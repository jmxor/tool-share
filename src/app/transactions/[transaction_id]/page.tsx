import { auth } from "@/auth";
import { getEmailID } from "@/lib/auth/actions";
import { getTransactionDetails } from "@/lib/transactions/actions";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import TransactionTimeline from "@/components/transactions/timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, UserIcon, Wrench } from "lucide-react";

export type TimelineStep = {
  isCompleted: boolean;
  isNext: boolean;
  date: string;
  pendingText: string;
  completedText: string;
}

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ transaction_id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  const { success, transaction } = await getTransactionDetails(
    parseInt((await params).transaction_id)
  );

  if (!success || !transaction) redirect("/transactions");
  
  if (transaction.borrower.id !== userID && transaction.owner.id !== userID) {
    redirect("/transactions");
  }
  

  const stepTypeMap = {
    "transaction_created": "Transaction Started",
    "deposit_paid": "Deposit Paid",
    "tool_borrowed": "Tool Borrowed",
    "tool_returned": "Tool Returned",
    "transaction_completed": "Transaction Completed"
  };

  const stepTextMap = {
    "transaction_created": {
      pendingText: "Waiting for transaction to start",
      completedText: "Transaction Started"
    },
    "deposit_paid": {
      pendingText: "Waiting for deposit to be paid",
      completedText: "Deposit Paid"
    },
    "tool_borrowed": {
      pendingText: "Waiting for tool to be borrowed",
      completedText: "Tool Borrowed"
    },
    "tool_returned": {
      pendingText: "Waiting for tool to be returned",
      completedText: "Tool Returned"
    },
    "transaction_completed": {
      pendingText: "Waiting for transaction to complete",
      completedText: "Transaction Completed"
    }
  };

  const completedSteps = {
    "transaction_created": true,
    "deposit_paid": false,
    "tool_borrowed": false,
    "tool_returned": false,
    "transaction_completed": false
  };

  transaction.steps.forEach(step => {
    if (step.completed_at && stepTypeMap[step.step_type as keyof typeof stepTypeMap]) {
      completedSteps[step.step_type as keyof typeof completedSteps] = true;
    }
  });

  const nextStepKey = Object.keys(completedSteps).find(
    key => !completedSteps[key as keyof typeof completedSteps]
  ) as keyof typeof completedSteps | undefined;

  const timelineSteps: TimelineStep[] = Object.keys(stepTypeMap).map(stepType => {
    const isCompleted = completedSteps[stepType as keyof typeof completedSteps];
    const isNext = stepType === nextStepKey;
    
    let date = "Pending";
    if (stepType === "transaction_created") {
      date = format(transaction.created_at, "MMM d, yyyy");
    } else if (isCompleted) {
      const step = transaction.steps.find(s => s.step_type === stepType);
      if (step?.completed_at) {
        date = format(step.completed_at, "MMM d, yyyy");
      }
    }

    return {
      isCompleted,
      isNext,
      date,
      pendingText: stepTextMap[stepType as keyof typeof stepTextMap].pendingText,
      completedText: stepTextMap[stepType as keyof typeof stepTextMap].completedText
    };
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Transaction Details
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Manage your transaction for {transaction.tool_name}
            </p>
          </div>
          <Badge
            variant={
              transaction.transaction_status === "active" ? "default" :
              transaction.transaction_status === "completed" ? "outline" :
              transaction.transaction_status === "overdue" ? "destructive" :
              "secondary"
            }
            className="px-3 py-1 text-sm font-medium"
          >
            {transaction.transaction_status}
          </Badge>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <CardTitle className="text-lg">Tool Information</CardTitle>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Tool:</span> 
                    <span className="text-gray-700">{transaction.tool_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Owner:</span> 
                    <span className="text-gray-700">{transaction.owner.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Borrower:</span> 
                    <span className="text-gray-700">{transaction.borrower.username}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <CardTitle className="text-lg">Transaction Information</CardTitle>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Created:</span> 
                    <span className="text-gray-700">{format(transaction.created_at, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Return By:</span> 
                    <span className="text-gray-700">{format(transaction.expires_at, "MMM d, yyyy")}</span>
                  </div>
                  {transaction.returned_at && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Returned:</span> 
                      <span className="text-gray-700">{format(transaction.returned_at, "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="pt-2">
              <CardTitle className="text-lg mb-6">Transaction Timeline</CardTitle>
              <TransactionTimeline steps={timelineSteps} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}