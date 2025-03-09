"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Ban, BarChart2, ChevronLeft, FileSpreadsheet, Flag, Menu, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const links = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: BarChart2
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users
    },
    {
      href: "/admin/reports",
      label: "Reports",
      icon: Flag
    },
    {
      href: "/admin/warnings",
      label: "Warnings",
      icon: AlertTriangle
    },
    {
      href: "/admin/suspensions",
      label: "Suspensions",
      icon: Ban
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: Tag
    },
    {
      href: "/admin/transactions",
      label: "Transactions",
      icon: FileSpreadsheet
    }
  ];

  // Sidebar content used in both desktop and mobile views
  const renderNavLinks = (onClick?: () => void) => (
    <nav className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-md w-full",
            pathname === link.href 
              ? "bg-purple-600 text-white" 
              : "hover:bg-purple-50"
          )}
        >
          <link.icon size={18} />
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
  
  // For desktop: show fixed sidebar
  if (!isMobile) {
    return (
      <aside className="w-64 h-screen bg-background border-r border-r-purple-200 fixed top-0 left-0 z-10 hidden lg:block">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={18} />
              <span>Back to site</span>
            </Link>
            <div className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">Admin</div>
          </div>
          
          <h1 className="text-xl font-semibold mb-6">Admin Dashboard</h1>
          
          {renderNavLinks()}
        </div>
      </aside>
    );
  }
  
  // For mobile: show hamburger button and slide-in sidebar
  return (
    <>
      {/* Mobile Hamburger Menu */}
      <div className="fixed bottom-16 left-4 z-50 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg border-2 border-white"
            >
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-purple-600">
            <div className="p-4">
              <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
              <div className="flex items-center justify-between mb-6">
                <Link 
                  href="/"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <ChevronLeft size={18} />
                  <span>Back to site</span>
                </Link>
                <div className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">Admin</div>
              </div>
              
              <h1 className="text-xl font-semibold mb-6">Admin Dashboard</h1>
              
              {renderNavLinks(() => setIsOpen(false))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}