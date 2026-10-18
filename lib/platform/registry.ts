/** Versioned research baseline. Null means unresolved, never a guessed default. */
export type QuestionFormat =
  "mcq" | "msq" | "nat" | "tita" | "descriptive" | "typing" | "interview";
export type PatternSection = {
  id: string;
  title: string;
  questions: number | null;
  marks: number | null;
  minutes: number | null;
  qualifying?: boolean;
};
export type Pattern = {
  id: string;
  examId: string;
  cycle: string;
  stage: string;
  title: string;
  version: string;
  sourceUrl: string;
  sourceLocator: string;
  checkedOn: string;
  status: "source-checked" | "reference-only";
  classification:
    | "official-pattern-verified"
    | "historical-pattern-practice"
    | "custom-illustrative";
  formats: QuestionFormat[];
  sections: PatternSection[];
  navigation: "paper" | "fixed-sections" | "unresolved";
  penalty: {
    mcqFraction?: number;
    mcqFixed?: number;
    msq: number;
    numeric: number;
  } | null;
  unresolved: string[];
  language: string[];
  effectiveDate: string | null;
  questionBankVersion: string | null;
  calculator: "scientific" | "basic" | "none" | "unresolved";
};
const checkedOn = "2026-10-15";
const links = {
  upsc: "https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf",
  bpsc: "https://bpsc.bihar.gov.in/syllabus/",
  ssc: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf",
  sbi: "https://sbi.bank.in/en/web/careers/current-openings",
  ibps: "https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf",
  cat: "https://iimcat.ac.in/",
  ese: "https://www.upsc.gov.in/examinations/Engineering%20Services%20%28Preliminary%29%20Examination%2C%202027",
  gate: "https://gate2027.iitm.ac.in/question_paper_pattern",
};
function section(
  id: string,
  title: string,
  questions: number | null,
  marks: number | null,
  minutes: number | null,
  qualifying = false,
): PatternSection {
  return { id, title, questions, marks, minutes, qualifying };
}
function pattern(
  examId: string,
  cycle: string,
  stage: string,
  title: string,
  formats: QuestionFormat[],
  sections: PatternSection[],
  extras: Partial<Pattern> = {},
): Pattern {
  return {
    id: `${examId}-${cycle}-${stage}`,
    examId,
    cycle,
    stage,
    title,
    version: `${examId}-${cycle}-${stage}-20261015-v1`,
    sourceUrl:
      links[
        (examId.startsWith("gate-") ? "gate" : examId) as keyof typeof links
      ],
    sourceLocator:
      "Owner reference; full governing instructions require review",
    checkedOn,
    status: "reference-only",
    classification: "custom-illustrative",
    language: ["English"],
    effectiveDate: null,
    questionBankVersion: null,
    formats,
    sections,
    navigation: "unresolved",
    penalty: null,
    unresolved: [
      "Full current-cycle instructions and accommodations require review.",
      "Complete reviewed paper and answer key are not yet available in Anvaya.",
    ],
    calculator: "unresolved",
    ...extras,
  };
}
export const patterns: Pattern[] = [
  pattern(
    "upsc",
    "2026",
    "prelims-gs1",
    "Prelims · General Studies I",
    ["mcq"],
    [section("gs1", "General Studies I", 100, 200, 120)],
    {
      penalty: { mcqFraction: 1 / 3, msq: 0, numeric: 0 },
      navigation: "paper",
    },
  ),
  pattern(
    "upsc",
    "2026",
    "prelims-csat",
    "Prelims · CSAT",
    ["mcq"],
    [section("csat", "CSAT", 80, 200, 120, true)],
    {
      penalty: { mcqFraction: 1 / 3, msq: 0, numeric: 0 },
      navigation: "paper",
    },
  ),
  ...[
    ["language", "Indian language", 300],
    ["english", "English", 300],
    ["essay", "Essay", 250],
    ["gs1", "General Studies I", 250],
    ["gs2", "General Studies II", 250],
    ["gs3", "General Studies III", 250],
    ["gs4", "General Studies IV", 250],
    ["optional-1", "Optional I", 250],
    ["optional-2", "Optional II", 250],
  ].map(([id, title, marks]) =>
    pattern(
      "upsc",
      "2026",
      `mains-${id}`,
      `Mains · ${title}`,
      ["descriptive"],
      [
        section(
          String(id),
          String(title),
          null,
          Number(marks),
          180,
          id === "language" || id === "english",
        ),
      ],
    ),
  ),
  pattern(
    "upsc",
    "2026",
    "interview",
    "Personality test",
    ["interview"],
    [section("interview", "Personality test", null, 275, null)],
  ),
  pattern(
    "bpsc",
    "72nd",
    "prelims",
    "Preliminary General Studies",
    ["mcq"],
    [section("gs", "General Studies", 150, 150, 120)],
    {
      unresolved: [
        "Fifth-option E and the treatment of blank responses must be confirmed from the governing instructions.",
        "Revised dates and detailed current-cycle rules remain unresolved.",
      ],
      penalty: null,
    },
  ),
  ...[
    ["hindi", "General Hindi", 100],
    ["gs1", "General Studies I", 300],
    ["gs2", "General Studies II", 300],
    ["essay", "Essay", 300],
    ["optional", "Optional subject", 100],
  ].map(([id, title, marks]) =>
    pattern(
      "bpsc",
      "72nd",
      `mains-${id}`,
      `Mains · ${title}`,
      ["descriptive"],
      [
        section(
          String(id),
          String(title),
          null,
          Number(marks),
          null,
          id === "hindi" || id === "optional",
        ),
      ],
    ),
  ),
  pattern(
    "bpsc",
    "72nd",
    "interview",
    "Interview",
    ["interview"],
    [section("interview", "Interview", null, 120, null)],
  ),
  pattern(
    "ssc",
    "2026",
    "tier1",
    "Tier-I",
    ["mcq"],
    [
      section("reason", "Reasoning", 25, 50, 15),
      section("ga", "General Awareness", 25, 50, 15),
      section("quant", "Quantitative Aptitude", 25, 50, 15),
      section("english", "English Comprehension", 25, 50, 15),
    ],
    {
      status: "source-checked",
      checkedOn: "2026-10-17",
      sourceLocator: "§13.8, page 25; scribe timings separate",
      navigation: "fixed-sections",
      penalty: { mcqFixed: 0.5, msq: 0, numeric: 0 },
      calculator: "none",
      unresolved: [
        "Live subject-order behaviour must be confirmed from the navigation instructions.",
        "A complete reviewed, licensed paper is required before an official simulation can launch.",
      ],
    },
  ),
  pattern(
    "ssc",
    "2026",
    "tier2-paper1",
    "Tier-II · Paper I",
    ["mcq", "typing"],
    [
      section("math", "Mathematical Abilities", 30, 90, 30),
      section("reason", "Reasoning", 30, 90, 30),
      section("english", "English Language", 45, 135, 40),
      section("ga", "General Awareness", 25, 75, 20),
      section("computer", "Computer Knowledge", 20, 60, 15, true),
      section("dest", "DEST", null, null, 15, true),
    ],
    {
      status: "source-checked",
      checkedOn: "2026-10-17",
      sourceLocator:
        "§13.9 table and instructions, pages 25–29; separate session-II DEST",
      navigation: "fixed-sections",
      calculator: "none",
      penalty: { mcqFixed: 1, msq: 0, numeric: 0 },
      unresolved: [
        "Practice uses subject-table order with section closure. Live subject-order behaviour is not certified; DEST starts separately after an untimed re-registration break.",
        "Standard and compensatory practice profiles are available at /ssc-cgl. Eligibility, qualifying thresholds and regional DEST evaluation require the applicable official instructions.",
      ],
    },
  ),
  pattern(
    "ssc",
    "2026",
    "tier2-statistics",
    "Tier-II · Statistics (applicable posts)",
    ["mcq"],
    [section("statistics", "Statistics", 100, 200, 120)],
    { penalty: { mcqFixed: 0.5, msq: 0, numeric: 0 } },
  ),
  pattern(
    "ssc",
    "2026",
    "tier2-finance",
    "Tier-II · Finance & Economics (applicable posts)",
    ["mcq"],
    [section("finance", "Finance & Economics", 100, 200, 120)],
    {
      sourceLocator:
        "§13.9 Paper III and post applicability; omitted from owner research summary",
      penalty: { mcqFixed: 0.5, msq: 0, numeric: 0 },
    },
  ),
  pattern(
    "sbi",
    "2026-27",
    "prelims",
    "PO · Prelims",
    ["mcq"],
    [
      section("english", "English", 40, 40, 20),
      section("quant", "Quantitative Aptitude", 30, 30, 20),
      section("reason", "Reasoning", 30, 30, 20),
    ],
    {
      penalty: { mcqFraction: 0.25, msq: 0, numeric: 0 },
      navigation: "fixed-sections",
    },
  ),
  pattern(
    "sbi",
    "2026-27",
    "mains",
    "PO · Mains",
    ["mcq", "descriptive"],
    [
      section("reason", "Reasoning & Computer Aptitude", 40, 60, 50),
      section("data", "Data Analysis & Interpretation", 30, 60, 45),
      section("awareness", "General/Economy/Banking Awareness", 60, 60, 45),
      section("english", "English", 40, 20, 40),
      section("writing", "Written communication", null, 30, 30),
    ],
    {
      penalty: { mcqFraction: 0.25, msq: 0, numeric: 0 },
      unresolved: [
        "Current advertisement and handouts must confirm this reference table, question-level marks and descriptive requirements.",
      ],
    },
  ),
  pattern(
    "sbi",
    "2026-27",
    "phase3",
    "Psychometric / group exercise / interview",
    ["interview"],
    [section("phase3", "Later selection stages", null, null, null)],
  ),
  pattern(
    "ibps",
    "XVI",
    "prelims",
    "PO · Prelims",
    ["mcq"],
    [
      section("english", "English", 30, 30, 20),
      section("quant", "Quantitative Aptitude", 35, 30, 20),
      section("reason", "Reasoning", 35, 40, 20),
    ],
    {
      penalty: { mcqFraction: 0.25, msq: 0, numeric: 0 },
      navigation: "fixed-sections",
      unresolved: [
        "Verify section marks from the CRP-XVI PDF; older cycles are not interchangeable.",
      ],
    },
  ),
  pattern(
    "ibps",
    "XVI",
    "mains",
    "PO · Mains",
    ["mcq", "descriptive"],
    [
      section("reason", "Reasoning", null, null, null),
      section(
        "awareness",
        "General/Economy/Banking/Digital Awareness",
        null,
        null,
        null,
      ),
      section("english", "English", null, null, null),
      section("data", "Data Analysis", null, null, null),
      section("writing", "Descriptive", null, null, null),
    ],
    {
      unresolved: [
        "Conflicting 145/170-question distributions in the supplied reference. No default is selected.",
        "Official CRP-XVI PDF retrieval failed during review.",
      ],
    },
  ),
  pattern(
    "ibps",
    "XVI",
    "interview",
    "Later selection stages",
    ["interview"],
    [section("interview", "Interview / selection", null, null, null)],
  ),
  pattern(
    "cat",
    "2024-25-reference",
    "test",
    "CAT · historical 68-question reference",
    ["mcq", "tita"],
    [
      section("varc", "VARC", 24, 72, 40),
      section("dilr", "DILR", 22, 66, 40),
      section("qa", "QA", 22, 66, 40),
    ],
    {
      classification: "historical-pattern-practice",
      navigation: "fixed-sections",
      penalty: { mcqFixed: 1, msq: 0, numeric: 0 },
      calculator: "basic",
      unresolved: [
        "68 questions and 24/22/22 are a historical reference, not confirmed CAT 2026 rules.",
        "A complete reviewed paper is unavailable.",
      ],
    },
  ),
  pattern(
    "ese",
    "2027",
    "prelims1",
    "Prelims · GS & Engineering Aptitude",
    ["mcq"],
    [section("gs", "GS & Engineering Aptitude", 100, 200, 120)],
    { penalty: { mcqFraction: 1 / 3, msq: 0, numeric: 0 } },
  ),
  pattern(
    "ese",
    "2027",
    "prelims2",
    "Prelims · Electrical Engineering",
    ["mcq"],
    [section("ee", "Electrical Engineering", 150, 300, 180)],
    { penalty: { mcqFraction: 1 / 3, msq: 0, numeric: 0 } },
  ),
  ...[1, 2].map((n) =>
    pattern(
      "ese",
      "2027",
      `mains${n}`,
      `Mains · Electrical Engineering ${n}`,
      ["descriptive"],
      [section(`ee${n}`, `Electrical Engineering ${n}`, null, 300, 180)],
    ),
  ),
  pattern(
    "ese",
    "2027",
    "interview",
    "Personality test",
    ["interview"],
    [section("interview", "Personality test", null, 200, null)],
  ),
  ...["ee", "ec", "in"].map((code) =>
    pattern(
      `gate-${code}`,
      "2027",
      "paper",
      `GATE ${code.toUpperCase()}`,
      ["mcq", "msq", "nat"],
      [
        section("ga", "General Aptitude", 10, 15, null),
        section("subject", "Mathematics + technical", 55, 85, null),
      ],
      {
        status: "source-checked",
        checkedOn: "2026-10-18",
        version: `gate-${code}-2027-paper-20261018-v2`,
        sourceLocator:
          "Official question paper pattern; 13 mathematics + 72 technical marks within subject",
        navigation: "paper",
        penalty: { mcqFraction: 1 / 3, msq: 0, numeric: 0 },
        calculator: "scientific",
        unresolved: [
          "Full licensed question set with final answer key and reviewed accepted numerical ranges is required before official simulation.",
          "Accessibility/accommodation instructions need their own profile.",
        ],
      },
    ),
  ),
];
export function officialLaunchReadiness(
  p: Pattern,
  bank: { reviewed: boolean; count: number; version: string } | null,
) {
  const missing = [...p.unresolved];
  if (p.status !== "source-checked")
    missing.push("Governing rules not fully source-checked");
  if (p.classification !== "official-pattern-verified")
    missing.push("Reference is not approved as an official simulation pattern");
  if (!p.questionBankVersion || p.questionBankVersion !== bank?.version)
    missing.push("Approved immutable question-bank version does not match");
  if (
    !p.effectiveDate ||
    p.navigation === "unresolved" ||
    !p.penalty ||
    p.sections.some((s) => s.questions === null) ||
    p.sections.some((s) => s.marks === null)
  )
    missing.push(
      "Effective pattern date, objective coverage and navigation/marking must be resolved",
    );
  if (!bank?.reviewed) missing.push("Question bank and answer key need review");
  const count = p.sections.reduce((a, s) => a + (s.questions ?? 0), 0);
  if (!bank || bank.count !== count)
    missing.push("Full paper coverage missing");
  return { ready: missing.length === 0, missing };
}
