"use client";

import { useState } from "react";

import { PastePasswordDialog } from "@/components/paste/PastePasswordDialog";
import { PasteView } from "@/components/paste/PasteView";

export function ProtectedPasteClient({ pasteId, initialCanEdit = false }) {
  const [unlockedPaste, setUnlockedPaste] = useState(null);

  if (unlockedPaste) {
    return <PasteView paste={unlockedPaste} initialCanEdit={initialCanEdit} />;
  }

  return <PastePasswordDialog pasteId={pasteId} onUnlocked={setUnlockedPaste} />;
}
