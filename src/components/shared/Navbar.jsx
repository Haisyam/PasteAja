import Link from "next/link";

import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <nav className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-18">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          {/* <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            PA
          </span> */}
          <span className="font-bold text-lg">PasteAja</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
