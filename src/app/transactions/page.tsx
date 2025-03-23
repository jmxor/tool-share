import { auth } from "@/auth";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { getEmailID } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import RequestArea from "@/components/transactions/request-area";
import TransactionArea from "@/components/transactions/transaction-area";
import Skeleton from "@/components/transactions/skeleton";
import { Suspense } from "react";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");


  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transactions and Requests</h1>
            <p className="text-muted-foreground mt-1.5">View and manage your transactions and requests</p>
          </div>
        </div>

        <div className="rounded-lg border shadow-sm bg-white overflow-hidden">
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="w-full border-b bg-gray-50 px-4 grid grid-cols-2 h-fit">
              <TabsTrigger value="requests" className="font-medium py-3 w-full">Requests</TabsTrigger>
              <TabsTrigger value="transactions" className="font-medium py-3 w-full">Transactions</TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent value="requests" className="mt-0">
                <Suspense fallback={<Skeleton />}>
                  <RequestArea />
                </Suspense>
              </TabsContent>
              <TabsContent value="transactions" className="mt-0">
                <Suspense fallback={<Skeleton />}>
                  <TransactionArea />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}