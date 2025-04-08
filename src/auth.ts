import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs';
import { LoginFormSchema } from "./lib/zod";
import { ZodError } from "zod";
import { getUserRowFromEmail, isEmailBanned } from "./lib/auth/actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: false,
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        console.log("[AUTH] Starting authorization process");
        try {
          console.log("[AUTH] Validating credentials with Zod schema");
          const { email, password } = await LoginFormSchema.parseAsync(credentials);
          console.log(`[AUTH] Email validation successful: ${email}`);

          console.log("[AUTH] Fetching user from database");
          const result = await getUserRowFromEmail(email)
          if (!result) {
            console.log("[AUTH] No result returned from database");
            throw new Error("Invalid credentials.");
          }

          const rows = result.rows;
          if (!rows) {
            console.log("[AUTH] No rows in result");
            throw new Error("Invalid credentials.");
          }
          console.log("[AUTH] User found in database");

          const user = rows[0];
          console.log("[AUTH] Comparing password hash");
          const isMatch = await bcrypt.compare(password + (process.env.AUTH_SECRET || ''), user.password_hash);
          if (!isMatch) {
            console.log("[AUTH] Password does not match");
            throw new Error("Invalid credentials.");
          }
          console.log("[AUTH] Password match successful");

          const sessionUser = {
            email: user.email,
          };

          console.log("[AUTH] Checking if user is banned");
          const isBanned = await isEmailBanned(email);
          if (isBanned) {
            console.log("[AUTH] User is banned, rejecting login");
            throw new Error("banned");
          }
          console.log("[AUTH] User is not banned, login successful");

          return sessionUser;

        } catch (error) {
          if (error instanceof ZodError) {
            console.log("[AUTH] Zod validation error:", error.message);
            throw new Error("Invalid credentials.");
          }
          console.log("[AUTH] Authorization error:", error instanceof Error ? error.message : "Unknown error");
          if (error instanceof Error && error.message === "banned") {
            throw new Error("banned");
          }
          throw new Error("Invalid credentials.");
        }
      }
    })
  ],
});
