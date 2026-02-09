"use client";

import { useState } from "react";
import { Eye, EyeOff, LockOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PastePasswordDialog({ pasteId, onUnlocked }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/paste/${pasteId}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Gagal membuka paste.");
        return;
      }

      const body = await response.json();
      setPassword("");
      onUnlocked?.(body.paste);
    } catch {
      setError("Terjadi gangguan jaringan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paste Diproteksi</DialogTitle>
          <DialogDescription>Masukkan password untuk membuka paste ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlock-password">Password</Label>
            <div className="relative">
              <Input
                id="unlock-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={isLoading} aria-label="Buka Paste" title="Buka Paste" className="gap-2">
            <LockOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{isLoading ? "Membuka..." : "Buka Paste"}</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
