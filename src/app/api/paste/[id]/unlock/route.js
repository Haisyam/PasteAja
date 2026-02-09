import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/rateLimit";
import { applySecurityHeaders } from "@/lib/securityHeaders";
import {
  getClientIp,
  isSameOriginRequest,
} from "@/server/services/auth.service";
import { unlockPasteAndGetContent } from "@/server/services/paste.service";

const UNLOCK_WINDOW_MS = 10 * 60 * 1000;
const UNLOCK_LIMIT = 15;

export async function POST(request, { params }) {
  const { id } = await params;
  const ip = getClientIp(request);

  if (!isSameOriginRequest(request)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Permintaan diblokir" }, { status: 403 }),
    );
  }

  const unlockLimit = rateLimit(`unlock:${ip}:${id}`, {
    limit: UNLOCK_LIMIT,
    windowMs: UNLOCK_WINDOW_MS,
  });

  if (!unlockLimit.allowed) {
    const response = NextResponse.json(
      { error: "Terlalu banyak permintaan" },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(unlockLimit.retryAfter));
    return applySecurityHeaders(response);
  }

  try {
    const body = await request.json();
    const result = await unlockPasteAndGetContent(id, body, { ip });

    if (result.status === "not_found") {
      return applySecurityHeaders(
        NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 }),
      );
    }

    if (result.status !== "ok") {
      return applySecurityHeaders(
        NextResponse.json({ error: "Password tidak valid" }, { status: 401 }),
      );
    }

    const response = NextResponse.json({ ok: true, paste: result.paste }, { status: 200 });
    response.headers.set("Cache-Control", "no-store");
    return applySecurityHeaders(response);
  } catch {
    return applySecurityHeaders(
      NextResponse.json({ error: "Gagal membuka paste" }, { status: 400 }),
    );
  }
}
