import type { LearningVault } from "./vault.ts";
export const sscHandoffKey = "anvaya-ssc-start-v1";
/** One-time same-tab launch token; not authentication and never used for old-session takeover. */
export function claimSSCLaunch(
  v: LearningVault,
  raw: string | null,
  writerId: string,
): LearningVault {
  try {
    if (!raw || raw.length > 500 || !writerId) return v;
    const token = JSON.parse(raw),
      a = v.active;
    if (
      !a?.ssc ||
      a.submittedAt !== null ||
      token.id !== a.id ||
      token.writerId !== a.writerId
    )
      return v;
    return { ...v, active: { ...a, writerId } };
  } catch {
    return v;
  }
}
