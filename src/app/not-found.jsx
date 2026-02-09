import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold">Tidak Ditemukan</h1>
      <p className="text-muted-foreground">Paste tidak ditemukan atau sudah kedaluwarsa.</p>
      <Link href="/" className={buttonVariants()}>
        Buat Paste Baru
      </Link>
    </main>
  );
}
