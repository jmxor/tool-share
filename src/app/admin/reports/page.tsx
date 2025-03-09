"use client";

import { useState, useEffect } from "react";
import { Report, ReportStatus } from "@/lib/admin/types";
import { getReports, updateReportStatus, addReportMessage } from "@/lib/admin/actions";
import { MoreHorizontal, MessageSquare, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsManagement() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStatus, setCurrentStatus] = useState<ReportStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>(ReportStatus.OPEN);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    fetchReports(1, "all");
  }, []);
  
  async function fetchReports(page: number, status: ReportStatus | "all" = currentStatus) {
    setIsLoading(true);
    try {
      const result = await getReports(page, 10, status);
      setReports(result.data);
      setTotalCount(result.totalCount);
      setPageCount(result.pageCount);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleStatusChange = (status: ReportStatus | "all") => {
    setCurrentStatus(status);
    fetchReports(1, status);
  };
  
  const handlePageChange = (page: number) => {
    fetchReports(page);
  };
  
  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    
    try {
      const success = await updateReportStatus(selectedReport.id, newStatus);
      if (success) {
        setReports(reports.map(report => 
          report.id === selectedReport.id 
            ? { ...report, status: newStatus } 
            : report
        ));
        setSelectedReport(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update report status:", error);
    }
  };
  
  const handleAddReportMessage = async () => {
    if (!selectedReport || !message.trim()) return;
    
    try {
      const success = await addReportMessage(selectedReport.id, message);
      if (success) {
        setMessage("");
        setSelectedReport(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add report message:", error);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case ReportStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case ReportStatus.RESOLVED:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case ReportStatus.DISMISSED:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Report Management</h1>
          <p className="text-muted-foreground mt-1">Manage user reports and disputes</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Total Reports: {totalCount}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Select
          value={currentStatus}
          onValueChange={(value) => handleStatusChange(value as ReportStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value={ReportStatus.OPEN}>Open</SelectItem>
            <SelectItem value={ReportStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={ReportStatus.RESOLVED}>Resolved</SelectItem>
            <SelectItem value={ReportStatus.DISMISSED}>Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Accuser</TableHead>
              <TableHead>Accused</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
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
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} 
                  className="hover:bg-muted/50 cursor-pointer" 
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <TableCell>#{report.id}</TableCell>
                  <TableCell className="font-medium">{report.accuser.username}</TableCell>
                  <TableCell className="font-medium">{report.accused.username}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(report.created_at)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link 
                          href={`/reports/${report.id}`}
                          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Report Page
                        </Link>

                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Report #{report.id}</DialogTitle>
                              <DialogDescription>
                                Report filed by {report.accuser.username} against {report.accused.username}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div>
                                <h3 className="text-sm font-medium">Description</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Current Status</h3>
                                <Badge className={`mt-1 ${getStatusBadgeVariant(report.status)}`}>
                                  {report.status}
                                </Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Report Status</DialogTitle>
                              <DialogDescription>
                                Change the status of report #{report.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Select 
                                value={selectedReport?.id === report.id ? newStatus : report.status}
                                onValueChange={(value) => setNewStatus(value as ReportStatus)}
                                onOpenChange={() => {
                                  setSelectedReport(report);
                                  setNewStatus(report.status);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={ReportStatus.OPEN}>Open</SelectItem>
                                  <SelectItem value={ReportStatus.IN_PROGRESS}>In Progress</SelectItem>
                                  <SelectItem value={ReportStatus.RESOLVED}>Resolved</SelectItem>
                                  <SelectItem value={ReportStatus.DISMISSED}>Dismissed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateStatus}>
                                Update Status
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Report Message
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Report Message</DialogTitle>
                              <DialogDescription>
                                Add a message to report #{report.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Your message..."
                                value={selectedReport?.id === report.id ? message : ""}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                onFocus={() => setSelectedReport(report)}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddReportMessage}>
                                Add Message
                              </Button>
                            </DialogFooter>
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