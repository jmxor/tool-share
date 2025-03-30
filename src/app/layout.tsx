import { ourFileRouter } from "@/app/api/uploadthing/core";
import Header from "@/components/header";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import "./globals.css";
import { extractRouterConfig } from "uploadthing/server";

export const metadata: Metadata = {
  title: "ToolShare",
  description: "A platform to facilitate users Lending and Borrowing tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Header />
        {children}
      </body>
    </html>
  );
}
