"use server";

import { auth } from "@/auth";
import { ReportFormSchema } from "../zod";
import { getEmailID, getFirstUsernameID } from "../auth/actions";
import { getConnection } from "../db";
import { redirect } from "next/navigation";

export type ReportFormState = {
  errors?: {
    profileURL?: string[],
    reportDescription?: string[]
  },
  message?: string,
  success?: boolean
}

export async function createReport(
  prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return {
      message: "You must be logged in to submit a review.",
      success: false
    }
  }

  const reporterID = await getEmailID(session.user.email);
  if (!reporterID) {
    return {
      message: "Unable to find your email. Try again later.",
      success: false
    }
  }

  const data = {
    ...Object.fromEntries(formData),
  };

  const validatedFields = ReportFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
      message: "Failed to create report, try again.",
      success: false
    }
  }

  const reportedID = await getFirstUsernameID(validatedFields.data.profileURL);
  if (!reportedID) {
    return {
      message: "Unable to find user to report. Try again later.",
      success: false
    }
  }

  if (reporterID === reportedID) {
    return {
      message: "You cannot report yourself.",
      success: false
    }
  }

  let newReportId: number | null = null
  try {
    const conn = await getConnection();
    const query = `
      INSERT INTO report (accuser_id, accused_id, report_description, report_status)
      VALUES ($1, $2, $3, 'open')
      RETURNING id;
    `;

    const result = await conn.query(query, [reporterID, reportedID, validatedFields.data.reportDescription])

    newReportId = result.rows[0].id;

  } catch (error) {
    console.error("[ERROR] Failed to create report: ", error);
    return {
      message: "Failed to create the report. Try again later.",
      success: false
    }
  }

  if (newReportId) {
    redirect(`/reports/${newReportId}`)
  }
}

export type Report = {
  id: number;
  reporter_id: number;
  reporter_first_username: string;
  reporter_username: string;
  reported_id: number;
  reported_username: string;
  reported_first_username: string;
  report_text: string;
  report_messages: Report_Message[]
}

export type Report_Message = {
  id: number;
  user_id: number;
  user_first_username: string;
  user_username: string;
  message_text: string;
  sent_at: Date;
}

export async function getReportData(report_id: number): Promise<Report | null> {
  try {
    const query = `
      SELECT
        r.id AS report_id,
        r.accuser_id AS reporter_id,
        u1.first_username AS reporter_first_username,
        u1.username AS reporter_username,
        r.accused_id AS reported_id,
        u2.username AS reported_username,
        u2.first_username AS reported_first_username,
        r.report_description AS report_text,
        (
             SELECT
                  json_agg(
                      json_build_object(
                          'id', rm.id,
                          'user_id', rm.user_id,
                          'user_first_username', u3.first_username,
                          'user_username', u3.username,
                          'message_text', rm.message,
                          'sent_at', rm.sent_at
                      )
                  )
              FROM
                  report_message rm
              JOIN
                  public.user u3 ON rm.user_id = u3.id
              WHERE
                  rm.report_id = r.id
          ) AS report_messages
      FROM
        report r
      JOIN
        public.user u1 ON r.accuser_id = u1.id
      JOIN
        public.user u2 ON r.accused_id = u2.id
      WHERE
        r.id = $1;
    `;

    const conn = await getConnection();
    const result = await conn.query(query, [report_id])

    const rowCount = result.rowCount || 0;
    if (rowCount <= 0) {
      return null
    }

    const report = result.rows[0];

    return {
      id: report.report_id,
      reporter_id: report.reporter_id,
      reporter_first_username: report.reporter_first_username,
      reporter_username: report.reporter_username,
      reported_id: report.reported_id,
      reported_username: report.reported_username,
      reported_first_username: report.reported_first_username,
      report_text: report.report_text,
      report_messages: report.report_messages || [], // Ensure it's an array
    } as Report;

  } catch (error) {
    console.error("[ERROR] Failed to get report data: ", error);
    return null;
  }
}
