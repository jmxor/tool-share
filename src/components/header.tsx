import { HeaderLinks } from "@/components/header-links";
import HeaderSearch from "@/components/header-search";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

export interface NavLink {
  label: string;
  url: string;
}

const navLinks: NavLink[] = [
  { label: "Home", url: "/"},
  { label: "View Tools", url: "/tools" },
  { label: "How it Works", url: "/about" },
];

export default function Header() {
  return (
    <header className="flex h-16 w-full items-center border-b px-4">
      <Sheet>
        <div className="mr-auto flex items-center">
          <SheetTrigger className="mr-2 lg:hidden">
            <MenuIcon />
          </SheetTrigger>
          <Link href="/" className="mr-auto text-xl">
            Tool Share
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Links*/}
          <HeaderLinks links={navLinks} />

          <HeaderSearch />

          <Button variant="outline" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>

        {/* Mobile Links*/}
        <SheetContent side="left">
          <SheetHeader>
            <VisuallyHidden>
              <SheetTitle>Sidebar Links</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>
          <ul className="w-full pt-2">
            {navLinks.map((link) => (
              <li
                key={link.label}
                className="flex w-full items-center gap-y-2 rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={link.url} className="w-full px-4 py-2">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </header>
  );
}
