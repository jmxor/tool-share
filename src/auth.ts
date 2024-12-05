import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
        credentials: {
            username: {},
            email: {},
            password: {}
        },
        authorize: async (credentials) => {
            // Auth goes here

            // Return user profile data
            return {}
        }
    })
  ],
})