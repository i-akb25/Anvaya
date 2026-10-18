import test from "node:test";
import assert from "node:assert/strict";
import { calculate } from "../lib/platform/calculator.ts";
import { depthUnits, depthQuestions } from "../lib/platform/depth-content.ts";
import {
  questionBankFor,
  sixthBankVersion,
  practiceBankVersion,
} from "../lib/platform/questions.ts";
import {
  createGateAttempt,
  gateScore,
  gateAvailability,
} from "../lib/platform/gate-exam.ts";
import { gateDomain, gatePapers } from "../lib/platform/gate-rules.ts";
import {
  validAttempt,
  evaluate,
  submit,
  answer,
  deadline,
  editable,
  correct,
} from "../lib/platform/engine.ts";
import {
  emptyVault,
  validVault,
  validPayload,
  saveVault,
  readVault,
} from "../lib/platform/vault.ts";
const make = (
  paper = "gate-ee",
  profile = "standard",
  seen = [],
  allowRepeats = false,
) =>
  createGateAttempt({
    paper,
    profile,
    seen,
    allowRepeats,
    writerId: "gate-tab",
    now: 1000,
  });
const q = (id) => depthQuestions.find((q) => q.id === id);
const fullAnswer = (q) =>
  q.type === "msq"
    ? q.answer
    : q.type === "mcq"
      ? q.answer
      : String((q.answer.min + q.answer.max) / 2);
test("scientific parser handles mathematical precedence, scientific notation and explicit angle modes", () => {
  for (const [input, n] of [
    ["2+3*4", 14],
    ["(2+3)*4", 20],
    ["-2^2", -4],
    ["2^-2", 0.25],
    ["2^3^2", 512],
    ["sqrt(3^2+4^2)", 5],
    ["3!+4!", 30],
    ["1e-3*1000", 1],
    ["50%", 0.5],
    ["ln(exp(2))", 2],
    ["log(1000)", 3],
    ["2*pi", 2 * Math.PI],
    ["abs(-5)", 5],
  ])
    assert.ok(Math.abs(calculate(input) - n) < 1e-10, input);
  assert.ok(Math.abs(calculate("sin(30)", "deg") - 0.5) < 1e-12);
  assert.ok(Math.abs(calculate("sin(pi/2)", "rad") - 1) < 1e-12);
  assert.ok(Math.abs(calculate("asin(0.5)", "deg") - 30) < 1e-12);
  assert.equal(calculate("ans*2", "rad", 7), 14);
});
test("calculator rejects script syntax, unbounded input and undefined real operations", () => {
  for (const input of [
    "1/0",
    "sqrt(-1)",
    "ln(0)",
    "acos(2)",
    "0^0",
    "171!",
    "(-3)!",
    "3.5!",
    "2pi",
    "globalThis.alert(1)",
    "constructor(1)",
    "1;2",
    "2[0]",
    "'1'",
    "(2+3",
    "sin 1",
    "1e999",
    "a".repeat(257),
  ])
    assert.throws(() => calculate(input), undefined, input);
  assert.throws(() => calculate("tan(90)", "deg"), /undefined/);
  assert.throws(() => calculate("2", "other"));
});
test("new numeric keys agree with independent matrix, calculus, convolution and circuit computations", () => {
  const conv = (x, h) =>
    Array.from({ length: x.length + h.length - 1 }, (_, n) =>
      x.reduce((s, v, k) => s + v * (h[n - k] ?? 0), 0),
    );
  const expected = {
    "matrix-linear-systems-1": 4 * 3 - 2,
    "matrix-linear-systems-2": (11 + 1) / 4,
    "matrix-linear-systems-4": 7,
    "matrix-linear-systems-6": 6 - 4,
    "calculus-rates-area-1": 3 * 2 ** 2 - 2,
    "calculus-rates-area-2": 2 ** 3,
    "calculus-rates-area-3": 5,
    "calculus-rates-area-6": 4 * 5,
    "first-order-control-1": 2,
    "first-order-control-2": 3 / 2,
    "first-order-control-3": -1 / 0.25,
    "first-order-control-6": 4 / (1 + 4),
    "discrete-convolution-1": conv([1, 2], [1, 1])[1],
    "discrete-convolution-2": conv([2, 1], [1, -1])[2],
    "discrete-convolution-3": 4 + 3 - 1,
    "discrete-convolution-6": conv([3, 1], [2, 2]).reduce((a, b) => a + b, 0),
    "ideal-opamp-feedback-1": -20 / 5,
    "ideal-opamp-feedback-2": 1 + 20 / 10,
    "ideal-opamp-feedback-3": -6 * 0.2,
    "ideal-opamp-feedback-6": (0.3 / 10000) * 1e6,
    "diode-piecewise-model-1": ((5 - 0.7) / 1000) * 1000,
    "diode-piecewise-model-2": (9 / 3000) * 1000,
    "diode-piecewise-model-4": 0.6 * 2,
    "diode-piecewise-model-6": ((5 - 0.5) / 1500) * 1000,
    "measurement-uncertainty-1": Math.hypot(3, 4),
    "measurement-uncertainty-2": 0.2 + 0.3,
    "measurement-uncertainty-4": Math.hypot(6, 8),
    "measurement-uncertainty-6": (2 / 100) * 100,
    "conditional-counting-1": 12 / 20,
    "conditional-counting-2": 6 / (6 + 2),
    "conditional-counting-3": 0.12 / 0.3,
    "conditional-counting-6": 0.2 * 0.5,
    "weather-climate-evidence-1": 19.5 - 18,
    "weather-climate-evidence-4": 17 - 20,
  };
  for (const [id, n] of Object.entries(expected)) {
    const item = q(id);
    assert.ok(item, id);
    assert.ok(Math.abs(item.answer.min - n) < 1e-10, id);
    assert.equal(item.answer.min, item.answer.max, id);
  }
  assert.equal(depthUnits.length, 10);
  assert.equal(depthQuestions.length, 60);
});
test("original conceptual keys match the explicitly stated assumptions", () => {
  for (const [id, n] of Object.entries({
    "matrix-linear-systems-3": 2,
    "calculus-rates-area-4": 1,
    "first-order-control-4": 2,
    "discrete-convolution-4": 0,
    "ideal-opamp-feedback-4": 1,
    "diode-piecewise-model-3": 2,
    "measurement-uncertainty-3": 1,
    "conditional-counting-4": 0,
    "species-interactions-1": 2,
    "species-interactions-2": 0,
    "species-interactions-3": 1,
    "species-interactions-4": 3,
    "species-interactions-6": 1,
    "weather-climate-evidence-2": 2,
    "weather-climate-evidence-3": 0,
    "weather-climate-evidence-6": 1,
  }))
    assert.equal(q(id).answer, String(n), id);
  for (const item of depthQuestions.filter((q) => q.type === "msq"))
    assert.deepEqual(
      item.answer,
      item.topicId === "first-order-control" ||
        item.topicId === "diode-piecewise-model"
        ? [0, 1]
        : [0, 2],
      item.id,
    );
});
test("all three GATE papers freeze exact counts, mark quotas and whole-paper profiles", () => {
  for (const paper of gatePapers)
    for (const profile of ["standard", "compensatory"]) {
      const a = make(paper, profile);
      assert.equal(validAttempt(a), true);
      assert.equal(a.items.length, 65);
      assert.equal(new Set(a.items.map((i) => i.question.id)).size, 65);
      assert.equal(evaluate(a).maximum, 100);
      assert.equal(a.sections.length, 1);
      assert.equal(
        a.sections[0].seconds,
        profile === "standard" ? 10800 : 14400,
      );
      assert.equal(a.navigation, "paper");
      assert.equal(a.items.filter((i) => i.marking.correct === 1).length, 30);
      assert.equal(a.items.filter((i) => i.marking.correct === 2).length, 35);
      const breakdown = gateScore(a);
      assert.deepEqual(
        breakdown.map((r) => r.maximum),
        [15, 13, 72],
      );
      assert.deepEqual(
        breakdown.map(
          (r) =>
            a.items.filter(
              (i) => gateDomain(paper, i.question.topicId) === r.domain,
            ).length,
        ),
        [10, 9, 46],
      );
      assert.ok(editable(a, a.items.at(-1).question.id, 1001));
    }
});
test("GATE scoring gives 100 for exact keys and penalises only incorrect MCQs", () => {
  const a = make(),
    all = {
      ...a,
      answers: Object.fromEntries(
        a.items.map((i) => [i.question.id, fullAnswer(i.question)]),
      ),
    };
  assert.equal(validAttempt(all), true);
  assert.equal(evaluate(all).score, 100);
  assert.equal(evaluate(all).right, 65);
  const wrong = {
    ...a,
    answers: Object.fromEntries(
      a.items.map(({ question: q }) => [
        q.id,
        q.type === "mcq"
          ? String((Number(q.answer) + 1) % q.options.length)
          : q.type === "msq"
            ? correct(q, [0])
              ? [1]
              : [0]
            : "999999999",
      ]),
    ),
  };
  const expected = -a.items
    .filter((i) => i.question.type === "mcq")
    .reduce((n, i) => n + i.marking.correct / 3, 0);
  assert.ok(Math.abs(evaluate(wrong).score - expected) < 1e-10);
  assert.equal(evaluate(wrong).wrong, 65);
});
test("GATE exhaustion requires explicit reuse and never pads a paper", () => {
  const a = make(),
    seen = a.items.map((i) => i.question.id);
  assert.equal(gateAvailability("gate-ee", seen)[0].available, 0);
  assert.throws(() => make("gate-ee", "standard", seen), /unseen/);
  const repeated = make("gate-ee", "standard", seen, true);
  assert.equal(repeated.items.length, 65);
  assert.equal(new Set(repeated.items.map((i) => i.question.id)).size, 65);
});
test("frozen GATE contracts reject changed banks, times, domains, weights and cross-exam snapshots", () => {
  const a = make();
  for (const mutate of [
    (a) => (a.bankVersion = sixthBankVersion),
    (a) => (a.examId = "gate-ec"),
    (a) => a.sections[0].seconds++,
    (a) => (a.navigation = "fixed-sections"),
    (a) => (a.items[0].marking.correct = 2),
    (a) => (a.items[0].marking.mcqPenalty = 0),
    (a) => a.items.pop(),
    (a) => (a.gate.version = "future"),
    (a) => (a.gate.profile = "unverified"),
    (a) =>
      (a.ssc = { id: "tier1", profile: "standard", version: "ssc-2026-v2" }),
  ]) {
    const copy = structuredClone(a);
    mutate(copy);
    assert.equal(validAttempt(copy), false);
  }
  assert.equal(questionBankFor(sixthBankVersion).length, 685);
  assert.equal(questionBankFor(practiceBankVersion).length, 745);
  assert.equal(
    questionBankFor(sixthBankVersion).some((item) =>
      depthQuestions.some((q) => q.id === item.id),
    ),
    false,
  );
});
test("GATE deadline, ownership and full-paper metadata survive vault and backup recovery", () => {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  };
  const a = make("gate-in", "compensatory"),
    v = { ...emptyVault(), active: a };
  saveVault(v, 0);
  const restored = readVault();
  assert.equal(deadline(restored.active), 14401000);
  assert.deepEqual(restored.active.gate, a.gate);
  assert.equal(validVault(restored), true);
  assert.equal(
    validPayload({
      schema: 1,
      learning: restored,
      workspace: { version: 1, tasks: [], papers: {} },
    }),
    true,
  );
  const expired = submit(restored.active, 999999999);
  assert.equal(expired.submittedAt, deadline(a));
  assert.equal(validAttempt(expired), true);
  assert.throws(
    () =>
      answer(
        a,
        a.items[0].question.id,
        fullAnswer(a.items[0].question),
        deadline(a) + 1,
      ),
    /outside its section/,
  );
  delete globalThis.localStorage;
});
