import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t bg-background/80">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-center gap-1 px-2 py-4 text-xs text-muted-foreground sm:px-3 lg:px-4">
        <span>Copyright {year}</span>
        <span>•</span>
        <span>Made with</span>
        <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" aria-hidden="true" />
        <span>by</span>
        <Link
          href="https://haisyam.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          KhairizmiDev
        </Link>
      </div>
    </footer>
  );
}
