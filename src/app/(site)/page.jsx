import { PasteCreateForm } from "@/components/paste/PasteCreateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.7fr,1.7fr] lg:items-start">
      <div className="space-y-4 px-2 sm:px-3 lg:px-14 py-4 lg:py-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:justify-center">
          <div className="space-y-3 lg:max-w-lg">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Berbagi Teks dengan Aman
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Simpan teks dengan cepat, atur masa aktif, beri password jika
              perlu, lalu bagikan link dengan aman.
            </p>
          </div>
          <Card className="mx-auto w-[92%] max-w-md rotate-2 border-white/20 bg-black/70 font-mono text-white shadow-2xl backdrop-blur-xl sm:w-[88%] lg:mx-0 lg:w-[440px] lg:max-w-[440px]">
            <CardHeader className="px-3 pt-4 pb-2 sm:px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-zinc-300">bash</span>
              </div>
              <CardTitle className="pt-3 text-sm text-zinc-100">
                Kenapa Pakai PasteAja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-4 text-xs sm:px-4 sm:text-sm">
              <p className="text-emerald-400">
                $ Proteksi password opsional dengan token akses 10 menit.
              </p>
              <p className="text-zinc-200">
                + Raw endpoint untuk integrasi tooling.
              </p>
              <p className="text-zinc-200">
                + Kebijakan kedaluwarsa dan rate limiting anti-abuse.
              </p>
              <p className="text-emerald-400">$</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="px-2 sm:px-3 lg:px-14">
        <PasteCreateForm />
      </div>
    </section>
  );
}
