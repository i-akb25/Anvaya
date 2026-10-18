import test from "node:test";
import { emptyWorkspace } from "../lib/workspace.ts";
import { recallQueue, rateRecall } from "../lib/platform/recall.ts";
import assert from "node:assert/strict";
import {
  sscChapters,
  sscQuestions,
  sscUnits,
  sscTopicIds,
} from "../lib/platform/ssc.ts";
import { createSSCAttempt, sscScore } from "../lib/platform/ssc-exam.ts";
import { sscPlan } from "../lib/platform/ssc-rules.ts";
import {
  validAttempt,
  answer,
  editable,
  deadline,
  activeSection,
  evaluate,
  submit,
} from "../lib/platform/engine.ts";
import {
  questionBankFor,
  thirdBankVersion,
} from "../lib/platform/questions.ts";
import {
  createDest,
  destDeadline,
  typeDest,
  submitDest,
  validDest,
  validDestStore,
  editDistance,
  destReport,
} from "../lib/platform/ssc-dest.ts";
import {
  emptyVault,
  validVault,
  saveVault,
  readVault,
  addResult,
} from "../lib/platform/vault.ts";
import { restoreLocalPayload } from "../lib/platform/local-data.ts";
import { studyIndex } from "../lib/platform/discovery.ts";
import { syllabusFor } from "../lib/platform/syllabus.ts";
const make = (stage = "tier1", profile = "standard", rest = {}) =>
  createSSCAttempt({
    stage,
    profile,
    seen: [],
    allowRepeats: false,
    writerId: "ssc-test",
    now: 1000,
    ...rest,
  });
const option = (id) => {
  const q = sscQuestions.find((q) => q.id === id);
  return q.options[Number(q.answer)];
};
function memory() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
}
test("SSC classroom maps every original chapter into search, syllabus, notes and topic drill scope", () => {
  assert.equal(sscChapters.length, 79);
  assert.equal(sscQuestions.length, 562);
  assert.equal(new Set(sscQuestions.map((q) => q.stem)).size, 562);
  for (const u of sscUnits) {
    assert.deepEqual(u.exams, ["ssc"]);
    assert.equal(u.status, "source-linked");
    assert.ok(u.concepts.every((c) => c.title && c.text));
    assert.equal(u.example.steps.length, 3);
    assert.ok(
      studyIndex().some(
        (h) =>
          h.id === `lesson:${u.slug}` && h.status.includes("author-checked"),
      ),
    );
    assert.ok(syllabusFor("ssc").some((s) => s.topicIds.includes(u.slug)));
    assert.ok(sscQuestions.some((q) => q.topicId === u.slug));
  }
  assert.equal(sscTopicIds("statistics").length, 16);
  assert.equal(sscTopicIds("finance").length, 17);
  assert.ok(
    sscQuestions.every(
      (q) => !q.pyq && !q.humanReviewed && q.keyStatus === "author-checked",
    ),
  );
  assert.deepEqual(questionBankFor(thirdBankVersion).length, 81);
});
test("SSC original numerical keys agree with separately computed results", () => {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const values = {
    "ssc-numbers-1": (18 * 24) / gcd(18, 24),
    "ssc-numbers-2": 3 / 5 + 0.25,
    "ssc-numbers-3": 347 % 9,
    "ssc-numbers-4": (36 / 6) * 3 - 4,
    "ssc-algebra-1": 4 ** 2 - 2,
    "ssc-algebra-2": (20 + 7) / 3,
    "ssc-mixture-1": ((10 * 0.2 + 30 * 0.4) / 40) * 100,
    "ssc-mixture-4": 12 * 0.25,
    "ssc-triangles-1": Math.hypot(5, 12),
    "ssc-triangles-2": 180 - 48 - 67,
    "ssc-circles-1": Math.sqrt(100 - 36),
    "ssc-circles-3": 180 - 112,
    "ssc-mensuration-1": ((22 / 7) * 9 * 7) / 3,
    "ssc-mensuration-2": (36 / 16 - 1) * 100,
    "ssc-mensuration-3": 2 ** 3,
    "ssc-mensuration-4": (14 * 9) / 2,
    "ssc-data-1": (70 / 200) * 100,
    "ssc-data-2": 0.15 * 360,
    "ssc-data-3": 25 - 20,
    "ssc-arithmetic-review-1": 1000 / 1.25,
    "ssc-arithmetic-review-2": (3600 * 7) / 9,
    "ssc-arithmetic-review-3": 240 / (120 / 40 + 120 / 60),
    "ssc-arithmetic-review-4": 2400 * 0.05 * 1.5,
    "ssc-series-1": 30 + 12,
    "ssc-series-2": 7 ** 2 + 1,
    "ssc-coding-2": 4 + 15 + 7,
    "ssc-coding-3": 4 * 3 + 2,
    "ssc-directions-1": Math.hypot(3, 4),
    "ssc-relations-1": 6 + 9 - 1,
    "ssc-relations-4": 21 - 9 + 1,
    "ssc-venn-1": 60 - (35 + 30 - 15),
    "ssc-seating-4": 5 - 2 + 1,
    "ssc-physics-2": 60 / 12,
    "ssc-physics-4": 12 / 4,
    "ssc-economy-3": (165 / 150 - 1) * 100,
    "ssc-computer-hardware-2": 3 * 8,
    "ssc-computer-hardware-6": 8192 / 1024,
    "ssc-spreadsheets-3": 2 + 4 + 6,
    "ssc-spreadsheets-4": (3 + 6 + 9) / 3,
    "ssc-statistics-data-1": (4 + 7) / 2,
    "ssc-statistics-data-2": ((1 - 2) ** 2 + (3 - 2) ** 2) / 2,
    "ssc-statistics-data-3": 12 - 3,
    "ssc-statistics-probability-1": 10 * 0.2 * 0.8,
    "ssc-statistics-probability-2": 0.12 / 0.3,
    "ssc-statistics-probability-4": 1 / 0.5,
    "ssc-statistics-inference-2": 10 / Math.sqrt(25),
    "ssc-statistics-inference-4": 20 - 4,
    "ssc-statistics-association-1": (-0.5 * 6) / 3,
    "ssc-statistics-association-2": (100 / 80) * 100,
    "ssc-accounts-statements-1": 100 + 600 - 150,
    "ssc-accounts-statements-2": (12000 - 2000) / 5,
    "ssc-microeconomics-2": 240 / 12,
    "ssc-macro-governance-1": 500 - 320,
  };
  for (const [id, expected] of Object.entries(values)) {
    const raw = option(id).replaceAll(",", "");
    const number = Number(raw.match(/[-−]?\d+(?:\.\d+)?/)[0].replace("−", "-"));
    assert.ok(
      Math.abs(number - expected) < 1e-9,
      `${id}: ${raw} vs ${expected}`,
    );
  }
  assert.equal(option("ssc-spreadsheets-2"), "=$A3+B$1");
  const schedules = ["XYZ", "XZY", "YXZ", "YZX", "ZXY", "ZYX"].filter(
    (s) => s.indexOf("X") < s.indexOf("Y") && s[2] !== "Z",
  );
  assert.deepEqual(schedules, ["XZY", "ZXY"]);
  assert.ok(schedules.every((s) => s[2] === "Y"));
});
test("SSC standard and compensatory profiles freeze exact full counts and enforce subject boundaries", () => {
  for (const [stage, profile, total, minutes, counts] of [
    ["tier1", "standard", 100, 60, [25, 25, 25, 25]],
    ["tier1", "compensatory", 100, 80, [25, 25, 25, 25]],
    ["tier2-common", "standard", 150, 135, [30, 30, 45, 25, 20]],
    ["tier2-common", "compensatory", 150, 180, [30, 30, 45, 25, 20]],
  ]) {
    const a = make(stage, profile);
    assert.equal(validAttempt(a), true);
    assert.equal(a.items.length, total);
    assert.equal(new Set(a.items.map((i) => i.question.id)).size, total);
    assert.equal(deadline(a), 1000 + minutes * 60000);
    assert.deepEqual(
      a.sections.map((s) => a.items.filter((i) => i.section === s.id).length),
      counts,
    );
    const id = a.items[0].question.id,
      end = 1000 + a.sections[0].seconds * 1000,
      next = a.items[counts[0]].question.id;
    assert.equal(editable(a, next, end - 1), false);
    assert.equal(editable(a, id, end - 1), true);
    assert.equal(editable(a, id, end), false);
    assert.equal(editable(a, next, end), true);
    assert.equal(activeSection(a, deadline(a)), null);
    assert.throws(() => answer(a, id, "0", end));
    const frozen = JSON.parse(JSON.stringify(a));
    assert.equal(validAttempt(frozen), true);
    assert.equal(deadline(frozen), deadline(a));
    frozen.sections[0].seconds++;
    assert.equal(validAttempt(frozen), false);
    const tamper = structuredClone(a);
    tamper.items[0].marking.mcqPenalty = 0;
    assert.equal(validAttempt(tamper), false);
  }
  assert.deepEqual(
    sscPlan("tier2-common", "compensatory").map((r) => r.seconds / 60),
    [40, 40, 55, 25, 20],
  );
  assert.throws(() => sscPlan("statistics", "standard"));
});
test("SSC never silently fills a short unseen bank, preserves snapshot keys and splits qualifying computer score", () => {
  const a = make("tier2-common");
  assert.throws(
    () =>
      make("tier2-common", "standard", {
        seen: sscQuestions.map((q) => q.id),
      }),
    /unseen/,
  );
  assert.equal(
    make("tier2-common", "standard", {
      seen: a.items.map((i) => i.question.id),
      allowRepeats: true,
    }).items.length,
    150,
  );
  const full = {
    ...a,
    answers: Object.fromEntries(
      a.items.map((i) => [i.question.id, i.question.answer]),
    ),
  };
  assert.equal(evaluate(full).score, 450);
  assert.equal(sscScore(full).merit, 390);
  assert.equal(sscScore(full).computer.score, 60);
  const comp = a.items.at(-1);
  full.answers[comp.question.id] = String(
    (Number(comp.question.answer) + 1) % 4,
  );
  assert.equal(sscScore(full).merit, 390);
  assert.equal(sscScore(full).computer.score, 56);
  const closed = submit(full, deadline(full) + 5000);
  assert.equal(validAttempt(closed), true);
  assert.equal(closed.submittedAt, deadline(full));
  assert.deepEqual(submit(closed, deadline(full) + 9000), closed);
  const v = addResult(emptyVault(), closed);
  assert.equal(validVault(v), true);
  assert.equal(v.active, null);
  assert.equal(v.seen.ssc.length, 150);
  const corrupt = structuredClone(a);
  corrupt.items[0].question.answer = "7";
  assert.equal(validAttempt(corrupt), false);
});
test("DEST is separately timed, immutable, recoverable, bounded and scored without invented SSC pass thresholds", () => {
  const a = createDest("standard", "tab1", 1000);
  assert.equal(validDest(a), true);
  assert.ok(a.target.length >= 1900 && a.target.length <= 2100);
  assert.match(a.target, /^[\x00-\x7F]+$/);
  assert.equal(destDeadline(a), 901000);
  assert.equal(createDest("compensatory", "tab1", 1000).seconds, 1200);
  const typed = typeDest(a, "The community", 2000);
  assert.equal(typed.startedAt, a.startedAt);
  assert.throws(() => typeDest(typed, "late", destDeadline(a)));
  assert.throws(() => typeDest(a, "x".repeat(4001), 2000));
  const done = submitDest(typed, 9999999);
  assert.equal(done.submittedAt, destDeadline(a));
  assert.deepEqual(submitDest(done, 99999999), done);
  assert.equal(validDestStore({ active: null, history: [done] }), true);
  assert.equal(validDestStore({ active: a, history: [done] }), false);
  assert.equal(editDistance("kitten", "sitting"), 3);
  assert.equal(editDistance("a b", "ab"), 1);
  assert.equal(editDistance("A", "a"), 1);
  const perfect = submitDest({ ...a, text: a.target }, 601000);
  assert.equal(destReport(perfect).edits, 0);
  assert.equal(destReport(perfect).wpm, a.target.length / 5 / 10);
  assert.equal(validDest({ ...a, target: "a forged easier passage" }), false);
  assert.equal(validDest({ ...a, seconds: 1800 }), false);
  globalThis.localStorage = memory();
  const saved = saveVault(
    { ...emptyVault(), sscDest: { active: typed, history: [] } },
    0,
  );
  assert.deepEqual(readVault().sscDest.active, typed);
  assert.throws(
    () => saveVault({ ...saved, active: make() }, saved.revision),
    /Finish/,
  );
  assert.throws(
    () =>
      saveVault(
        {
          ...saved,
          sscDest: { active: { ...typed, writerId: "tab2" }, history: [] },
        },
        0,
      ),
    /another tab/,
  );
  assert.throws(() =>
    restoreLocalPayload({
      schema: 1,
      learning: emptyVault(),
      workspace: emptyWorkspace,
    }),
  );
});

test("SSC lesson completion feeds recall and private notebook search without leaking notes to public search", () => {
  const key = "ssc:ssc-trigonometry",
    v = {
      ...emptyVault(),
      notes: { [key]: "Remember the supplied eye height." },
      completed: [key],
      revisionDue: { [key]: "2026-10-17" },
    };
  assert.equal(
    recallQueue(v, "ssc", true, "2026-10-17")[0].unit.slug,
    "ssc-trigonometry",
  );
  assert.equal(
    rateRecall(v, key, "good", new Date("2026-10-17T12:00:00Z")).revisionDue[
      key
    ],
    "2026-10-24",
  );
  assert.ok(
    studyIndex(v).some(
      (h) => h.private && h.body.includes("supplied eye height"),
    ),
  );
  assert.ok(
    !studyIndex().some((h) =>
      h.body.includes("Remember the supplied eye height"),
    ),
  );
});
