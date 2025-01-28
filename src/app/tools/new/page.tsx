"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export default function NewToolPage() {
  return (
    <div className="mb-auto flex w-full flex-1 justify-center bg-gray-50">
      <form
        onSubmit={() => {}}
        className="mb-20 mt-20 h-fit w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
      >
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Share a new Tool
        </h2>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="tool-name">Name</Label>
            <Input
              id="tool-name"
              name="tool_name"
              type="text"
              className="w-full"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" className="w-full" />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="deposit">Deposit</Label>
            <Input
              id="deposit"
              name="deposit"
              type="number"
              className="w-full"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="borrow_limit">Max Borrow Period (days)</Label>
            <Input
              id="borrow_limit"
              name="borrow_limit"
              type="number"
              className="w-full"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="location">Location (postcode)</Label>
            <Input
              id="location"
              name="location"
              type="text"
              className="w-full"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              name="images"
              type="file"
              className="w-full"
              multiple
            />
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
          </div>
        </div>

        <Button type="submit" className="w-full">
          Share
        </Button>
        {/*{error ? (*/}
        {/*  <p className="flex justify-center text-sm text-red-400">{error}</p>*/}
        {/*) : (*/}
        {/*  ""*/}
        {/*)}*/}
      </form>
    </div>
  );
}
