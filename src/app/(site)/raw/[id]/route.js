import { NextResponse } from "next/server";

import { applySecurityHeaders } from "@/lib/securityHeaders";
import { getClientIp } from "@/server/services/auth.service";
import { getPasteForAccess } from "@/server/services/paste.service";

export async function GET(request, { params }) {
  const { id } = await params;

  const result = await getPasteForAccess(id, {
    ip: getClientIp(request),
  });

  if (result.status === "not_found") {
    return applySecurityHeaders(
      new NextResponse("Tidak ditemukan\n", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }),
    );
  }

  if (result.status === "locked") {
    return applySecurityHeaders(
      new NextResponse("Tidak diizinkan\n", {
        status: 401,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }),
    );
  }

  return applySecurityHeaders(
    new NextResponse(result.paste.content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    }),
  );
}
