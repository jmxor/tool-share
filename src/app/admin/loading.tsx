export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loading...</h1>
        <p className="text-muted-foreground mt-1">Loading page content</p>
      </div>
      
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-muted rounded-lg"></div>
        <div className="h-48 bg-muted rounded-lg"></div>
      </div>
    </div>
  );
} 