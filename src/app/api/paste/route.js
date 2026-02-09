import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { applySecurityHeaders } from "@/lib/securityHeaders";
import { createPaste } from "@/server/services/paste.service";
import { getClientIp, isSameOriginRequest } from "@/server/services/auth.service";
import { constants } from "@/server/validators/paste.schema";

const CREATE_WINDOW_MS = 10 * 60 * 1000;
const CREATE_LIMIT = 20;

export async function POST(request) {
  const ip = getClientIp(request);

  if (!isSameOriginRequest(request)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Permintaan diblokir" }, { status: 403 }),
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > constants.MAX_PASTE_BYTES + 1024) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Ukuran payload terlalu besar" }, { status: 413 }),
    );
  }

  const createLimit = rateLimit(`create:${ip}`, {
    limit: CREATE_LIMIT,
    windowMs: CREATE_WINDOW_MS,
  });

  if (!createLimit.allowed) {
    const response = NextResponse.json(
      { error: "Terlalu banyak permintaan" },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(createLimit.retryAfter));
    return applySecurityHeaders(response);
  }

  try {
    const body = await request.json();
    const result = await createPaste(body, { ip });
    const baseUrl = env.APP_BASE_URL ?? request.nextUrl.origin;
    return applySecurityHeaders(
      NextResponse.json(
        { id: result.id, url: `${baseUrl}/p/${result.id}`, accessKey: result.accessKey },
        { status: 201 },
      ),
    );
  } catch (error) {
    logger.error("paste_create_exception", {
      ip,
      reason: error instanceof Error ? error.message : "unknown",
    });

    return applySecurityHeaders(
      NextResponse.json({ error: "Gagal membuat paste" }, { status: 400 }),
    );
  }
}
