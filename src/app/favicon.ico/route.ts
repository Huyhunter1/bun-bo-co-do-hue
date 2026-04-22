import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET(request: NextRequest) {
  // Redirect to the actual image in public folder
  return NextResponse.redirect(new URL("/images/nha-hang-bun-bo.jpg", request.nextUrl.origin), 308);
}
