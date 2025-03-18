import { Suspense } from "react";
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import { DashboardChart } from "@/components/admin/dashboard/dashboard-chart";
import { DashboardLoading } from "./dashboard-loading";

export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and key metrics</p>
        </div>
        
        <DashboardStats />
        
        <div className="mt-8">
          <DashboardChart />
        </div>
      </div>
    </Suspense>
  );
} 