import { expansionQuestions } from "./expansion-questions.ts";
import { sourceFor } from "./content.ts";
export type ObjectiveType = "mcq" | "msq" | "nat" | "tita";
export type StudyQuestion = {
  id: string;
  version: string;
  topicId: string;
  type: ObjectiveType;
  stem: string;
  options?: string[];
  answer: string | number[] | { min: number; max: number };
  explanation: string;
  context?: string;
  groupId?: string;
  sourceId: string;
  origin: "original-ai-authored";
  keyStatus: "calculation-checked" | "source-compared";
  humanReviewed: false;
  pyq: false;
  marks: number;
};
type Input = Omit<
  StudyQuestion,
  "version" | "origin" | "keyStatus" | "humanReviewed" | "pyq" | "marks"
> & { marks?: number };
const items: Input[] = [
  {
    id: "pct-1",
    topicId: "percentages",
    sourceId: "percent",
    type: "mcq",
    stem: "What is 35% of 240?",
    options: ["72", "84", "96", "108"],
    answer: "1",
    explanation: "0.35 × 240 = 84.",
  },
  {
    id: "pct-2",
    topicId: "percentages",
    sourceId: "percent",
    type: "nat",
    stem: "54 is 30% of a number. Enter that number.",
    answer: { min: 180, max: 180 },
    explanation: "Whole = 54/0.30 = 180.",
  },
  {
    id: "pct-3",
    topicId: "percentages",
    sourceId: "percent",
    type: "msq",
    stem: "Select every quantity equal to 18% of 250.",
    options: ["45", "0.18 × 250", "18/100 × 250", "18 × 250"],
    answer: [0, 1, 2],
    explanation:
      "18% means 18/100. All first three expressions evaluate to 45.",
  },
  {
    id: "pct-4",
    topicId: "percentages",
    sourceId: "percent",
    type: "tita",
    stem: "A is 25% greater than B. By what percentage is B smaller than A? Enter the percentage as a number.",
    answer: { min: 20, max: 20 },
    explanation:
      "Take B=100 and A=125. The reduction relative to A is 25/125 ×100 = 20%.",
  },
  {
    id: "chg-1",
    topicId: "percentage-change",
    sourceId: "change",
    type: "nat",
    stem: "An amount of ₹500 rises by 12% and then falls by 10%. Enter the final amount in rupees.",
    answer: { min: 504, max: 504 },
    explanation: "500 ×1.12×0.90 = 504.",
  },
  {
    id: "chg-2",
    topicId: "percentage-change",
    sourceId: "change",
    type: "mcq",
    stem: "A value falls from 80 to 68. What is the percentage decrease?",
    options: ["12%", "15%", "17.65%", "20%"],
    answer: "1",
    explanation: "(80−68)/80 ×100=15%.",
  },
  {
    id: "chg-3",
    topicId: "percentage-change",
    sourceId: "change",
    type: "msq",
    stem: "Which statements are true?",
    options: [
      "A 20% increase followed by a 20% decrease leaves 96% of the start.",
      "The two changes exactly cancel.",
      "A 25% increase is reversed by a 20% decrease.",
      "A 10% decrease is reversed by a 10% increase.",
    ],
    answer: [0, 2],
    explanation:
      "1.2×0.8=0.96; 1.25×0.8=1. The other claimed cancellations do not hold.",
  },
  {
    id: "chg-4",
    topicId: "percentage-change",
    sourceId: "change",
    type: "tita",
    stem: "A price after a 25% discount is ₹630. Enter its original price in rupees.",
    answer: { min: 840, max: 840 },
    explanation: "0.75×original=630, so original=840.",
  },
  {
    id: "ratio-1",
    topicId: "ratios",
    sourceId: "ratio",
    type: "mcq",
    stem: "Split 960 in the ratio 3:5. What is the smaller share?",
    options: ["120", "320", "360", "600"],
    answer: "2",
    explanation: "Eight parts total, each 120. Smaller share=3×120=360.",
  },
  {
    id: "ratio-2",
    topicId: "ratios",
    sourceId: "ratio",
    type: "nat",
    stem: "A vehicle covers 168 km in 2.8 hours. Enter its average speed in km/h.",
    answer: { min: 60, max: 60 },
    explanation: "168/2.8=60 km/h.",
  },
  {
    id: "ratio-3",
    topicId: "ratios",
    sourceId: "ratio",
    type: "msq",
    stem: "Select every ratio equivalent to 4:7.",
    options: ["8:14", "12:21", "16:21", "20:35"],
    answer: [0, 1, 3],
    explanation: "Multiply both terms by the same factor: 2, 3 or 5.",
  },
  {
    id: "ratio-4",
    topicId: "ratios",
    sourceId: "ratio",
    type: "nat",
    stem: "A:B=2:3 and B:C=6:5. If A+B+C=150, enter C.",
    answer: { min: 50, max: 50 },
    explanation: "Use A:B:C=4:6:5. Fifteen parts total; C=5×10=50.",
  },
  {
    id: "prob-1",
    topicId: "probability",
    sourceId: "probability",
    type: "mcq",
    stem: "A fair die is rolled once. What is the probability of a result greater than 4?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    answer: "1",
    explanation:
      "Two favourable outcomes, 5 and 6, among six equally likely outcomes: 2/6=1/3.",
  },
  {
    id: "prob-2",
    topicId: "probability",
    sourceId: "probability",
    type: "nat",
    stem: "A fair coin is tossed twice. Enter the probability of exactly one head as a decimal.",
    answer: { min: 0.5, max: 0.5 },
    explanation: "HT and TH are two of four equally likely outcomes.",
  },
  {
    id: "prob-3",
    topicId: "probability",
    sourceId: "probability",
    type: "msq",
    stem: "A fair die is rolled. Select every event with probability 1/2.",
    options: [
      "Even result",
      "Result less than 4",
      "Result greater than 4",
      "Odd result",
    ],
    answer: [0, 1, 3],
    explanation:
      "Each selected event contains three of six outcomes. Greater than 4 has two.",
  },
  {
    id: "prob-4",
    topicId: "probability",
    sourceId: "probability",
    type: "nat",
    stem: "A fair die result is known to be even. Enter the probability that it exceeds 3, rounded to three decimals.",
    answer: { min: 0.6665, max: 0.6675 },
    explanation:
      "Restricted space {2,4,6}; favourable {4,6}. 2/3 rounds to 0.667. The accepted interval is Anvaya's original practice tolerance, not an official key.",
  },
  {
    id: "ohm-1",
    topicId: "ohms-law",
    sourceId: "ohm",
    type: "mcq",
    stem: "A 24 Ω ideal resistor has 12 V across it. What is its current?",
    options: ["0.25 A", "0.5 A", "2 A", "288 A"],
    answer: "1",
    explanation: "I=12/24=0.5 A.",
  },
  {
    id: "ohm-2",
    topicId: "ohms-law",
    sourceId: "ohm",
    type: "nat",
    stem: "A 10 Ω resistor carries 0.3 A. Enter its power in watts.",
    answer: { min: 0.9, max: 0.9 },
    explanation: "P=I²R=0.09×10=0.9 W.",
  },
  {
    id: "ohm-3",
    topicId: "ohms-law",
    sourceId: "ohm",
    type: "msq",
    stem: "For an ideal resistor with consistent SI units, select every valid expression for its dissipated power.",
    options: ["VI", "I²R", "V²/R", "V/R"],
    answer: [0, 1, 2],
    explanation: "VI, I²R and V²/R represent power. V/R represents current.",
  },
  {
    id: "ohm-4",
    topicId: "ohms-law",
    sourceId: "ohm",
    type: "nat",
    stem: "A 2 kΩ resistor carries 3 mA. Enter the voltage across it in volts.",
    answer: { min: 6, max: 6 },
    explanation: "R=2000 Ω, I=0.003 A, V=IR=6 V.",
  },
  {
    id: "network-1",
    topicId: "series-parallel",
    sourceId: "resistors",
    type: "nat",
    stem: "A 3 Ω and 6 Ω resistor are connected in parallel. Enter equivalent resistance in ohms.",
    answer: { min: 2, max: 2 },
    explanation: "Req=3×6/(3+6)=2 Ω.",
  },
  {
    id: "network-2",
    topicId: "series-parallel",
    sourceId: "resistors",
    type: "mcq",
    stem: "Two positive, finite resistors are connected in parallel. Their equivalent resistance is:",
    options: [
      "Greater than either resistor",
      "Less than either resistor",
      "Always their arithmetic mean",
      "Always zero",
    ],
    answer: "1",
    explanation:
      "The total conductance exceeds either positive branch conductance, so equivalent resistance is smaller.",
  },
  {
    id: "network-3",
    topicId: "series-parallel",
    sourceId: "resistors",
    type: "nat",
    stem: "A 5 Ω resistor is in series with two parallel 8 Ω resistors. Enter the total resistance in ohms.",
    answer: { min: 9, max: 9 },
    explanation: "The parallel pair equals 4 Ω. Add the series 5 Ω to get 9 Ω.",
  },
  {
    id: "network-4",
    topicId: "series-parallel",
    sourceId: "resistors",
    type: "msq",
    stem: "Select every true statement for ideal resistors.",
    options: [
      "Series resistors share current.",
      "Parallel resistors share voltage.",
      "Parallel resistances always add directly.",
      "Two equal R resistors in parallel give R/2.",
    ],
    answer: [0, 1, 3],
    explanation:
      "Shared current defines a series path; parallel branches have common endpoints. Equal parallel conductances give Req=R/2.",
  },
  {
    id: "kcl-1",
    topicId: "kirchhoff",
    sourceId: "kcl",
    type: "nat",
    stem: "A node has 2 A and 3 A entering and a single unknown current leaving. Enter that outgoing current in amperes.",
    answer: { min: 5, max: 5 },
    explanation: "Current balance: Iout=2+3=5 A.",
  },
  {
    id: "kcl-2",
    topicId: "kirchhoff",
    sourceId: "kcl",
    type: "nat",
    stem: "Node V connects to 20 V through 4 Ω and ground through 6 Ω. Enter V in volts.",
    answer: { min: 12, max: 12 },
    explanation: "(V−20)/4+V/6=0. Multiply by 12: 3V−60+2V=0, so V=12 V.",
  },
  {
    id: "kcl-3",
    topicId: "kirchhoff",
    sourceId: "kcl",
    type: "mcq",
    stem: "A consistent circuit calculation gives I=−2 A for an assumed arrow. What does the sign mean?",
    options: [
      "The actual current is 2 A opposite the arrow.",
      "Current has no direction.",
      "The circuit violates charge conservation.",
      "The current magnitude is imaginary.",
    ],
    answer: "0",
    explanation:
      "A negative solution reverses the assumed reference direction; its magnitude is 2 A.",
  },
  {
    id: "kcl-4",
    topicId: "kirchhoff",
    sourceId: "kcl",
    type: "msq",
    stem: "A node at V is connected through R1 to a known potential Vs and through R2 to ground. Select every equivalent current-balance equation.",
    options: [
      "(V−Vs)/R1+V/R2=0",
      "(Vs−V)/R1=V/R2",
      "V/R1+V/R2=0 for any Vs",
      "(Vs−V)/R1−V/R2=0",
    ],
    answer: [0, 1, 3],
    explanation:
      "The selected equations differ only by rearrangement or reversal of the sign convention.",
  },
  {
    id: "read-1",
    topicId: "reading-analysis",
    sourceId: "reading",
    type: "mcq",
    groupId: "library-visits",
    context:
      "Original passage: A library's recorded visits rose after it extended evening hours. The report did not separate new users from repeat visits. A new bus route also began serving the library that month.",
    stem: "Which conclusion is directly supported?",
    options: [
      "Evening hours alone caused the increase.",
      "The number of distinct users doubled.",
      "Recorded visits increased.",
      "The bus route had no effect.",
    ],
    answer: "2",
    explanation:
      "The passage reports a rise in visits. It does not isolate a cause or count distinct users.",
  },
  {
    id: "read-2",
    topicId: "reading-analysis",
    sourceId: "reading",
    type: "mcq",
    groupId: "library-visits",
    context:
      "Original passage: A library's recorded visits rose after it extended evening hours. The report did not separate new users from repeat visits. A new bus route also began serving the library that month.",
    stem: "Which additional measurement would directly help establish whether more distinct people visited?",
    options: [
      "The paint colour of the building",
      "Deduplicated user counts before and after",
      "The librarian's preferred hours",
      "Only the total number of books",
    ],
    answer: "1",
    explanation:
      "A count of distinct users addresses the specific missing measurement.",
  },
];
const firstRelease: StudyQuestion[] = items.map((q) => ({
  ...q,
  marks: q.marks ?? 1,
  version: `${q.id}-v1`,
  origin: "original-ai-authored",
  keyStatus:
    q.sourceId === "reading" ? "source-compared" : "calculation-checked",
  humanReviewed: false,
  pyq: false,
}));
export const legacyBankVersion = "source-linked-foundations-20261015-v1";
export const practiceBankVersion = "source-linked-foundations-20261015-v2";
export const practiceQuestions: StudyQuestion[] = [
  ...firstRelease,
  ...expansionQuestions.map((q): StudyQuestion => ({
    ...q,
    marks: 1,
    version: `${q.id}-v1`,
    origin: "original-ai-authored",
    keyStatus: ["rights", "ecosystem"].includes(q.sourceId)
      ? "source-compared"
      : "calculation-checked",
    humanReviewed: false,
    pyq: false,
  })),
];
export function questionBankFor(version: string): StudyQuestion[] | undefined {
  if (version === legacyBankVersion) return firstRelease;
  if (version === practiceBankVersion) return practiceQuestions;
}
export function questionSource(q: StudyQuestion) {
  return sourceFor(q.sourceId);
}
