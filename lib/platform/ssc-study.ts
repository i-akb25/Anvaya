import {
  sscChapters,
  sscQuestions,
  sscSections,
  type SSCSection,
} from "./ssc.ts";
import { createPractice, evaluate, type PracticeAttempt } from "./engine.ts";
import { recallQueue, localDay } from "./recall.ts";
import type { LearningVault } from "./vault.ts";
const sscQuestionIds = new Set(sscQuestions.map((q) => q.id));
export const mistakeReasons = [
  "concept",
  "calculation",
  "reading",
  "time",
  "guess",
  "unreviewed",
] as const;
export type MistakeReason = (typeof mistakeReasons)[number];
export type SSCJournalEntry = {
  note: string;
  reason: MistakeReason;
  resolved: boolean;
  doubt: boolean;
  updatedAt: string;
};
export type SSCStudy = {
  minutes: number;
  section: "common" | SSCSection;
  journal: Record<string, SSCJournalEntry>;
};
export const defaultSSCStudy = (): SSCStudy => ({
  minutes: 60,
  section: "common",
  journal: {},
});
export function validSSCStudy(value: unknown): value is SSCStudy {
  if (!value || typeof value !== "object") return false;
  const s = value as SSCStudy;
  return (
    Number.isInteger(s.minutes) &&
    s.minutes >= 20 &&
    s.minutes <= 180 &&
    ["common", ...Object.keys(sscSections)].includes(s.section) &&
    !!s.journal &&
    typeof s.journal === "object" &&
    !Array.isArray(s.journal) &&
    Object.keys(s.journal).length <= sscQuestions.length &&
    Object.entries(s.journal).every(
      ([id, e]) =>
        sscQuestionIds.has(id) &&
        !!e &&
        typeof e === "object" &&
        typeof e.note === "string" &&
        e.note.length <= 4000 &&
        mistakeReasons.includes(e.reason) &&
        typeof e.resolved === "boolean" &&
        typeof e.doubt === "boolean" &&
        typeof e.updatedAt === "string" &&
        Number.isFinite(Date.parse(e.updatedAt)),
    )
  );
}
export function latestSSCResponses(v: LearningVault) {
  const rows = new Map<
    string,
    {
      id: string;
      topicId: string;
      status: "correct" | "incorrect" | "unanswered";
      submittedAt: number;
      attemptId: string;
    }
  >();
  // Sort by actual submission time, not backup array order. Newest response wins.
  for (const a of [...v.attempts]
    .reverse()
    .filter((a) => a.examId === "ssc" && a.submittedAt !== null)
    .sort(
      (a, b) => a.submittedAt! - b.submittedAt! || a.startedAt - b.startedAt,
    ))
    for (const r of evaluate(a).rows)
      if (sscQuestionIds.has(r.id))
        rows.set(r.id, { ...r, submittedAt: a.submittedAt!, attemptId: a.id });
  return rows;
}
export function sscMistakes(v: LearningVault) {
  const journal = v.sscStudy?.journal ?? {},
    latest = latestSSCResponses(v);
  return sscQuestions.flatMap((question) => {
    const response = latest.get(question.id),
      entry = journal[question.id];
    if (!response && !entry) return [];
    return [
      {
        question,
        response,
        entry,
        open:
          !!entry?.doubt ||
          (!entry?.resolved && response?.status !== "correct"),
      },
    ];
  });
}
export function sscDailyPlan(v: LearningVault, today = localDay()) {
  const settings = v.sscStudy ?? defaultSSCStudy();
  const chapters = sscChapters.filter((c) =>
    settings.section === "common"
      ? !["statistics", "finance"].includes(c.section)
      : c.section === settings.section,
  );
  const slugs = new Set(chapters.map((c) => c.slug));
  const due = recallQueue(v, "ssc", true, today).filter((r) =>
    slugs.has(r.unit.slug),
  );
  const missed = sscMistakes(v).filter(
    (r) => r.open && !r.entry?.doubt && slugs.has(r.question.topicId),
  );
  const tasks: {
    kind: "recall" | "mistakes" | "lesson" | "drill";
    title: string;
    minutes: number;
    href: string;
  }[] = [];
  let remaining = settings.minutes;
  const add = (
    kind: (typeof tasks)[number]["kind"],
    title: string,
    minutes: number,
    href: string,
  ) => {
    if (remaining >= minutes) {
      tasks.push({ kind, title, minutes, href });
      remaining -= minutes;
    }
  };
  if (due.length)
    add("recall", `Recall ${due[0].unit.title}`, 10, "/recall?exam=ssc");
  if (missed.length)
    add(
      "mistakes",
      `Retry up to ${Math.min(missed.length, 10)} missed questions`,
      10,
      "/ssc-cgl/study#mistake-notebook",
    );
  const priority = new Set(missed.map((m) => m.question.topicId));
  const next = [...chapters]
    .filter((c) => !v.completed.includes(`ssc:${c.slug}`))
    .sort(
      (a, b) => Number(priority.has(b.slug)) - Number(priority.has(a.slug)),
    );
  for (const c of next) {
    if (remaining < 20) break;
    add("lesson", c.title, 20, `/courses/${c.slug}?exam=ssc`);
    add(
      "drill",
      `Apply: ${c.title}`,
      10,
      `/assessments?exam=ssc&topic=${c.slug}`,
    );
  }
  return { tasks, remaining, due: due.length, missed: missed.length };
}
export function sscSubjectProgress(v: LearningVault) {
  const latest = [...latestSSCResponses(v).values()];
  return Object.entries(sscSections).map(([section, title]) => {
    const chapters = sscChapters.filter((c) => c.section === section),
      slugs = new Set(chapters.map((c) => c.slug));
    const responses = latest.filter((r) => slugs.has(r.topicId));
    return {
      section,
      title,
      lessons: chapters.length,
      completed: chapters.filter((c) => v.completed.includes(`ssc:${c.slug}`))
        .length,
      questions: sscQuestions.filter((q) => slugs.has(q.topicId)).length,
      observed: responses.length,
      correct: responses.filter((r) => r.status === "correct").length,
      incorrect: responses.filter((r) => r.status === "incorrect").length,
      unanswered: responses.filter((r) => r.status === "unanswered").length,
    };
  });
}
export function createSSCRetry(
  v: LearningVault,
  ids: string[],
  writerId: string,
  now: number,
): PracticeAttempt {
  if (v.active || v.personal?.active || v.sscDest?.active)
    throw Error("Finish or resume your active timed session first.");
  const eligible = sscMistakes(v)
    .filter((r) => r.open && !r.entry?.doubt)
    .map((r) => r.question.id);
  if (
    !ids.length ||
    ids.length > 20 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !eligible.includes(id))
  )
    throw Error("Select 1–20 unresolved questions without a key doubt.");
  return createPractice({
    examId: "ssc",
    topicIds: sscChapters.map((c) => c.slug),
    questionIds: ids,
    count: ids.length,
    seconds: Math.max(60, ids.length * 60),
    correct: 2,
    penalty: 0.5,
    seen: [],
    allowRepeats: true,
    writerId,
    now,
  });
}
