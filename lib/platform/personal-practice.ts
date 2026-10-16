import { numericValue } from "./engine.ts";
const examIds = [
  "upsc",
  "bpsc",
  "ssc",
  "sbi",
  "ibps",
  "cat",
  "gate-ee",
  "gate-ec",
  "gate-in",
  "ese",
];
export type PersonalQuestion = {
  id: string;
  type: "mcq" | "msq" | "numeric";
  stem: string;
  options?: string[];
  answer: number[] | { min: number; max: number };
  explanation: string;
  sourceUrl?: string;
};
export type PersonalPack = {
  schema: 1;
  id: string;
  version: string;
  title: string;
  examId: string;
  questions: PersonalQuestion[];
};
export type PersonalAttempt = {
  id: string;
  classification: "personal-unverified";
  pack: { id: string; version: string; title: string; examId: string };
  questions: PersonalQuestion[];
  answers: Record<string, string | number[]>;
  startedAt: number;
  seconds: number;
  submittedAt: number | null;
  marks: number;
  penalty: number;
};
export type PersonalPractice = {
  packs: PersonalPack[];
  active: PersonalAttempt | null;
  results: PersonalAttempt[];
};
export const emptyPersonal = (): PersonalPractice => ({
  packs: [],
  active: null,
  results: [],
});
const safe = (v: unknown): v is Record<string, unknown> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  !Object.keys(v).some((k) =>
    ["__proto__", "constructor", "prototype"].includes(k),
  );
const id = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[a-zA-Z0-9][\w-]{0,79}$/.test(v) &&
  !["constructor", "prototype"].includes(v);
const text = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
export function validSourceUrl(v: unknown) {
  if (v === undefined || v === "") return true;
  if (typeof v !== "string" || v.length > 2000) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function validPersonalQuestion(
  value: unknown,
): value is PersonalQuestion {
  if (!safe(value)) return false;
  const q = value as PersonalQuestion;
  if (
    !id(q.id) ||
    !text(q.stem, 5000) ||
    !text(q.explanation, 10000) ||
    !validSourceUrl(q.sourceUrl)
  )
    return false;
  if (q.type === "numeric")
    return (
      safe(q.answer) &&
      Number.isFinite(q.answer.min) &&
      Number.isFinite(q.answer.max) &&
      q.answer.min <= q.answer.max
    );
  return (
    ["mcq", "msq"].includes(q.type) &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    q.options.length <= 8 &&
    q.options.every((o) => text(o, 1000)) &&
    Array.isArray(q.answer) &&
    q.answer.length >= 1 &&
    (q.type !== "mcq" || q.answer.length === 1) &&
    new Set(q.answer).size === q.answer.length &&
    q.answer.every(
      (n) => Number.isInteger(n) && n >= 0 && n < q.options!.length,
    )
  );
}
export function validPersonalPack(value: unknown): value is PersonalPack {
  if (!safe(value)) return false;
  const p = value as PersonalPack;
  return (
    p.schema === 1 &&
    id(p.id) &&
    id(p.version) &&
    text(p.title, 200) &&
    examIds.includes(p.examId) &&
    Array.isArray(p.questions) &&
    p.questions.length >= 1 &&
    p.questions.length <= 100 &&
    p.questions.every(validPersonalQuestion) &&
    new Set(p.questions.map((q) => q.id)).size === p.questions.length
  );
}
function responseValid(q: PersonalQuestion, answer: unknown) {
  return q.type === "numeric"
    ? typeof answer === "string" &&
        answer.length <= 100 &&
        (answer === "" || numericValue(answer) !== null)
    : Array.isArray(answer) &&
        (q.type !== "mcq" || answer.length <= 1) &&
        new Set(answer).size === answer.length &&
        answer.every(
          (n) => Number.isInteger(n) && n >= 0 && n < q.options!.length,
        );
}
export function personalDeadline(a: PersonalAttempt) {
  return a.startedAt + a.seconds * 1000;
}
export function validPersonalAttempt(value: unknown): value is PersonalAttempt {
  if (!safe(value)) return false;
  const a = value as PersonalAttempt;
  return (
    id(a.id) &&
    a.classification === "personal-unverified" &&
    safe(a.pack) &&
    id(a.pack.id) &&
    id(a.pack.version) &&
    text(a.pack.title, 200) &&
    examIds.includes(a.pack.examId) &&
    Array.isArray(a.questions) &&
    a.questions.length >= 1 &&
    a.questions.length <= 50 &&
    a.questions.every(validPersonalQuestion) &&
    new Set(a.questions.map((q) => q.id)).size === a.questions.length &&
    safe(a.answers) &&
    Object.entries(a.answers).every(([id, response]) => {
      const q = a.questions.find((q) => q.id === id);
      return !!q && responseValid(q, response);
    }) &&
    Number.isFinite(a.startedAt) &&
    a.startedAt >= 0 &&
    Number.isInteger(a.seconds) &&
    a.seconds >= 60 &&
    a.seconds <= 10800 &&
    Number.isFinite(a.marks) &&
    a.marks > 0 &&
    a.marks <= 10 &&
    Number.isFinite(a.penalty) &&
    a.penalty >= 0 &&
    a.penalty <= 10 &&
    (a.submittedAt === null ||
      (Number.isFinite(a.submittedAt) &&
        a.submittedAt >= a.startedAt &&
        a.submittedAt <= personalDeadline(a)))
  );
}
export function validPersonalPractice(
  value: unknown,
): value is PersonalPractice {
  if (!safe(value)) return false;
  const v = value as PersonalPractice;
  return (
    Array.isArray(v.packs) &&
    v.packs.length <= 10 &&
    v.packs.every(validPersonalPack) &&
    v.packs.reduce((s, p) => s + p.questions.length, 0) <= 500 &&
    new Set(v.packs.map((p) => `${p.id}:${p.version}`)).size ===
      v.packs.length &&
    (v.active === null ||
      (validPersonalAttempt(v.active) && v.active.submittedAt === null)) &&
    Array.isArray(v.results) &&
    v.results.length <= 20 &&
    v.results.every((a) => validPersonalAttempt(a) && a.submittedAt !== null) &&
    new Set(v.results.map((a) => a.id)).size === v.results.length
  );
}
export function importPersonalPack(v: PersonalPractice, pack: PersonalPack) {
  if (!validPersonalPack(pack))
    throw Error(
      "Invalid pack. Check question types, unique IDs, answers, explanations and HTTPS sources.",
    );
  const prior = v.packs.find(
    (p) => p.id === pack.id && p.version === pack.version,
  );
  if (prior && JSON.stringify(prior) !== JSON.stringify(pack))
    throw Error(
      "This pack/version already exists with different questions. Give the changed pack a new version.",
    );
  const next = {
    ...v,
    packs: prior ? v.packs : [...v.packs, structuredClone(pack)],
  };
  if (!validPersonalPractice(next))
    throw Error(
      "Library limit: 10 packs and 500 questions. Export a backup before removing a pack.",
    );
  return next;
}
export function createPersonalAttempt(
  pack: PersonalPack,
  count: number,
  seconds: number,
  marks: number,
  penalty: number,
  now: number,
): PersonalAttempt {
  if (
    !validPersonalPack(pack) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > Math.min(50, pack.questions.length)
  )
    throw Error("Choose 1–50 questions, within the pack’s available count.");
  const pool = structuredClone(pack.questions);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const a: PersonalAttempt = {
    id: crypto.randomUUID(),
    classification: "personal-unverified",
    pack: {
      id: pack.id,
      version: pack.version,
      title: pack.title,
      examId: pack.examId,
    },
    questions: pool.slice(0, count),
    answers: {},
    startedAt: now,
    seconds,
    submittedAt: null,
    marks,
    penalty,
  };
  if (!validPersonalAttempt(a))
    throw Error(
      "Use 1–180 whole minutes, positive marks up to 10 and a penalty from 0–10.",
    );
  return a;
}
export function answerPersonal(
  a: PersonalAttempt,
  id: string,
  response: string | number[],
  now: number,
) {
  const q = a.questions.find((q) => q.id === id);
  if (
    !q ||
    a.submittedAt !== null ||
    now >= personalDeadline(a) ||
    !responseValid(q, response)
  )
    throw Error("Response rejected: invalid, submitted or expired.");
  return { ...a, answers: { ...a.answers, [id]: response } };
}
export function submitPersonal(a: PersonalAttempt, now: number) {
  return a.submittedAt === null
    ? {
        ...a,
        submittedAt: Math.max(a.startedAt, Math.min(now, personalDeadline(a))),
      }
    : a;
}
export function personalScore(a: PersonalAttempt) {
  const rows = a.questions.map((q) => {
    const value = a.answers[q.id],
      skipped =
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
    const right =
      !skipped &&
      (q.type === "numeric"
        ? typeof value === "string" &&
          !Array.isArray(q.answer) &&
          numericValue(value)! >= q.answer.min &&
          numericValue(value)! <= q.answer.max
        : Array.isArray(value) &&
          Array.isArray(q.answer) &&
          value.length === q.answer.length &&
          value.every((n) => (q.answer as number[]).includes(n)));
    return {
      id: q.id,
      status: skipped ? "unanswered" : right ? "correct" : "incorrect",
      marks: skipped ? 0 : right ? a.marks : q.type === "mcq" ? -a.penalty : 0,
    };
  });
  return {
    rows,
    score: rows.reduce((s, r) => s + r.marks, 0),
    maximum: a.questions.length * a.marks,
    correct: rows.filter((r) => r.status === "correct").length,
  };
}
