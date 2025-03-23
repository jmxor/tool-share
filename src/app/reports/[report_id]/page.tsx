import { auth } from "@/auth";
import { getEmailID, userIsAdmin } from "@/lib/auth/actions";
import { getReportData } from "@/lib/reports/actions";
import { redirect } from "next/navigation";
import ReportMessages from "@/components/reports/report-messages";
import AdminStatusUpdate from "@/components/reports/admin-status-update";

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
  
  const isAdmin = await userIsAdmin(session.user.email);

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-4rem)] flex justify-center py-8 px-2">
      <div className="bg-white w-full md:w-3/5 lg:w-1/2 h-auto rounded-lg shadow-xl overflow-hidden">
        <h2 className="text-center text-3xl py-6 border-b border-gray-200 bg-gray-50 font-semibold">
          Report
        </h2>

        {/* Report Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Report Details</h3>
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {report_data.report_status || "open"}
            </div>
          </div>

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
          
          {isAdmin && (
            <AdminStatusUpdate 
              reportId={report_data.id} 
              currentStatus={report_data.report_status || "open"} 
            />
          )}
        </div>
        <ReportMessages report_id={report_data.id} report_messages={report_data.report_messages} loggedInUserID={loggedInUserID} />
      </div>
    </div>
  );
}
