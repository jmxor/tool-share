"use client"

import { Report_Message, ReportMessageFormState, sendReportMessage } from "@/lib/reports/user-actions";
import { getTimeAgo } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useActionState } from "react";

export default function ReportMessages({ report_id, report_messages, loggedInUserID }: { report_id: number, report_messages: Report_Message[], loggedInUserID: number }) {
  const initialState: ReportMessageFormState = {
    errors: {}
  }

  const [state, formAction, isPending] = useActionState(
    sendReportMessage,
    initialState
  );

  return (
    <div className="flex-grow overflow-y-auto p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Messages
      </h3>
      <div className="space-y-3 px-2 pr-4">
        {report_messages.map((message: Report_Message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.user_id === loggedInUserID
              ? 'items-start'
              : 'items-end'
              }`}
          >
            <div
              className={`rounded-xl py-2 px-4 w-full md:w-3/4 lg:w-2/3 ${message.user_id === loggedInUserID
                ? 'bg-blue-100 text-gray-800'
                : 'bg-gray-100 text-gray-700'
                }`}
            >
              <p className="text-sm break-words">
                {message.message_text}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <a href={`/user/${message.user_first_username}`} className="hover:underline">{message.user_username}</a> -{' '}
                {getTimeAgo(message.sent_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form
        action={formAction}
        className="min-w-48 flex flex-col p-2 mr-2 gap-1 items-start"
      >
        <input type="hidden" name="reportID" value={report_id} />
        <Textarea name="reportMessageText" placeholder="Write your message here." />
        {state.errors?.reportMessageText ? <p className="px-2 text-red-400 text-sm flex justify-center mb-2">{state.errors.reportMessageText}</p> : ""}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending ..." : "Send Message"}
        </Button>
        {state.success === false ? <p className="px-2 text-red-400 flex justify-center text-sm">{state.message}</p> : ""}
      </form>
    </div>
  );
}
