import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";

export default function SiteLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-2 py-6 sm:px-3 lg:px-4 lg:py-8">{children}</main>
      <Footer />
    </div>
  );
}
