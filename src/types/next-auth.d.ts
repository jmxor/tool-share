import "next-auth"

declare module "next-auth" {
    interface User {
        id: string;
        username?: string | null;
        email?: string | null;
        image?: string | null;
        created_at?: string | Date | null;
        user_privilege?: string | null;
        is_suspended?: boolean | null;
    }
}