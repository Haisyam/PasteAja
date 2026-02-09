import { NextResponse } from "next/server";

import { SECURITY_HEADERS } from "@/lib/securityHeaders";

export function middleware(request) {
  const response = NextResponse.next();

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
