import { NavLink } from "@/components/header";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export function HeaderLinks({ links }: { links: NavLink[] }) {
  return (
    <NavigationMenu className="hidden lg:block">
      <NavigationMenuList>
        {links.map((link) => (
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
  );
}
