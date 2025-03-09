import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <div className="rounded-md border">
        <div className="h-10 border-b px-4 bg-muted/40">
          <div className="flex items-center h-full">
            <Skeleton className="h-4 w-full max-w-[800px]" />
          </div>
        </div>
        
        {Array(5).fill(null).map((_, index) => (
          <div key={index} className="h-16 border-b px-4 flex items-center">
            <div className="grid grid-cols-6 gap-4 w-full">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
} 