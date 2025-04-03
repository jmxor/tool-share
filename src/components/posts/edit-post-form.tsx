"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  AllToolPostData,
  createTool,
  PostFormState,
} from "@/lib/posts/actions";
import { cn } from "@/lib/utils";
import { CreateToolFormSchema } from "@/lib/zod";
import { UploadDropzone } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Category = {
  id: number;
  name: string;
};

export default function EditPostForm({
  post,
  categories,
}: {
  post: AllToolPostData;
  categories: Category[];
}) {
  const initialState: PostFormState = {
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    createTool,
    initialState
  );
  const form = useForm<z.output<typeof CreateToolFormSchema>>({
    resolver: zodResolver(CreateToolFormSchema),
    defaultValues: {
      name: post.tool_name,
      description: post.description,
      deposit: post.deposit,
      max_borrow_days: post.max_borrow_days,
      location: post.postcode,
      image_urls: post.pictures,
      categories: post.categories.map((cat) =>
        categories.find((c) => c.name == cat)?.id.toString()
      ),
      ...(state?.fields ?? {}),
    },
    mode: "onTouched",
  });

  const formRef = useRef<HTMLFormElement>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : form.getValues("image_urls").length
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < form.getValues("image_urls").length ? prevIndex + 1 : 0
    );
  };

  return (
    <>
      <Form {...form}>
        <form
          ref={formRef}
          // onSubmit={form.handleSubmit(() => formRef.current?.submit())}
          // action={formAction}
          className="my-4 h-fit w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
        >
          <h2 className="mt-0 text-center text-3xl font-bold text-gray-800">
            Edit Tool
          </h2>
          <div className="space-y-2">
            {/*TODO: add multi image support, add dropzone support*/}
            <FormField
              control={form.control}
              name="image_urls"
              render={({ field }) => (
                <FormItem className="min-h-[84px] w-full">
                  <FormLabel>Images*</FormLabel>
                  <FormControl>
                    <Input {...field} type="hidden" />
                  </FormControl>
                  <div className="relative flex w-full overflow-clip">
                    {form.getValues("image_urls").length > 1 && (
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 z-50 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
                      >
                        <ChevronLeft />
                      </button>
                    )}

                    {form.watch("image_urls").map((image_url) => (
                      <div
                        key={image_url}
                        className="relative mt-0 aspect-square w-full shrink-0 overflow-clip rounded-md"
                        style={{
                          transform: `translate(-${currentImageIndex * 100}%)`,
                        }}
                      >
                        <button
                          onClick={() =>
                            form.setValue(
                              "image_urls",
                              form
                                .getValues("image_urls")
                                .filter((url) => url != image_url)
                            )
                          }
                          className="absolute right-2 top-2 z-50 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
                        >
                          <X />
                        </button>
                        <Image
                          src={image_url}
                          alt={"Tool Image"}
                          width={100}
                          height={100}
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </div>
                    ))}
                    <div
                      className="aspect-square w-full shrink-0"
                      style={{
                        transform: `translate(-${currentImageIndex * 100}%)`,
                      }}
                    >
                      <UploadDropzone
                        className="aspect-square w-full ut-button:bg-primary ut-button:hover:cursor-pointer"
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
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
                    </div>

                    {form.getValues("image_urls").length > 1 && (
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-200 p-1 opacity-75 hover:opacity-100"
                      >
                        <ChevronRight />
                      </button>
                    )}
                  </div>

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
                            "relative flex h-auto w-full flex-wrap justify-start pr-8",
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
                                  defaultChecked={post.categories.includes(
                                    category.name
                                  )}
                                  checked={field.value.includes(
                                    category.id.toString()
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
                                          (cat) =>
                                            cat !== category.id.toString()
                                        )
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
                      <div className="flex">
                        <div className="flex h-9 shrink-0 items-center justify-center rounded-md rounded-r-none border border-r-0 border-input px-3 shadow-sm">
                          £
                        </div>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          className="rounded-l-none"
                        />
                      </div>
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
                      <div className="flex">
                        <Input
                          {...field}
                          type="number"
                          className="rounded-r-none"
                        />
                        <div className="flex h-9 shrink-0 items-center justify-center rounded-md rounded-l-none border border-l-0 border-input px-3 shadow-sm">
                          days
                        </div>
                      </div>
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
                  <FormLabel>Postcode*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{state.errors?.location}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="w-full">
              Save
            </Button>
            <Button
              type="button"
              disabled={isPending}
              className="w-full"
              asChild
            >
              <Link href="/tools">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
