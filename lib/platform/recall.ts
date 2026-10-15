import { studyUnits } from "./content.ts";
import type { LearningVault } from "./vault.ts";
export type RecallRating = "again" | "hard" | "good";
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function afterDays(days: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return localDay(date);
}
export function recallQueue(
  v: LearningVault,
  exam = "all",
  dueOnly = true,
  today = localDay(),
) {
  return [...new Set(v.completed)]
    .flatMap((key) => {
      const [examId, slug] = key.split(":");
      const unit = studyUnits.find(
        (u) => u.slug === slug && u.exams.includes(examId),
      );
      const due = v.revisionDue[key] ?? today;
      return unit &&
        (exam === "all" || examId === exam) &&
        (!dueOnly || due <= today)
        ? [{ key, examId, unit, due }]
        : [];
    })
    .sort((a, b) => a.due.localeCompare(b.due) || a.key.localeCompare(b.key));
}
export function rateRecall(
  v: LearningVault,
  key: string,
  rating: RecallRating,
  now = new Date(),
): LearningVault {
  if (!recallQueue(v, "all", false).some((r) => r.key === key))
    throw Error("Complete this exam/unit context before rating recall.");
  if (!["again", "hard", "good"].includes(rating))
    throw Error("Unknown recall rating.");
  const due = afterDays({ again: 1, hard: 3, good: 7 }[rating], now);
  return {
    ...v,
    revisionDue: { ...v.revisionDue, [key]: due },
    recalls: { ...v.recalls, [key]: { rating, reviewedAt: now.toISOString() } },
  };
}
