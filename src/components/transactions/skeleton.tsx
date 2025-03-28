import { Skeleton } from "@/components/ui/skeleton";

export default function RequestAreaSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="border-b pb-2">
          <div className="h-7 w-64 mb-1">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-5 w-48">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-md border h-64">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-400 animate-spin"></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="border-b pb-2">
          <div className="h-7 w-64 mb-1">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-5 w-48">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-md border h-64">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-400 animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
