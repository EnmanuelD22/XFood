import { NextRequest, NextResponse } from "next/server";

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const base = process.env.XFOOD_API_BASE_URL;
  if (!base) return NextResponse.json({ code: "API_NOT_CONFIGURED", message: "Configura XFOOD_API_BASE_URL para conectar con XFood API." }, { status: 503 });
  const { path } = await context.params;
  const upstreamUrl = new URL(`${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`, `${base.replace(/\/$/, "")}/`);
  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "origin", "referer", "user-agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  try {
    const upstream = await fetch(upstreamUrl, { method: request.method, headers, body, redirect: "manual", cache: "no-store" });
    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "location", "x-page", "x-page-size", "x-has-next-page"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("cache-control", "private, no-store");
    const cookies = upstream.headers.getSetCookie?.() ?? [];
    for (const cookie of cookies) responseHeaders.append("set-cookie", cookie);
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ code: "API_UNAVAILABLE", message: "No se pudo conectar con XFood API." }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
