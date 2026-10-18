import { evaluate, type PracticeAttempt } from "./engine.ts";
export type ReviewFilter = "all" | "missed" | "marked";
/** Preserve original question indices so paged feedback never uses another question's key or score. */
export function answerReviewPage(
  attempt: PracticeAttempt,
  filter: ReviewFilter,
  page: number,
) {
  if (
    !["all", "missed", "marked"].includes(filter) ||
    !Number.isInteger(page) ||
    page < 0
  )
    throw Error("Invalid review page.");
  const scored = evaluate(attempt);
  const selected = attempt.items
    .map((item, index) => ({
      item,
      index,
      status: scored.rows[index].status,
      marks: scored.rows[index].marks,
    }))
    .filter(
      (row) =>
        filter === "all" ||
        (filter === "missed" && row.status !== "correct") ||
        (filter === "marked" && attempt.marked.includes(row.item.question.id)),
    );
  const pages = Math.max(1, Math.ceil(selected.length / 20)),
    current = Math.min(page, pages - 1);
  return {
    rows: selected.slice(current * 20, current * 20 + 20),
    total: selected.length,
    pages,
    page: current,
  };
}
