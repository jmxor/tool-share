import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getConnection } from "./db";
import bcrypt from 'bcryptjs';
import { logInSchema } from "./lib/zod";
import { ZodError } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: false,
  providers: [
    Credentials({
        credentials: {
            email: {},
            password: {}
        },
        authorize: async (credentials) => {
          try {
            const { email, password } = await logInSchema.parseAsync(credentials);
            const conn = await getConnection();
            const query = `
              SELECT id, username, email, password_hash, created_at, user_privilege, is_suspended 
              FROM "user"
              WHERE email = $1
            `
            const result = await conn.query(query, [email]);
            const rows = result.rows;
            if (!rows ) {
              return null;
            }
  
            const user = rows[0];
            const isMatch = await bcrypt.compare(password + (process.env.AUTH_SECRET || ''), user.password_hash);
            if (!isMatch) {
              return null;
            }
            
            const sessionUser = {
              id: user.id,
              username: user.username,
              email: user.email,
              created_at: user.created_at,
              user_privilege: user.user_privilege,
              is_suspended: user.is_suspended,
            };
            
            return sessionUser;
          } catch (error) {
            if (error instanceof ZodError) {
              return null
            }
            return null;
          }
        }
    })
  ],
});