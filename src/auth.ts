import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs';
import { logInSchema } from "./lib/zod";
import { ZodError } from "zod";
import { getUserByEmail, getUserRowFromEmail } from "./lib/auth/actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        try {
          const { email, password } = await logInSchema.parseAsync(credentials);

          const result = await getUserRowFromEmail(email)
          if (!result) {
            throw new Error("Invalid credentials.");
          }

          const rows = result.rows;
          if (!rows) {
            throw new Error("Invalid credentials.");
          }

          const user = rows[0];
          const isMatch = await bcrypt.compare(password + (process.env.AUTH_SECRET || ''), user.password_hash);
          if (!isMatch) {
            throw new Error("Invalid credentials.");
          }

          const sessionUser = {
            email: user.email,
          };

          return sessionUser;

        } catch (error) {
          if (error instanceof ZodError) {
            throw new Error("Invalid credentials.");
          }
          throw new Error("Invalid credentials.");
        }
      }
    })
  ],
});
