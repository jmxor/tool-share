import { PostFiltersFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useRef } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { z } from "zod";
import { PostFilterState } from "./tools-page-content";
import { Category } from "@/lib/posts/actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

export default function PostFiltersForm({
  setPostFiltersState,
  postFiltersState,
  categories,
}: {
  setPostFiltersState: Dispatch<SetStateAction<PostFilterState>>;
  postFiltersState: PostFilterState;
  categories: Category[];
}) {
  const form = useForm<z.output<typeof PostFiltersFormSchema>>({
    resolver: zodResolver(PostFiltersFormSchema),
    defaultValues: {
      name: "",
      location: "",
      max_deposit: 0,
      min_borrow_days: 0,
      categories: [],
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

            <div className="col-span-2 grid grid-cols-4 gap-x-2">
              <FormField
                control={form.control}
                name="max_deposit"
                render={({ field }) => (
                  <FormItem className="col-span-2 min-h-[84px] lg:col-span-1">
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
                  <FormItem className="col-span-2 min-h-[84px] lg:col-span-1">
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

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem className="col-span-4 mt-1 flex min-h-[84px] flex-col gap-y-1 lg:col-span-2">
                    <FormLabel>Categories</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "relative mt-0.5 flex h-auto w-full flex-wrap justify-start pr-8",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value.length > 0
                              ? field.value.map((c1) => (
                                  <Badge key={c1}>
                                    {
                                      categories.find(
                                        (c2) => c1 == c2.id.toString()
                                      )?.name
                                    }
                                  </Badge>
                                ))
                              : "Select categories"}
                            <ChevronDown className="absolute right-2 top-2.5 opacity-50" />
                            <Input {...field} type="hidden" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search categories..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  value={category.name}
                                  key={category.id}
                                >
                                  <Checkbox
                                    checked={field.value.includes(
                                      category.id.toString()
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        form.setValue("categories", [
                                          ...field.value,
                                          category.id.toString(),
                                        ]);
                                        setPostFiltersState((state) => ({
                                          ...state,
                                          categories: [
                                            ...postFiltersState.categories,
                                            category.name,
                                          ],
                                        }));
                                        form.clearErrors("categories");
                                      } else {
                                        // TODO: update errors on unselect
                                        form.setValue(
                                          "categories",
                                          field.value.filter(
                                            (cat) =>
                                              cat !== category.id.toString()
                                          )
                                        );
                                        setPostFiltersState((state) => ({
                                          ...state,
                                          categories:
                                            postFiltersState.categories.filter(
                                              (cat) => cat !== category.name
                                            ),
                                        }));
                                      }
                                      console.log(postFiltersState.categories);
                                    }}
                                  />
                                  {category.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
