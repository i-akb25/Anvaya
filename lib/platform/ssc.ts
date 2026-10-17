import course from "./ssc-course.json" with { type: "json" };
import type { Source, StudyUnit } from "./content.ts";
import type { StudyQuestion } from "./questions.ts";
export const sscNotice =
  "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf";
export const sscVersion = "ssc-cgl-2026-20261017-v1";
export const sscSections = {
  quant: "Mathematical abilities",
  reason: "Reasoning",
  english: "English language",
  ga: "General awareness",
  computer: "Computer knowledge",
  statistics: "Statistics · applicable posts",
  finance: "Finance & Economics · applicable posts",
};
export type SSCSection = keyof typeof sscSections;
export const sscChapters = course.chapters;
export const sscSources: Source[] = [
  {
    id: "ssc-2026-syllabus",
    title: "SSC CGL 2026 · official syllabus and scheme (§13)",
    url: sscNotice,
    publisher: "Staff Selection Commission",
    checkedOn: "2026-10-17",
    licenseNote:
      "Official coverage/rules reference. The original lessons and questions are independently AI-authored, not copied from this notice or an SSC answer key. Topic links are further reading, not independent answer review.",
  },
];
export const sscUnits: StudyUnit[] = sscChapters.map((c) => ({
  slug: c.slug,
  title: c.title,
  subject: sscSections[c.section as SSCSection],
  exams: ["ssc"],
  minutes: 20,
  objective: `Learn the essentials, work through an example and practise: ${c.tags.join(", ")}.`,
  sourceId: "ssc-2026-syllabus",
  status: "source-linked",
  authorship: "AI-authored",
  review:
    "Mapped to the 2026 SSC syllabus. Original condensed notes and examples; author checks only. No independent human editorial review is claimed; full syllabus depth remains pending. The notice is a coverage reference, not evidence for each answer.",
  version: `${c.slug}-20261017-v1`,
  concepts: c.concepts,
  example: c.example,
  recall: c.recall.map((t) => `Without looking, explain: ${t.toLowerCase()}.`),
  mistake: c.mistake,
}));
export const sscQuestions: StudyQuestion[] = course.questions.map((q) => ({
  id: q.id,
  topicId: q.topicId,
  stem: q.stem,
  options: q.options,
  answer: q.answer,
  explanation: q.explanation,
  type: "mcq",
  version: `${q.id}-v1`,
  sourceId: "ssc-2026-syllabus",
  origin: "original-ai-authored",
  keyStatus: "author-checked",
  humanReviewed: false,
  pyq: false,
  marks: 1,
}));
export function sscTopicIds(section: SSCSection) {
  return sscChapters.filter((c) => c.section === section).map((c) => c.slug);
}
export const sscFurtherReading = [
  [
    "NCERT textbooks · choose class and subject",
    "https://ncert.nic.in/textbook.php",
  ],
  [
    "Constitution · official text",
    "https://www.legislative.gov.in/constitution-of-india",
  ],
  [
    "British Council · reported speech",
    "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/reported-speech",
  ],
  [
    "Microsoft · Excel formulas",
    "https://support.microsoft.com/en-us/excel/get-started/overview-of-formulas-in-excel",
  ],
  ["NASA · Earth facts", "https://science.nasa.gov/earth/facts/"],
  ["SSC · notices, papers and answer-key availability", "https://ssc.gov.in/"],
];
export const sscRemaining = [
  "Independent editorial review of every lesson, answer and explanation.",
  "Deeper ancient/medieval history, Indian maps/culture, current affairs, visual reasoning and advanced special-paper teaching.",
  "A licensed, authenticated previous-paper/final-key dataset; no current-year official question paper is imported here.",
  "Full 100-question Statistics and Finance/Economics practice papers: each branch currently has 16 original topic questions, so full papers are blocked.",
  "Curated SSC-specific video lessons and independently calibrated paper difficulty.",
  "Live examination navigation/subject order and regional DEST evaluation instructions; this rehearsal is not an SSC interface replica.",
];
