import { exams } from "../catalog.ts";
import { studyUnits } from "./content.ts";
import { practiceQuestions } from "./questions.ts";
import { createPractice, evaluate, type PracticeAttempt } from "./engine.ts";
import { recallQueue, localDay } from "./recall.ts";
import {
  createSSCRetry,
  defaultSSCStudy,
  mistakeReasons,
  sscDailyPlan,
  sscMistakes,
  sscSubjectProgress,
  type SSCJournalEntry,
  type SSCStudy,
} from "./ssc-study.ts";
import { sscSections } from "./ssc.ts";
import type { LearningVault } from "./vault.ts";
export type ExamStudy = {
  minutes: number;
  section: string;
  journal: Record<string, SSCJournalEntry>;
};
export function examLessons(examId: string) {
  return studyUnits.filter((u) => u.exams.includes(examId));
}
export function examQuestions(examId: string) {
  const slugs = new Set(examLessons(examId).map((u) => u.slug));
  return practiceQuestions.filter((q) => slugs.has(q.topicId));
}
export function examSubjects(examId: string): Record<string, string> {
  return examId === "ssc"
    ? sscSections
    : Object.fromEntries(
        [...new Set(examLessons(examId).map((u) => u.subject))].map((s) => [
          s,
          s,
        ]),
      );
}
export function defaultExamStudy(): ExamStudy {
  return { minutes: 60, section: "all", journal: {} };
}
export function examStudy(v: LearningVault, examId: string): ExamStudy {
  return examId === "ssc"
    ? (v.sscStudy ?? defaultSSCStudy())
    : (v.examStudy?.[examId] ?? defaultExamStudy());
}
export function withExamStudy(
  v: LearningVault,
  examId: string,
  settings: ExamStudy,
): LearningVault {
  if (!exams.some((e) => e.id === examId)) throw Error("Unknown exam context.");
  return examId === "ssc"
    ? { ...v, sscStudy: settings as SSCStudy }
    : { ...v, examStudy: { ...v.examStudy, [examId]: settings } };
}
function record(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
export function validExamStudyRecord(
  value: unknown,
): value is Record<string, ExamStudy> {
  if (!record(value) || Object.keys(value).length > exams.length - 1)
    return false;
  return Object.entries(value).every(([id, raw]) => {
    if (id === "ssc" || !exams.some((e) => e.id === id) || !record(raw))
      return false;
    const s = raw as ExamStudy,
      pool = new Set(examQuestions(id).map((q) => q.id));
    return (
      Number.isInteger(s.minutes) &&
      s.minutes >= 20 &&
      s.minutes <= 180 &&
      (s.section === "all" || Object.hasOwn(examSubjects(id), s.section)) &&
      record(s.journal) &&
      Object.keys(s.journal).length <= pool.size &&
      Object.entries(s.journal).every(
        ([qid, e]) =>
          pool.has(qid) &&
          record(e) &&
          typeof e.note === "string" &&
          e.note.length <= 4000 &&
          mistakeReasons.includes(e.reason as SSCJournalEntry["reason"]) &&
          typeof e.resolved === "boolean" &&
          typeof e.doubt === "boolean" &&
          typeof e.updatedAt === "string" &&
          Number.isFinite(Date.parse(e.updatedAt)),
      )
    );
  });
}
export function latestExamResponses(v: LearningVault, examId: string) {
  const pool = new Set(examQuestions(examId).map((q) => q.id));
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
  for (const a of [...v.attempts]
    .reverse()
    .filter((a) => a.examId === examId && a.submittedAt !== null)
    .sort(
      (a, b) => a.submittedAt! - b.submittedAt! || a.startedAt - b.startedAt,
    ))
    for (const r of evaluate(a).rows)
      if (pool.has(r.id))
        rows.set(r.id, { ...r, submittedAt: a.submittedAt!, attemptId: a.id });
  return rows;
}
export function examMistakes(v: LearningVault, examId: string) {
  if (examId === "ssc") return sscMistakes(v);
  const journal = examStudy(v, examId).journal,
    latest = latestExamResponses(v, examId);
  return examQuestions(examId).flatMap((question) => {
    const response = latest.get(question.id),
      entry = journal[question.id];
    return response || entry
      ? [
          {
            question,
            response,
            entry,
            open:
              !!entry?.doubt ||
              (!entry?.resolved && response?.status !== "correct"),
          },
        ]
      : [];
  });
}
export function examDailyPlan(
  v: LearningVault,
  examId: string,
  today = localDay(),
) {
  if (examId === "ssc") return sscDailyPlan(v, today);
  const settings = examStudy(v, examId),
    lessons = examLessons(examId).filter(
      (u) => settings.section === "all" || u.subject === settings.section,
    ),
    slugs = new Set(lessons.map((u) => u.slug));
  const due = recallQueue(v, examId, true, today).filter((r) =>
      slugs.has(r.unit.slug),
    ),
    missed = examMistakes(v, examId).filter(
      (r) => r.open && !r.entry?.doubt && slugs.has(r.question.topicId),
    );
  const tasks: {
    kind: "recall" | "mistakes" | "lesson" | "drill";
    title: string;
    minutes: number;
    href: string;
  }[] = [];
  let remaining = settings.minutes;
  function add(
    kind: (typeof tasks)[number]["kind"],
    title: string,
    minutes: number,
    href: string,
  ) {
    if (remaining >= minutes) {
      tasks.push({ kind, title, minutes, href });
      remaining -= minutes;
    }
  }
  if (due.length)
    add("recall", `Recall ${due[0].unit.title}`, 10, `/recall?exam=${examId}`);
  if (missed.length)
    add(
      "mistakes",
      `Diagnose ${missed.length} unresolved questions`,
      10,
      `/classrooms/${examId}/study#mistake-notebook`,
    );
  const priority = new Set(missed.map((r) => r.question.topicId));
  for (const u of lessons
    .filter((u) => !v.completed.includes(`${examId}:${u.slug}`))
    .sort(
      (a, b) => Number(priority.has(b.slug)) - Number(priority.has(a.slug)),
    )) {
    if (remaining < u.minutes) continue;
    add("lesson", u.title, u.minutes, `/courses/${u.slug}?exam=${examId}`);
    if (examQuestions(examId).some((q) => q.topicId === u.slug))
      add(
        "drill",
        `Apply: ${u.title}`,
        10,
        `/assessments?exam=${examId}&topic=${u.slug}`,
      );
  }
  return { tasks, remaining, due: due.length, missed: missed.length };
}
export function examSubjectProgress(v: LearningVault, examId: string) {
  if (examId === "ssc") return sscSubjectProgress(v);
  const latest = [...latestExamResponses(v, examId).values()],
    pool = examQuestions(examId);
  return Object.entries(examSubjects(examId)).map(([section, title]) => {
    const lessons = examLessons(examId).filter((u) => u.subject === section),
      slugs = new Set(lessons.map((u) => u.slug)),
      responses = latest.filter((r) => slugs.has(r.topicId));
    return {
      section,
      title,
      lessons: lessons.length,
      completed: lessons.filter((u) =>
        v.completed.includes(`${examId}:${u.slug}`),
      ).length,
      questions: pool.filter((q) => slugs.has(q.topicId)).length,
      observed: responses.length,
      correct: responses.filter((r) => r.status === "correct").length,
      incorrect: responses.filter((r) => r.status === "incorrect").length,
      unanswered: responses.filter((r) => r.status === "unanswered").length,
    };
  });
}
export function createExamRetry(
  v: LearningVault,
  examId: string,
  ids: string[],
  writerId: string,
  now: number,
): PracticeAttempt {
  if (examId === "ssc") return createSSCRetry(v, ids, writerId, now);
  if (!exams.some((e) => e.id === examId)) throw Error("Unknown exam context.");
  if (v.active || v.personal?.active || v.sscDest?.active)
    throw Error("Finish or resume your active timed session first.");
  const eligible = new Set(
    examMistakes(v, examId)
      .filter((r) => r.open && !r.entry?.doubt)
      .map((r) => r.question.id),
  );
  if (
    !ids.length ||
    ids.length > 20 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !eligible.has(id))
  )
    throw Error(
      "Select 1–20 unresolved questions without a key doubt in this exam.",
    );
  return createPractice({
    examId,
    topicIds: examLessons(examId).map((u) => u.slug),
    questionIds: ids,
    count: ids.length,
    seconds: ids.length * 60,
    correct: 1,
    penalty: 0.25,
    seen: [],
    allowRepeats: true,
    writerId,
    now,
  });
}
export function studyDeskUrl(examId: string) {
  return examId === "ssc" ? "/ssc-cgl/study" : `/classrooms/${examId}/study`;
}
