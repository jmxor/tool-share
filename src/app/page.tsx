import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, Plus, Search, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Share Tools, Save Money, Build Community
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Borrow the tools you need from people in your neighborhood.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/tools" className="gap-1">
                    Find Tools <Search />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/tools/new" className="gap-1">
                    List your Tools <Plus />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[450px]">
                <Image
                  src="/image.png"
                  alt="Tools arranged in a workshop"
                  className="h-full w-full object-cover"
                  width={350}
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                How ToolShare Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform makes it easy to borrow tools you need and share
                tools you own.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Find Tools</h3>
              <p className="text-muted-foreground">
                Search for tools in your area. Filter by category, price, and
                availability.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Book & Borrow</h3>
              <p className="text-muted-foreground">
                Reserve tools for the dates you need. Meet the owner for pickup
                or delivery.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Share Your Tools</h3>
              <p className="text-muted-foreground">
                List your tools, set availability, and give back to the
                community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Start Sharing?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join our community today and start borrowing or sharing tools.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <a href="/auth/login" className="flex gap-1">
                  Sign Up Now <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about" className="gap-1">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
