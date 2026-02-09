import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatEpoch(epochMs, fallback = "-") {
  if (!epochMs) return fallback;
  return new Date(Number(epochMs)).toLocaleString();
}

export function PasteMeta({ paste, isEditorUnlocked = false }) {
  return (
    <Card>
      <CardHeader className="px-2 py-2 sm:px-3 md:px-4">
        <CardTitle className="text-lg">Detail Paste</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1 px-2 pb-3 pt-1 text-sm sm:grid-cols-2 sm:px-3 md:px-4">
        <p className="sm:col-span-2"><span className="font-medium">Judul:</span> {paste.title || "Tanpa Judul"}</p>
        <p><span className="font-medium">ID:</span> {paste.id}</p>
        <p><span className="font-medium">Visibilitas:</span> {paste.visibility}</p>
        <p><span className="font-medium">Dibuat:</span> {formatEpoch(paste.createdAt)}</p>
        <p><span className="font-medium">Terakhir diubah:</span> {formatEpoch(paste.updatedAt, formatEpoch(paste.createdAt))}</p>
        <p><span className="font-medium">Kedaluwarsa:</span> {formatEpoch(paste.expiresAt, "Tidak kedaluwarsa")}</p>
        <p><span className="font-medium">Diproteksi:</span> {paste.isProtected ? "Ya" : "Tidak"}</p>
        <p><span className="font-medium">Mode Edit:</span> {isEditorUnlocked ? "Aktif" : "Terkunci"}</p>
      </CardContent>
    </Card>
  );
}
