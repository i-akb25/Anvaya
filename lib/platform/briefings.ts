import { validSourceUrl } from "./personal-practice.ts";
export type Briefing = {
  id: string;
  version: number;
  title: string;
  date: string;
  sourceUrl: string;
  summary: string;
  exams: string[];
  status: "draft" | "reviewed" | "corrected" | "withdrawn";
  checkedOn: string;
  correction: string;
  recall: string;
};
const ids = [
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
export const officialReadingSources = [
  { title: "PIB releases", url: "https://www.pib.gov.in/" },
  {
    title: "RBI press releases",
    url: "https://m.rbi.org.in/Scripts/BS_PressreleaseDisplay.aspx",
  },
  {
    title: "RBI monetary policy",
    url: "https://www.rbi.org.in/scripts/annualpolicy.aspx",
  },
  { title: "Bihar government", url: "https://state.bihar.gov.in/" },
];
export function calendarDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value
  );
}
export function validBriefing(value: unknown): value is Briefing {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Briefing;
  return (
    /^[a-zA-Z0-9][\w-]{0,79}$/.test(b.id) &&
    !["constructor", "prototype"].includes(b.id) &&
    Number.isSafeInteger(b.version) &&
    b.version > 0 &&
    typeof b.title === "string" &&
    b.title.trim().length > 0 &&
    b.title.length <= 200 &&
    typeof b.summary === "string" &&
    b.summary.trim().length > 0 &&
    b.summary.length <= 3000 &&
    typeof b.recall === "string" &&
    b.recall.length <= 1000 &&
    typeof b.correction === "string" &&
    b.correction.length <= 1000 &&
    (b.status !== "corrected" || !!b.correction.trim()) &&
    ["draft", "reviewed", "corrected", "withdrawn"].includes(b.status) &&
    !!b.sourceUrl &&
    validSourceUrl(b.sourceUrl) &&
    calendarDate(b.date) &&
    calendarDate(b.checkedOn) &&
    b.checkedOn >= b.date &&
    Array.isArray(b.exams) &&
    b.exams.length > 0 &&
    b.exams.length <= 10 &&
    new Set(b.exams).size === b.exams.length &&
    b.exams.every((e) => ids.includes(e))
  );
}
export const publishedBriefings: Briefing[] = [
  {
    id: "records-20261016",
    version: 1,
    title: "Records management and administrative capacity",
    date: "2026-10-16",
    sourceUrl:
      "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2324360&lang=1&reg=48",
    summary:
      "PIB reports that the Department of Social Justice and Empowerment held a records-management lecture as part of Special Campaign 6.0. Use this as a governance example of institutional record keeping. A report of a training event does not by itself measure improved administrative outcomes.",
    exams: ["upsc", "bpsc", "ssc"],
    status: "reviewed",
    checkedOn: "2026-10-16",
    correction: "",
    recall:
      "How would you distinguish an administrative activity from evidence of an improved outcome?",
  },
  {
    id: "startup-funding-20261015",
    version: 1,
    title: "Startup policy: distinguish initiative from impact",
    date: "2026-10-15",
    sourceUrl:
      "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=160469",
    summary:
      "A PIB backgrounder describes Startup India, launched in 2016, and government funding initiatives supporting enterprises at different stages. For revision, distinguish a policy's stated support mechanisms from independently measured results. Read the original before recording scheme amounts or eligibility.",
    exams: ["upsc", "bpsc", "sbi", "ibps"],
    status: "reviewed",
    checkedOn: "2026-10-16",
    correction: "",
    recall:
      "What additional evidence would be needed to evaluate whether funding support caused business growth?",
  },
  {
    id: "tb-framework-20261013",
    version: 1,
    title: "Public health programmes: connect objectives and implementation",
    date: "2026-10-13",
    sourceUrl:
      "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=160454&id=160454",
    summary:
      "PIB's tuberculosis backgrounder identifies the National Tuberculosis Elimination Programme and its Detect–Treat–Prevent–Build framework. Use the framework to structure a public-health answer. A programme target is not proof that disease elimination has been achieved.",
    exams: ["upsc", "bpsc", "ssc"],
    status: "reviewed",
    checkedOn: "2026-10-16",
    correction: "",
    recall:
      "Why must an exam answer distinguish an elimination target from verified achievement?",
  },
];
