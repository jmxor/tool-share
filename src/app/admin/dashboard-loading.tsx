import { StatCardSkeleton } from "@/components/admin/dashboard/stat-card-skeleton";
import { ChartSkeleton } from "@/components/admin/dashboard/chart-skeleton";

export function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and key metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      
      <div className="mt-8">
        <ChartSkeleton />
      </div>
    </div>
  );
} 