import { type NextRequest } from "next/server";
import {
  boundedJson,
  cloudConfigured,
  json,
  mutationAllowed,
  requireOwner,
} from "@/lib/platform/server";
import { parseRevision } from "@/lib/platform/auth-policy";
import { validPayload } from "@/lib/platform/vault";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!cloudConfigured())
    return json({ error: "Private sync is not configured." }, 503);
  try {
    const owner = await requireOwner();
    if (!owner)
      return json({ error: "Sign in with the permitted account." }, 401);
    const { data, error } = await owner.client
      .from("learning_workspaces")
      .select("payload,revision,updated_at")
      .eq("owner_id", owner.user.id)
      .maybeSingle();
    if (error)
      return json(
        { error: "Workspace unavailable. Your local data is unchanged." },
        503,
      );
    if (data && !validPayload(data.payload))
      return json(
        { error: "Cloud backup failed validation; no data was imported." },
        422,
      );
    return json({ record: data ?? null });
  } catch {
    return json(
      { error: "Sync service unavailable. Your local data is unchanged." },
      503,
    );
  }
}
export async function PUT(request: NextRequest) {
  if (!cloudConfigured())
    return json({ error: "Private sync is not configured." }, 503);
  if (!mutationAllowed(request))
    return json({ error: "Request origin or content type rejected." }, 403);
  try {
    const owner = await requireOwner();
    if (!owner)
      return json({ error: "Sign in with the permitted account." }, 401);
    const body = (await boundedJson(request, 2000000)) as {
      payload?: unknown;
      expectedRevision?: unknown;
    };
    const revision = parseRevision(body.expectedRevision);
    if (revision === null || !validPayload(body.payload))
      return json({ error: "Invalid workspace or revision." }, 400);
    const { data, error } = await owner.client.rpc("save_learning_workspace", {
      expected_revision: revision,
      new_payload: body.payload,
    });
    if (error) {
      if (error.message.includes("revision_conflict"))
        return json(
          {
            error:
              "Cloud data changed on another device. Download it before choosing which version to keep.",
          },
          409,
        );
      return json({ error: "Sync failed. Your local data is unchanged." }, 503);
    }
    return json({ record: data });
  } catch {
    return json(
      {
        error: "Request rejected or sync unavailable. Local data is unchanged.",
      },
      400,
    );
  }
}
