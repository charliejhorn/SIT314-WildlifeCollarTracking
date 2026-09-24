import { NextResponse } from "next/server";

type ProxyOptions = {
  baseUrl: string | undefined;
  path: string;
  request: Request;
  method?: string;
};

export async function proxyToService({ baseUrl, path, request, method }: ProxyOptions) {
  if (!baseUrl) {
    return NextResponse.json({ error: "Service URL is not configured" }, { status: 500 });
  }

  const body = !["GET", "HEAD"].includes(method ?? request.method)
    ? await request.text()
    : undefined;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    method: method ?? request.method,
    headers: body ? { "content-type": request.headers.get("content-type") ?? "application/json" } : undefined,
    body,
    cache: "no-store",
  });

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  return new NextResponse(response.body, { status: response.status, headers });
}
