export type ReviewedQuestionPack = {
  version: string;
  examId: string;
  cycle: string;
  stage: string;
  paperId: string;
  language: string;
  officialPatternVersion: string;
  license: "permitted" | "link-only" | "unresolved";
  sourceUrl: string;
  sourceLocator: string;
  checkedOn: string;
  review: {
    status: "pending" | "approved";
    reviewer: string | null;
    reviewedAt: string | null;
  };
  questions: {
    id: string;
    type: "mcq" | "msq" | "nat" | "tita";
    stem: string;
    options: string[];
    answer: string | number[] | { min: number; max: number };
    marks: number;
    explanation: string;
    sourceQuestionNumber: string;
    finalKeyUrl: string;
    figureRequired: boolean;
    figureAccessible: boolean;
  }[];
};
export function packIssues(value: unknown): string[] {
  const issues: string[] = [];
  if (!value || typeof value !== "object") return ["Pack must be an object"];
  const p = value as ReviewedQuestionPack;
  for (const key of [
    "version",
    "examId",
    "cycle",
    "stage",
    "paperId",
    "language",
    "officialPatternVersion",
    "sourceLocator",
    "checkedOn",
  ] as const)
    if (typeof p[key] !== "string" || !p[key].trim())
      issues.push(`${key} is required`);
  if (!p.sourceUrl?.startsWith("https://"))
    issues.push("HTTPS source URL is required");
  if (p.license !== "permitted")
    issues.push(
      "Redistribution permission must be confirmed; link-only papers cannot be imported",
    );
  if (
    p.review?.status !== "approved" ||
    !p.review?.reviewer?.trim() ||
    !p.review?.reviewedAt
  )
    issues.push("Named editorial review and review date are required");
  if (!Array.isArray(p.questions) || !p.questions.length)
    return [...issues, "Question set is empty"];
  if (new Set(p.questions.map((q) => q?.id)).size !== p.questions.length)
    issues.push("Duplicate question IDs");
  for (const [i, q] of p.questions.entries()) {
    if (!q || typeof q !== "object") {
      issues.push(`Question ${i + 1} is invalid`);
      continue;
    }
    const label = q.id || String(i + 1);
    if (
      !q.id ||
      !q.stem ||
      !q.explanation ||
      !q.sourceQuestionNumber ||
      !q.finalKeyUrl?.startsWith("https://")
    )
      issues.push(
        `${label}: source question number, final key and explanation required`,
      );
    if (q.figureRequired && !q.figureAccessible)
      issues.push(`${label}: required figure is missing`);
    if (!Number.isFinite(q.marks) || q.marks <= 0)
      issues.push(`${label}: invalid assigned marks`);
    if (q.type === "mcq") {
      if (
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        typeof q.answer !== "string" ||
        !/^\d+$/.test(q.answer) ||
        Number(q.answer) >= q.options.length
      )
        issues.push(`${label}: invalid MCQ key`);
    } else if (q.type === "msq") {
      if (
        !Array.isArray(q.options) ||
        !Array.isArray(q.answer) ||
        !q.answer.length ||
        new Set(q.answer).size !== q.answer.length ||
        !q.answer.every(
          (n) => Number.isInteger(n) && n >= 0 && n < q.options.length,
        )
      )
        issues.push(`${label}: invalid exact-set key`);
    } else if (q.type === "nat" || q.type === "tita") {
      if (
        !q.answer ||
        typeof q.answer !== "object" ||
        Array.isArray(q.answer) ||
        !Number.isFinite(q.answer.min) ||
        !Number.isFinite(q.answer.max) ||
        q.answer.min > q.answer.max
      )
        issues.push(`${label}: invalid accepted range`);
    } else issues.push(`${label}: unsupported question type`);
  }
  return issues;
}
