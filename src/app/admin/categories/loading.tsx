import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground mt-1">Manage tool categories and classifications</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-md border p-6 space-y-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="md:col-span-2">
          <div className="rounded-md border">
            <div className="h-10 border-b px-4 bg-muted/40">
              <div className="flex items-center h-full">
                <Skeleton className="h-4 w-full max-w-[400px]" />
              </div>
            </div>
            
            {Array(5).fill(null).map((_, index) => (
              <div key={index} className="h-16 border-b px-4 flex items-center">
                <div className="grid grid-cols-3 gap-4 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 