"use client";

import { useEffect, useState } from "react";
import { UserGrowthChart } from "./user-growth-chart";
import { ChartSkeleton } from "./chart-skeleton";
import { getDashboardStats } from "@/lib/admin/actions";

export function DashboardChart() {
  const [chartData, setChartData] = useState<{ labels: string[], data: number[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const stats = await getDashboardStats();
        setChartData(stats.userGrowth);
      } catch (error) {
        console.error('Error fetching user growth data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, []);

  if (loading || !chartData) {
    return <ChartSkeleton />;
  }

  return (
    <UserGrowthChart 
      labels={chartData.labels} 
      data={chartData.data} 
    />
  );
} 