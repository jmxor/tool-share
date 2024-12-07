type LocalErrors = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsOfService: string;
};

export type User = {
    username: string;
    email: string;
    created_at: Date;
    user_privilege: string;
    is_suspended: boolean;
};