"use client";

import { useState, useEffect } from "react";
import { getSuspensions } from "@/lib/admin/actions";
import { Suspension } from "@/lib/admin/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuspensionsManagement() {
  const router = useRouter();
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSuspensions(1);
  }, []);
  
  async function fetchSuspensions(page: number) {
    setIsLoading(true);
    try {
      const result = await getSuspensions(page, 10);
      setSuspensions(result.data);
      setPageCount(result.pageCount);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error("Failed to fetch suspensions:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handlePageChange = (page: number) => {
    fetchSuspensions(page);
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
          <h1 className="text-3xl font-bold">User Suspensions</h1>
          <p className="text-muted-foreground mt-1">View all account suspensions</p>
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
                  Loading suspensions...
                </TableCell>
              </TableRow>
            ) : suspensions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No suspensions found
                </TableCell>
              </TableRow>
            ) : (
              suspensions.map((suspension) => (
                <TableRow key={suspension.id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/user/${suspension.first_username}`}
                      className="text-blue-600 hover:underline"
                    >
                      {suspension.username}
                    </Link>
                  </TableCell>
                  <TableCell>{suspension.admin_username || 'Unknown'}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {suspension.reason}
                  </TableCell>
                  <TableCell>{formatDate(suspension.issued_at)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin/users?username=${suspension.username}`)}
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