import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET(request: NextRequest) {
  const faviconUrl = new URL("/images/nha-hang-bun-bo.jpg", request.url);
  return NextResponse.redirect(faviconUrl, 308);
}
