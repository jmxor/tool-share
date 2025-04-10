import { PostFiltersFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { z } from "zod";
import { PostFilterState } from "./tools-page-content";
import { Button } from "./ui/button";

export default function PostFiltersForm({
  setPostFiltersState,
  postFiltersState,
}: {
  setPostFiltersState: Dispatch<SetStateAction<PostFilterState>>;
  postFiltersState: PostFilterState;
}) {
  const form = useForm<z.output<typeof PostFiltersFormSchema>>({
    resolver: zodResolver(PostFiltersFormSchema),
    defaultValues: {
      name: "",
      location: "",
      max_deposit: 0,
      min_borrow_days: 0,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Form {...form}>
        <form
          ref={formRef}
          className="h-fit w-full rounded-lg border bg-white p-2 shadow-md lg:col-span-3"
        >
          <div className="mb-auto grid w-full grid-cols-2 gap-x-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="min-h-[84px]">
                  <FormLabel>Tool Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={postFiltersState.name}
                      onChange={(e) =>
                        setPostFiltersState((state) => ({
                          ...state,
                          name: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                  {/* <FormMessage>{state.errors?.name}</FormMessage> */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="min-h-[84px]">
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={postFiltersState.location}
                      onChange={(e) =>
                        setPostFiltersState((state) => ({
                          ...state,
                          location: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                  {/* <FormMessage>{state.errors?.name}</FormMessage> */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_deposit"
              render={({ field }) => (
                <FormItem className="min-h-[84px]">
                  <FormLabel>Max Deposit</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <div className="flex h-9 shrink-0 items-center justify-center rounded-md rounded-r-none border border-r-0 border-input px-3 shadow-sm">
                        £
                      </div>
                      <Input
                        {...field}
                        type="number"
                        step={0.01}
                        className="rounded-l-none"
                        value={postFiltersState.max_deposit}
                        onChange={(e) =>
                          setPostFiltersState((state) => ({
                            ...state,
                            max_deposit: (parseFloat(e.target.value) ||
                              "") as number,
                          }))
                        }
                      />
                    </div>
                  </FormControl>
                  {/* <FormMessage>{state.errors?.name}</FormMessage> */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="min_borrow_days"
              render={({ field }) => (
                <FormItem className="min-h-[84px]">
                  <FormLabel>Minimum Borrow Time</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <Input
                        {...field}
                        type="number"
                        value={postFiltersState.min_borrow_days}
                        className="rounded-r-none"
                        onChange={(e) =>
                          setPostFiltersState((state) => ({
                            ...state,
                            min_borrow_days: (parseFloat(e.target.value) ||
                              "") as number,
                          }))
                        }
                      />

                      <div className="flex h-9 shrink-0 items-center justify-center rounded-md rounded-l-none border border-l-0 border-input px-3 shadow-sm">
                        days
                      </div>
                    </div>
                  </FormControl>
                  {/* <FormMessage>{state.errors?.name}</FormMessage> */}
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </>
  );
}
