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

export type BorrowRequest = {
    id: number;
    requester_id: number;
    post_id: number;
    requested_at: Date;
    requested_length: {days:number};
    request_status: string;
    result: string;
    tool_name: string;
    deposit: number;
    owner_username: string;
    owner_first_username: string;
    requester_username: string;
    requester_first_username: string;
    tool_status: string;
    owner_id: number;
    transaction_id?: number;
}