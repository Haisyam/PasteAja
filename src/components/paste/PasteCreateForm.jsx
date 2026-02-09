"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";

import { copyToClipboard } from "@/lib/copy";
import { Check, Copy, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const expirationOptions = [
  { label: "10 menit", value: "10m" },
  { label: "1 jam", value: "1h" },
  { label: "1 hari", value: "1d" },
  { label: "1 minggu", value: "1w" },
  { label: "Tidak kedaluwarsa", value: "never" },
];

export function PasteCreateForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("unlisted");
  const [expiration, setExpiration] = useState("never");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [createdPasteId, setCreatedPasteId] = useState("");
  const [isAccessKeyDialogOpen, setIsAccessKeyDialogOpen] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, visibility, expiration, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Gagal" }));
        toast.error(body.error ?? "Gagal membuat paste");
        return;
      }

      const body = await response.json();
      setAccessKey(body.accessKey);
      setCreatedPasteId(body.id);
      setIsAccessKeyDialogOpen(true);
      toast.success("Paste berhasil dibuat");
    } catch {
      toast.error("Terjadi gangguan jaringan");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyAccessKey() {
    try {
      const copied = await copyToClipboard(accessKey);
      if (!copied) throw new Error("copy_failed");
      toast.success("Access key berhasil disalin");
    } catch {
      toast.error("Gagal menyalin access key");
    }
  }

  function goToPaste() {
    setIsAccessKeyDialogOpen(false);
    router.push(`/p/${createdPasteId}`);
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <CardHeader className="px-4 pt-4 sm:px-4 md:px-4">
            <CardTitle>Buat Paste</CardTitle>
            <CardDescription>Simpan teks dengan opsi password dan kedaluwarsa.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-3 md:px-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul (Opsional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Query laporan mingguan"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Isi Paste</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Tempel teks kamu di sini"
                  className="min-h-[460px] font-mono text-sm"
                  maxLength={102400}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Visibilitas</Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Publik</SelectItem>
                      <SelectItem value="unlisted">Tidak Terindeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kedaluwarsa</Label>
                  <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expirationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Opsional)</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Kosongkan jika tidak perlu"
                  maxLength={128}
                />
              </div>

              <Button type="submit" disabled={isLoading} aria-label="Buat Paste" title="Buat Paste" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{isLoading ? "Membuat..." : "Buat Paste"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isAccessKeyDialogOpen} onOpenChange={setIsAccessKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simpan Access Key Kamu</DialogTitle>
            <DialogDescription>
              Access key dipakai untuk mengedit judul dan isi paste. Simpan baik-baik karena tidak bisa ditampilkan ulang.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="generated-access-key">Access Key</Label>
            <Input id="generated-access-key" value={accessKey} readOnly className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={copyAccessKey} aria-label="Salin Access Key" title="Salin Access Key" className="gap-2">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Salin Access Key</span>
            </Button>
            <Button onClick={goToPaste} aria-label="Buka Paste" title="Buka Paste" className="gap-2">
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Saya Sudah Simpan, Buka Paste</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
