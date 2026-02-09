import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { rateLimit } from "@/lib/rateLimit";
import { applySecurityHeaders } from "@/lib/securityHeaders";
import {
  EDIT_ACCESS_COOKIE_NAME,
  getClientIp,
  isSameOriginRequest,
} from "@/server/services/auth.service";
import {
  getPasteForAccess,
  deletePasteForEditor,
  updatePasteForEditor,
} from "@/server/services/paste.service";

const UPDATE_WINDOW_MS = 10 * 60 * 1000;
const UPDATE_LIMIT = 30;

export async function GET(request, { params }) {
  const { id } = await params;

  const result = await getPasteForAccess(id, {
    ip: getClientIp(request),
  });

  if (result.status === "not_found") {
    return applySecurityHeaders(
      NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 }),
    );
  }

  if (result.status === "locked") {
    return applySecurityHeaders(
      NextResponse.json({ error: "Resource terkunci" }, { status: 401 }),
    );
  }

  return applySecurityHeaders(NextResponse.json(result.paste, { status: 200 }));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const ip = getClientIp(request);

  if (!isSameOriginRequest(request)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Permintaan diblokir" }, { status: 403 }),
    );
  }

  const updateLimit = rateLimit(`update-paste:${ip}:${id}`, {
    limit: UPDATE_LIMIT,
    windowMs: UPDATE_WINDOW_MS,
  });
  if (!updateLimit.allowed) {
    const response = NextResponse.json(
      { error: "Terlalu banyak permintaan" },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(updateLimit.retryAfter));
    return applySecurityHeaders(response);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(EDIT_ACCESS_COOKIE_NAME)?.value;

  try {
    const body = await request.json();
    const result = await updatePasteForEditor(id, token, body, { ip });

    if (result.status === "not_found") {
      return applySecurityHeaders(
        NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 }),
      );
    }

    if (result.status === "locked") {
      return applySecurityHeaders(
        NextResponse.json({ error: "Access key diperlukan" }, { status: 401 }),
      );
    }

    return applySecurityHeaders(
      NextResponse.json(
        { ok: true, title: result.title, content: result.content },
        { status: 200 },
      ),
    );
  } catch {
    return applySecurityHeaders(
      NextResponse.json({ error: "Gagal menyimpan perubahan" }, { status: 400 }),
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const ip = getClientIp(request);

  if (!isSameOriginRequest(request)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Permintaan diblokir" }, { status: 403 }),
    );
  }

  const updateLimit = rateLimit(`delete-paste:${ip}:${id}`, {
    limit: UPDATE_LIMIT,
    windowMs: UPDATE_WINDOW_MS,
  });
  if (!updateLimit.allowed) {
    const response = NextResponse.json(
      { error: "Terlalu banyak permintaan" },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(updateLimit.retryAfter));
    return applySecurityHeaders(response);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(EDIT_ACCESS_COOKIE_NAME)?.value;

  const result = await deletePasteForEditor(id, token, { ip });

  if (result.status === "not_found") {
    return applySecurityHeaders(
      NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 }),
    );
  }

  if (result.status === "locked") {
    return applySecurityHeaders(
      NextResponse.json({ error: "Access key diperlukan" }, { status: 401 }),
    );
  }

  return applySecurityHeaders(
    NextResponse.json({ ok: true }, { status: 200 }),
  );
}
