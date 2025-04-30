"use client";

import { createReport, ReportFormState } from "@/lib/reports/actions";
import { ReportFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ReportForm({ reported_first_username }: { reported_first_username: string }) {
  const initialState: ReportFormState = {
    message: undefined,
    errors: {}
  }
  const [state, formAction] = useActionState(
    createReport,
    initialState,
  );

  const form = useForm<z.output<typeof ReportFormSchema>>({
    resolver: zodResolver(ReportFormSchema),
    defaultValues: {
      profileURL: reported_first_username,
      reportDescription: "",
    },
    mode: "onTouched",
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(() => formRef.current?.submit())}
          action={formAction}
          className="w-full max-w-md space-y-2 rounded-lg bg-white p-8 shadow-md h-fit mt-20 mx-6"
        >
          <h2 className="text-center text-3xl font-bold">Report</h2>
          <FormField
            control={form.control}
            name="profileURL"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="px-2 font-medium text-gray-700">User you want to report</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-1 bg-gray-50 px-4 py-1 rounded-lg">
                    <p className="text-nowrap text-gray-500">/users/</p>
                    <Input
                      {...field}
                      type="text"
                      value={reported_first_username}
                      placeholder="unique_username"
                      className="w-20 bg-transparent shadow-none px-1 text-center"
                    />
                  </div>
                </FormControl>
                <FormMessage>{state.errors?.profileURL}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reportDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="px-2 font-medium text-gray-700">Describe the reason for the report</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Write a detailed account of the reason for the report."
                    className="bg-gray-50 h-36"
                  />
                </FormControl>
                <FormMessage>{state.errors?.reportDescription}</FormMessage>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">Submit Report</Button>
          {state.success === false ? <p className="text-red-400 flex justify-center text-sm">{state.message}</p> : ""}
        </form>
      </Form>
    </div>
  );
}
