import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { isCurrentUserAdmin } from "@/lib/admin/actions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isCurrentUserAdmin();
  
  if (!isAdmin) {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <main className="lg:pl-64 min-h-screen overflow-auto">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
} 