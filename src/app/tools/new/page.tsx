"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTool, ToolState } from "@/lib/actions";
import { Plus, X } from "lucide-react";
import { useActionState } from "react";

export default function NewToolPage() {
  const initialState: ToolState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createTool, initialState);

  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50">
      <form
        action={formAction}
        className="mb-20 mt-20 h-fit w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
      >
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Share a new Tool
        </h2>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Name*</Label>
            <Input id="name" name="name" type="text" className="w-full" />
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="px-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="description">Description*</Label>
            <Textarea id="description" name="description" className="w-full" />
            {state.errors?.description &&
              state.errors.description.map((error: string) => (
                <p className="px-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="deposit">Deposit*</Label>
            <Input
              id="deposit"
              name="deposit"
              type="number"
              step="0.01"
              className="w-full"
            />
            {state.errors?.deposit &&
              state.errors.deposit.map((error: string) => (
                <p className="px-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="max_borrow_days">Max Borrow Period (days)*</Label>
            <Input
              id="max_borrow_days"
              name="max_borrow_days"
              type="number"
              className="w-full"
            />
            {state.errors?.max_borrow_days &&
              state.errors.max_borrow_days.map((error: string) => (
                <p className="px-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="location">Location (postcode)*</Label>
            <Input
              id="location"
              name="location"
              type="text"
              className="w-full"
            />
            {state.errors?.location &&
              state.errors.location.map((error: string) => (
                <p className="px-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="images">Images*</Label>
            <Input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              className="w-full"
              multiple
            />
            {state.errors?.images &&
              state.errors.images.map((error: string) => (
                <p className="px-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="">Categories</Label>
            <div className="flex gap-2">
              <Badge variant="outline">
                Power Tools
                <X size={24} className="ml-1 rounded-full bg-gray-50 p-1" />
              </Badge>
              <Button type="button" variant="outline" size="icon">
                <Plus size={16} />
              </Button>
            </div>
            {state.errors?.categories &&
              state.errors.categories.map((error: string) => (
                <p className="px-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Share
        </Button>
      </form>
    </div>
  );
}
