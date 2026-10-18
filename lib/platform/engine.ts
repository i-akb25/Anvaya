import { validGateTemplate, type GateTemplate } from "./gate-rules.ts";
import { validSSCTemplate, type SSCTemplate } from "./ssc-rules.ts";
import {
  questionBankFor,
  practiceBankVersion,
  type StudyQuestion,
} from "./questions.ts";
export type Response = string | number[];
export type Marking = {
  correct: number;
  mcqPenalty: number;
  blankPenalty: number;
};
export type FrozenQuestion = {
  question: StudyQuestion;
  section: string;
  marking: Marking;
};
export type PracticeAttempt = {
  id: string;
  examId: string;
  version: 1;
  bankVersion: string;
  classification: "custom-illustrative";
  ssc?: SSCTemplate;
  gate?: GateTemplate;
  sections: { id: string; seconds: number; title?: string }[];
  navigation: "paper" | "fixed-sections";
  items: FrozenQuestion[];
  answers: Record<string, Response>;
  marked: string[];
  startedAt: number;
  submittedAt: number | null;
  writerId: string;
};
export function numericValue(raw: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw.trim()))
    return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function responseValid(
  q: StudyQuestion,
  value: unknown,
): value is Response {
  if (q.type === "msq")
    return (
      Array.isArray(value) &&
      value.length <= q.options!.length &&
      new Set(value).size === value.length &&
      value.every((v) => Number.isInteger(v) && v >= 0 && v < q.options!.length)
    );
  if (typeof value !== "string" || value.length > 100) return false;
  if (value === "") return true;
  return q.type === "mcq"
    ? /^\d+$/.test(value) && Number(value) < q.options!.length
    : numericValue(value) !== null;
}
export function blank(value: Response | undefined) {
  return (
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}
export function correct(q: StudyQuestion, value: Response | undefined) {
  if (blank(value)) return false;
  if (q.type === "msq")
    return (
      Array.isArray(value) &&
      Array.isArray(q.answer) &&
      value.length === q.answer.length &&
      [...value]
        .sort((a, b) => a - b)
        .every(
          (v, i) => v === [...(q.answer as number[])].sort((a, b) => a - b)[i],
        )
    );
  if (q.type === "mcq") return value === q.answer;
  if (
    typeof value !== "string" ||
    typeof q.answer !== "object" ||
    Array.isArray(q.answer)
  )
    return false;
  const n = numericValue(value);
  return n !== null && n >= q.answer.min && n <= q.answer.max;
}
export function deadline(a: PracticeAttempt) {
  return a.startedAt + a.sections.reduce((s, v) => s + v.seconds, 0) * 1000;
}
export function activeSection(a: PracticeAttempt, now: number) {
  let elapsed = Math.max(0, (now - a.startedAt) / 1000);
  for (const s of a.sections) {
    if (elapsed < s.seconds) return s.id;
    elapsed -= s.seconds;
  }
  return null;
}
export function editable(a: PracticeAttempt, id: string, now: number) {
  const item = a.items.find((i) => i.question.id === id);
  return (
    !!item &&
    a.submittedAt === null &&
    now < deadline(a) &&
    (a.navigation === "paper" || item.section === activeSection(a, now))
  );
}
export function answer(
  a: PracticeAttempt,
  id: string,
  value: Response,
  now: number,
) {
  const item = a.items.find((i) => i.question.id === id);
  if (!item || !editable(a, id, now) || !responseValid(item.question, value))
    throw Error(
      "Response rejected: invalid, submitted or outside its section.",
    );
  return { ...a, answers: { ...a.answers, [id]: value } };
}
export function evaluate(a: PracticeAttempt) {
  let score = 0,
    maximum = 0,
    penalties = 0,
    right = 0,
    wrong = 0,
    skipped = 0;
  const rows = a.items.map((item) => {
    const q = item.question,
      value = a.answers[q.id];
    maximum += item.marking.correct;
    let marks = 0;
    let status: "correct" | "incorrect" | "unanswered";
    if (blank(value)) {
      skipped++;
      status = "unanswered";
      marks = -item.marking.blankPenalty;
    } else if (correct(q, value)) {
      right++;
      status = "correct";
      marks = item.marking.correct;
    } else {
      wrong++;
      status = "incorrect";
      marks = q.type === "mcq" ? -item.marking.mcqPenalty : 0;
    }
    score += marks;
    if (marks < 0) penalties -= marks;
    return { id: q.id, topicId: q.topicId, status, marks };
  });
  return { score, maximum, penalties, right, wrong, skipped, rows };
}
export function submit(a: PracticeAttempt, now: number) {
  return a.submittedAt === null
    ? { ...a, submittedAt: Math.max(a.startedAt, Math.min(now, deadline(a))) }
    : a;
}
export function createPractice(input: {
  bankVersion?: string;
  questionIds?: string[];
  examId: string;
  topicIds: string[];
  count: number;
  seconds: number;
  correct: number;
  penalty: number;
  seen: string[];
  allowRepeats: boolean;
  writerId: string;
  now: number;
}): PracticeAttempt {
  if (
    !Number.isInteger(input.count) ||
    input.count < 1 ||
    input.count > 200 ||
    !Number.isInteger(input.seconds) ||
    input.seconds < 60 ||
    input.seconds > 14400 ||
    !Number.isFinite(input.correct) ||
    input.correct <= 0 ||
    input.correct > 10 ||
    !Number.isFinite(input.penalty) ||
    input.penalty < 0 ||
    input.penalty > 10
  )
    throw Error("Invalid test settings.");
  const bankVersion = input.bankVersion ?? practiceBankVersion;
  const bank = questionBankFor(bankVersion);
  if (!bank) throw Error("Unknown question bank version.");
  let pool = bank.filter(
    (q) =>
      input.topicIds.includes(q.topicId) &&
      (!input.questionIds || input.questionIds.includes(q.id)) &&
      (!input.seen.includes(q.id) || input.allowRepeats),
  );
  // Keep shared passages adjacent; never fill a short bank by repeating questions.
  const groups = new Map<string, StudyQuestion[]>();
  for (const q of pool) {
    const key = q.groupId ?? q.id;
    groups.set(key, [...(groups.get(key) ?? []), q]);
  }
  const ordered = [...groups.values()];
  for (let i = ordered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }
  pool = ordered.flat();
  if (pool.length < input.count)
    throw Error(
      `Only ${pool.length} ${input.allowRepeats ? "available" : "unseen"} questions match. Reduce the count or explicitly allow repeats.`,
    );
  return {
    id: crypto.randomUUID(),
    version: 1,
    bankVersion,
    examId: input.examId,
    classification: "custom-illustrative",
    sections: [{ id: "practice", seconds: input.seconds }],
    navigation: "paper",
    items: pool.slice(0, input.count).map((question) => ({
      question: structuredClone(question),
      section: "practice",
      marking: {
        correct: input.correct,
        mcqPenalty: input.penalty,
        blankPenalty: 0,
      },
    })),
    answers: {},
    marked: [],
    startedAt: input.now,
    submittedAt: null,
    writerId: input.writerId,
  };
}
export function validAttempt(value: unknown): value is PracticeAttempt {
  try {
    if (!value || typeof value !== "object") return false;
    const a = value as PracticeAttempt;
    if (
      a.version !== 1 ||
      !questionBankFor(a.bankVersion) ||
      a.classification !== "custom-illustrative" ||
      typeof a.id !== "string" ||
      typeof a.examId !== "string" ||
      typeof a.writerId !== "string" ||
      !Number.isFinite(a.startedAt) ||
      a.startedAt < 0 ||
      !(
        a.submittedAt === null ||
        (Number.isFinite(a.submittedAt) && a.submittedAt >= a.startedAt)
      ) ||
      !["paper", "fixed-sections"].includes(a.navigation) ||
      !Array.isArray(a.items) ||
      a.items.length < 1 ||
      a.items.length > 200 ||
      new Set(a.items.map((i) => i.question?.id)).size !== a.items.length ||
      !Array.isArray(a.sections) ||
      a.sections.length < 1 ||
      a.sections.length > 10 ||
      new Set(a.sections.map((s) => s.id)).size !== a.sections.length ||
      !a.sections.every(
        (s) =>
          typeof s.id === "string" &&
          (s.title === undefined ||
            (typeof s.title === "string" && s.title.length <= 100)) &&
          Number.isInteger(s.seconds) &&
          s.seconds >= 60 &&
          s.seconds <= 14400,
      ) ||
      !Array.isArray(a.marked) ||
      !a.marked.every((id) => a.items.some((i) => i.question.id === id)) ||
      !a.answers ||
      typeof a.answers !== "object" ||
      Array.isArray(a.answers)
    )
      return false;
    return (
      validSSCTemplate(a) &&
      validGateTemplate(a) &&
      a.items.every((i) => {
        const original = questionBankFor(a.bankVersion)!.find(
          (q) => q.id === i.question.id,
        );
        return (
          original &&
          JSON.stringify(original) === JSON.stringify(i.question) &&
          a.sections.some((s) => s.id === i.section) &&
          i.marking &&
          Number.isFinite(i.marking.correct) &&
          i.marking.correct > 0 &&
          i.marking.correct <= 10 &&
          Number.isFinite(i.marking.mcqPenalty) &&
          i.marking.mcqPenalty >= 0 &&
          i.marking.mcqPenalty <= 10 &&
          i.marking.blankPenalty === 0
        );
      }) &&
      Object.entries(a.answers).every(([id, v]) => {
        const item = a.items.find((i) => i.question.id === id);
        return !!item && responseValid(item.question, v);
      }) &&
      a.submittedAt !== undefined &&
      (a.submittedAt === null || a.submittedAt <= deadline(a))
    );
  } catch {
    return false;
  }
}

export type SectionPlan = {
  title: string;
  topicIds: string[];
  count: number;
  seconds: number;
  correct: number;
  penalty: number;
};
/** Custom source-linked sectional practice only. Does not certify an official pattern. */
export function createSectionPractice(input: {
  bankVersion?: string;
  examId: string;
  sections: SectionPlan[];
  fixed: boolean;
  seen: string[];
  allowRepeats: boolean;
  writerId: string;
  now: number;
}): PracticeAttempt {
  if (
    !input.sections.length ||
    input.sections.length > 6 ||
    input.sections.reduce((n, s) => n + s.count, 0) > 200 ||
    input.sections.reduce((n, s) => n + s.seconds, 0) > 21600
  )
    throw Error(
      "Use 1–6 sections, at most 200 questions and 6 hours in total.",
    );
  const used = new Set<string>();
  const attempts = input.sections.map((s, i) => {
    if (typeof s.title !== "string" || !s.title.trim() || s.title.length > 100)
      throw Error("Each section needs a title up to 100 characters.");
    const prior = input.allowRepeats ? [] : input.seen;
    const a = createPractice({
      ...s,
      bankVersion: input.bankVersion,
      examId: input.examId,
      seen: [...prior, ...used],
      allowRepeats: false,
      writerId: input.writerId,
      now: input.now,
    });
    a.items.forEach((item) => used.add(item.question.id));
    return {
      ...a,
      sections: [
        { id: `section-${i + 1}`, title: s.title, seconds: s.seconds },
      ],
      items: a.items.map((item) => ({ ...item, section: `section-${i + 1}` })),
    };
  });
  const a: PracticeAttempt = {
    ...attempts[0],
    id: crypto.randomUUID(),
    navigation: input.fixed ? "fixed-sections" : "paper",
    sections: attempts.flatMap((a) => a.sections),
    items: attempts.flatMap((a) => a.items),
  };
  if (!validAttempt(a)) throw Error("Section settings failed validation.");
  return a;
}
