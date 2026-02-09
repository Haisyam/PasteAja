import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/rateLimit";
import { applySecurityHeaders } from "@/lib/securityHeaders";
import {
  buildEditAccessCookie,
  getClientIp,
  isSameOriginRequest,
  issueEditAccessToken,
} from "@/server/services/auth.service";
import { verifyEditorAccessKey } from "@/server/services/paste.service";

const EDIT_UNLOCK_WINDOW_MS = 10 * 60 * 1000;
const EDIT_UNLOCK_LIMIT = 20;

export async function POST(request, { params }) {
  const { id } = await params;
  const ip = getClientIp(request);

  if (!isSameOriginRequest(request)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Permintaan diblokir" }, { status: 403 }),
    );
  }

  const unlockLimit = rateLimit(`edit-unlock:${ip}:${id}`, {
    limit: EDIT_UNLOCK_LIMIT,
    windowMs: EDIT_UNLOCK_WINDOW_MS,
  });

  if (!unlockLimit.allowed) {
    const response = NextResponse.json(
      { error: "Terlalu banyak percobaan" },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(unlockLimit.retryAfter));
    return applySecurityHeaders(response);
  }

  try {
    const body = await request.json();
    const verified = await verifyEditorAccessKey(id, body, { ip });

    if (!verified.ok) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Access key tidak valid" }, { status: 401 }),
      );
    }

    const editToken = await issueEditAccessToken(id);
    const cookie = buildEditAccessCookie(editToken.token, editToken.expiresAt);

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return applySecurityHeaders(response);
  } catch {
    return applySecurityHeaders(
      NextResponse.json({ error: "Gagal membuka mode edit" }, { status: 400 }),
    );
  }
}
