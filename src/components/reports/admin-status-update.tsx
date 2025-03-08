"use client";

import { useState } from "react";
import { updateReportStatus } from "@/lib/admin/actions";
import { ReportStatus } from "@/lib/admin/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

interface AdminStatusUpdateProps {
  reportId: number;
  currentStatus: string;
}

export default function AdminStatusUpdate({ reportId, currentStatus }: AdminStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ReportStatus>(currentStatus as ReportStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdateStatus = async () => {
    if (status === currentStatus as ReportStatus) {
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess(false);

    try {
      const result = await updateReportStatus(reportId, status);
      if (result) {
        setSuccess(true);
        router.refresh();
      } else {
        setError("Failed to update status. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ReportStatus.OPEN:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case ReportStatus.IN_PROGRESS:
        return <Clock className="h-5 w-5 text-blue-500" />;
      case ReportStatus.RESOLVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ReportStatus.DISMISSED:
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          {getStatusIcon(currentStatus)}
          <span className="ml-2">Admin Actions</span>
        </CardTitle>
        <CardDescription>Update the status of this report</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Current Status:</span>
            <span className="capitalize">{currentStatus}</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Change Status:</label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as ReportStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportStatus.OPEN}>Open</SelectItem>
                <SelectItem value={ReportStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={ReportStatus.RESOLVED}>Resolved</SelectItem>
                <SelectItem value={ReportStatus.DISMISSED}>Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="text-sm font-medium text-red-500">{error}</div>
          )}
          {success && (
            <div className="text-sm font-medium text-green-500">Status updated successfully!</div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpdateStatus} 
          disabled={isUpdating || status === currentStatus as ReportStatus}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>
      </CardFooter>
    </Card>
  );
} 