"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createTool, ToolState } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { CreateToolFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useActionState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function NewToolPage() {
  // TODO: request categories from database using server action
  type Category = {
    id: number;
    value: string;
  };
  const categories: Category[] = [
    { id: 0, value: "Power Tools" },
    { id: 1, value: "Hand Tools" },
    { id: 2, value: "Hammer" },
    { id: 3, value: "Screwdriver" },
    { id: 4, value: "Nail gun" },
  ];
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
      deposit: 1.0,
      max_borrow_days: 1,
      location: "",
      images: "",
      categories: [],
      ...(state?.fields ?? {}),
    },
    mode: "onTouched",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = form.register("images");

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50 px-4">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(() => formRef.current?.submit())}
          action={formAction}
          className="my-4 h-fit w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
        >
          <h2 className="mt-0 text-center text-3xl font-bold text-gray-800">
            Share a new Tool
          </h2>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="min-h-[84px]">
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
                <FormItem className="min-h-[108px]">
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage>{state.errors?.description}</FormMessage>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem className="min-h-[84px]">
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
                  <FormItem className="min-h-[84px]">
                    <FormLabel>Max Borrow Period*</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage>{state.errors?.max_borrow_days}</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="min-h-[84px]">
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
                <FormItem className="min-h-[84px]">
                  <FormLabel>Images*</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" multiple {...fileRef} />
                  </FormControl>
                  <FormMessage>{state.errors?.images}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Categories</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value.length > 0
                            ? field.value.join(", ")
                            : "Select categories"}
                          <ChevronDown className="opacity-50" />
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
                                value={category.value}
                                key={category.id}
                              >
                                <Checkbox
                                  checked={field.value.includes(category.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      form.setValue("categories", [
                                        ...field.value,
                                        category.value,
                                      ]);
                                      form.clearErrors("categories");
                                    } else {
                                      // TODO: update errors on unselect
                                      form.setValue(
                                        "categories",
                                        field.value.filter(
                                          (cat) => cat !== category.value,
                                        ),
                                      );
                                    }
                                  }}
                                />
                                {category.value}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage>{state.errors?.categories}</FormMessage>
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
