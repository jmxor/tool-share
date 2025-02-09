export type User = {
    username: string;
    email: string;
    created_at: Date;
    user_privilege: string;
    is_suspended: boolean;
};

export type PublicUser = {
    username: string;
    created_at: Date,
    is_suspended: boolean,
    suspensionCount: number
};

export type ToolPostPreview = {
    toolName: string;
    deposit: number;
    mainImagePath: string;
    status: string;
}
