"use client";

import { useEffect, useState } from "react";
import { AdminDashboardStats } from "@/lib/admin/types";
import { StatCard } from "./stat-card";
import { StatCardSkeleton } from "./stat-card-skeleton";
import { Users, Wrench, Flag, CircleDollarSign } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/actions";

export function DashboardStats() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Users" 
        value={stats.totalUsers}
        icon={Users}
        description={`${stats.activeUsers} active users`}
      />
      <StatCard 
        title="Total Tools" 
        value={stats.totalTools}
        icon={Wrench}
        description={`${stats.activeTools} active listings`}
      />
      <StatCard 
        title="Pending Reports" 
        value={stats.pendingReports}
        icon={Flag}
      />
      <StatCard 
        title="Transactions Today" 
        value={stats.transactionsToday}
        icon={CircleDollarSign}
        description={`${stats.totalTransactions} total transactions`}
      />
    </div>
  );
} 