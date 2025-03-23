import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { UserBorrowRequest } from "@/lib/transactions/types";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

export default function RequestTable({ requests, type }: { requests: UserBorrowRequest[], type: "requester" | "owner" }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-50">
          <TableRow className="border-b">
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tool</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">{type === "requester" ? "Owner" : "Requester"}</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Requested</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Duration</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Deposit</TableHead>
            <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="hover:bg-gray-50 transition-colors">
              <TableCell className="py-4 px-4 font-medium text-gray-900">{request.tool_name}</TableCell>
              <TableCell className="py-4 px-4 text-gray-700">
                {type === "requester" 
                  ? request.owner.username 
                  : request.requester.username}
              </TableCell>
              <TableCell className="py-4 px-4">
                <Badge
                  variant={
                  request.request_status === "pending" ? "outline" :
                  request.request_status === "accepted" ? "default" :
                  "destructive"
                }
                className={`px-2.5 py-0.5 text-xs font-medium ${request.request_status === "pending" ? "bg-yellow-500" :
                  request.request_status === "accepted" ? "bg-green-500" :
                  "bg-red-500"}`}>
                  {request.request_status}
                </Badge>
              </TableCell>
              <TableCell className="py-4 px-4 text-gray-700">{formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}</TableCell>
              <TableCell className="py-4 px-4 text-gray-700">{request.requested_length.days} days</TableCell>
              <TableCell className="py-4 px-4 text-gray-700 font-medium">£{request.deposit}</TableCell>
              <TableCell className="py-4 px-4">
                <Button variant="outline" size="sm" asChild className="hover:bg-gray-100">
                  <a href={`/transactions/request/${request.id}`} className="flex items-center gap-2 text-sm">
                    Request Page
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