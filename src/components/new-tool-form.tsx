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
import { UploadDropzone } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useActionState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Category = {
  id: number;
  name: string;
};

export default function NewToolForm({
  categories,
}: {
  categories: Category[];
}) {
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
      image_urls: [],
      categories: [],
      ...(state?.fields ?? {}),
    },
    mode: "onTouched",
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
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

          {/*TODO: add multi image support, add dropzone support*/}
          <FormField
            control={form.control}
            name="image_urls"
            render={({ field }) => (
              <FormItem className="min-h-[84px]">
                <FormLabel>Images*</FormLabel>
                <FormControl>
                  <Input {...field} type="hidden" />
                </FormControl>
                <UploadDropzone
                  className="ut-button:bg-primary ut-button:hover:cursor-pointer"
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    // Do something with the response
                    form.setValue("image_urls", [
                      ...field.value,
                      ...res.map((image) => image.url),
                    ]);
                    form.clearErrors("image_urls");
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    alert(`ERROR! ${error.message}`);
                  }}
                />
                {form.watch("image_urls").map((image_url) => (
                  <Image
                    key={image_url}
                    src={image_url}
                    alt={""}
                    width={100}
                    height={100}
                  />
                ))}
                <FormMessage>{state.errors?.images}</FormMessage>
              </FormItem>
            )}
          />

          {/*TODO: limit size of categories select and scroll instead*/}
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
                          ? field.value
                              .map(
                                (c1) =>
                                  categories.find(
                                    (c2) => c1 == c2.id.toString(),
                                  )?.name,
                              )
                              .join(", ")
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
                              value={category.name}
                              key={category.id}
                            >
                              <Checkbox
                                checked={field.value.includes(
                                  category.id.toString(),
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    form.setValue("categories", [
                                      ...field.value,
                                      category.id.toString(),
                                    ]);
                                    form.clearErrors("categories");
                                  } else {
                                    // TODO: update errors on unselect
                                    form.setValue(
                                      "categories",
                                      field.value.filter(
                                        (cat) => cat !== category.id.toString(),
                                      ),
                                    );
                                  }
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
  );
}
