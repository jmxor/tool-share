import { HeaderLinks, NavLink } from "@/components/header-links";
import HeaderSearch from "@/components/header-search";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const navLinks: NavLink[] = [
  { label: "View Tools", url: "/tools" },
  { label: "How it Works", url: "/about" },
];

export default function Header() {
  return (
    <header className="flex h-16 w-full items-center border-b px-4">
      <div className="mr-auto">Tool Share</div>

      <div className="flex items-center gap-4">
        {/* Desktop Links*/}
        <HeaderLinks links={navLinks} />

        <HeaderSearch />

        <Button variant="outline" asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    </header>
  );
}
