import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReportForm from "@/components/reports/report-form";

export default async function NewReportPage({
  params,
}: {
  params: Promise<{ reported_first_username: string }>
}) {

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/auth/login")
  }

  const reported_first_username = (await params).reported_first_username;

  return (
    <ReportForm reported_first_username={reported_first_username} />
  );
}
