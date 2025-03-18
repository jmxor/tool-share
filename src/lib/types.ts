export type User = {
    username: string;
    first_username: string;
    email: string;
    created_at: Date;
    user_privilege: string;
    is_suspended: boolean;
    warnings: number;
};

export type Post = {
    id: number,
    tool_name: string,
    description: string,
    sources: string[]
}

export type PublicUser = {
    username: string;
    created_at: Date,
    is_suspended: boolean,
    suspensionCount: number
    posts: Post[]
};

export type ToolPostPreview = {
    toolName: string;
    deposit: number;
    mainImagePath: string;
    status: string;
}
