"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTool, ToolState } from "@/lib/actions";
import { CreateToolFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function NewToolPage() {
  const initialState: ToolState = {
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    createTool,
    initialState,
  );
  const form = useForm<z.output<typeof CreateToolFormSchema>>({
    resolver: zodResolver(CreateToolFormSchema),
    defaultValues: {
      name: "",
      description: "",
      deposit: 0,
      max_borrow_days: 0,
      location: "",
      images: "",
      categories: "Power Tools",
      ...(state?.fields ?? {}),
    },
    mode: "onTouched",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = form.register("images");

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(() => formRef.current?.submit())}
          action={formAction}
          className="mb-20 mt-20 h-fit w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
        >
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Share a new Tool
          </h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{state.errors?.name}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage>{state.errors?.description}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit*</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" />
                  </FormControl>
                  <FormMessage>{state.errors?.deposit}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_borrow_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Borrow Period*</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage>{state.errors?.max_borrow_days}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{state.errors?.location}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images*</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" multiple {...fileRef} />
                  </FormControl>
                  <FormMessage>{state.errors?.images}</FormMessage>
                </FormItem>
              )}
            />

            {/* TODO create custom categories input field*/}
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{state.errors?.name}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            Share
          </Button>
        </form>
      </Form>
    </div>
  );
}
