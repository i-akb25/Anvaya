import { questionBankFor } from "./questions.ts";
import {
  createPractice,
  evaluate,
  validAttempt,
  type PracticeAttempt,
} from "./engine.ts";
import {
  gateBankVersion,
  gateDomain,
  gatePapers,
  gateQuotas,
  gateSeconds,
  type GatePaper,
  type GateProfile,
} from "./gate-rules.ts";
export function gateAvailability(paper: GatePaper, seen: string[] = []) {
  return gateQuotas.map((r) => ({
    ...r,
    available: questionBankFor(gateBankVersion)!.filter(
      (q) =>
        gateDomain(paper, q.topicId) === r.domain &&
        (r.domain !== "aptitude" || q.type === "mcq") &&
        ["mcq", "msq", "nat"].includes(q.type) &&
        !seen.includes(q.id),
    ).length,
    required: r.ones + r.twos,
  }));
}
export function createGateAttempt(input: {
  paper: GatePaper;
  profile: GateProfile;
  seen: string[];
  allowRepeats: boolean;
  writerId: string;
  now: number;
}): PracticeAttempt {
  if (
    !gatePapers.includes(input.paper) ||
    !["standard", "compensatory"].includes(input.profile)
  )
    throw Error("Unknown GATE paper or timing profile.");
  const used = new Set<string>(),
    items: PracticeAttempt["items"] = [];
  for (const row of gateQuotas) {
    const pool = questionBankFor(gateBankVersion)!.filter(
      (q) =>
        gateDomain(input.paper, q.topicId) === row.domain &&
        (row.domain !== "aptitude" || q.type === "mcq") &&
        ["mcq", "msq", "nat"].includes(q.type),
    );
    for (const [marks, count] of [
      [1, row.ones],
      [2, row.twos],
    ]) {
      const a = createPractice({
        examId: input.paper,
        bankVersion: gateBankVersion,
        topicIds: [...new Set(pool.map((q) => q.topicId))],
        questionIds: pool.map((q) => q.id),
        count,
        seconds: gateSeconds(input.profile),
        correct: marks,
        penalty: marks / 3,
        seen: [...(input.allowRepeats ? [] : input.seen), ...used],
        allowRepeats: false,
        writerId: input.writerId,
        now: input.now,
      });
      a.items.forEach((i) => {
        used.add(i.question.id);
        items.push({ ...i, section: "gate-paper" });
      });
    }
  }
  const a: PracticeAttempt = {
    id: crypto.randomUUID(),
    examId: input.paper,
    version: 1,
    bankVersion: gateBankVersion,
    classification: "custom-illustrative",
    gate: {
      paper: input.paper,
      profile: input.profile,
      version: "gate-original-2027-v1",
    },
    sections: [
      {
        id: "gate-paper",
        title: `${input.paper.toUpperCase()} · original practice`,
        seconds: gateSeconds(input.profile),
      },
    ],
    navigation: "paper",
    items,
    answers: {},
    marked: [],
    startedAt: input.now,
    submittedAt: null,
    writerId: input.writerId,
  };
  if (!validAttempt(a))
    throw Error("GATE original paper failed frozen-contract validation.");
  return a;
}
export function gateScore(a: PracticeAttempt) {
  if (!a.gate) throw Error("Not a GATE template attempt.");
  const report = evaluate(a);
  return gateQuotas.map((r) => ({
    ...r,
    score: report.rows
      .filter((row) => gateDomain(a.gate!.paper, row.topicId) === r.domain)
      .reduce((n, r) => n + r.marks, 0),
  }));
}
