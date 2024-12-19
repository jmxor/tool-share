import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import AccountButton from "@/components/accounts/account-button";

interface NavLink {
  label: string;
  url: string;
}

const navLinks: NavLink[] = [
  { label: "Home", url: "/"},
  { label: "View Tools", url: "/tools" },
  { label: "How it Works", url: "/about" },
];

export default async function Header() {
  const session = await auth();

  return (
    <header className="flex h-16 w-full items-center border-b px-8">
      <Link href="/" className="mr-auto text-xl">
        Tool Share
      </Link>

      <NavigationMenu className="mr-4">
        <NavigationMenuList>
          {navLinks.map((link) => (
            <NavigationMenuItem key={link.url}>
              <Link href={link.url} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {link.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-4">
        <div className="flex rounded-md has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring">
          <Input
            type="search"
            placeholder="Search tools..."
            className="rounded-r-none border-r-0 focus-visible:ring-0"
          />
          <Button type="submit" variant="outline" className="rounded-l-none">
            Go
          </Button>
        </div>
        { session?.user ? 
            <AccountButton email={session?.user.email as string} />
          :
            <Button variant="outline" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
        }
      </div>
    </header>
  );
}
