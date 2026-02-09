import { Toaster } from "sonner";
import { Roboto_Flex } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto-flex",
});

export const metadata = {
  title: "PasteAja",
  description: "Aplikasi pastebin aman berbasis Next.js dan Turso",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "PasteAja",
    description: "Aplikasi pastebin aman berbasis Next.js dan Turso",
    siteName: "PasteAja",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PasteAja - Berbagi Teks dengan Aman",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PasteAja",
    description: "Aplikasi pastebin aman berbasis Next.js dan Turso",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${robotoFlex.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
