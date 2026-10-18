import test from "node:test";
import assert from "node:assert/strict";
import { exams } from "../lib/catalog.ts";
import {
  allExamUnits,
  allExamQuestions,
} from "../lib/platform/all-exam-content.ts";
import {
  practiceQuestions,
  questionBankFor,
  fifthBankVersion,
  practiceBankVersion,
} from "../lib/platform/questions.ts";
import {
  examLessons,
  examQuestions,
  defaultExamStudy,
  withExamStudy,
  examStudy,
  validExamStudyRecord,
  examMistakes,
  examDailyPlan,
  examSubjectProgress,
  createExamRetry,
} from "../lib/platform/exam-study.ts";
import {
  emptyVault,
  validVault,
  validPayload,
  saveVault,
  readVault,
} from "../lib/platform/vault.ts";
import {
  createPractice,
  submit,
  evaluate,
  validAttempt,
  correct,
} from "../lib/platform/engine.ts";
import { createSSCAttempt } from "../lib/platform/ssc-exam.ts";
import {
  practiceHandoffKey,
  claimPracticeLaunch,
} from "../lib/platform/practice-handoff.ts";
import { studyIndex } from "../lib/platform/discovery.ts";
const entry = (patch = {}) => ({
  note: "Use the earlier total as the growth base.",
  reason: "concept",
  doubt: false,
  resolved: false,
  updatedAt: "2026-10-18T14:00:00Z",
  ...patch,
});
const q = (id) => practiceQuestions.find((q) => q.id === id);
function attempt(examId, topicId = "percentages", now = 1000) {
  return submit(
    createPractice({
      examId,
      topicIds: [topicId],
      count: 2,
      seconds: 120,
      correct: 1,
      penalty: 0.25,
      seen: [],
      allowRepeats: true,
      writerId: "origin",
      now,
    }),
    now + 50,
  );
}
test("each non-SSC path gains relevant original worked content with explicit author-only provenance", () => {
  for (const e of exams.filter((e) => e.id !== "ssc")) {
    const units = allExamUnits.filter((u) => u.exams.includes(e.id));
    assert.ok(units.length, e.id);
    for (const u of units) {
      assert.ok(u.example.steps.length >= 3);
      assert.ok(u.recall.length >= 3);
      assert.match(u.review, /No independent human/);
      assert.equal(
        allExamQuestions.filter((q) => q.topicId === u.slug).length,
        6,
      );
    }
  }
  assert.equal(allExamUnits.length, 7);
  assert.equal(allExamQuestions.length, 42);
});
test("new numerical keys match separately recomputed data, circuit and measurement results", () => {
  const expected = {
    "nominal-real-output-1": 660 / 1.1,
    "nominal-real-output-2": (900 / 750) * 100,
    "nominal-real-output-4": ((420 - 400) / 400) * 100,
    "nominal-real-output-6": 450 / 0.9,
    "table-di-base-1": 150 + 100 + 150,
    "table-di-base-2": (150 / (150 + 100 + 150)) * 100,
    "table-di-base-3": (80 / 120) * 100,
    "table-di-base-4": 150 - 100,
    "table-di-base-5": ((150 - 120) / 120) * 100,
    "conditional-arguments-5": 1,
    "ac-real-power-1": 240 * 2 * 0.6,
    "ac-real-power-2": (100 * Math.SQRT2) / Math.SQRT2,
    "ac-real-power-3": 300 / (100 * 5),
    "ac-real-power-6": 50 * 2,
    "digital-gate-logic-3": 2 ** 3,
    "digital-gate-logic-6": 3,
    "strain-calibration-1": 200 * 2 * 500e-6,
    "strain-calibration-2": (0.02 / 100) * 1e6,
    "strain-calibration-3": 0.001 / 500e-6,
    "strain-calibration-5": 120 * (1 + 2 * -1000e-6),
    "ideal-transformer-ratios-1": (200 * 250) / 1000,
    "ideal-transformer-ratios-2": (100 * 4) / 200,
    "ideal-transformer-ratios-3": 3 ** 2 * 4,
    "ideal-transformer-ratios-5": 0.2 * 5,
  };
  for (const [id, n] of Object.entries(expected)) {
    const item = q(id);
    assert.ok(correct(item, String(n)), id);
    assert.ok(item.answer.max - item.answer.min <= 0.021, id);
  }
});
test("Boolean question sets agree with exhaustive independently enumerated assignments", () => {
  const pairs = [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ];
  assert.equal(
    Number(q("conditional-arguments-5").answer.min),
    pairs.filter(([p, r]) => p && !r).length,
  );
  // Conditional MSQ options list TT, TF, FT, FF, while AND options list FF, FT, TF, TT.
  assert.deepEqual(
    q("conditional-arguments-3").answer,
    [
      [true, true],
      [true, false],
      [false, true],
      [false, false],
    ].flatMap(([p, r], i) => (!p || r ? [i] : [])),
  );
  assert.deepEqual(
    q("digital-gate-logic-5").answer,
    pairs.flatMap(([a, b], i) => (!(a && b) ? [i] : [])),
  );
  assert.equal(
    pairs.filter(([a, b]) => a || b).length,
    q("digital-gate-logic-6").answer.min,
  );
  for (const [a, b] of pairs) assert.equal((a && b) || (!a && b), b);
});
test("v5 stays immutable and full SSC templates remain pinned to that bank after v6 publication", () => {
  assert.equal(questionBankFor(fifthBankVersion).length, 643);
  assert.equal(questionBankFor(practiceBankVersion).length, 745);
  assert.ok(
    !questionBankFor(fifthBankVersion).some((q) =>
      allExamQuestions.some((n) => n.id === q.id),
    ),
  );
  const a = createSSCAttempt({
    stage: "tier1",
    profile: "standard",
    seen: [],
    allowRepeats: false,
    writerId: "t",
    now: 1000,
  });
  assert.equal(a.bankVersion, fifthBankVersion);
  assert.equal(validAttempt(a), true);
  assert.equal(validAttempt({ ...a, bankVersion: practiceBankVersion }), false);
  const old = attempt("cat");
  old.bankVersion = fifthBankVersion;
  assert.equal(validAttempt(old), true);
});
test("shared lessons, question notes and results remain isolated in each exam context", () => {
  let v = emptyVault(),
    a = attempt("cat");
  v.attempts = [a];
  const id = a.items[0].question.id;
  v = withExamStudy(v, "cat", {
    ...defaultExamStudy(),
    journal: { [id]: entry() },
  });
  assert.equal(examMistakes(v, "cat").length, 2);
  assert.equal(examMistakes(v, "sbi").length, 0);
  assert.equal(Object.keys(examStudy(v, "sbi").journal).length, 0);
  v.completed = ["cat:percentages"];
  assert.equal(
    examSubjectProgress(v, "sbi").reduce((n, p) => n + p.completed, 0),
    0,
  );
  assert.equal(validVault(v), true);
});
test("all nine paths can retry exact eligible questions with clear custom marking and owned launch", () => {
  for (const e of exams.filter((e) => e.id !== "ssc")) {
    const v = emptyVault();
    v.attempts = [attempt(e.id)];
    const ids = v.attempts[0].items.map((i) => i.question.id),
      a = createExamRetry(v, e.id, ids, "launch", 2000);
    assert.equal(validAttempt(a), true, e.id);
    assert.deepEqual(a.items.map((i) => i.question.id).sort(), ids.sort());
    assert.equal(a.ssc, undefined);
    assert.equal(a.sections[0].seconds, 120);
    assert.equal(a.items[0].marking.correct, 1);
    assert.equal(a.items[0].marking.mcqPenalty, 0.25);
    const active = { ...v, active: a },
      token = JSON.stringify({ id: a.id, writerId: a.writerId, examId: e.id });
    assert.equal(
      claimPracticeLaunch(active, token, "destination").active.writerId,
      "destination",
    );
    assert.equal(
      claimPracticeLaunch(
        active,
        JSON.stringify({ id: a.id, writerId: "other", examId: e.id }),
        "destination",
      ),
      active,
    );
    assert.equal(
      claimPracticeLaunch(
        active,
        JSON.stringify({ id: a.id, writerId: a.writerId, examId: "ssc" }),
        "destination",
      ),
      active,
    );
    assert.throws(
      () => createExamRetry(active, e.id, ids, "t", 3000),
      /active timed/,
    );
    v.examStudy = {
      [e.id]: {
        ...defaultExamStudy(),
        journal: { [ids[0]]: entry({ doubt: true }) },
      },
    };
    assert.throws(
      () => createExamRetry(v, e.id, [ids[0]], "t", 3000),
      /without a key doubt/,
    );
  }
});
test("exam-study validators reject cross-path question injection, invalid settings and prototype keys", () => {
  const id = allExamQuestions.find(
    (q) => q.topicId === "strain-calibration",
  ).id;
  assert.equal(
    validExamStudyRecord({
      cat: { ...defaultExamStudy(), journal: { [id]: entry() } },
    }),
    false,
  );
  for (const data of [
    { unknown: defaultExamStudy() },
    { ssc: defaultExamStudy() },
    { cat: { ...defaultExamStudy(), minutes: 181 } },
    { cat: { ...defaultExamStudy(), section: "invented" } },
    { cat: { ...defaultExamStudy(), journal: [] } },
    JSON.parse('{"__proto__":{}}'),
  ])
    assert.equal(validExamStudyRecord(data), false);
});
test("per-exam planning respects subject, budget and contextual completion without mutating records", () => {
  for (const e of exams.filter((e) => e.id !== "ssc")) {
    const v = emptyVault(),
      u = examLessons(e.id)[0];
    v.examStudy = {
      [e.id]: { ...defaultExamStudy(), minutes: 30, section: u.subject },
    };
    const before = JSON.stringify(v),
      p = examDailyPlan(v, e.id, "2026-10-18");
    assert.ok(p.tasks.length);
    assert.ok(p.tasks.reduce((n, t) => n + t.minutes, 0) <= 30);
    assert.ok(p.tasks.every((t) => t.href.includes(`exam=${e.id}`)));
    assert.equal(JSON.stringify(v), before);
  }
});
test("new notes survive backup, private search and stale-write protection", () => {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  };
  let v = emptyVault();
  v.attempts = [attempt("sbi")];
  const id = v.attempts[0].items[0].question.id;
  v = withExamStudy(v, "sbi", {
    ...defaultExamStudy(),
    journal: { [id]: entry({ note: "private-denominator-reminder" }) },
  });
  const saved = saveVault(v, 0);
  assert.deepEqual(readVault().examStudy, v.examStudy);
  assert.equal(
    validPayload(
      JSON.parse(
        JSON.stringify({
          schema: 1,
          learning: saved,
          workspace: { version: 1, tasks: [], papers: {} },
        }),
      ),
    ),
    true,
  );
  assert.ok(
    studyIndex(saved).some(
      (h) =>
        h.private &&
        h.kind === "My question note" &&
        h.body.includes("private-denominator-reminder"),
    ),
  );
  assert.ok(
    !studyIndex().some((h) => h.body.includes("private-denominator-reminder")),
  );
  assert.throws(() => saveVault(v, 0), /another tab/);
  assert.deepEqual(readVault().examStudy, v.examStudy);
  delete globalThis.localStorage;
});
