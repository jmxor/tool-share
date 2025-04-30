import { auth } from "@/auth";
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
import { MenuIcon, MessageCircle } from "lucide-react";
import Link from "next/link";
import AccountButton from "@/components/accounts/account-button";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface NavLink {
  label: string;
  url: string;
}

const navLinks: NavLink[] = [
  { label: "Home", url: "/" },
  { label: "View Tools", url: "/tools" },
  { label: "How it Works", url: "/about" },
];

export default async function Header() {
  const session = await auth();

  return (
    <>
      <header className="flex h-16 w-full items-center gap-2 border-b px-4 md:px-8 md:py-10">
        <Sheet>
          <div className="mr-auto flex items-center">
            <SheetTrigger className="mr-2 lg:hidden">
              <MenuIcon />
            </SheetTrigger>
            <Link href="/">
              <Image
                className="hidden md:block"
                src="https://fm91r3r9rr.ufs.sh/f/ZkX4M83fedN1FIDZHXcygq7OTWXcLdVKs1BlQzUaCkJGrbMh"
                alt="Tool Share Logo"
                height={48}
                width={240}
              />
            </Link>
          </div>

          <div className="hidden w-full items-center justify-center gap-4 md:flex">
            <HeaderLinks links={navLinks} />
          </div>

          {session?.user ? (
            <AccountButton email={session?.user.email as string} />
          ) : (
            <Button variant="outline" asChild>
              <a href="/auth/login">Log In</a>
            </Button>
          )}

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
      {/* Mobile Search Bar */}
      {/* <div className={cn("w-full px-4 py-2 border-b md:hidden")}>
        <HeaderSearch />
      </div> */}

      {/* Chat Button for logged in users */}
      {session?.user && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="h-14 w-14 rounded-full p-0" asChild>
            <Link href="/chat">
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Chat</span>
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
