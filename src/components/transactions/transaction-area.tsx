import { auth } from "@/auth";
import TransactionTable from "@/components/transactions/transaction-table";
import { redirect } from "next/navigation";
import { getTransactions } from "@/lib/transactions/actions";
import { getEmailID } from "@/lib/auth/actions";

export default async function TransactionArea() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  const transactions = await getTransactions(1, 10);

  console.log(transactions);

  const transactionsAsBorrower = transactions.data.filter(transaction => transaction.borrower.id === userID);
  const transactionsAsOwner = transactions.data.filter(transaction => transaction.owner.id === userID);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">Tools You&apos;re Borrowing</h2>
          <p className="text-sm text-gray-500">Tools you&apos;ve borrowed from others</p>
        </div>
        {transactionsAsBorrower.length > 0 ? (
          <TransactionTable transactions={transactionsAsBorrower} type="borrower" />
        ) : (
          <div className="bg-gray-50 rounded-md p-6 text-center">
            <p className="text-gray-600">You aren&apos;t borrowing any tools right now.</p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">Tools You&apos;re Lending</h2>
          <p className="text-sm text-gray-500">Your tools that others are borrowing</p>
        </div>
        {transactionsAsOwner.length > 0 ? (
          <TransactionTable transactions={transactionsAsOwner} type="owner" />
        ) : (
          <div className="bg-gray-50 rounded-md p-6 text-center">
            <p className="text-gray-600">You aren&apos;t lending any tools right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}