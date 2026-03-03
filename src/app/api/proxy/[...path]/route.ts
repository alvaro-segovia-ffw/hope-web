import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env/client-env";

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetPath = `/${path.join("/")}`;
  const search = request.nextUrl.search;
  const targetUrl = `${env.NEXT_PUBLIC_API_BASE_URL}${targetPath}${search}`;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  const method = request.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const responseBody = await upstreamResponse.text();
  const responseHeaders = new Headers();
  const upstreamContentType = upstreamResponse.headers.get("content-type");

  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
