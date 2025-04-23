"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionStatus } from "@/lib/admin/types";
import { getTransactions } from "@/lib/admin/actions";
import { Calendar, Clock, Eye, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/pagination";
import Link from "next/link";

export default function TransactionsMonitoring() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  async function fetchTransactions(page: number) {
    setIsLoading(true);
    try {
      const result = await getTransactions(page, 10);
      setTransactions(result.data);
      setPageCount(result.pageCount);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    fetchTransactions(page);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case TransactionStatus.ACTIVE:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case TransactionStatus.COMPLETED:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case TransactionStatus.CANCELED:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case TransactionStatus.EXPIRED:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Monitoring</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor all tool borrowing transactions
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>#{transaction.id}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.post.tool_name}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/user/${transaction.post.user.first_username}`}
                      className="text-primary hover:underline"
                    >
                      {transaction.post.user.username}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/user/${transaction.borrower.first_username}`}
                      className="text-primary hover:underline"
                    >
                      {transaction.borrower.username}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusBadgeVariant(
                        transaction.transaction_status,
                      )}
                    >
                      {transaction.transaction_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Transaction #{transaction.id}
                              </DialogTitle>
                              <DialogDescription>
                                Transaction details for{" "}
                                {transaction.post.tool_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <h3 className="text-sm font-medium">Tool</h3>
                                <p className="mt-1 text-sm">
                                  {transaction.post.tool_name}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium">Owner</h3>
                                  <p className="mt-1 text-sm">
                                    {transaction.post.user.username}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium">
                                    Borrower
                                  </h3>
                                  <p className="mt-1 text-sm">
                                    {transaction.borrower.username}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Status</h3>
                                <Badge
                                  className={`mt-1 ${getStatusBadgeVariant(transaction.transaction_status)}`}
                                >
                                  {transaction.transaction_status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <h3 className="flex items-center text-sm font-medium">
                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Created
                                  </h3>
                                  <p className="text-sm">
                                    {formatDateTime(transaction.created_at)}
                                  </p>
                                </div>
                                {transaction.transaction_status ===
                                  TransactionStatus.ACTIVE && (
                                  <div className="space-y-1">
                                    <h3 className="flex items-center text-sm font-medium">
                                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                      Expires
                                    </h3>
                                    <p className="text-sm">
                                      {formatDateTime(transaction.expires_at)}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {transaction.borrowed_at && (
                                <div className="space-y-1">
                                  <h3 className="text-sm font-medium">
                                    Borrowed At
                                  </h3>
                                  <p className="text-sm">
                                    {formatDateTime(transaction.borrowed_at)}
                                  </p>
                                </div>
                              )}
                              {transaction.returned_at && (
                                <div className="space-y-1">
                                  <h3 className="text-sm font-medium">
                                    Returned At
                                  </h3>
                                  <p className="text-sm">
                                    {formatDateTime(transaction.returned_at)}
                                  </p>
                                </div>
                              )}
                              {transaction.completed_at && (
                                <div className="space-y-1">
                                  <h3 className="text-sm font-medium">
                                    Completed At
                                  </h3>
                                  <p className="text-sm">
                                    {formatDateTime(transaction.completed_at)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

