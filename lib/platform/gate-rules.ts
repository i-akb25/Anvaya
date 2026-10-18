import type { PracticeAttempt } from "./engine.ts";
export const gatePapers = ["gate-ee", "gate-ec", "gate-in"] as const;
export type GatePaper = (typeof gatePapers)[number];
export type GateProfile = "standard" | "compensatory";
export type GateTemplate = {
  paper: GatePaper;
  profile: GateProfile;
  version: "gate-original-2027-v1";
};
export const gateBankVersion = "source-linked-foundations-20261018-v7";
export const gateRuleSource =
  "https://gate2027.iitm.ac.in/question_paper_pattern";
export const gateAptitudeTopics = [
  "percentages",
  "percentage-change",
  "ratios",
  "reading-analysis",
  "simple-interest",
  "profit-discount",
  "work-rates",
  "compound-interest",
  "relative-speed",
];
export const gateMathTopics = [
  "probability",
  "weighted-averages",
  "combinations",
  "matrix-linear-systems",
  "calculus-rates-area",
  "conditional-counting",
];
const core = [
  "ohms-law",
  "series-parallel",
  "kirchhoff",
  "capacitor-energy",
  "rc-transients",
  "electromagnetic-induction",
  "ac-real-power",
  "digital-gate-logic",
  "first-order-control",
  "discrete-convolution",
  "ideal-opamp-feedback",
  "diode-piecewise-model",
  "measurement-uncertainty",
];
const technical: Record<GatePaper, string[]> = {
  "gate-ee": [...core, "strain-calibration", "ideal-transformer-ratios"],
  "gate-ec": core,
  "gate-in": [...core, "strain-calibration"],
};
export type GateDomain = "aptitude" | "math" | "technical";
export function gateDomain(paper: GatePaper, topic: string): GateDomain | null {
  if (gateAptitudeTopics.includes(topic)) return "aptitude";
  if (gateMathTopics.includes(topic)) return "math";
  return technical[paper]?.includes(topic) ? "technical" : null;
}
export const gateQuotas = [
  {
    domain: "aptitude" as const,
    ones: 5,
    twos: 5,
    title: "General Aptitude",
    maximum: 15,
  },
  {
    domain: "math" as const,
    ones: 5,
    twos: 4,
    title: "Engineering Mathematics",
    maximum: 13,
  },
  {
    domain: "technical" as const,
    ones: 20,
    twos: 26,
    title: "Technical foundations",
    maximum: 72,
  },
];
export function gateSeconds(profile: GateProfile) {
  return profile === "standard" ? 10800 : 14400;
}
export function validGateTemplate(a: PracticeAttempt) {
  if (a.gate === undefined) return true;
  const t = a.gate;
  if (
    !t ||
    !gatePapers.includes(t.paper) ||
    t.version !== "gate-original-2027-v1" ||
    !["standard", "compensatory"].includes(t.profile) ||
    a.examId !== t.paper ||
    a.ssc !== undefined ||
    a.bankVersion !== gateBankVersion ||
    a.navigation !== "paper" ||
    a.items.length !== 65 ||
    a.sections.length !== 1
  )
    return false;
  const section = a.sections[0];
  if (
    section.id !== "gate-paper" ||
    section.title !== `${t.paper.toUpperCase()} · original practice` ||
    section.seconds !== gateSeconds(t.profile)
  )
    return false;
  if (
    a.items.some(
      (i) =>
        i.section !== section.id ||
        !["mcq", "msq", "nat"].includes(i.question.type) ||
        !gateDomain(t.paper, i.question.topicId) ||
        i.marking.blankPenalty !== 0 ||
        ![1, 2].includes(i.marking.correct) ||
        i.marking.mcqPenalty !== i.marking.correct / 3,
    )
  )
    return false;
  return gateQuotas.every((r) => {
    const items = a.items.filter(
      (i) => gateDomain(t.paper, i.question.topicId) === r.domain,
    );
    return (
      items.length === r.ones + r.twos &&
      items.filter((i) => i.marking.correct === 1).length === r.ones &&
      items.filter((i) => i.marking.correct === 2).length === r.twos &&
      (r.domain !== "aptitude" || items.every((i) => i.question.type === "mcq"))
    );
  });
}
