import RequestTable from "@/components/transactions/request-table";
import { getRequests } from "@/lib/transactions/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEmailID } from "@/lib/auth/actions";

export default async function RequestArea() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const userID = await getEmailID(session.user.email);
  if (!userID) redirect("/auth/login");

  const requests = await getRequests(1, 10);

  const requestsMade = requests.data.filter(request => request.requester.id === userID);
  const requestsReceived = requests.data.filter(request => request.owner.id === userID);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">Requests You've Made</h2>
          <p className="text-sm text-gray-500">Tools you've requested to borrow from others</p>
        </div>
        {requestsMade.length > 0 ? (
          <RequestTable requests={requestsMade} type="requester" />
        ) : (
          <div className="bg-gray-50 rounded-md p-6 text-center">
            <p className="text-gray-600">You haven't made any requests yet.</p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">Requests You've Received</h2>
          <p className="text-sm text-gray-500">Requests from others to borrow your tools</p>
        </div>
        {requestsReceived.length > 0 ? (
          <RequestTable requests={requestsReceived} type="owner" />
        ) : (
          <div className="bg-gray-50 rounded-md p-6 text-center">
            <p className="text-gray-600">You haven't received any requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}