import { validSourceUrl } from "./personal-practice.ts";
import { calendarDate } from "./briefings.ts";
import { patterns } from "./registry.ts";
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
  const object = (v: unknown): v is Record<string, unknown> =>
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    !Object.keys(v).some((k) =>
      ["__proto__", "constructor", "prototype"].includes(k),
    );
  const text = (v: unknown, max = 200) =>
    typeof v === "string" && !!v.trim() && v.length <= max;
  const url = (v: unknown) => typeof v === "string" && !!v && validSourceUrl(v);
  if (!object(value)) return ["Pack must be a plain object"];
  const p = value;
  for (const key of [
    "version",
    "examId",
    "cycle",
    "stage",
    "paperId",
    "language",
    "officialPatternVersion",
    "sourceLocator",
  ])
    if (!text(p[key]))
      issues.push(`${key} is required and must be at most 200 characters`);
  if (!calendarDate(p.checkedOn))
    issues.push("A real checkedOn calendar date is required");
  if (!url(p.sourceUrl))
    issues.push("A credential-free HTTPS source URL is required");
  const pattern = patterns.find(
    (v) =>
      v.version === p.officialPatternVersion &&
      v.examId === p.examId &&
      v.cycle === p.cycle &&
      v.stage === p.stage,
  );
  if (!pattern)
    issues.push(
      "Exam, cycle, stage and officialPatternVersion must match a registered reference",
    );
  if (p.license !== "permitted")
    issues.push(
      "Redistribution permission must be confirmed; link-only papers cannot be imported",
    );
  if (
    !object(p.review) ||
    p.review.status !== "approved" ||
    !text(p.review.reviewer) ||
    !calendarDate(p.review.reviewedAt)
  )
    issues.push("Named editorial review and a real review date are required");
  if (
    !Array.isArray(p.questions) ||
    !p.questions.length ||
    p.questions.length > 200
  )
    return [...issues, "Question set must contain 1–200 questions"];
  if (
    new Set(p.questions.map((q) => (object(q) ? q.id : null))).size !==
    p.questions.length
  )
    issues.push("Duplicate or missing question IDs");
  for (const [i, q] of p.questions.entries()) {
    if (!object(q)) {
      issues.push(`Question${i + 1} is invalid`);
      continue;
    }
    const label = typeof q.id === "string" ? q.id : String(i + 1);
    if (
      !text(q.id, 100) ||
      !text(q.stem, 5000) ||
      !text(q.explanation, 10000) ||
      !text(q.sourceQuestionNumber, 100) ||
      !url(q.finalKeyUrl)
    )
      issues.push(
        `${label}: bounded stem, source question number, final key and explanation required`,
      );
    if (
      typeof q.figureRequired !== "boolean" ||
      typeof q.figureAccessible !== "boolean" ||
      (q.figureRequired && !q.figureAccessible)
    )
      issues.push(
        `${label}: required figure is missing or figure declarations are invalid`,
      );
    if (
      typeof q.marks !== "number" ||
      !Number.isFinite(q.marks) ||
      q.marks <= 0 ||
      q.marks > 10
    )
      issues.push(`${label}: invalid assigned marks`);
    const options =
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      q.options.length <= 8 &&
      q.options.every((v) => text(v, 1000));
    if (q.type === "mcq") {
      if (
        !options ||
        typeof q.answer !== "string" ||
        !/^\d+$/.test(q.answer) ||
        Number(q.answer) >= (q.options as unknown[]).length
      )
        issues.push(`${label}: invalid MCQ key`);
    } else if (q.type === "msq") {
      if (
        !options ||
        !Array.isArray(q.answer) ||
        !q.answer.length ||
        new Set(q.answer).size !== q.answer.length ||
        !q.answer.every(
          (n) =>
            Number.isInteger(n) &&
            n >= 0 &&
            n < (q.options as unknown[]).length,
        )
      )
        issues.push(`${label}: invalid exact-set key`);
    } else if (q.type === "nat" || q.type === "tita") {
      if (
        !object(q.answer) ||
        typeof q.answer.min !== "number" ||
        typeof q.answer.max !== "number" ||
        !Number.isFinite(q.answer.min) ||
        !Number.isFinite(q.answer.max) ||
        q.answer.min > q.answer.max
      )
        issues.push(`${label}: invalid accepted range`);
    } else issues.push(`${label}: unsupported question type`);
  }
  return issues;
}
