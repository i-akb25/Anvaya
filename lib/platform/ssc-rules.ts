import expansion from "./ssc-expansion.json" with { type: "json" };
import { sscFinancePart } from "./ssc.ts";
import course from "./ssc-course.json" with { type: "json" };
import type { PracticeAttempt } from "./engine.ts";
export type SSCProfile = "standard" | "compensatory";
export type SSCStage =
  "tier1" | "tier2-common" | "tier2-statistics" | "tier2-finance";
export type SSCTemplate = {
  id: SSCStage;
  profile: SSCProfile;
  version: "ssc-2026-v1" | "ssc-2026-v2";
};
export const sscRuleRows = {
  "tier2-statistics": [
    {
      id: "statistics",
      title: "Statistics · applicable posts",
      count: 100,
      minutes: 120,
      extra: 160,
    },
  ],
  "tier2-finance": [
    {
      id: "finance",
      title: "Finance & Economics · applicable posts",
      count: 100,
      minutes: 120,
      extra: 160,
    },
  ],
  tier1: [
    { id: "reason", title: "Reasoning", count: 25, minutes: 15, extra: 20 },
    { id: "ga", title: "General awareness", count: 25, minutes: 15, extra: 20 },
    {
      id: "quant",
      title: "Quantitative aptitude",
      count: 25,
      minutes: 15,
      extra: 20,
    },
    {
      id: "english",
      title: "English comprehension",
      count: 25,
      minutes: 15,
      extra: 20,
    },
  ],
  "tier2-common": [
    {
      id: "quant",
      title: "Mathematical abilities",
      count: 30,
      minutes: 30,
      extra: 40,
    },
    { id: "reason", title: "Reasoning", count: 30, minutes: 30, extra: 40 },
    {
      id: "english",
      title: "English language",
      count: 45,
      minutes: 40,
      extra: 55,
    },
    { id: "ga", title: "General awareness", count: 25, minutes: 20, extra: 25 },
    {
      id: "computer",
      title: "Computer knowledge · qualifying",
      count: 20,
      minutes: 15,
      extra: 20,
    },
  ],
} as const;
export function sscPlan(stage: SSCStage, profile: SSCProfile) {
  if (
    !Object.hasOwn(sscRuleRows, stage) ||
    !["standard", "compensatory"].includes(profile)
  )
    throw Error("Unknown SSC paper or timing profile.");
  return sscRuleRows[stage].map((r) => ({
    id: r.id,
    title: r.title,
    count: r.count,
    seconds: 60 * (profile === "standard" ? r.minutes : r.extra),
  }));
}
export function validSSCTemplate(a: PracticeAttempt) {
  if (a.ssc === undefined) return true;
  const t = a.ssc;
  if (
    !t ||
    !["ssc-2026-v1", "ssc-2026-v2"].includes(t.version) ||
    !Object.hasOwn(sscRuleRows, t.id) ||
    !["standard", "compensatory"].includes(t.profile)
  )
    return false;
  if (
    a.examId !== "ssc" ||
    (t.version === "ssc-2026-v1"
      ? a.bankVersion !== "source-linked-foundations-20261017-v4" ||
        !["tier1", "tier2-common"].includes(t.id)
      : a.bankVersion !== "source-linked-foundations-20261018-v5") ||
    a.navigation !==
      (t.id.startsWith("tier2-") && t.id !== "tier2-common"
        ? "paper"
        : "fixed-sections")
  )
    return false;
  const plan = sscPlan(t.id, t.profile);
  if (
    a.sections.length !== plan.length ||
    a.items.length !== plan.reduce((n, r) => n + r.count, 0)
  )
    return false;
  if (
    t.id === "tier2-finance" &&
    a.items.filter((i) => sscFinancePart(i.question.topicId) === "accounts")
      .length !== 40
  )
    return false;
  return plan.every((r, i) => {
    const section = a.sections[i];
    const items = a.items.filter((q) => q.section === section.id);
    return (
      section.id === `section-${i + 1}` &&
      section.title === r.title &&
      section.seconds === r.seconds &&
      items.length === r.count &&
      items.every((item) => {
        const bank =
          t.version === "ssc-2026-v1"
            ? course.questions
            : [...course.questions, ...expansion.questions];
        const q = bank.find((q) => q.id === item.question.id);
        return (
          q?.section === r.id &&
          item.question.type === "mcq" &&
          item.marking.correct === (t.id === "tier2-common" ? 3 : 2) &&
          item.marking.mcqPenalty === (t.id === "tier2-common" ? 1 : 0.5) &&
          item.marking.blankPenalty === 0
        );
      })
    );
  });
}

export function sscTitle(stage: SSCStage) {
  return {
    tier1: "Tier-I",
    "tier2-common": "Tier-II Paper-I objective",
    "tier2-statistics": "Tier-II Statistics",
    "tier2-finance": "Tier-II Finance & Economics",
  }[stage];
}
