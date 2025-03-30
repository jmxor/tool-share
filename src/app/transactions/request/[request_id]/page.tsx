import { auth } from "@/auth";
import { getEmailID } from "@/lib/auth/actions";
import { getRequestData } from "@/lib/transactions/actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { RequestActions } from "@/components/transactions/request-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RequestPage({
  params,
}: {
  params: Promise<{ request_id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  const request_id = parseInt((await params).request_id);
  if (isNaN(request_id)) redirect("/transactions");

  const requestData = await getRequestData(request_id);
  
  if (!requestData.success || !requestData.request) {
    redirect("/transactions");
  }

  const request = requestData.request;
  
  const isRequester = request.requester_id === userID;
  const isOwner = request.owner_id === userID;
  
  if (!isRequester && !isOwner) {
    redirect("/transactions");
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Button variant="outline" asChild>
        <Link href="/transactions" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions</Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-center text-2xl">Borrow Request</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Request Details</h3>
            <Badge variant={getBadgeVariant(request.request_status) as "destructive" | "secondary" | "default" | "outline" | null | undefined}>
              {request.request_status || "pending"}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Tool</h4>
                <p className="font-medium">
                  <a href={`/posts/${request.post_id}`} className="hover:underline flex items-center gap-1">
                    {request.tool_name}
                    <span className="text-muted-foreground text-sm flex items-center">
                      (view post <ExternalLink className="ml-0.5 h-3 w-3" />)
                    </span>
                  </a>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Deposit Required</h4>
                <p className="font-medium">£{request.deposit}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Requester</h4>
                <p>
                  <a href={`/user/${request.requester_first_username}`} className="font-medium hover:underline">
                    {request.requester_username}{' '}
                    <span className="text-muted-foreground">
                      ({request.requester_first_username})
                    </span>
                  </a>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Owner</h4>
                <p>
                  <a href={`/user/${request.owner_first_username}`} className="font-medium hover:underline">
                    {request.owner_username}{' '}
                    <span className="text-muted-foreground">
                      ({request.owner_first_username})
                    </span>
                  </a>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Requested On</h4>
                <p>{format(new Date(request.requested_at), 'MMM d, yyyy')}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Requested Length</h4>
                <p>{`${request.requested_length.days} day(s)`}</p>
              </div>
            </div>

            <RequestActions 
              requestId={request.id}
              isOwner={isOwner}
              isRequester={isRequester}
              status={request.request_status}
            />

            {request.transaction_id && (
              <Button variant="outline" asChild>
              <a href={`/transactions/${request.transaction_id}`}>
                Transaction Page <ExternalLink className="ml-0.5 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}