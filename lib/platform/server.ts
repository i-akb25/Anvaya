import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { allowedOwner, sameOrigin, cloudEnabled } from "./auth-policy";
export function cloudConfigured() {
  return cloudEnabled(process.env);
}
export async function authClient() {
  if (!cloudConfigured()) throw Error("Cloud account is not configured.");
  const jar = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          for (const { name, value, options } of values)
            jar.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
        },
      },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          }),
      },
    },
  );
}
export async function requireOwner() {
  const client = await authClient();
  const { data, error } = await client.auth.getUser();
  if (error || !allowedOwner(data.user?.id, process.env.ANVAYA_OWNER_ID))
    return null;
  return { client, user: data.user! };
}
export function json(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Pragma: "no-cache",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function mutationAllowed(request: NextRequest) {
  return (
    sameOrigin(
      request.headers.get("origin"),
      process.env.ANVAYA_APP_ORIGIN ?? "",
    ) && request.headers.get("content-type")?.startsWith("application/json")
  );
}
export async function boundedJson(request: NextRequest, maxBytes: number) {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes)
    throw Error("Request too large");
  const reader = request.body?.getReader();
  if (!reader) throw Error("Missing body");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw Error("Request too large");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(length);
  let index = 0;
  for (const part of chunks) {
    all.set(part, index);
    index += part.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(all)) as unknown;
}
