import { patterns } from "./registry.ts";
export type SyllabusUnit = {
  id: string;
  title: string;
  aliases: string[];
  examId: string;
  cycle: string;
  stage: string;
  depth: string;
  topicIds: string[];
  sourceUrl: string;
  locator: string;
  version: string;
  status: "source-checked-outline" | "research-outline";
  complete: false;
};
const gateSections: Record<string, string[]> = {
  "gate-ee": [
    "Engineering Mathematics",
    "Electric Circuits",
    "Electromagnetic Fields",
    "Signals and Systems",
    "Electrical Machines",
    "Power Systems",
    "Control Systems",
    "Electrical and Electronic Measurements",
    "Analog and Digital Electronics",
    "Power Electronics",
  ],
  "gate-ec": [
    "Engineering Mathematics",
    "Networks, Signals and Systems",
    "Electronic Devices",
    "Analog Circuits",
    "Digital Circuits",
    "Control Systems",
    "Communications",
    "Electromagnetics",
  ],
  "gate-in": [
    "Engineering Mathematics",
    "Electricity and Magnetism",
    "Electrical Circuits and Machines",
    "Signals and Systems",
    "Control Systems",
    "Analog Electronics",
    "Digital Electronics",
    "Measurements",
    "Sensors and Industrial Instrumentation",
    "Communication and Optical Instrumentation",
  ],
};
const research: Record<string, Record<string, string[]>> = {
  upsc: {
    "prelims-gs1": [
      "Indian Polity and Constitution",
      "History and Culture",
      "Geography",
      "Economy and Social Development",
      "Environment and Biodiversity",
      "Science",
      "Current Affairs",
    ],
    "prelims-csat": [
      "Reading Comprehension",
      "Reasoning and Decision Making",
      "Numeracy and Data Interpretation",
    ],
    "mains-gs1": ["History, Culture, Society and Geography"],
    "mains-gs2": [
      "Constitution, Governance, Social Justice and International Relations",
    ],
    "mains-gs3": ["Economy, Agriculture, Technology, Security and Environment"],
    "mains-gs4": ["Ethics, Integrity and Case Studies"],
  },
  bpsc: {
    prelims: [
      "Bihar and Indian History",
      "Bihar and Indian Geography",
      "Indian Polity and Economy",
      "Science and Current Affairs",
      "General Mental Ability",
    ],
    "mains-gs1": ["History, Culture and Statistical Analysis"],
    "mains-gs2": ["Polity, Economy, Geography and Science"],
  },
  ssc: {
    tier1: [
      "Reasoning",
      "General Awareness",
      "Quantitative Aptitude",
      "English Comprehension",
    ],
    "tier2-paper1": [
      "Mathematical Abilities",
      "Reasoning",
      "English Language",
      "General Awareness",
      "Computer Knowledge",
      "Data Entry Skills",
    ],
    "tier2-statistics": ["Statistics"],
    "tier2-finance": ["Finance and Economics"],
  },
  sbi: {
    prelims: ["English", "Quantitative Aptitude", "Reasoning"],
    mains: [
      "Reasoning and Computer Aptitude",
      "Data Interpretation",
      "Banking, Economy and General Awareness",
      "English and Written Communication",
    ],
  },
  ibps: {
    prelims: ["English", "Quantitative Aptitude", "Reasoning"],
    mains: [
      "Reasoning",
      "Banking, Economy and Digital Awareness",
      "English and Written Communication",
      "Data Interpretation",
    ],
  },
  cat: {
    test: [
      "Verbal Ability and Reading Comprehension",
      "Data Interpretation and Logical Reasoning",
      "Quantitative Aptitude",
    ],
  },
  ese: {
    prelims1: ["General Studies and Engineering Aptitude"],
    prelims2: [
      "Mathematics, Circuits and Fields",
      "Machines and Power Systems",
      "Electronics, Measurements and Control",
    ],
    mains1: ["Electrical Engineering Paper I"],
    mains2: ["Electrical Engineering Paper II"],
  },
};
function topics(title: string) {
  const value = title.toLowerCase();
  const ids: string[] = [];
  if (/quant|numeracy|mathematical abilities|general aptitude/.test(value))
    ids.push("percentages", "ratios", "probability");
  if (/mathematics|statistics/.test(value)) ids.push("probability");
  if (/circuits|networks/.test(value))
    ids.push("ohms-law", "series-parallel", "kirchhoff");
  if (/english|reading|verbal|comprehension/.test(value))
    ids.push("reading-analysis");
  if (/polity|constitution/.test(value)) ids.push("constitutional-rights");
  if (/interpretation|statistical analysis/.test(value))
    ids.push("ratios", "percentages");
  return [...new Set(ids)];
}
export const syllabusUnits: SyllabusUnit[] = [
  ...Object.entries(gateSections).flatMap(([examId, sections]) =>
    [...sections, "General Aptitude"].map((title, i) => ({
      id: `${examId}-2027-${i + 1}`,
      examId,
      cycle: "2027",
      stage: "paper",
      title,
      aliases: [
        title.replace("Electric", "Electrical"),
        examId.slice(5).toUpperCase(),
      ],
      depth:
        examId === "gate-in"
          ? "Instrumentation-specific scope; includes the revised 2027 material. Consult the full PDF."
          : `${examId.slice(5).toUpperCase()}-specific scope; consult the revised 2027 PDF for every subtopic.`,
      topicIds: topics(title),
      sourceUrl: `https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/${title === "General Aptitude" ? "GA" : examId.slice(5).toUpperCase()}_GATE2027_Syllabus.pdf`,
      locator:
        title === "General Aptitude" ? "GA syllabus" : `Section ${i + 1}`,
      version: `${examId}-syllabus-2027-outline-v1`,
      status: "source-checked-outline" as const,
      complete: false as const,
    })),
  ),
  ...Object.entries(research).flatMap(([examId, stages]) =>
    Object.entries(stages).flatMap(([stage, titles]) =>
      titles.map((title, i) => {
        const p = patterns.find(
          (p) =>
            p.examId === examId &&
            (p.stage === stage || (examId === "cat" && p.stage === "test")),
        )!;
        return {
          id: `${examId}-${stage}-${i}`,
          examId,
          cycle: p.cycle,
          stage: p.stage,
          title,
          aliases: [title, examId.toUpperCase()],
          depth:
            "Planning outline from the supplied research reference. Complete subtopic transcription and primary-source review remain pending.",
          topicIds: topics(title),
          sourceUrl: p.sourceUrl,
          locator: p.sourceLocator,
          version: `${examId}-${p.cycle}-${stage}-outline-v1`,
          status: "research-outline" as const,
          complete: false as const,
        };
      }),
    ),
  ),
];
export function syllabusFor(examId: string) {
  return syllabusUnits.filter((u) => u.examId === examId);
}
