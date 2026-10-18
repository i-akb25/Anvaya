import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  sscQuestions,
  legacySscQuestions,
  sscFinancePart,
  sscChapters,
} from "../lib/platform/ssc.ts";
import { createSSCAttempt, sscScore } from "../lib/platform/ssc-exam.ts";
import { sscPlan } from "../lib/platform/ssc-rules.ts";
import {
  validAttempt,
  answer,
  deadline,
  evaluate,
  submit,
  editable,
} from "../lib/platform/engine.ts";
import {
  questionBankFor,
  fourthBankVersion,
  practiceBankVersion,
} from "../lib/platform/questions.ts";
import { emptyVault, saveVault, readVault } from "../lib/platform/vault.ts";
import { claimSSCLaunch } from "../lib/platform/ssc-handoff.ts";
import { lectureTopics, resourcesForTopic } from "../lib/platform/lectures.ts";
const make = (
  stage = "tier2-statistics",
  profile = "standard",
  seen = [],
  allowRepeats = false,
) =>
  createSSCAttempt({
    stage,
    profile,
    seen,
    allowRepeats,
    writerId: "test-tab",
    now: 1000,
  });
const q = (id) => sscQuestions.find((q) => q.id === id);
const selected = (id) => {
  const item = q(id);
  assert.ok(item, id);
  return item.options[Number(item.answer)];
};
test("special papers freeze 100 unique MCQs, correct whole-paper profiles and 40/60 finance split", () => {
  for (const stage of ["tier2-statistics", "tier2-finance"]) {
    for (const profile of ["standard", "compensatory"]) {
      const a = make(stage, profile);
      assert.equal(validAttempt(a), true);
      assert.equal(a.items.length, 100);
      assert.equal(a.sections.length, 1);
      assert.equal(a.navigation, "paper");
      assert.equal(
        deadline(a),
        1000 + (profile === "standard" ? 120 : 160) * 60000,
      );
      assert.equal(new Set(a.items.map((i) => i.question.id)).size, 100);
      assert.equal(editable(a, a.items.at(-1).question.id, 1001), true);
      let working = answer(
        a,
        a.items[0].question.id,
        a.items[0].question.answer,
        1001,
      );
      working = answer(
        working,
        a.items[1].question.id,
        String((Number(a.items[1].question.answer) + 1) % 4),
        1002,
      );
      assert.equal(evaluate(working).score, 1.5);
      assert.equal(evaluate(working).maximum, 200);
      const perfect = {
        ...a,
        answers: Object.fromEntries(
          a.items.map((i) => [i.question.id, i.question.answer]),
        ),
      };
      assert.equal(evaluate(perfect).score, 200);
      if (stage === "tier2-finance") {
        assert.equal(
          a.items.filter(
            (i) => sscFinancePart(i.question.topicId) === "accounts",
          ).length,
          40,
        );
        assert.deepEqual(
          sscScore(perfect).finance.map((p) => [p.part, p.score, p.maximum]),
          [
            ["accounts", 80, 80],
            ["economics", 120, 120],
          ],
        );
      }
      assert.equal(
        validAttempt(
          JSON.parse(JSON.stringify(submit(working, deadline(a) + 100))),
        ),
        true,
      );
      assert.throws(() => answer(a, a.items[0].question.id, "0", deadline(a)));
      for (const edit of [
        (v) => v.sections[0].seconds++,
        (v) => (v.items[0].marking.mcqPenalty = 1),
        (v) => (v.ssc.profile = "invented"),
        (v) => (v.navigation = "fixed-sections"),
      ]) {
        const bad = structuredClone(a);
        edit(bad);
        assert.equal(validAttempt(bad), false);
      }
    }
  }
  const finance = make("tier2-finance"),
    used = new Set(finance.items.map((i) => i.question.id));
  const spare = sscQuestions.find(
    (q) =>
      sscFinancePart(q.topicId) === "accounts" &&
      sscChapters.some(
        (c) => c.slug === q.topicId && c.section === "finance",
      ) &&
      !used.has(q.id),
  );
  const bad = structuredClone(finance);
  bad.items[
    bad.items.findIndex(
      (i) => sscFinancePart(i.question.topicId) === "economics",
    )
  ].question = structuredClone(spare);
  assert.equal(validAttempt(bad), false);
});
test("two common rehearsals can use disjoint questions; exhausted special banks require explicit reuse", () => {
  for (const stage of ["tier1", "tier2-common"]) {
    const a = make(stage),
      ids = a.items.map((i) => i.question.id),
      b = make(stage, "standard", ids);
    assert.equal(
      b.items.some((i) => ids.includes(i.question.id)),
      false,
    );
    assert.equal(validAttempt(b), true);
  }
  const a = make();
  assert.throws(
    () =>
      make(
        "tier2-statistics",
        "standard",
        a.items.map((i) => i.question.id),
      ),
    /unseen/,
  );
  assert.equal(
    make(
      "tier2-statistics",
      "standard",
      a.items.map((i) => i.question.id),
      true,
    ).items.length,
    100,
  );
});
test("v4 SSC snapshots retain immutable question/marking/timing contracts after the v5 upgrade", () => {
  assert.equal(questionBankFor(fourthBankVersion).length, 281);
  assert.equal(questionBankFor(practiceBankVersion).length, 643);
  const rows = sscPlan("tier1", "standard"),
    sections = rows.map((r, i) => ({
      id: `section-${i + 1}`,
      title: r.title,
      seconds: r.seconds,
    }));
  const items = rows.flatMap((r, i) =>
    legacySscQuestions
      .filter((q) =>
        sscChapters.some((c) => c.slug === q.topicId && c.section === r.id),
      )
      .slice(0, r.count)
      .map((question) => ({
        question: structuredClone(question),
        section: sections[i].id,
        marking: { correct: 2, mcqPenalty: 0.5, blankPenalty: 0 },
      })),
  );
  const a = {
    id: "pre-upgrade",
    version: 1,
    bankVersion: fourthBankVersion,
    examId: "ssc",
    classification: "custom-illustrative",
    ssc: { id: "tier1", profile: "standard", version: "ssc-2026-v1" },
    sections,
    navigation: "fixed-sections",
    items,
    answers: {},
    marked: [],
    startedAt: 1000,
    submittedAt: null,
    writerId: "old-tab",
  };
  assert.equal(validAttempt(a), true);
  assert.equal(deadline(a), 3601000);
  const tampered = structuredClone(a);
  tampered.items[0].question = q("ssc-series-extension-1");
  assert.equal(validAttempt(tampered), false);
});
test("new launch handoff cannot silently take over a changed writer or unrelated saved attempt", () => {
  const a = make(),
    v = { ...emptyVault(), active: a },
    token = JSON.stringify({ id: a.id, writerId: a.writerId });
  const claimed = claimSSCLaunch(v, token, "new-tab");
  assert.equal(claimed.active.writerId, "new-tab");
  assert.equal(claimed.active.startedAt, a.startedAt);
  assert.equal(deadline(claimed.active), deadline(a));
  for (const raw of [
    null,
    "invalid",
    JSON.stringify({ id: "other", writerId: a.writerId }),
    JSON.stringify({ id: a.id, writerId: "old-writer" }),
  ])
    assert.equal(claimSSCLaunch(v, raw, "new-tab"), v);
  assert.equal(
    claimSSCLaunch(
      { ...v, active: { ...a, writerId: "already-taken" } },
      token,
      "new-tab",
    ).active.writerId,
    "already-taken",
  );
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  };
  const saved = saveVault(v, 0);
  saveVault(claimSSCLaunch(saved, token, "new-tab"), saved.revision);
  assert.throws(() => saveVault(saved, saved.revision), /another tab/);
  assert.equal(readVault().active.writerId, "new-tab");
});
test("new statistical and financial numerical keys agree with separate computations", () => {
  const values = {
    "ssc-sampling-design-1": (80 * 300) / 800,
    "ssc-sampling-design-5": 1200 / 60,
    "ssc-grouped-data-1": (2 * 5 + 6 * 15) / 8,
    "ssc-grouped-data-2": 18 / 6,
    "ssc-grouped-data-3": 3 + 7,
    "ssc-grouped-data-4": 12 / 48,
    "ssc-grouped-data-5": 20 + ((40 / 2 - 12) / 16) * 10,
    "ssc-dispersion-detail-1": 3 ** 2 * 9,
    "ssc-dispersion-detail-2": (6 / 40) * 100,
    "ssc-dispersion-detail-3": (28 - 12) / 2,
    "ssc-dispersion-detail-4": 4 + 9,
    "ssc-dispersion-detail-5": 0,
    "ssc-dispersion-detail-7": 30 / (6 - 1),
    "ssc-moments-shape-1": 13 - 2 ** 2,
    "ssc-moments-shape-3": 5 - 3,
    "ssc-moments-shape-4": 16 / 2 ** 3,
    "ssc-correlation-detail-1": 6 / (2 * 5),
    "ssc-correlation-detail-2": 1 - (6 * 10) / (5 * (25 - 1)),
    "ssc-correlation-detail-3": -0.7,
    "ssc-correlation-detail-5": 0.5,
    "ssc-regression-detail-1": 8 - 2 * 3,
    "ssc-regression-detail-2": (-0.8) ** 2,
    "ssc-regression-detail-3": 12 - 9,
    "ssc-regression-detail-4": 5 + 2 * 4,
    "ssc-regression-detail-6": Math.sqrt(0.4 * 0.9),
    "ssc-probability-bayes-1": 0.4 + 0.5 - 0.2,
    "ssc-probability-bayes-4": 0.2 * 0.3,
    "ssc-probability-bayes-5": 0.9 / (0.9 + 0.3),
    "ssc-probability-bayes-6": (5 * 4) / 2,
    "ssc-probability-bayes-7": 1 - 0.65,
    "ssc-discrete-distributions-2": 2,
    "ssc-discrete-distributions-3": 0.75 + 3 * 0.25,
    "ssc-discrete-distributions-4": 4 + 9 + 2,
    "ssc-discrete-distributions-6": 0.12 / 0.4,
    "ssc-discrete-distributions-7": 1,
    "ssc-continuous-distributions-1": (14 - 20) / 4,
    "ssc-continuous-distributions-2": (2 + 8) / 2,
    "ssc-continuous-distributions-3": 6 ** 2 / 12,
    "ssc-continuous-distributions-4": 1 / 2 ** 2,
    "ssc-continuous-distributions-5": 0,
    "ssc-continuous-distributions-6": 0.5,
    "ssc-estimation-detail-1": 4 + 3 ** 2,
    "ssc-estimation-detail-2": 12 / Math.sqrt(36),
    "ssc-estimation-detail-3": 7 / 10,
    "ssc-estimation-detail-4": (1 + 2 + 6) / 3,
    "ssc-estimation-detail-5": 18 - 1,
    "ssc-estimation-detail-6": 1 / Math.sqrt(4),
    "ssc-estimation-detail-7": 0,
    "ssc-testing-anova-1": (3 - 1) * (4 - 1),
    "ssc-testing-anova-3": 1 - 0.2,
    "ssc-testing-anova-4": (12 - 10) / (4 / Math.sqrt(16)),
    "ssc-testing-anova-6": (12 - 10) ** 2 / 10 + (8 - 10) ** 2 / 10,
    "ssc-testing-anova-7": 18 / 3,
    "ssc-time-indices-1": (6 + 9 + 12) / 3,
    "ssc-time-indices-2": (180 / 120) * 100,
    "ssc-time-indices-3": Math.sqrt(144 * 100),
    "ssc-time-indices-4": 100 * 1.2,
    "ssc-time-indices-5": 80 - 5,
    "ssc-time-indices-7": (300 / 250) * 100,
    "ssc-bookkeeping-1": 90000 - 35000,
    "ssc-bank-reconciliation-1": 5000 + 800 - 300,
    "ssc-bank-reconciliation-2": 10000 - 200,
    "ssc-bank-reconciliation-4": -2000 + 500,
    "ssc-bills-control-1": 20000 * 0.1 * 0.5,
    "ssc-bills-control-4": 10000 + 8000 - 6000,
    "ssc-bills-control-5": 5000 + 100,
    "ssc-final-accounts-1": 80000 - 52000,
    "ssc-final-accounts-2": 30000 - 12000,
    "ssc-final-accounts-3": 4000 + 20000 - 3000,
    "ssc-final-accounts-4": 10000 - 1000 + 2000,
    "ssc-depreciation-inventory-1": (30000 - 3000) / 9,
    "ssc-depreciation-inventory-2": 10000 * 0.8 ** 2,
    "ssc-depreciation-inventory-3": (10 * 4 + 10 * 6) / 20,
    "ssc-depreciation-inventory-4": 12 + 9 - 15,
    "ssc-depreciation-inventory-6": 5 * 2 + 3,
    "ssc-consumer-demand-2": 15 / 10,
    "ssc-consumer-demand-7": 120 / 10,
    "ssc-consumer-demand-8": -10 / 5,
    "ssc-production-cost-1": 120 / 6,
    "ssc-production-cost-2": 4 * 10,
    "ssc-production-cost-3": 42 - 30,
    "ssc-production-cost-5": 15,
    "ssc-market-structures-1": (60 - 10) / 2,
    "ssc-national-income-1": (550 / 500) * 100,
    "ssc-national-income-2": 900 - 60,
    "ssc-national-income-3": 200 - 130,
    "ssc-national-income-4": 100 + 30 + 20 + 15 - 25,
    "ssc-money-budget-1": 300 - 90,
    "ssc-money-budget-2": 700 - 620,
    "ssc-money-budget-3": 1 / 0.2,
    "ssc-india-development-1": (40 / 500) * 100,
    "ssc-india-development-2": (450 / 900) * 100,
    "ssc-external-reforms-1": 100 * (80 - 75),
    "ssc-external-reforms-3": 90 - 110,
    "ssc-indian-physical-1": (4 * 100000) / 100000,
    "ssc-climate-agriculture-1": (60 + 100 + 140) / 3,
    "ssc-common-statistics-2": (10 * 20 + 30 * 40) / 40,
    "ssc-common-statistics-3": 9,
    "ssc-algebra-extension-1": 3 ** 2 + 2,
    "ssc-algebra-extension-2": 15 / 3,
    "ssc-algebra-extension-3": (8 - 2) / 3,
    "ssc-triangles-extension-1": (6 * 8) / 2,
    "ssc-triangles-extension-2": (18 * 2) / 3,
    "ssc-triangles-extension-3": (180 / 6) * 3,
    "ssc-circles-extension-1": Math.sqrt(25 - 16),
    "ssc-circles-extension-2": 100 / 2,
    "ssc-circles-extension-3": Math.hypot(12, 9),
    "ssc-circles-extension-4": 90,
    "ssc-mensuration-extension-1": 2 * (3 * 4 + 4 * 5 + 5 * 3),
    "ssc-mensuration-extension-3": Math.hypot(6, 8),
    "ssc-mensuration-extension-4": 24 * 7,
    "ssc-trigonometry-extension-2": 2 * 0.5 + 0.5,
    "ssc-data-extension-1": ((135 - 120) / 120) * 100,
    "ssc-data-extension-2": (72 / 360) * 100,
    "ssc-data-extension-3": (3 * 18 + 30) / 4,
    "ssc-data-extension-4": 4 * 5,
    "ssc-arithmetic-review-extension-1": 1 / (1 / 12 + 1 / 18),
    "ssc-arithmetic-review-extension-2": (150 / 10) * 3.6,
    "ssc-arithmetic-review-extension-3": ((1000 * 0.9 - 800) / 800) * 100,
    "ssc-arithmetic-review-extension-4": (Math.sqrt(12100 / 10000) - 1) * 100,
  };
  for (const [id, expected] of Object.entries(values)) {
    const text = selected(id).replaceAll(",", "").replaceAll("−", "-");
    const value = Number(text.match(/-?\d+(?:\.\d+)?/)[0]);
    assert.ok(
      Math.abs(value - expected) < 1e-8,
      `${id}: ${text} vs ${expected}`,
    );
  }
  assert.equal(selected("ssc-probability-bayes-2"), "1/6");
  assert.equal(selected("ssc-probability-bayes-3"), "3/10");
  assert.equal(selected("ssc-discrete-distributions-1"), "1/16");
  assert.equal(selected("ssc-consumer-demand-1"), "−1/3");
  assert.equal(selected("ssc-common-statistics-1"), "√(8/3)");
});
test("original visual drills ship accessible local vectors and preserve figure snapshots", async () => {
  const visual = sscQuestions.filter((q) => q.figure);
  assert.equal(visual.length, 8);
  for (const item of visual) {
    assert.match(item.figure.src, /^\/assets\/ssc\/[a-z0-9-]+\.svg$/);
    assert.ok(item.figure.alt.length > 40);
    const svg = await readFile(
      new URL(`../public${item.figure.src}`, import.meta.url),
      "utf8",
    );
    assert.match(svg, /<title>/);
    assert.ok(
      !/<script|foreignObject|https?:\/\/(?!www.w3.org\/2000\/svg)/.test(svg),
    );
  }
  const clockwise = (direction, steps) => (direction + steps + 4) % 4;
  assert.equal(
    ["Up", "Right", "Down", "Left"][clockwise(0, 1)],
    selected("ssc-visual-practice-2"),
  );
  assert.equal(
    ["Up", "Right", "Down", "Left"][clockwise(1, -1)],
    selected("ssc-visual-practice-4"),
  );
  assert.equal(Number(selected("ssc-visual-practice-6")), 2 ** 2);
  assert.equal(Number(selected("ssc-visual-practice-7")), 4 + 5);
  assert.equal(Number(selected("ssc-visual-practice-8")), 2 + 1);
  const topic = lectureTopics.find((t) => t.id === "ssc-trigonometry");
  assert.ok(
    resourcesForTopic(topic).some(
      (r) => r.evidenceUrl.endsWith("mathematics-211.html") && r.youtubeId,
    ),
  );
});

test("paged review preserves frozen question indices, keys, scores and mark filters", async () => {
  const { answerReviewPage } = await import("../lib/platform/answer-review.ts");
  const a = make(),
    first = a.items[0],
    last = a.items[99];
  a.answers[first.question.id] = first.question.answer;
  a.answers[last.question.id] = String((Number(last.question.answer) + 1) % 4);
  a.marked = [first.question.id, last.question.id];
  const page = answerReviewPage(a, "all", 4);
  assert.equal(page.pages, 5);
  assert.equal(page.rows[0].index, 80);
  assert.equal(page.rows.at(-1).item.question.id, last.question.id);
  assert.equal(page.rows.at(-1).marks, -0.5);
  const missed = answerReviewPage(a, "missed", 0);
  assert.equal(missed.total, 99);
  assert.equal(missed.rows[0].index, 1);
  assert.ok(missed.rows[0].marks === 0);
  const marked = answerReviewPage(a, "marked", 99);
  assert.equal(marked.page, 0);
  assert.deepEqual(
    marked.rows.map((r) => r.index),
    [0, 99],
  );
  assert.deepEqual(
    marked.rows.map((r) => r.marks),
    [2, -0.5],
  );
  assert.throws(() => answerReviewPage(a, "unknown", 0));
  assert.throws(() => answerReviewPage(a, "all", -1));
  assert.equal(a.answers[first.question.id], first.question.answer);
});
