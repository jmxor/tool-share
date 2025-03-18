export enum UserPrivilege {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user"
}

export type AdminUser = {
  id: number;
  username: string;
  first_username: string;
  email: string;
  created_at: Date;
  user_privilege: UserPrivilege;
  is_suspended: boolean;
  warnings: number;
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalTools: number;
  activeTools: number;
  pendingReports: number;
  transactionsToday: number;
  totalTransactions: number;
  userGrowth: {
    labels: string[];
    data: number[];
  };
};

export type Category = {
  id: number;
  name: string;
  toolCount: number;
};

export type Report = {
  id: number;
  accuser: {
    id: number;
    username: string;
    first_username: string;
  };
  accused: {
    id: number;
    username: string;
    first_username: string;
  };
  description: string;
  status: ReportStatus;
  created_at: Date;
};

export enum ReportStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  DISMISSED = "dismissed"
}

export type Transaction = {
  id: number;
  post: {
    id: number;
    tool_name: string;
    user: {
      id: number;
      username: string;
      first_username: string;
    };
  };
  borrower: {
    id: number;
    username: string;
    first_username: string;
  };
  created_at: Date;
  borrowed_at: Date | null;
  returned_at: Date | null;
  transaction_status: TransactionStatus;
  expires_at: Date;
  completed_at: Date | null;
};

export enum TransactionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELED = "canceled",
  EXPIRED = "expired"
}

export type PagedResult<T> = {
  data: T[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
};

export type Warning = {
  id: number;
  user_id: number;
  username: string;
  first_username: string;
  issuing_admin_id: number;
  admin_username: string;
  reason: string;
  issued_at: Date;
};

export type Suspension = {
  id: number;
  user_id: number;
  username: string;
  first_username: string;
  issuing_admin_id: number;
  admin_username: string;
  reason: string;
  issued_at: Date;
}; 