"use server";

import { z } from "zod";
import { getConnection } from "@/lib/db";
import {
  LoginFormSchema,
  RegistrationFormSchema,
  ReviewFormSchema,
} from "@/lib/zod";
import { hashPassword } from "./utils";
import { signIn, signOut } from "@/auth";
import { PublicUser, User } from "@/lib/types";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { NotificationTemplate, VerificationTemplate } from '@/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function isLoggedIn() {
  const session = await auth();
  if (!session?.user) {
    return false;
  } else return true;
}

export async function sendVerificationCode(): Promise<boolean> {
  const session = await auth();
  if (!session?.user || !session?.user?.email) {
    return false;
  }

  try {
    const conn = await getConnection();
    const userID = await getEmailID(session.user.email);
    
    const checkQuery = `
      SELECT code FROM verification_codes
      WHERE user_id = $1 AND expires_at > NOW()
    `;
    const checkResult = await conn.query(checkQuery, [userID]);
    
    let code: string;
    
    if (checkResult.rows && checkResult.rows.length > 0) {
      code = checkResult.rows[0].code;
    } else {
      code = [...Array(128)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
      
      const query = `
        INSERT INTO verification_codes 
        (user_id, code, expires_at)
        VALUES
        ($1, $2, NOW() + INTERVAL '15 minutes')
      `;

      await conn.query(query, [userID, code]);
    }
    
    const username = (await getUserByEmail(session.user.email))?.username || "";
    
    const { error } = await resend.emails.send({
      from: 'ToolShare <onboarding@resend.dev>',
      to: [session.user.email],
      subject: 'Verify Your Email Address',
      react: VerificationTemplate({ username, code }),
    });

    if (error) {
      console.error("[ERROR] Failed to send verification email: ", error);
      return false;
    }
    
    return true;
  } catch(error) {
    console.error("[ERROR] Failed to send email verification code: ", error);
    return false;
  }
}

export async function updateNotificationSettings(settings: {
  transactions?: boolean;
  borrowRequests?: boolean;
  reviews?: boolean;
  messages?: boolean;
  warningsAndSuspensions?: boolean;
}): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return false;
    }
    
    const conn = await getConnection();
    const userID = await getEmailID(session.user.email);
    
    const verificationQuery = `
      SELECT is_email_verified FROM "user"
      WHERE id = $1
    `;
    const verificationResult = await conn.query(verificationQuery, [userID]);
    
    if (!verificationResult.rows?.[0]?.is_email_verified) {
      return false;
    }
    
    const updateQuery = `
      UPDATE user_notifications
      SET 
        transactions = COALESCE($2, transactions),
        borrow_requests = COALESCE($3, borrow_requests),
        reviews = COALESCE($4, reviews),
        messages = COALESCE($5, messages),
        warnings_suspensions = COALESCE($6, warnings_suspensions)
      WHERE user_id = $1
    `;
    
    await conn.query(updateQuery, [
      userID,
      settings.transactions !== undefined ? settings.transactions : null,
      settings.borrowRequests !== undefined ? settings.borrowRequests : null,
      settings.reviews !== undefined ? settings.reviews : null,
      settings.messages !== undefined ? settings.messages : null,
      settings.warningsAndSuspensions !== undefined ? settings.warningsAndSuspensions : null
    ]);
    
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to update notification settings: ", error);
    return false;
  }
}

export async function attemptEmailVerification(code: string): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return false;
    }
    
    const conn = await getConnection();
    const userID = await getEmailID(session.user.email);
    
    const verifyQuery = `
      SELECT user_id FROM verification_codes
      WHERE code = $1 AND expires_at > NOW()
    `;
    const verifyResult = await conn.query(verifyQuery, [code]);
    
    if (!verifyResult.rows || verifyResult.rows.length === 0) {
      return false;
    }
    
    const codeUserID = verifyResult.rows[0].user_id;
    
    if (codeUserID !== userID) {
      return false;
    }
    
    const updateUserQuery = `
      UPDATE "user"
      SET is_email_verified = true
      WHERE id = $1
    `;
    await conn.query(updateUserQuery, [userID]);
    
    const checkNotificationsQuery = `
      SELECT id FROM user_notifications
      WHERE user_id = $1
    `;
    const notificationsResult = await conn.query(checkNotificationsQuery, [userID]);
    
    if (!notificationsResult.rows || notificationsResult.rows.length === 0) {
      const createNotificationsQuery = `
        INSERT INTO user_notifications
        (user_id, transactions, borrow_requests, reviews, messages, warnings_suspensions)
        VALUES
        ($1, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
      `;
      await conn.query(createNotificationsQuery, [userID]);
    }
    
    const deleteCodeQuery = `
      DELETE FROM verification_codes
      WHERE code = $1
    `;
    await conn.query(deleteCodeQuery, [code]);
    
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to verify email: ", error);
    return false;
  }
}

export type NotificationType = 
  | 'transactions' 
  | 'borrowRequests' 
  | 'reviews' 
  | 'messages' 
  | 'warningsAndSuspensions';

export async function sendNotificationEmail(
  notificationType: NotificationType, 
  message: string
): Promise<boolean> {
  const session = await auth();
  if (!session?.user || !session?.user?.email) {
    return false;
  }

  try {
    const conn = await getConnection();
    const userID = await getEmailID(session.user.email);
    
    const columnMapping: Record<NotificationType, string> = {
      transactions: 'transactions',
      borrowRequests: 'borrow_requests',
      reviews: 'reviews',
      messages: 'messages',
      warningsAndSuspensions: 'warnings_suspensions'
    };
    
    const columnName = columnMapping[notificationType];
    
    const settingsQuery = `
      SELECT ${columnName} FROM user_notifications
      WHERE user_id = $1
    `;
    const settingsResult = await conn.query(settingsQuery, [userID]);
    
    if (!settingsResult.rows || 
        settingsResult.rows.length === 0 || 
        !settingsResult.rows[0][columnName]) {
      return false;
    }
    
    const username = (await getUserByEmail(session.user.email))?.username || "";
    
    let subject = 'ToolShare Notification';
    switch(notificationType) {
      case 'transactions':
        subject = 'Transaction Update';
        break;
      case 'borrowRequests':
        subject = 'Borrow Request Update';
        break;
      case 'reviews':
        subject = 'New Review Notification';
        break;
      case 'messages':
        subject = 'New Message Notification';
        break;
      case 'warningsAndSuspensions':
        subject = 'Account Warning or Suspension Notice';
        break;
    }
    
    const { error } = await resend.emails.send({
      from: 'ToolShare <notifications@resend.dev>',
      to: [session.user.email],
      subject: subject,
      react: NotificationTemplate({ username, message }),
    });

    if (error) {
      console.error("[ERROR] Failed to send notification email: ", error);
      return false;
    }
    
    return true;
  } catch(error) {
    console.error("[ERROR] Failed to send notification email: ", error);
    return false;
  }
}

export type NotificationSettings = {
  transactions: boolean;
  borrowRequests: boolean;
  reviews: boolean;
  messages: boolean;
  warningsAndSuspensions: boolean;
}

export async function getUserNotificationSettings(): Promise<NotificationSettings> {
  const session = await auth();
  if (!session?.user) {
    return {
      transactions: false,
      borrowRequests: false,
      reviews: false,
      messages: false,
      warningsAndSuspensions: false,
    };
  }
  try {
    const conn = await getConnection();
    const userId = await getEmailID(session.user.email as string);
    const query = `
      SELECT transactions, borrow_requests, reviews, messages, warnings_suspensions
      FROM user_notifications
      WHERE user_id = $1
    `;
    const result = await conn.query(query, [userId]);
    if (result.rowCount === 0) {
      return {
        transactions: false,
        borrowRequests: false,
        reviews: false,
        messages: false,
        warningsAndSuspensions: false,
      };
    }
    
    return {
      transactions: result.rows[0].transactions,
      borrowRequests: result.rows[0].borrow_requests,
      reviews: result.rows[0].reviews,
      messages: result.rows[0].messages,
      warningsAndSuspensions: result.rows[0].warnings_suspensions,
    };
  } catch (error) {
    console.error("[ERROR] Failed to get notification settings: ", error);
    return {
      transactions: false,
      borrowRequests: false,
      reviews: false,
      messages: false,
      warningsAndSuspensions: false,
    };
  }
}

export async function isEmailVerified(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) {
    return false;
  }

  try {
    const conn = await getConnection();
    const query = `
            SELECT is_email_verified
            FROM "user"
            WHERE email = $1
        `;
    const result = await conn.query(query, [session.user.email]);

    if ((result.rowCount || 0) <= 0) {
      return false;
    }

    const user = result.rows[0];
    if (user.is_email_verified) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[ERROR] Failed to check whether email is verified: ", error);
    return false;
  }
}
export async function isEmailBanned(email: string): Promise<boolean> {
  try {
    const conn = await getConnection();
    const query = `
            SELECT is_suspended
            FROM "user"
            WHERE email = $1
        `;

    const result = await conn.query(query, [email]);

    if ((result.rowCount || 0) <= 0) {
      return false;
    }

    const user = result.rows[0];
    if (user.is_suspended) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[ERROR] Failed to check whether email is banned: ", error);
    return false;
  }
}

export async function isUserBanned(userId: number): Promise<boolean> {
  try {
    const conn = await getConnection();

    const query = `
            SELECT is_suspended
            FROM "user"
            WHERE id = $1
        `;

    const result = await conn.query(query, [userId]);

    if ((result.rowCount || 0) <= 0) {
      return false;
    }

    const user = result.rows[0];
    if (user.is_suspended) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[ERROR] Failed to check whether user is banned: ", error);
    return false;
  }
}

export async function userIsAdmin(email: string): Promise<boolean> {
  try {
    const conn = await getConnection();

    const query = `
            SELECT user_privilege
            FROM "user"
            WHERE email = $1
        `;

    const result = await conn.query(query, [email]);

    if ((result.rowCount || 0) <= 0) {
      return false;
    }

    const user = result.rows[0];
    if (user.user_privilege !== "admin") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[ERROR] Failed to check whether user is admin: ", error);
    return false;
  }
}

export type DeleteReviewState = {
  message: string | null;
  success: boolean | null;
};

export async function deleteReview(
  first_username: string
): Promise<DeleteReviewState> {
  if (!first_username) {
    return {
      success: false,
      message: "User does not exist",
    };
  }

  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return {
        message: "You must be logged in to delete your review.",
        success: false,
      };
    }

    const sessionUserID = await getEmailID(session.user.email);
    if (!sessionUserID) {
      return {
        message: "You must be logged in to delete your review.",
        success: false,
      };
    }
    const targetUserID = await getFirstUsernameID(first_username);
    if (!targetUserID) {
      return {
        message: "Couldn't find this user. Try again later.",
        success: false,
      };
    }

    const conn = await getConnection();
    const query = `
            DELETE FROM review
            WHERE reviewer_id = $1
            AND reviewed_id = $2
        `;

    await conn.query(query, [sessionUserID, targetUserID]);
  } catch (error) {
    console.error("[ERROR] Failed to delete review: ", error);
    return {
      success: false,
      message: "Failed to delete review. Try again later",
    };
  }

  revalidatePath(`/user/${first_username}`);
  redirect(`/user/${first_username}`);
}

export type Review = {
  id: number;
  reviewer_username: string;
  reviewer_first_usename: string;
  stars: number;
  text: string;
  created_at: Date;
};

export async function getReviews(
  first_username: string
): Promise<Review[] | null> {
  try {
    const targetID = await getFirstUsernameID(first_username);
    if (!targetID) {
      return null;
    }

    const conn = await getConnection();
    const reviewsQuery = `
            SELECT id, reviewer_id, stars, review_text, created_at
            FROM review
            WHERE reviewed_id = $1
        `;

    const result = await conn.query(reviewsQuery, [targetID]);
    if (result.rows.length === 0) {
      return [];
    }

    const reviewerQuery = `
            SELECT username, first_username
            FROM "user"
            WHERE id = $1
        `;
    const reviewPromises = result.rows.map(async (row) => {
      const reviewerResult = await conn.query(reviewerQuery, [row.reviewer_id]);
      if (reviewerResult.rows.length === 0) {
        return null;
      }
      const review: Review = {
        id: row.id,
        reviewer_username: reviewerResult.rows[0].username,
        reviewer_first_usename: reviewerResult.rows[0].first_username,
        stars: row.stars,
        text: row.review_text,
        created_at: row.created_at,
      };
      return review;
    });

    const reviewArray: Review[] = (await Promise.all(reviewPromises)).filter(
      (review) => review !== null
    ) as Review[];
    return reviewArray;
  } catch (error) {
    console.error("[ERROR] Failed to get reviews", error);
    return null;
  }
}

export type ReviewFormState = {
  errors?: {
    target?: string[];
    stars?: string[];
    text?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function submitReview(
  prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const data = {
    ...Object.fromEntries(formData),
  };

  let parsedData;
  let validatedFields;
  // Stars is submitted as a string so try to parse to int and if not just use the data so that zod handles the non-integer error
  try {
    parsedData = {
      ...data,
      stars: parseInt(data.stars.toString()),
    };
    validatedFields = ReviewFormSchema.safeParse(parsedData);
  } catch {
    console.error(
      "[ERROR] Non integer value submitted as star rating in review form"
    );
  }

  if (!validatedFields) {
    validatedFields = ReviewFormSchema.safeParse(data);
  }

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    // First get the id of the target user.
    const targetID = await getFirstUsernameID(validatedFields.data.target);
    if (!targetID) {
      return {
        message: "Couldn't find target user.",
        success: false,
      };
    }

    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return {
        message: "You must be logged in to submit a review.",
        success: false,
      };
    }

    const userID = await getEmailID(session.user.email);
    if (!userID) {
      return {
        message:
          "Could not find email id. You must be logged in to submit a review.",
        success: false,
      };
    }

    const query = `
            INSERT INTO review ( reviewer_id, reviewed_id, stars, review_text )
            VALUES ($1, $2, $3, $4)
        `;

    const conn = await getConnection();
    const values = [
      userID,
      targetID,
      validatedFields.data.stars,
      validatedFields.data.text,
    ];
    await conn.query(query, values);
  } catch {
    console.error("[ERROR] Failed to insert review into database");
    return {
      message: "Failed to submit review. Try again later.",
      success: false,
    };
  }

  redirect(`/user/${validatedFields.data.target}`);
}

export async function getPublicUserData(
  first_username: string
): Promise<PublicUser | null> {
  try {
    const conn = await getConnection();
    const query = `
            SELECT id, username, created_at, is_suspended
            FROM "user"
            WHERE first_username = $1
        `;

    const result = await conn.query(query, [first_username]);

    if (result.rows.length == 0) {
      return null;
    }

    const row = result.rows[0];

    const suspensionCountQuery = `
            SELECT COUNT(*)
            FROM suspension
            WHERE user_id = $1
        `;

    const countResult = await conn.query(suspensionCountQuery, [row.id]);

    let suspensionCount = 0;
    if (result.rows.length !== 0) {
      suspensionCount = countResult.rows[0].count;
    }

    const postsQuery = `
            SELECT p.*,
               p.deposit::numeric,
               array_agg(DISTINCT pp.source) AS pictures,
               array_agg(DISTINCT c.name)    AS categories,
               l.postcode,
               l.longitude,
               l.latitude
        FROM post p
                 LEFT JOIN post_picture pp ON p.id = pp.post_id
                 LEFT JOIN post_category pc ON p.id = pc.post_id
                 LEFT JOIN category c ON pc.category_id = c.id
                 LEFT JOIN location l ON p.location_id = l.id
            WHERE
              p.user_id = $1
            GROUP BY p.id, l.id
            ORDER BY p.location_id
        `;

    const postsResult = await conn.query(postsQuery, [row.id]);

    const publicUserData: PublicUser = {
      username: row.username,
      created_at: row.created_at,
      is_suspended: row.is_suspended,
      suspensionCount: suspensionCount,
      posts: postsResult.rows,
    };

    return publicUserData;
  } catch (error) {
    console.error("[ERROR] Failed to fetch public user data: ", error);

    return null;
  }
}

export type RegistrationFormState = {
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  fields?: Record<string, string>;
  success?: boolean;
};

export async function registerUser(
  _: RegistrationFormState,
  formData: FormData
): Promise<RegistrationFormState> {
  const data = {
    ...Object.fromEntries(formData),
  };

  const validatedFields = RegistrationFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
      message: "Missing fields, failed to register.",
      fields: validatedFields.data,
      success: false,
    };
  }

  try {
    const conn = await getConnection();

    const checkQuery = `
            SELECT id
            FROM "user"
            WHERE first_username = $1 OR email = $2
            LIMIT 1
        `;
    const result = await conn.query(checkQuery, [
      validatedFields.data.username.toLowerCase().replace(/\s+/g, ""),
      validatedFields.data.email,
    ]);

    if (result.rowCount !== null && result.rowCount > 0) {
      return {
        message: "Username or email already registered, try again.",
        success: false,
      };
    }

    const insertQuery = `
            INSERT INTO "user" (username, first_username, email, password_hash, user_privilege) 
            VALUES ($1, $2, $3, $4, $5)
        `;

    const hashedPassword = await hashPassword(validatedFields.data.password);
    await conn.query(insertQuery, [
      validatedFields.data.username,
      validatedFields.data.username.toLowerCase().replace(/\s+/g, ""),
      validatedFields.data.email,
      hashedPassword,
      "user",
    ]);
  } catch (error) {
    console.error("Failed to register new user: ", error);
    return {
      message: "Failed to register new user.",
      success: false,
    };
  }

  revalidatePath("/auth/login");
  redirect("/auth/login");
}

export async function registerUserr(formData: FormData): Promise<string> {
  const data = Object.fromEntries(formData.entries());

  try {
    const parsedData = RegistrationFormSchema.parse(data);
    const conn = await getConnection();

    const checkQuery = `
            SELECT id
            FROM "user"
            WHERE first_username = $1 OR email = $2
            LIMIT 1
        `;
    const result = await conn.query(checkQuery, [
      parsedData.username.toLowerCase().replace(/\s+/g, ""),
      parsedData.email,
    ]);

    if (result.rowCount !== null && result.rowCount > 0) {
      return "Username or email is already registered.";
    }

    const insertQuery = `
            INSERT INTO "user" (username, first_username, email, password_hash, user_privilege) 
            VALUES ($1, $2, $3, $4, $5)
        `;
    const hashedPassword = await hashPassword(parsedData.password);
    await conn.query(insertQuery, [
      parsedData.username,
      parsedData.username.toLowerCase().replace(/\s+/g, ""),
      parsedData.email,
      hashedPassword,
      "user",
    ]);

    return "Success";
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => issue.message)
        .join(", ");
      return errorMessages;
    }

    console.error(error);
    return "Failed to register unexpectedly.";
  }
}

export async function getUserRowFromEmail(email: string) {
  try {
    const conn = await getConnection();
    const query = `
        SELECT id, username, email, password_hash, created_at, user_privilege, is_suspended 
        FROM "user"
        WHERE email = $1
        `;
    const result = await conn.query(query, [email]);

    return result;
  } catch {
    return null;
  }
}

export async function getUserRowFromId(id: number) {
  try {
    const conn = await getConnection();
    const query = `
        SELECT id, username, first_username, email, password_hash, created_at, user_privilege, is_suspended 
        FROM "user"
        WHERE id = $1
        `;
    const result = await conn.query(query, [id]);

    return result.rows[0];
  } catch {
    return null;
  }
}

export async function getFirstUsernameID(first_username: string) {
  try {
    const conn = await getConnection();
    const query = `
        SELECT id
        FROM "user"
        WHERE first_username = $1
        `;
    const result = await conn.query(query, [first_username]);

    return result.rows[0].id;
  } catch {
    return null;
  }
}

export async function getEmailID(email: string) {
  try {
    const conn = await getConnection();
    const query = `
        SELECT id
        FROM "user"
        WHERE email = $1
        `;
    const result = await conn.query(query, [email]);

    return result.rows[0].id;
  } catch {
    return null;
  }
}

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
  fields?: Record<string, string>;
  success?: boolean | null;
};

export async function loginUser(
  _: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const data = {
    ...Object.fromEntries(formData),
  };

  const validatedFields = LoginFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
      message: "Invalid or missing field values.",
      success: false,
    };
  }

  try {
    const result = await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });

    if (!result) {
      throw new Error("Failed to signIn");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "banned") {
      return {
        message: "This account has been banned.",
        success: false,
      };
    }
    console.log(error);
    return {
      message: "The account is banned or the email or password is incorrect.",
      success: false,
    };
  }

  revalidatePath("/");
  redirect("/");
}

export async function signInUser(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return result;
  } catch {
    throw new Error("Invalid credentials.");
  }
}

export async function signOutUser() {
  await signOut();
}

export async function deleteAccount() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return false;
    }

    const query = `
            DELETE FROM "user"
            WHERE email = $1
        `;

    const conn = await getConnection();
    const result = await conn.query(query, [session.user.email]);

    if (result.rowCount === 0) {
      console.error("Delete account query no response");
      return false;
    }

    await signOut();
    return true;
  } catch (error) {
    console.error("Delete account query error:", error);
    return false;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const query = `
            SELECT u.username, u.first_username, u.email, u.created_at, u.user_privilege, u.is_suspended,
                   COUNT(w.id) AS warnings
            FROM "user" u
            LEFT JOIN warning w ON u.id = w.user_id
            WHERE u.email = $1
            GROUP BY u.username, u.first_username, u.email, u.created_at, u.user_privilege, u.is_suspended
            LIMIT 1
        `;
    const conn = await getConnection();
    const result = await conn.query(query, [email]);

    if (!result.rows) {
      return null;
    }
    const user = result.rows[0];

    const user_object = {
      ...user,
      created_at: new Date(user.created_at),
    } as User;

    return user_object;
  } catch {
    return null;
  }
}

export async function updateUsername(newUsername: string) {
  // Return false if empty
  if (!newUsername) {
    return false;
  }

  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return false;
    }

    const query = `
            UPDATE "user"
            SET username = $1
            WHERE email = $2
        `;

    const conn = await getConnection();
    await conn.query(query, [newUsername, session.user.email]);

    return true;
  } catch {
    return false;
  }
}

export async function setPassword(newPassword: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return false;
    }

    // Update on database
    const newHash = await hashPassword(newPassword);
    const email = session.user.email;

    const query = `
            UPDATE "user"
            SET password_hash = $1
            WHERE email = $2
        `;

    const conn = await getConnection();
    const result = await conn.query(query, [newHash, email]);

    if (!result) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in setPassword:", error);
    return false;
  }
}

export async function getUserWarningsAndSuspensions() {
  const session = await auth();
  if (!session?.user?.email) return { warnings: [], suspensions: [] };

  try {
    const conn = await getConnection();

    const userId = await getEmailID(session.user.email);

    const warningsQuery = `
      SELECT 
        id,
        reason,
        issued_at
      FROM warning
      WHERE user_id = $1
      AND issued_at > NOW() - INTERVAL '30 days'
      ORDER BY issued_at DESC
      LIMIT 5
    `;

    const warningsResult = await conn.query(warningsQuery, [userId]);

    const suspensionsQuery = `
      SELECT 
        id,
        reason,
        issued_at
      FROM suspension 
      WHERE user_id = $1
      AND issued_at > NOW() - INTERVAL '90 days'
      ORDER BY issued_at DESC
      LIMIT 5
    `;

    const suspensionsResult = await conn.query(suspensionsQuery, [userId]);

    return {
      warnings: warningsResult.rows.map((row) => ({
        id: row.id,
        reason: row.reason,
        issuedAt: new Date(row.issued_at),
        adminUsername: row.admin_username,
      })),
      suspensions: suspensionsResult.rows.map((row) => ({
        id: row.id,
        reason: row.reason,
        issuedAt: new Date(row.issued_at),
        adminUsername: row.admin_username,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch user warnings and suspensions:", error);
    return { warnings: [], suspensions: [] };
  }
}
