import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { UserTransactionView } from "@/lib/transactions/types";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

export default function TransactionTable({ transactions, type }: { transactions: UserTransactionView[], type: "borrower" | "owner" }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-50">
          <TableRow className="border-b">
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tool</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">{type === "borrower" ? "Owner" : "Borrower"}</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Started</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Return In</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Return By</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
              <TableCell className="py-4 px-4 font-medium text-gray-900">{transaction.tool_name}</TableCell>
              <TableCell className="py-4 px-4 text-gray-700">
                {type === "borrower" 
                  ? transaction.owner.username 
                  : transaction.borrower.username}
              </TableCell>
              <TableCell className="py-4 px-4">
                <Badge variant={
                  transaction.transaction_status === "active" ? "default" :
                  transaction.transaction_status === "completed" ? "outline" :
                  transaction.transaction_status === "overdue" ? "destructive" :
                  "secondary"
                }
                className={`px-2.5 py-0.5 text-xs font-medium ${transaction.transaction_status === "transaction_completed" ? "bg-green-500 text-white" : ""}`}>
                  {transaction.transaction_status
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Badge>
              </TableCell>
              <TableCell className="py-4 px-4 text-gray-700">{formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}</TableCell>
              <TableCell className="py-4 px-4 text-gray-700">{formatDistanceToNow(new Date(transaction.expires_at), { addSuffix: true })}</TableCell>
              <TableCell className="py-4 px-4 text-gray-700">{format(new Date(transaction.expires_at), 'MMM d, yyyy')}</TableCell>
              <TableCell className="py-4 px-4">
                <Button variant="outline" size="sm" asChild className="hover:bg-gray-100">
                  <a href={`/transactions/${transaction.id}`} className="flex items-center gap-2 text-sm">
                    Transaction Page
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
