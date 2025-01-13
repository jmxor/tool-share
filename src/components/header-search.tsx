import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HeaderSearch() {
  return (
    <div className="flex">
      <Input
        type="search"
        placeholder="Search tools..."
        className="rounded-r-none border-r-0 focus-visible:ring-0"
      />
      <Button type="submit" variant="outline" className="w-9 rounded-l-none">
        <Search size={8} />
      </Button>
    </div>
  );
}
