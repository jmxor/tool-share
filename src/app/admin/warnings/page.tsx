"use client";

import { useState, useEffect } from "react";
import { getWarnings } from "@/lib/admin/actions";
import { Warning } from "@/lib/admin/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WarningsManagement() {
  const router = useRouter();
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWarnings(1);
  }, []);
  
  async function fetchWarnings(page: number) {
    setIsLoading(true);
    try {
      const result = await getWarnings(page, 10);
      setWarnings(result.data);
      setPageCount(result.pageCount);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error("Failed to fetch warnings:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handlePageChange = (page: number) => {
    fetchWarnings(page);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Warnings</h1>
          <p className="text-muted-foreground mt-1">View all warnings issued to users</p>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading warnings...
                </TableCell>
              </TableRow>
            ) : warnings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No warnings found
                </TableCell>
              </TableRow>
            ) : (
              warnings.map((warning) => (
                <TableRow key={warning.id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/user/${warning.first_username}`}
                      className="text-blue-600 hover:underline"
                    >
                      {warning.username}
                    </Link>
                  </TableCell>
                  <TableCell>{warning.admin_username || 'Unknown'}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {warning.reason}
                  </TableCell>
                  <TableCell>{formatDate(warning.issued_at)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin/users?username=${warning.username}`)}
                    >
                      View User
                    </Button>
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
