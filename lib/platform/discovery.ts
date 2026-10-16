import { studyUnits } from "./content.ts";
import { lectureTopics, lectureResources } from "./lectures.ts";
import { syllabusUnits } from "./syllabus.ts";
import { materials } from "../materials.ts";
import type { LearningVault } from "./vault.ts";
import type { Workspace } from "../workspace.ts";
import { localDay } from "./recall.ts";
export type StudyHit = {
  id: string;
  kind: string;
  title: string;
  body: string;
  exams: string[];
  href: string;
  private: boolean;
  status: string;
};
export function studyIndex(v?: LearningVault, w?: Workspace): StudyHit[] {
  const hits: StudyHit[] = [
    ...studyUnits.map((u) => ({
      id: `lesson:${u.slug}`,
      kind: "Lesson",
      title: u.title,
      body: `${u.subject} ${u.objective} ${lectureTopics.find((t) => t.id === u.slug)?.aliases.join(" ") ?? ""}`,
      exams: u.exams,
      href: `/courses/${u.slug}`,
      private: false,
      status:
        "Source-checked original foundation; not independently human-reviewed",
    })),
    ...lectureTopics.map((t) => ({
      id: `topic:${t.id}`,
      kind: "Lecture topic",
      title: t.title,
      body: `${t.subject} ${t.aliases.join(" ")} ${t.resourceIds.map((id) => lectureResources.find((r) => r.id === id)?.title).join(" ")}`,
      exams: t.exams,
      href: `/lectures/${t.id}`,
      private: false,
      status: t.resourceIds.length
        ? `${t.resourceIds.length} publisher links; partial selection`
        : "Curation pending",
    })),
    ...syllabusUnits.map((s) => ({
      id: `syllabus:${s.id}`,
      kind: "Syllabus outline",
      title: s.title,
      body: `${s.cycle} ${s.stage} ${s.aliases.join(" ")}`,
      exams: [s.examId],
      href: `/lectures?exam=${s.examId}&syllabus=${s.id}`,
      private: false,
      status: `${s.status}; complete subtopic coverage pending`,
    })),
    ...materials.map((m) => ({
      id: `paper:${m.id}`,
      kind: "Official paper link",
      title: m.title,
      body: m.note,
      exams: [m.examId],
      href: `/study/${m.id}`,
      private: false,
      status: "Publisher-hosted paper/archive; not an imported scored test",
    })),
  ];
  if (v) {
    for (const [key, note] of Object.entries(v.notes)) {
      const [exam, topic] = key.split(":"),
        t = lectureTopics.find((t) => t.id === topic && t.exams.includes(exam));
      if (note.trim() && t)
        hits.push({
          id: `note:${key}`,
          kind: "My note",
          title: t.title,
          body: note,
          exams: [exam],
          href: `/notebook?exam=${exam}&topic=${topic}`,
          private: true,
          status: "Personal note; not editorially verified",
        });
    }
    for (const [key, state] of Object.entries(v.lectures ?? {})) {
      const [exam, topic, id] = key.split(":"),
        r = lectureResources.find((r) => r.id === id),
        t = lectureTopics.find(
          (t) =>
            t.id === topic &&
            t.exams.includes(exam) &&
            t.resourceIds.includes(id),
        );
      if (r && t && state.note.trim())
        hits.push({
          id: `lecture-note:${key}`,
          kind: "My lecture note",
          title: r.title,
          body: state.note,
          exams: [exam],
          href: `/lectures/${topic}?exam=${exam}&resource=${id}`,
          private: true,
          status: state.status,
        });
    }
    for (const p of v.personal?.packs ?? [])
      hits.push({
        id: `pack:${p.id}:${p.version}`,
        kind: "My question pack",
        title: p.title,
        body: p.questions.map((q) => q.stem).join(" "),
        exams: [p.examId],
        href: "/my-practice",
        private: true,
        status: "Personal questions and supplied keys; unverified",
      });
    for (const [id, entry] of Object.entries(v.writing))
      if (entry.text.trim())
        hits.push({
          id: `writing:${id}`,
          kind: "My writing",
          title: entry.kind,
          body: entry.text,
          exams: [],
          href: "/writing",
          private: true,
          status: "Personal writing draft",
        });
  }
  if (w)
    for (const task of w.tasks)
      hits.push({
        id: `task:${task.id}`,
        kind: "My plan",
        title: task.title,
        body: task.date,
        exams: [task.exam],
        href: "/planner",
        private: true,
        status: task.done ? "Completed" : "Planned",
      });
  return hits;
}
const normalize = (v: string) => v.toLocaleLowerCase().normalize("NFKC").trim();
export function searchStudy(
  index: StudyHit[],
  query: string,
  exam = "all",
  kind = "all",
  includePrivate = false,
) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return index
    .filter(
      (h) =>
        (includePrivate || !h.private) &&
        (exam === "all" || h.exams.includes(exam)) &&
        (kind === "all" || h.kind === kind) &&
        words.every((word) => normalize(h.title + " " + h.body).includes(word)),
    )
    .map((h) => ({
      hit: h,
      score: words.reduce(
        (s, word) => s + (normalize(h.title).includes(word) ? 3 : 1),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title))
    .map((r) => r.hit);
}
export function noteReviewQueue(
  v: LearningVault,
  exam = "all",
  today = localDay(),
) {
  return Object.entries(v.revisionDue)
    .flatMap(([key, date]) => {
      const [ex, topic] = key.split(":"),
        t = lectureTopics.find((t) => t.id === topic && t.exams.includes(ex));
      return t && (exam === "all" || ex === exam) && date <= today
        ? [{ key, date, exam: ex, topic: t }]
        : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
