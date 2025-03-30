"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { MessageSquare, AlertCircle, ExternalLink } from "lucide-react";
import { getUserReports } from "@/lib/reports/actions";
import { UserReport } from "@/lib/admin/types";

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    fetchReports(1);
  }, []);

  async function fetchReports(page: number) {
    setIsLoading(true);
    try {
      const result = await getUserReports(page, 10);
      setReports(result.data);
      setPageCount(result.pageCount);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    fetchReports(page);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case 'in_progress':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'resolved':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'dismissed':
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Reports</h1>
            <p className="text-muted-foreground mt-1">View and manage your submitted reports</p>
          </div>
          <Button onClick={() => router.push('/reports/new')}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Submit New Report
          </Button>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Reported User</TableHead>
                <TableHead className="max-w-[300px]">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No reports found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push('/reports/new')}
                      >
                        Submit a Report
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow 
                    key={report.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <TableCell>#{report.id}</TableCell>
                    <TableCell>
                      <a 
                        href={`/user/${report.reported_first_username}`}
                        className="text-blue-600 hover:underline flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {report.reported_username}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {report.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeVariant(report.report_status)}>
                          {report.report_status.replace('_', ' ')}
                        </Badge>
                        {report.latest_message_from_admin && (
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/reports/${report.id}`);
                        }}
                      >
                        Report Page <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {reports.length > 0 && (
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}