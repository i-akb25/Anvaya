import { validLectureState, type LectureState } from "./lecture-progress.ts";
import { validAttempt, type PracticeAttempt } from "./engine.ts";
import { validWorkspace, type Workspace } from "../workspace.ts";
export type LearningVault = {
  schema: 1;
  revision: number;
  notes: Record<string, string>;
  completed: string[];
  attempts: PracticeAttempt[];
  active: PracticeAttempt | null;
  writing: Record<string, { text: string; updatedAt: string; kind: string }>;
  revisionDue: Record<string, string>;
  lectures?: Record<string, LectureState>;
  seen?: Record<string, string[]>;
  recalls?: Record<
    string,
    { rating: "again" | "hard" | "good"; reviewedAt: string }
  >;
};
export const vaultKey = "anvaya-learning-v1";
export function emptyVault(): LearningVault {
  return {
    schema: 1,
    revision: 0,
    notes: {},
    completed: [],
    attempts: [],
    active: null,
    writing: {},
    revisionDue: {},
  };
}
function record(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length <= 500 &&
    !Object.keys(value).some((k) =>
      ["__proto__", "prototype", "constructor"].includes(k),
    )
  );
}
export function validVault(value: unknown): value is LearningVault {
  if (!record(value)) return false;
  const v = value as LearningVault;
  return (
    v.schema === 1 &&
    Number.isSafeInteger(v.revision) &&
    v.revision >= 0 &&
    record(v.notes) &&
    Object.values(v.notes).every(
      (t) => typeof t === "string" && t.length <= 100000,
    ) &&
    Array.isArray(v.completed) &&
    v.completed.length <= 1000 &&
    v.completed.every((s) => typeof s === "string" && s.length < 200) &&
    Array.isArray(v.attempts) &&
    v.attempts.length <= 30 &&
    v.attempts.every((a) => validAttempt(a) && a.submittedAt !== null) &&
    new Set(v.attempts.map((a) => a.id)).size === v.attempts.length &&
    (v.active === null ||
      (validAttempt(v.active) && v.active.submittedAt === null)) &&
    record(v.writing) &&
    Object.values(v.writing).every(
      (w) =>
        w &&
        typeof w === "object" &&
        typeof w.text === "string" &&
        w.text.length <= 100000 &&
        typeof w.updatedAt === "string" &&
        typeof w.kind === "string",
    ) &&
    (v.seen === undefined ||
      (record(v.seen) &&
        Object.values(v.seen).every(
          (ids) =>
            Array.isArray(ids) &&
            ids.length <= 10000 &&
            new Set(ids).size === ids.length &&
            ids.every(
              (id) =>
                typeof id === "string" && id.length > 0 && id.length < 200,
            ),
        ))) &&
    (v.recalls === undefined ||
      (record(v.recalls) &&
        Object.values(v.recalls).every(
          (r) =>
            record(r) &&
            ["again", "hard", "good"].includes(r.rating as string) &&
            typeof r.reviewedAt === "string" &&
            Number.isFinite(Date.parse(r.reviewedAt)),
        ))) &&
    (v.lectures === undefined ||
      (record(v.lectures) &&
        Object.entries(v.lectures).every(
          ([key, state]) => key.length < 200 && validLectureState(state),
        ))) &&
    record(v.revisionDue) &&
    Object.values(v.revisionDue).every(
      (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v),
    )
  );
}
export function readVault(): LearningVault {
  const raw = localStorage.getItem(vaultKey);
  if (!raw) return emptyVault();
  const parsed: unknown = JSON.parse(raw);
  if (!validVault(parsed))
    throw Error(
      "Saved learning data is invalid. Export recovery data before replacing it.",
    );
  return parsed;
}
export function saveVault(next: LearningVault, expected: number) {
  const current = readVault();
  if (current.revision !== expected)
    throw Error(
      "This workspace changed in another tab. Reload to avoid overwriting newer work.",
    );
  const value = { ...next, revision: expected + 1 };
  if (!validVault(value))
    throw Error("Invalid learning data; nothing was saved.");
  localStorage.setItem(vaultKey, JSON.stringify(value));
  return value;
}
export type SyncPayload = {
  schema: 1;
  learning: LearningVault;
  workspace: Workspace;
};
export function validPayload(value: unknown): value is SyncPayload {
  if (!record(value)) return false;
  return (
    value.schema === 1 &&
    validVault(value.learning) &&
    validWorkspace(value.workspace)
  );
}
export function addResult(v: LearningVault, a: PracticeAttempt) {
  if (a.submittedAt === null || !validAttempt(a))
    throw Error("Cannot store an unfinished or invalid result.");
  if (v.attempts.some((r) => r.id === a.id)) return { ...v, active: null };
  return {
    ...v,
    active: null,
    attempts: [a, ...v.attempts].slice(0, 30),
    seen: Object.fromEntries(
      [
        ...new Set([
          ...Object.keys(v.seen ?? {}),
          ...v.attempts.map((r) => r.examId),
          a.examId,
        ]),
      ].map((examId) => [
        examId,
        [
          ...new Set([
            ...seenQuestions(v, examId),
            ...(examId === a.examId ? a.items.map((i) => i.question.id) : []),
          ]),
        ],
      ]),
    ),
  };
}
export function seenQuestions(v: LearningVault, examId: string) {
  return [
    ...new Set([
      ...(v.seen?.[examId] ?? []),
      ...v.attempts
        .filter((a) => a.examId === examId)
        .flatMap((a) => a.items.map((i) => i.question.id)),
    ]),
  ];
}
