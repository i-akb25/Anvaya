import {
  createSectionPractice,
  evaluate,
  type PracticeAttempt,
} from "./engine.ts";
import { sscTopicIds, type SSCSection } from "./ssc.ts";
import { sscPlan, type SSCStage, type SSCProfile } from "./ssc-rules.ts";
export function createSSCAttempt(input: {
  stage: SSCStage;
  profile: SSCProfile;
  seen: string[];
  allowRepeats: boolean;
  writerId: string;
  now: number;
}): PracticeAttempt {
  const plan = sscPlan(input.stage, input.profile);
  const a = createSectionPractice({
    examId: "ssc",
    sections: plan.map((r) => ({
      title: r.title,
      topicIds: sscTopicIds(r.id as SSCSection),
      count: r.count,
      seconds: r.seconds,
      correct: input.stage === "tier1" ? 2 : 3,
      penalty: input.stage === "tier1" ? 0.5 : 1,
    })),
    fixed: true,
    seen: input.seen,
    allowRepeats: input.allowRepeats,
    writerId: input.writerId,
    now: input.now,
  });
  return {
    ...a,
    ssc: { id: input.stage, profile: input.profile, version: "ssc-2026-v1" },
  };
}
export function sscScore(a: PracticeAttempt) {
  const report = evaluate(a);
  const sections = a.sections.map((section) => ({
    title: section.title ?? section.id,
    id: section.id,
    score: report.rows
      .filter(
        (row) =>
          a.items.find((i) => i.question.id === row.id)?.section === section.id,
      )
      .reduce((sum, r) => sum + r.marks, 0),
    maximum: a.items
      .filter((i) => i.section === section.id)
      .reduce((sum, i) => sum + i.marking.correct, 0),
  }));
  const computer = a.ssc?.id === "tier2-common" ? sections.at(-1) : undefined;
  return {
    sections,
    merit: report.score - (computer?.score ?? 0),
    meritMaximum: report.maximum - (computer?.maximum ?? 0),
    computer,
  };
}
