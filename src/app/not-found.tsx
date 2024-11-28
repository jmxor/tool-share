"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 p-4">
      <h1>Error 404, Not Found!</h1>
      <Button variant="outline" onClick={() => router.back()}>
        Go Back
      </Button>
    </div>
  );
}
