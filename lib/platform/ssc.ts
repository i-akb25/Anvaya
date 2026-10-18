import expansion from "./ssc-expansion.json" with { type: "json" };
import course from "./ssc-course.json" with { type: "json" };
import type { Source, StudyUnit } from "./content.ts";
import type { StudyQuestion } from "./questions.ts";
export const sscNotice =
  "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf";
export const sscVersion = "ssc-cgl-2026-20261018-v2";
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
export const sscChapters = [
  ...course.chapters.map((c) => ({
    ...c,
    sourceId: "ssc-2026-syllabus",
    releaseDate: "20261017",
  })),
  ...expansion.chapters.map((c) => ({ ...c, releaseDate: "20261018" })),
];
export const sscSources: Source[] = [
  ...[
    [
      "ssc-nist",
      "NIST statistical methods · reference",
      "https://www.itl.nist.gov/div898/handbook/eda/section3/eda35.htm",
      "NIST",
    ],
    [
      "ssc-nios-accounts",
      "NIOS Accountancy · original source reading",
      "https://cdn.nios.ac.in/cms/documents/2020/Jun/29/320_E_book1.pdf",
      "NIOS",
    ],
    [
      "ssc-nios-economics",
      "NIOS Economics · course and media",
      "https://rcraipur.nios.ac.in/economics-318.html",
      "NIOS",
    ],
    [
      "ssc-nios-history",
      "NIOS History · course index",
      "https://rcjaipur.nios.ac.in/history-315.html",
      "NIOS",
    ],
    [
      "ssc-nios-geography",
      "NIOS Social Science · geography readings",
      "https://rcbengaluru.nios.ac.in/social-science-213.html",
      "NIOS",
    ],
    [
      "ssc-nios-science",
      "NIOS Science · source readings",
      "https://rcbengaluru.nios.ac.in/science-and-technology-212.html",
      "NIOS",
    ],
    [
      "ssc-constitution",
      "Constitution of India · official text",
      "https://www.legislative.gov.in/constitution-of-india",
      "Legislative Department",
    ],
  ].map(([id, title, url, publisher]) => ({
    id,
    title,
    url,
    publisher,
    checkedOn: "2026-10-18",
    licenseNote:
      "Read at publisher. Reference for concepts, not an SSC answer key. Anvaya notes and questions are original AI-authored material with author checks only; no copied textbook exercises or independent human review are claimed.",
  })),
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
  sourceId: c.sourceId,
  status: "source-linked",
  authorship: "AI-authored",
  review:
    "Mapped to the 2026 SSC syllabus. Original condensed notes and examples; author checks only. No independent human editorial review is claimed; full syllabus depth remains pending. The notice is a coverage reference, not evidence for each answer.",
  version: `${c.slug}-${c.releaseDate}-v1`,
  concepts: c.concepts,
  example: c.example,
  recall: c.recall.map((t) => `Without looking, explain: ${t.toLowerCase()}.`),
  mistake: c.mistake,
}));
export const legacySscQuestions: StudyQuestion[] = course.questions.map(
  (q) => ({
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
  }),
);
export const sscQuestions: StudyQuestion[] = [
  ...legacySscQuestions,
  ...expansion.questions.map((q) => ({
    id: q.id,
    topicId: q.topicId,
    stem: q.stem,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    type: "mcq" as const,
    version: `${q.id}-v1`,
    sourceId: q.sourceId,
    origin: "original-ai-authored" as const,
    keyStatus: "author-checked" as const,
    humanReviewed: false as const,
    pyq: false as const,
    marks: 1,
    ...("figure" in q ? { figure: q.figure } : {}),
  })),
];
export const sscAccountTopics = new Set([
  "ssc-accounts-foundations",
  "ssc-accounts-statements",
  "ssc-bookkeeping",
  "ssc-bank-reconciliation",
  "ssc-bills-control",
  "ssc-final-accounts",
  "ssc-depreciation-inventory",
]);
export function sscFinancePart(topicId: string) {
  return sscAccountTopics.has(topicId) ? "accounts" : "economics";
}
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
  "Independent subject-expert review and difficulty calibration. Author checks and automated tests do not constitute that approval.",
  "Authenticated, permitted official PYQs paired with final keys. Current-year public access could not be verified; original practice is never labelled PYQ.",
  "Exhaustive textbook depth and every syllabus subtopic: the expanded path is structured original teaching, not a certified complete curriculum.",
  "Live examination navigation, accommodation eligibility and regional DEST error evaluation must follow the applicable official instructions.",
  "Full playback review of linked lectures and physical-device/accessibility testing beyond automated and desktop checks.",
];
