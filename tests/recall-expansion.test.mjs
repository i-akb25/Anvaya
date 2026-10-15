import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  questionBankFor,
  legacyBankVersion,
  practiceBankVersion,
  practiceQuestions,
} from "../lib/platform/questions.ts";
import {
  createPractice,
  submit,
  validAttempt,
  correct,
} from "../lib/platform/engine.ts";
import {
  emptyVault,
  validVault,
  validPayload,
  addResult,
  seenQuestions,
} from "../lib/platform/vault.ts";
import {
  afterDays,
  localDay,
  recallQueue,
  rateRecall,
} from "../lib/platform/recall.ts";
const oldBank = JSON.parse(
  readFileSync(
    new URL("./fixtures/platform-bank-v1.json", import.meta.url),
    "utf8",
  ),
);
const input = {
  examId: "ssc",
  topicIds: ["percentages"],
  count: 1,
  seconds: 60,
  correct: 1,
  penalty: 0,
  seen: [],
  allowRepeats: false,
  writerId: "test",
  now: 1000,
};
test("v1 questions remain byte-order compatible and old snapshots survive in active sessions and backups", () => {
  assert.equal(
    JSON.stringify(questionBankFor(legacyBankVersion)),
    JSON.stringify(oldBank),
  );
  const active = {
    ...createPractice(input),
    bankVersion: legacyBankVersion,
    items: [
      {
        question: oldBank[0],
        section: "practice",
        marking: { correct: 1, mcqPenalty: 0, blankPenalty: 0 },
      },
    ],
  };
  assert.equal(validAttempt(active), true);
  assert.equal(validVault({ ...emptyVault(), active }), true);
  const oldVault = { ...emptyVault(), attempts: [submit(active, 2000)] };
  assert.equal(
    validPayload({
      schema: 1,
      learning: oldVault,
      workspace: { version: 1, tasks: [], papers: {} },
    }),
    true,
  );
  assert.equal(createPractice(input).bankVersion, practiceBankVersion);
  assert.equal(questionBankFor("unrecognized"), undefined);
  const injected = {
    ...active,
    items: [
      {
        ...active.items[0],
        question: practiceQuestions.find((q) => q.id === "si-1"),
      },
    ],
  };
  assert.equal(validAttempt(injected), false);
});
test("seen history survives result retention and stays separate by exam", () => {
  let v = emptyVault();
  const first = submit(createPractice(input), 2000);
  v = addResult(v, first);
  for (let i = 0; i < 35; i++)
    v = addResult(
      v,
      submit(createPractice({ ...input, topicIds: ["simple-interest"] }), 2000),
    );
  assert.equal(v.attempts.length, 30);
  assert.equal(
    v.attempts.some((a) => a.id === first.id),
    false,
  );
  assert.equal(
    seenQuestions(v, "ssc").includes(first.items[0].question.id),
    true,
  );
  assert.deepEqual(seenQuestions(v, "cat"), []);
  const legacyOther = submit(createPractice({ ...input, examId: "cat" }), 2000);
  const migrated = addResult(
    {
      ...v,
      seen: undefined,
      attempts: [...v.attempts.slice(0, 29), legacyOther],
    },
    submit(createPractice(input), 2000),
  );
  assert.equal(
    migrated.attempts.some((a) => a.id === legacyOther.id),
    false,
  );
  assert.deepEqual(seenQuestions(migrated, "cat"), [
    legacyOther.items[0].question.id,
  ]);
  assert.equal(validVault(JSON.parse(JSON.stringify(v))), true);
  const legacy = { ...emptyVault(), attempts: [first] };
  assert.deepEqual(seenQuestions(legacy, "ssc"), [first.items[0].question.id]);
});
test("recall ratings use local calendar days, retain notes, separate exams and reject invalid contexts", () => {
  const now = new Date(2026, 9, 31, 23, 45);
  assert.equal(localDay(now), "2026-10-31");
  assert.equal(afterDays(1, now), "2026-11-01");
  const v = {
    ...emptyVault(),
    completed: [
      "ssc:percentages",
      "cat:percentages",
      "cat:constitutional-rights",
    ],
    notes: { "ssc:percentages": "base" },
    revisionDue: {
      "ssc:percentages": "2026-10-30",
      "cat:percentages": "2026-11-05",
    },
  };
  assert.deepEqual(
    recallQueue(v, "all", true, "2026-10-31").map((r) => r.key),
    ["ssc:percentages"],
  );
  assert.equal(recallQueue(v, "cat", false).length, 1);
  for (const [rating, date] of [
    ["again", "2026-11-01"],
    ["hard", "2026-11-03"],
    ["good", "2026-11-07"],
  ]) {
    const next = rateRecall(v, "ssc:percentages", rating, now);
    assert.equal(next.revisionDue["ssc:percentages"], date);
    assert.equal(next.revisionDue["cat:percentages"], "2026-11-05");
    assert.equal(next.notes["ssc:percentages"], "base");
    assert.equal(next.recalls["ssc:percentages"].rating, rating);
    assert.equal(validVault(JSON.parse(JSON.stringify(next))), true);
  }
  assert.throws(() => rateRecall(v, "cat:constitutional-rights", "good", now));
  assert.throws(() => rateRecall(v, "ssc:percentages", "invalid", now));
  assert.equal(
    validVault({
      ...v,
      recalls: { a: { rating: "invalid", reviewedAt: "bad" } },
    }),
    false,
  );
  assert.equal(validVault({ ...v, seen: { ssc: [null] } }), false);
});
test("new numerical keys independently agree with formulas and declared rounding", () => {
  const computations = {
    "eco-2": 24000 * 0.1 ** 2,
    "si-1": (7200 * 0.05 * 8) / 12,
    "si-2": 810 / (0.06 * 3),
    "cap-1": 0.5 * 50e-6 * 20 ** 2 * 1000,
    "cap-3": 12 * 5,
    "rc-1": 25000 * 8e-6,
    "rc-3": Math.round(12 * Math.exp(-1) * 100) / 100,
  };
  for (const [id, expected] of Object.entries(computations)) {
    const q = practiceQuestions.find((q) => q.id === id);
    assert.equal(
      correct(q, String(Number(expected.toPrecision(12)))),
      true,
      id,
    );
  }
  assert.equal(
    practiceQuestions.find((q) => q.id === "si-3").options[2],
    `₹${2500 * (1 + 0.08 * 2)}`.replace("2900", "2,900"),
  );
  assert.equal(practiceQuestions.find((q) => q.id === "cap-2").answer, "2");
  assert.equal(practiceQuestions.find((q) => q.id === "rc-2").answer, "1");
});
