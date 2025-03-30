"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useActionState } from "react";
import { resolveRequest } from "@/lib/transactions/actions";
import { useRouter } from "next/navigation";

interface RequestActionsProps {
  requestId: number;
  isOwner: boolean;
  isRequester: boolean;
  status: string;
}

export function RequestActions({ requestId, isOwner, isRequester, status }: RequestActionsProps) {
  const router = useRouter();

  const [rejectState, rejectAction] = useActionState(
    async () => {
      const result = await resolveRequest(requestId, 'rejected');
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    { success: true, message: "" }
  );

  const [acceptState, acceptAction] = useActionState(
    async () => {
      const result = await resolveRequest(requestId, 'accepted');
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    { success: true, message: "" }
  );

  const [cancelState, cancelAction] = useActionState(
    async () => {
      const result = await resolveRequest(requestId, 'cancelled');
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    { success: true, message: "" }
  );

  if (status !== 'pending') return null;

  return (
    <>
      {isOwner && (
        <div className="flex gap-4 mt-6 justify-end">
          <form action={rejectAction}>
            {rejectState.message && (
              <p className="text-sm text-red-600 mb-2">{rejectState.message}</p>
            )}
            <Button variant="destructive" type="submit">
              <X className="mr-2 h-4 w-4" /> Reject
            </Button>
          </form>
          <form action={acceptAction}>
            {acceptState.message && (
              <p className="text-sm text-red-600 mb-2">{acceptState.message}</p>
            )}
            <Button variant="default" type="submit">
              <Check className="mr-2 h-4 w-4" /> Accept
            </Button>
          </form>
        </div>
      )}
      
      {isRequester && (
        <div className="flex mt-6 justify-end">
          <form action={cancelAction}>
            {cancelState.message && (
              <p className="text-sm text-red-600 mb-2">{cancelState.message}</p>
            )}
            <Button variant="outline" type="submit">
              <X className="mr-2 h-4 w-4" /> Cancel Request
            </Button>
          </form>
        </div>
      )}
    </>
  );
} 