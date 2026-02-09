"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, FileCode2, KeyRound, Link2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/lib/copy";

import { PasteMeta } from "@/components/paste/PasteMeta";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";

export function PasteView({ paste, initialCanEdit }) {
  const router = useRouter();
  const [title, setTitle] = useState(paste.title ?? "");
  const [content, setContent] = useState(paste.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorUnlocked, setIsEditorUnlocked] = useState(initialCanEdit);
  const [isAccessKeyModalOpen, setIsAccessKeyModalOpen] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState("");
  const [isUnlockingEditor, setIsUnlockingEditor] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const effectiveTitle = useMemo(() => title.trim(), [title]);
  const metaPaste = useMemo(
    () => ({ ...paste, title: effectiveTitle || null }),
    [effectiveTitle, paste],
  );
  const lastSavedRef = useRef({
    title: paste.title ?? "",
    content: paste.content,
  });

  const isDirty =
    (title ?? "") !== (lastSavedRef.current.title ?? "") ||
    content !== lastSavedRef.current.content;

  async function copyContent() {
    try {
      const copied = await copyToClipboard(content);
      if (!copied) throw new Error("copy_failed");
      toast.success("Isi paste berhasil disalin");
    } catch {
      toast.error("Gagal menyalin isi paste");
    }
  }

  async function copyPasteUrl() {
    try {
      const copied = await copyToClipboard(`${window.location.origin}/p/${paste.id}`);
      if (!copied) throw new Error("copy_failed");
      toast.success("URL paste berhasil disalin");
    } catch {
      toast.error("Gagal menyalin URL paste");
    }
  }

  async function persistChanges({ silent = false } = {}) {
    if (isSaving) return;

    if (!isEditorUnlocked) {
      if (!silent) {
        toast.error("Masukkan access key untuk mengedit");
      }
      return;
    }

    if (!isDirty) {
      if (!silent) {
        toast.message("Belum ada perubahan untuk disimpan");
      }
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/paste/${paste.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Gagal menyimpan perubahan" }));
        if (!silent) {
          toast.error(body.error ?? "Gagal menyimpan perubahan");
        } else {
          toast.error("Autosave gagal");
        }
        return;
      }

      lastSavedRef.current = {
        title,
        content,
      };

      if (!silent) {
        toast.success("Perubahan berhasil disimpan");
      }
    } catch {
      if (!silent) {
        toast.error("Terjadi gangguan jaringan");
      } else {
        toast.error("Autosave gagal");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function unlockEditor(event) {
    event.preventDefault();
    setIsUnlockingEditor(true);

    try {
      const response = await fetch(`/api/paste/${paste.id}/edit-unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessKey: accessKeyInput }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Access key tidak valid" }));
        toast.error(body.error ?? "Access key tidak valid");
        return;
      }

      setIsEditorUnlocked(true);
      setAccessKeyInput("");
      setIsAccessKeyModalOpen(false);
      toast.success("Mode edit aktif");
    } catch {
      toast.error("Terjadi gangguan jaringan");
    } finally {
      setIsUnlockingEditor(false);
    }
  }

  async function deletePaste() {
    if (!isEditorUnlocked) {
      toast.error("Masukkan access key untuk menghapus");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/paste/${paste.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Gagal menghapus paste" }));
        toast.error(body.error ?? "Gagal menghapus paste");
        return;
      }

      toast.success("Paste berhasil dihapus");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Terjadi gangguan jaringan");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  useEffect(() => {
    if (!isEditorUnlocked) return undefined;

    const timer = setInterval(() => {
      if (isDirty) {
        persistChanges({ silent: true });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isEditorUnlocked, isDirty, title, content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader className="px-2 pt-4 sm:px-3 md:px-4">
          <CardTitle>{effectiveTitle || "Tanpa Judul"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2 pb-4 sm:px-3 md:px-4">
          {isEditorUnlocked ? (
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Tanpa Judul"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="edit-content">Isi Paste</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-[560px] font-mono text-xs"
              readOnly={!isEditorUnlocked}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={copyContent} aria-label="Salin Isi" title="Salin Isi" className="gap-2">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Salin Isi</span>
            </Button>
            <Button onClick={copyPasteUrl} variant="secondary" aria-label="Salin URL" title="Salin URL" className="gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Salin URL</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsAccessKeyModalOpen(true)}
              variant={isEditorUnlocked ? "ghost" : "outline"}
              className="gap-2"
              aria-label="Masukkan Access Key"
              title={isEditorUnlocked ? "Access Key Aktif" : "Masukkan Access Key"}
            >
              <KeyRound className="h-4 w-4" />
              <span className="hidden sm:inline">{isEditorUnlocked ? "Access Key Aktif" : "Masukkan Access Key"}</span>
            </Button>
            <Link
              href={`/raw/${paste.id}`}
              target="_blank"
              rel="noreferrer"
              className={`${buttonVariants({ variant: "outline" })} gap-2`}
              aria-label="Lihat Raw"
              title="Lihat Raw"
            >
              <FileCode2 className="h-4 w-4" />
              <span className="hidden sm:inline">Lihat Raw</span>
            </Link>
            <Button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              aria-label="Hapus Paste"
              title="Hapus Paste"
              disabled={!isEditorUnlocked}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Hapus Paste</span>
            </Button>
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={() => persistChanges({ silent: false })}
              disabled={!isEditorUnlocked || !isDirty || isSaving}
              aria-label="Simpan Semua Perubahan"
              title="Simpan Semua Perubahan"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{isSaving ? "Menyimpan..." : "Simpan Semua Perubahan"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <PasteMeta paste={metaPaste} isEditorUnlocked={isEditorUnlocked} />

      <Dialog open={isAccessKeyModalOpen} onOpenChange={setIsAccessKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masukkan Access Key</DialogTitle>
            <DialogDescription>
              Access key diperlukan untuk mengedit judul dan isi paste ini.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={unlockEditor}>
            <div className="space-y-2">
              <Label htmlFor="editor-access-key">Access Key</Label>
              <Input
                id="editor-access-key"
                value={accessKeyInput}
                onChange={(event) => setAccessKeyInput(event.target.value)}
                placeholder="Masukkan access key"
                autoComplete="off"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isUnlockingEditor} aria-label="Aktifkan Edit" title="Aktifkan Edit" className="gap-2">
                <KeyRound className="h-4 w-4" />
                <span className="hidden sm:inline">{isUnlockingEditor ? "Memverifikasi..." : "Aktifkan Edit"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Paste</DialogTitle>
            <DialogDescription>
              Tindakan ini permanen. Paste yang sudah dihapus tidak bisa dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={deletePaste}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
