import { fifthBankVersion } from "./questions.ts";
import {
  createSectionPractice,
  createPractice,
  validAttempt,
  evaluate,
  type PracticeAttempt,
} from "./engine.ts";
import { sscTopicIds, sscFinancePart, type SSCSection } from "./ssc.ts";
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
  const special =
    input.stage === "tier2-statistics" || input.stage === "tier2-finance";
  let a: PracticeAttempt;
  if (input.stage === "tier2-finance") {
    const topics = sscTopicIds("finance"),
      seconds = plan[0].seconds;
    const parts = (["accounts", "economics"] as const).map((part) =>
      createPractice({
        bankVersion: fifthBankVersion,
        examId: "ssc",
        topicIds: topics.filter((t) => sscFinancePart(t) === part),
        count: part === "accounts" ? 40 : 60,
        seconds,
        correct: 2,
        penalty: 0.5,
        seen: input.seen,
        allowRepeats: input.allowRepeats,
        writerId: input.writerId,
        now: input.now,
      }),
    );
    a = {
      ...parts[0],
      sections: [{ id: "section-1", title: plan[0].title, seconds }],
      items: parts.flatMap((p) =>
        p.items.map((i) => ({ ...i, section: "section-1" })),
      ),
    };
  } else
    a = createSectionPractice({
      bankVersion: fifthBankVersion,
      examId: "ssc",
      sections: plan.map((r) => ({
        title: r.title,
        topicIds: sscTopicIds(r.id as SSCSection),
        count: r.count,
        seconds: r.seconds,
        correct: input.stage === "tier2-common" ? 3 : 2,
        penalty: input.stage === "tier2-common" ? 1 : 0.5,
      })),
      fixed: !special,
      seen: input.seen,
      allowRepeats: input.allowRepeats,
      writerId: input.writerId,
      now: input.now,
    });
  const frozen: PracticeAttempt = {
    ...a,
    ssc: { id: input.stage, profile: input.profile, version: "ssc-2026-v2" },
  };
  if (!validAttempt(frozen))
    throw Error("SSC paper configuration failed validation.");
  return frozen;
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
  const finance =
    a.ssc?.id === "tier2-finance"
      ? (["accounts", "economics"] as const).map((part) => ({
          part,
          maximum: part === "accounts" ? 80 : 120,
          score: report.rows
            .filter(
              (r) =>
                sscFinancePart(
                  a.items.find((i) => i.question.id === r.id)!.question.topicId,
                ) === part,
            )
            .reduce((n, r) => n + r.marks, 0),
        }))
      : undefined;
  return {
    finance,
    sections,
    merit: report.score - (computer?.score ?? 0),
    meritMaximum: report.maximum - (computer?.maximum ?? 0),
    computer,
  };
}
