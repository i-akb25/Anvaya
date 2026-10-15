import { type NextRequest } from "next/server";
import {
  authClient,
  boundedJson,
  cloudConfigured,
  json,
  mutationAllowed,
  requireOwner,
} from "@/lib/platform/server";
import { allowedOwner } from "@/lib/platform/auth-policy";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!cloudConfigured()) return json({ configured: false, signedIn: false });
  try {
    const owner = await requireOwner();
    return json({ configured: true, signedIn: !!owner });
  } catch {
    return json(
      { error: "Account provider unavailable. Local data is unchanged." },
      503,
    );
  }
}
export async function POST(request: NextRequest) {
  if (!cloudConfigured())
    return json({ error: "Private account setup is incomplete." }, 503);
  if (!mutationAllowed(request))
    return json({ error: "Request origin or content type rejected." }, 403);
  try {
    const body = (await boundedJson(request, 4096)) as {
      action?: string;
      email?: string;
      password?: string;
    };
    const client = await authClient();
    if (body.action === "signout") {
      await client.auth.signOut({ scope: "local" });
      return json({ signedIn: false });
    }
    if (
      body.action !== "signin" ||
      typeof body.email !== "string" ||
      body.email.length > 254 ||
      typeof body.password !== "string" ||
      body.password.length < 8 ||
      body.password.length > 256
    )
      return json({ error: "Check your sign-in details." }, 400);
    const { data, error } = await client.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error || !allowedOwner(data.user?.id, process.env.ANVAYA_OWNER_ID)) {
      await client.auth.signOut({ scope: "local" });
      return json(
        { error: "Sign-in failed or this account is not permitted." },
        401,
      );
    }
    return json({ signedIn: true });
  } catch {
    return json(
      { error: "Sign-in service unavailable. Try again later." },
      503,
    );
  }
}
