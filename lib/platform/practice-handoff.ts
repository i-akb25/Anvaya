import { exams } from "../catalog.ts";
import type { LearningVault } from "./vault.ts";
export const practiceHandoffKey = "anvaya-practice-start-v1";
export function claimPracticeLaunch(
  v: LearningVault,
  raw: string | null,
  writerId: string,
): LearningVault {
  try {
    if (!raw || raw.length > 600 || !writerId) return v;
    const token = JSON.parse(raw),
      a = v.active;
    if (
      !a ||
      a.submittedAt !== null ||
      !exams.some((e) => e.id === a.examId) ||
      token.examId !== a.examId ||
      token.id !== a.id ||
      token.writerId !== a.writerId
    )
      return v;
    return { ...v, active: { ...a, writerId } };
  } catch {
    return v;
  }
}
