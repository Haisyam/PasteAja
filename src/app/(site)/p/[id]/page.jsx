import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { ProtectedPasteClient } from "@/components/paste/ProtectedPasteClient";
import { PasteView } from "@/components/paste/PasteView";
import {
  EDIT_ACCESS_COOKIE_NAME,
} from "@/server/services/auth.service";
import {
  canEditPaste,
  getPasteForAccess,
  getPasteVisibilityInfo,
} from "@/server/services/paste.service";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const info = await getPasteVisibilityInfo(id);

  if (info.status !== "ok") {
    return {
      title: "Paste | PasteAja",
    };
  }

  const pageTitle = info.title?.trim() ? info.title.trim() : "Untitled";

  return {
    title: `${pageTitle} | PasteAja`,
  };
}

export default async function PasteDetailPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  const editToken = cookieStore.get(EDIT_ACCESS_COOKIE_NAME)?.value;
  const initialCanEdit = await canEditPaste(id, editToken);

  const result = await getPasteForAccess(id, { ip });

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "locked") {
    const info = await getPasteVisibilityInfo(id);
    if (info.status === "not_found") {
      notFound();
    }

    return (
      <section className="space-y-4">
        <ProtectedPasteClient pasteId={id} initialCanEdit={initialCanEdit} />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <PasteView paste={result.paste} initialCanEdit={initialCanEdit} />
    </section>
  );
}
