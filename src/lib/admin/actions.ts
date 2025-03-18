"use server";

import { getConnection } from "@/lib/db";
import { auth } from "@/auth";
import { AdminDashboardStats, AdminUser, Category, PagedResult, Report, ReportStatus, Transaction, UserPrivilege, Warning, Suspension } from "./types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEmailID } from "../auth/actions";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;
  
  try {
    const conn = await getConnection();
    const query = `
      SELECT user_privilege
      FROM "user"
      WHERE email = $1
    `;
    
    const result = await conn.query(query, [session.user.email]);
    if (!result.rows || result.rows.length === 0) return false;
    
    return result.rows[0].user_privilege === UserPrivilege.ADMIN;
  } catch (error) {
    console.error("[ERROR] Failed to check admin status:", error);
    return false;
  }
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/");
  
  try {
    const conn = await getConnection();
    
    const usersQuery = `SELECT COUNT(*) as count FROM "user"`;
    const usersResult = await conn.query(usersQuery);
    const totalUsers = parseInt(usersResult.rows[0].count);
    
    const activeUsersQuery = `SELECT COUNT(*) as count FROM "user" WHERE is_suspended = false`;
    const activeUsersResult = await conn.query(activeUsersQuery);
    const activeUsers = parseInt(activeUsersResult.rows[0].count);
    
    const toolsQuery = `SELECT COUNT(*) as count FROM post`;
    const toolsResult = await conn.query(toolsQuery);
    const totalTools = parseInt(toolsResult.rows[0].count);
    
    const activeToolsQuery = `SELECT COUNT(*) as count FROM post WHERE status = 'available'`;
    const activeToolsResult = await conn.query(activeToolsQuery);
    const activeTools = parseInt(activeToolsResult.rows[0].count);
    
    const reportsQuery = `SELECT COUNT(*) as count FROM report WHERE report_status = 'open'`;
    const reportsResult = await conn.query(reportsQuery);
    const pendingReports = parseInt(reportsResult.rows[0].count);
    
    const todayQuery = `
      SELECT COUNT(*) as count 
      FROM transaction 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    const todayResult = await conn.query(todayQuery);
    const transactionsToday = parseInt(todayResult.rows[0].count);
    
    const transactionsQuery = `SELECT COUNT(*) as count FROM transaction`;
    const transactionsResult = await conn.query(transactionsQuery);
    const totalTransactions = parseInt(transactionsResult.rows[0].count);
    
    const growthQuery = `
      SELECT date_trunc('day', created_at) as day, COUNT(*) as count
      FROM "user"
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY day
      ORDER BY day ASC
    `;
    const growthResult = await conn.query(growthQuery);
    
    const labels: string[] = [];
    const data: number[] = Array(7).fill(0);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(dateStr);
    }
    
    growthResult.rows.forEach(row => {
      const date = new Date(row.day);
      const index = 6 - Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (index >= 0 && index < 7) {
        data[index] = parseInt(row.count);
      }
    });
    
    return {
      totalUsers,
      activeUsers,
      totalTools,
      activeTools,
      pendingReports,
      transactionsToday,
      totalTransactions,
      userGrowth: {
        labels,
        data
      }
    };
  } catch (error) {
    console.error("[ERROR] Failed to fetch dashboard stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalTools: 0,
      activeTools: 0,
      pendingReports: 0,
      transactionsToday: 0,
      totalTransactions: 0,
      userGrowth: {
        labels: [],
        data: []
      }
    };
  }
}

export async function getUsers(page: number = 1, limit: number = 10, searchTerm: string = ""): Promise<PagedResult<AdminUser>> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/");
  
  try {
    const conn = await getConnection();
    const offset = (page - 1) * limit;
    
    let whereClause = "";
    const params = [];
    
    if (searchTerm) {
      whereClause = "WHERE username ILIKE $1 OR email ILIKE $1";
      params.push(`%${searchTerm}%`);
    }
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM "user"
      ${whereClause}
    `;
    
    const countResult = await conn.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);
    
    const usersQuery = `
      SELECT u.id, u.username, u.first_username, u.email, u.created_at, u.user_privilege, u.is_suspended,
        (SELECT COUNT(*) FROM warning w WHERE w.user_id = u.id) as warnings
      FROM "user" u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const usersResult = await conn.query(usersQuery, [...params, limit, offset]);

    const users = usersResult.rows.map(row => ({
      id: row.id,
      username: row.username,
      first_username: row.first_username,
      email: row.email,
      created_at: new Date(row.created_at),
      user_privilege: row.user_privilege as UserPrivilege,
      is_suspended: row.is_suspended,
      warnings: parseInt(row.warnings)
    }));
    return {
      data: users,
      totalCount,
      pageCount: Math.ceil(totalCount / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("[ERROR] Failed to fetch users:", error);
    return {
      data: [],
      totalCount: 0,
      pageCount: 0,
      currentPage: page
    };
  }
}

export async function updateUserPrivilege(userId: number, privilege: UserPrivilege): Promise<boolean> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return false;
  
  try {
    const conn = await getConnection();
    const query = `
      UPDATE "user"
      SET user_privilege = $1
      WHERE id = $2
    `;
    
    await conn.query(query, [privilege, userId]);
    revalidatePath("/admin/users");
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to update user privilege:", error);
    return false;
  }
}

export async function toggleUserSuspension(userId: number, suspend: boolean, reason: string = ""): Promise<boolean> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return false;
  
  const session = await auth();
  if (!session?.user?.email) return false;
  
  try {
    const conn = await getConnection();
    
    const adminQuery = `SELECT id FROM "user" WHERE email = $1`;
    const adminResult = await conn.query(adminQuery, [session.user.email]);
    if (!adminResult.rows || adminResult.rows.length === 0) return false;
    
    const adminId = adminResult.rows[0].id;
    
    const updateQuery = `
      UPDATE "user"
      SET is_suspended = $1
      WHERE id = $2
    `;
    
    await conn.query(updateQuery, [suspend, userId]);
    
    if (suspend && reason) {
      const suspensionQuery = `
        INSERT INTO suspension (user_id, issuing_admin_id, reason)
        VALUES ($1, $2, $3)
      `;
      
      await conn.query(suspensionQuery, [userId, adminId, reason]);
    }
    
    revalidatePath("/admin/users");
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to toggle user suspension:", error);
    return false;
  }
}

export async function getReports(page: number = 1, limit: number = 10, status: ReportStatus | "all" = "all"): Promise<PagedResult<Report>> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/");
  
  try {
    const conn = await getConnection();
    const offset = (page - 1) * limit;
    
    let whereClause = "";
    const params = [];
    
    if (status !== "all") {
      whereClause = "WHERE r.report_status = $1";
      params.push(status);
    }
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM report r
      ${whereClause}
    `;
    
    const countResult = await conn.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);
    
    const reportsQuery = `
      SELECT 
        r.id,
        r.report_description,
        r.report_status,
        r.created_at,
        accuser.id as accuser_id,
        accuser.username as accuser_username,
        accuser.first_username as accuser_first_username,
        accused.id as accused_id,
        accused.username as accused_username,
        accused.first_username as accused_first_username
      FROM report r
      LEFT JOIN "user" accuser ON r.accuser_id = accuser.id
      LEFT JOIN "user" accused ON r.accused_id = accused.id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN r.report_status = 'open' THEN 1
          WHEN r.report_status = 'in_progress' THEN 2
          ELSE 3
        END,
        r.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const reportsResult = await conn.query(reportsQuery, [...params, limit, offset]);
    
    const reports = reportsResult.rows.map(row => ({
      id: row.id,
      accuser: {
        id: row.accuser_id,
        username: row.accuser_username,
        first_username: row.accuser_first_username
      },
      accused: {
        id: row.accused_id,
        username: row.accused_username,
        first_username: row.accused_first_username
      },
      description: row.report_description,
      status: row.report_status as ReportStatus,
      created_at: new Date(row.created_at)
    }));
    
    return {
      data: reports,
      totalCount,
      pageCount: Math.ceil(totalCount / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("[ERROR] Failed to fetch reports:", error);
    return {
      data: [],
      totalCount: 0,
      pageCount: 0,
      currentPage: page
    };
  }
}

export async function updateReportStatus(reportId: number, status: ReportStatus): Promise<boolean> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return false;
  
  try {
    const conn = await getConnection();
    const query = `
      UPDATE report
      SET report_status = $1
      WHERE id = $2
    `;
    
    await conn.query(query, [status, reportId]);
    revalidatePath("/admin/reports");
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to update report status:", error);
    return false;
  }
}

export async function getCategories(): Promise<Category[]> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/");
  
  try {
    const conn = await getConnection();
    
    const query = `
      SELECT 
        c.id,
        c.name,
        COUNT(pc.post_id) as tool_count
      FROM 
        category c
      LEFT JOIN 
        post_category pc ON c.id = pc.category_id
      GROUP BY 
        c.id, c.name
      ORDER BY 
        c.name
    `;
    
    const result = await conn.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      toolCount: parseInt(row.tool_count)
    }));
  } catch (error) {
    console.error("[ERROR] Failed to fetch categories:", error);
    return [];
  }
}

export async function addCategory(name: string): Promise<boolean> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return false;
  
  try {
    const conn = await getConnection();
    
    const checkQuery = `SELECT id FROM category WHERE name = $1`;
    const checkResult = await conn.query(checkQuery, [name]);
    
    if (checkResult.rows && checkResult.rows.length > 0) {
      return false;
    }
    
    const addQuery = `INSERT INTO category (name) VALUES ($1)`;
    await conn.query(addQuery, [name]);
    
    revalidatePath("/admin/categories");
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to add category:", error);
    return false;
  }
}

export async function updateCategory(id: number, name: string): Promise<boolean> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return false;
  
  try {
    const conn = await getConnection();
    
    const checkQuery = `SELECT id FROM category WHERE name = $1 AND id != $2`;
    const checkResult = await conn.query(checkQuery, [name, id]);
    
    if (checkResult.rows && checkResult.rows.length > 0) {
      return false;
    }
    
    const updateQuery = `UPDATE category SET name = $1 WHERE id = $2`;
    await conn.query(updateQuery, [name, id]);
    
    revalidatePath("/admin/categories");
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to update category:", error);
    return false;
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return false;
  
  try {
    const conn = await getConnection();
    
    const checkQuery = `SELECT COUNT(*) as count FROM post_category WHERE category_id = $1`;
    const checkResult = await conn.query(checkQuery, [id]);
    
    if (checkResult.rows && parseInt(checkResult.rows[0].count) > 0) {
      return false; // Cannot delete category with associated tools
    }
    
    const deleteQuery = `DELETE FROM category WHERE id = $1`;
    await conn.query(deleteQuery, [id]);
    
    revalidatePath("/admin/categories");
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to delete category:", error);
    return false;
  }
}

export async function getTransactions(page: number = 1, limit: number = 10): Promise<PagedResult<Transaction>> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/");
  
  try {
    const conn = await getConnection();
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) as count FROM transaction`;
    const countResult = await conn.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    
    const transactionsQuery = `
      SELECT 
        t.id,
        t.created_at,
        t.borrowed_at,
        t.returned_at,
        t.transaction_status,
        t.expires_at,
        t.completed_at,
        p.id as post_id,
        p.tool_name,
        owner.id as owner_id,
        owner.username as owner_username,
        owner.first_username as owner_first_username,
        borrower.id as borrower_id,
        borrower.username as borrower_username,
        borrower.first_username as borrower_first_username
      FROM 
        transaction t
      JOIN 
        post p ON t.post_id = p.id
      JOIN 
        "user" owner ON p.user_id = owner.id
      JOIN 
        borrow_request br ON br.post_id = p.id AND br.status = 'approved'
      JOIN 
        "user" borrower ON br.requester_id = borrower.id
      ORDER BY 
        t.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const transactionsResult = await conn.query(transactionsQuery, [limit, offset]);
    
    const transactions = transactionsResult.rows.map(row => ({
      id: row.id,
      post: {
        id: row.post_id,
        tool_name: row.tool_name,
        user: {
          id: row.owner_id,
          username: row.owner_username,
          first_username: row.owner_first_username
        }
      },
      borrower: {
        id: row.borrower_id,
        username: row.borrower_username,
        first_username: row.borrower_first_username
      },
      created_at: new Date(row.created_at),
      borrowed_at: row.borrowed_at ? new Date(row.borrowed_at) : null,
      returned_at: row.returned_at ? new Date(row.returned_at) : null,
      transaction_status: row.transaction_status,
      expires_at: new Date(row.expires_at),
      completed_at: row.completed_at ? new Date(row.completed_at) : null
    }));
    
    return {
      data: transactions,
      totalCount,
      pageCount: Math.ceil(totalCount / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("[ERROR] Failed to fetch transactions:", error);
    return {
      data: [],
      totalCount: 0,
      pageCount: 0,
      currentPage: page
    };
  }
}

export async function getCurrentUserEmail(): Promise<{user?: {email: string}}> {
  const session = await auth();
  
  return {
    user: session?.user?.email ? {
      email: session.user.email
    } : undefined
  };
} 

export async function issueWarning(userId: number, reason: string): Promise<boolean> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return false;
  
  try {
    const session = await auth();
    if (!session?.user?.email) return false;

    const adminId = await getEmailID(session.user.email);
    if (!adminId) return false;

    const conn = await getConnection();

    const query = `
      INSERT INTO warning (user_id, issuing_admin_id, reason)
      VALUES ($1, $2, $3)
    `;
    await conn.query(query, [userId, adminId, reason]);

    const warningsQuery = `
      SELECT COUNT(*) as count FROM warning WHERE user_id = $1
    `;
    const warningsResult = await conn.query(warningsQuery, [userId]);
    const warningCount = parseInt(warningsResult.rows[0].count);
    
    if (warningCount >= 3) {
      const suspendQuery = `
        UPDATE "user"
        SET is_suspended = true
        WHERE id = $1
      `;
      await conn.query(suspendQuery, [userId]);
      
      const suspensionQuery = `
        INSERT INTO suspension (user_id, issuing_admin_id, reason)
        VALUES ($1, $2, $3)
      `;
      await conn.query(suspensionQuery, [userId, adminId, "Automatic suspension after 3 warnings"]);
    }
    
    revalidatePath("/admin/users");
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to issue warning:", error);
    return false;
  }
}

export async function getWarnings(page: number = 1, limit: number = 10): Promise<PagedResult<Warning>> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/");
  
  try {
    const conn = await getConnection();
    const offset = (page - 1) * limit;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM warning
    `;
    
    const countResult = await conn.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    
    const warningsQuery = `
      SELECT 
        w.id,
        w.user_id,
        w.issuing_admin_id,
        w.reason,
        w.issued_at,
        u.username,
        u.first_username,
        a.username as admin_username
      FROM warning w
      JOIN "user" u ON w.user_id = u.id
      LEFT JOIN "user" a ON w.issuing_admin_id = a.id
      ORDER BY w.issued_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const warningsResult = await conn.query(warningsQuery, [limit, offset]);
    
    const warnings = warningsResult.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      first_username: row.first_username,
      issuing_admin_id: row.issuing_admin_id,
      admin_username: row.admin_username,
      reason: row.reason,
      issued_at: new Date(row.issued_at)
    }));
    
    return {
      data: warnings,
      totalCount,
      pageCount: Math.ceil(totalCount / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("[ERROR] Failed to fetch warnings:", error);
    return {
      data: [],
      totalCount: 0,
      pageCount: 0,
      currentPage: page
    };
  }
}

export async function getSuspensions(page: number = 1, limit: number = 10): Promise<PagedResult<Suspension>> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect("/");
  
  try {
    const conn = await getConnection();
    const offset = (page - 1) * limit;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM suspension
    `;
    
    const countResult = await conn.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    
    const suspensionsQuery = `
      SELECT 
        s.id,
        s.user_id,
        s.issuing_admin_id,
        s.reason,
        s.issued_at,
        u.username,
        u.first_username,
        a.username as admin_username
      FROM suspension s
      JOIN "user" u ON s.user_id = u.id
      LEFT JOIN "user" a ON s.issuing_admin_id = a.id
      ORDER BY s.issued_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const suspensionsResult = await conn.query(suspensionsQuery, [limit, offset]);
    
    const suspensions = suspensionsResult.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      first_username: row.first_username,
      issuing_admin_id: row.issuing_admin_id,
      admin_username: row.admin_username,
      reason: row.reason,
      issued_at: new Date(row.issued_at)
    }));
    
    return {
      data: suspensions,
      totalCount,
      pageCount: Math.ceil(totalCount / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("[ERROR] Failed to fetch suspensions:", error);
    return {
      data: [],
      totalCount: 0,
      pageCount: 0,
      currentPage: page
    };
  }
}