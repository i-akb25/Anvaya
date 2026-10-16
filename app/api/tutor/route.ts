import type { NextRequest } from "next/server";
import {
  boundedJson,
  cloudConfigured,
  json,
  mutationAllowed,
  requireOwner,
} from "@/lib/platform/server";
import {
  validTutorInput,
  tutorEvidence,
  tutorPrompt,
  acceptedTutorAnswer,
} from "@/lib/platform/tutor";
export const dynamic = "force-dynamic";
function configured() {
  return (
    cloudConfigured() &&
    process.env.ANVAYA_TUTOR_ENABLED === "true" &&
    !!process.env.GEMINI_API_KEY &&
    /^[a-zA-Z0-9._-]{1,100}$/.test(process.env.ANVAYA_GEMINI_MODEL ?? "")
  );
}
export async function GET() {
  return json({
    configured: !!configured(),
    provider: "Google Gemini",
    dailyCalls: 20,
    notes:
      "Disabled until owner authentication, budget migration and provider are configured.",
  });
}
export async function POST(request: NextRequest) {
  if (!configured())
    return json(
      {
        error:
          "Tutor is disabled or not configured. Source-linked lessons remain available.",
      },
      503,
    );
  if (!mutationAllowed(request))
    return json({ error: "Request origin or content type rejected." }, 403);
  try {
    const owner = await requireOwner();
    if (!owner)
      return json({ error: "Sign in with the permitted owner account." }, 401);
    const input = await boundedJson(request, 16000);
    if (!validTutorInput(input))
      return json(
        {
          error:
            "Choose a lesson, enter a question and consent to this provider request.",
        },
        400,
      );
    const { data: remaining, error } = await owner.client.rpc(
      "reserve_anvaya_tutor_call",
    );
    if (error)
      return json(
        {
          error: error.message.includes("daily_limit")
            ? "Daily tutor limit reached. Try again after 00:00 UTC."
            : error.message.includes("rate_limited")
              ? "Wait 6 seconds between questions."
              : "Tutor budget service unavailable; no provider call was made.",
        },
        error.message.includes("limit") ? 429 : 503,
      );
    const prompt = tutorPrompt(input);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.ANVAYA_GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt.system }] },
          contents: [{ role: "user", parts: [{ text: prompt.user }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.2 },
        }),
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      return json(
        {
          error:
            "Tutor provider could not answer. This reserved call still counts toward the daily limit.",
        },
        502,
      );
    }
    const reader = response.body?.getReader();
    if (!reader) throw Error("No response");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 64000) {
        await reader.cancel();
        throw Error("Response too large");
      }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const result = JSON.parse(new TextDecoder().decode(bytes));
    const candidate = result.candidates?.[0];
    const answer =
      candidate?.finishReason === "STOP" &&
      Array.isArray(candidate.content?.parts)
        ? candidate.content.parts
            .filter(
              (p: { thought?: boolean; text?: unknown }) =>
                !p.thought && typeof p.text === "string",
            )
            .map((p: { text: string }) => p.text)
            .join("\n")
        : null;
    if (!acceptedTutorAnswer(answer))
      return json(
        {
          error:
            "The provider returned an incomplete, blocked or unsupported answer. Open the lesson and source instead.",
        },
        502,
      );
    const { context: _, ...source } = tutorEvidence(input.unitId);
    return json({
      answer,
      source,
      remaining,
      classification: "AI-generated; unreviewed",
    });
  } catch {
    return json(
      {
        error:
          "Tutor request failed. No notes or question text are recorded by Anvaya. A reserved call may still count toward your limit.",
      },
      503,
    );
  }
}
