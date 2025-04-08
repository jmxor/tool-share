export type UserBorrowRequest = {
    id: number;
    post_id: number;
    tool_name: string;
    requested_at: Date;
    requested_length: { days: number };
    request_status: string;
    result: boolean;
    owner: {
        id: number;
        username: string;
        first_username: string;
    };
    requester: {
        id: number;
        username: string;
        first_username: string;
    };
    deposit: number;
    transaction_id: number;
};

export type UserTransactionView = {
    id: number;
    post_id: number;
    tool_name: string;
    owner: {
        id: number;
        username: string;
        first_username: string;
    };
    borrower: {
        id: number;
        username: string;
        first_username: string;
    };
    transaction_status: string;
    created_at: Date;
    borrowed_at: Date | null;
    returned_at: Date | null;
    expires_at: Date;
    completed_at: Date | null;
};

export type PagedTransactionResult = {
    data: UserTransactionView[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
};

export type PagedRequestResult = {
    data: UserBorrowRequest[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
};

export type TransactionData = {
    id: number;
    post_id: number;
    tool_name: string;
    owner: {
        id: number;
        username: string;
        first_username: string;
    };
    borrower: {
        id: number;
        username: string;
        first_username: string;
    };
    deposit: number;
    transaction_status: string;
    created_at: Date;
    borrowed_at: Date | null;
    returned_at: Date | null;
    expires_at: Date;
    completed_at: Date | null;
    steps: Step[];
};

export type Step = {
    user_id: number;
    step_type: string;
    completed_at: Date | null;
};