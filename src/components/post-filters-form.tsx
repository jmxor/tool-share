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
          className="col-span-2 row-span-1 h-auto w-full rounded-lg border bg-white p-2 shadow-md lg:col-span-3"
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
                  <FormLabel>Max Despoit</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step={0.01}
                      value={postFiltersState.max_deposit}
                      onChange={(e) =>
                        setPostFiltersState((state) => ({
                          ...state,
                          max_deposit: parseFloat(e.target.value),
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
              name="min_borrow_days"
              render={({ field }) => (
                <FormItem className="min-h-[84px]">
                  <FormLabel>Minimum Borrow Limit</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  {/* <FormMessage>{state.errors?.name}</FormMessage> */}
                </FormItem>
              )}
            />
          </div>

          {/* <Button
            type="submit"
            disabled={false}
            className="mt-0 w-full"
            size="sm"
          >
            Filter Results
          </Button> */}
        </form>
      </Form>
    </>
  );
}
