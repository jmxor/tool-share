import { auth } from "@/auth";
import { getEmailID, userIsAdmin } from "@/lib/auth/actions";
import { getReportData, Report_Message } from "@/lib/reports/user-actions";
import { redirect } from "next/navigation";
import { Megaphone, Flag } from 'lucide-react';

export default async function ReportPage({ params }: { params: Promise<{ report_id: number }> }) {

  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    redirect("/auth/login")
  }
  const report_id = (await params).report_id;

  const report_data = await getReportData(report_id);
  if (!report_data) {
    redirect("/")
  }

  const loggedInUserID = await getEmailID(session.user.email);
  if (loggedInUserID !== report_data.reporter_id && !(await userIsAdmin(session.user.email))) {
    redirect("/");
  }

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-4rem)] flex justify-center py-8">
      <div className="bg-white w-full md:w-3/5 lg:w-1/2 h-auto rounded-lg shadow-xl overflow-hidden">
        <h2 className="text-center text-3xl py-6 border-b border-gray-200 bg-gray-50 font-semibold">
          Report
        </h2>

        {/* Report Header */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Report Details
          </h3>

          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700">Reporter:</div>
            <div className="flex items-center text-gray-600">
              <a href={`/user/${report_data.reporter_first_username}`} className="font-semibold hover:underline">
                {report_data.reporter_username}{' '}
                <span className="text-gray-500">
                  ({report_data.reporter_first_username})
                </span>
              </a>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700">Reported User:</div>
            <div className="flex items-center text-gray-600">
              <a href={`/user/${report_data.reported_first_username}`} className="font-semibold hover:underline">
                {report_data.reported_username}{' '}
                <span className="text-gray-500">
                  ({report_data.reported_first_username})
                </span>
              </a>
            </div>
          </div>

          <div className="mt-4">
            <p className="font-medium text-gray-700">Report Description:</p>
            <div className="mt-2 p-3 border rounded-md bg-gray-50 text-gray-600 font-semibold h-32">
              {report_data.report_text}
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="flex-grow overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Messages
          </h3>
          <div className="space-y-3">
            {report_data.report_messages.map((message: Report_Message) => (
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
                    {new Date(message.sent_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
