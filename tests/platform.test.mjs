import test from "node:test";
import assert from "node:assert/strict";
import { patterns, officialLaunchReadiness } from "../lib/platform/registry.ts";
import { syllabusUnits } from "../lib/platform/syllabus.ts";
import { sources, studyUnits } from "../lib/platform/content.ts";
import { practiceQuestions } from "../lib/platform/questions.ts";
import {
  answer,
  correct,
  createPractice,
  deadline,
  editable,
  evaluate,
  numericValue,
  submit,
  validAttempt,
} from "../lib/platform/engine.ts";
import {
  addResult,
  emptyVault,
  readVault,
  saveVault,
  validPayload,
  validVault,
  vaultKey,
} from "../lib/platform/vault.ts";
import {
  allowedOwner,
  parseRevision,
  sameOrigin,
} from "../lib/platform/auth-policy.ts";
import { packIssues } from "../lib/platform/moderation.ts";
const input = {
  examId: "gate-ee",
  topicIds: studyUnits.map((u) => u.slug),
  count: 4,
  seconds: 120,
  correct: 2,
  penalty: 2 / 3,
  seen: [],
  allowRepeats: false,
  writerId: "tab1",
  now: 1000,
};
function storage() {
  const map = new Map();
  let quota = false;
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      if (quota) throw Error("quota");
      map.set(k, v);
    },
    removeItem: (k) => map.delete(k),
    quota: (v) => {
      quota = v;
    },
  };
}
test("all ten exams retain cycle/stage-specific definitions and distinct GATE syllabi", () => {
  assert.equal(new Set(patterns.map((p) => p.examId)).size, 10);
  assert.equal(new Set(patterns.map((p) => p.id)).size, patterns.length);
  for (const exam of [
    "upsc",
    "bpsc",
    "ssc",
    "sbi",
    "ibps",
    "cat",
    "ese",
    "gate-ee",
    "gate-ec",
    "gate-in",
  ]) {
    assert.ok(syllabusUnits.some((u) => u.examId === exam));
    assert.ok(patterns.some((p) => p.examId === exam));
  }
  assert.ok(patterns.some((p) => p.id === "ssc-2026-tier2-finance"));
  const inTitles = syllabusUnits
    .filter((u) => u.examId === "gate-in")
    .map((u) => u.title);
  assert.ok(inTitles.includes("Sensors and Industrial Instrumentation"));
  assert.ok(
    !syllabusUnits
      .filter((u) => u.examId === "gate-ee")
      .some((u) => u.title === "Sensors and Industrial Instrumentation"),
  );
  for (const p of patterns) {
    assert.ok(p.sourceUrl.startsWith("https://"));
    assert.ok(p.version);
    assert.equal(officialLaunchReadiness(p, null).ready, false);
  }
  assert.ok(
    patterns
      .find((p) => p.examId === "ibps" && p.stage === "mains")
      .sections.every((s) => s.questions === null),
  );
  assert.equal(
    patterns.find((p) => p.examId === "bpsc" && p.stage === "prelims").penalty,
    null,
  );
});
test("published foundation units have checked primary links, honest provenance and original questions", () => {
  assert.equal(studyUnits.length, 108);
  assert.equal(practiceQuestions.length, 685);
  assert.equal(new Set(practiceQuestions.map((q) => q.id)).size, 685);
  for (const u of studyUnits) {
    assert.ok(sources.some((s) => s.id === u.sourceId));
    assert.equal(u.authorship, "AI-authored");
    assert.ok(u.review.includes("No independent human"));
    assert.ok(u.example.steps.length >= 3);
  }
  for (const q of practiceQuestions) {
    assert.ok(studyUnits.some((u) => u.slug === q.topicId));
    assert.ok(sources.some((s) => s.id === q.sourceId));
    assert.equal(q.pyq, false);
    assert.equal(q.humanReviewed, false);
  }
});
test("original numerical and MCQ keys agree with independently derived computations", () => {
  const expected = {
    "pct-1": (35 * 240) / 100,
    "pct-2": 54 / 0.3,
    "pct-4": (25 / 125) * 100,
    "chg-1": 500 * 1.12 * 0.9,
    "chg-2": ((80 - 68) / 80) * 100,
    "chg-4": 630 / 0.75,
    "ratio-1": (960 / 8) * 3,
    "ratio-2": 168 / 2.8,
    "ratio-4": (150 / 15) * 5,
    "prob-2": 2 / 4,
    "prob-4": 2 / 3,
    "ohm-1": 12 / 24,
    "ohm-2": 0.3 ** 2 * 10,
    "ohm-4": 2000 * 0.003,
    "network-1": 1 / (1 / 3 + 1 / 6),
    "network-3": 5 + 1 / (1 / 8 + 1 / 8),
    "kcl-1": 2 + 3,
    "kcl-2": 20 / 4 / (1 / 4 + 1 / 6),
  };
  for (const [id, n] of Object.entries(expected)) {
    const q = practiceQuestions.find((q) => q.id === id);
    if (q.type === "mcq") {
      const option = parseFloat(q.options[Number(q.answer)]);
      assert.ok(Math.abs(option - n) < 1e-8, id);
    } else {
      const tolerance = id === "prob-4" ? 0.001 : 1e-8;
      const mid = (q.answer.min + q.answer.max) / 2;
      assert.ok(Math.abs(mid - n) < tolerance, id);
    }
  }
});
test("MSQ uses exact set without partial credit, numeric ranges are inclusive and parsing is strict", () => {
  const q = practiceQuestions.find((q) => q.id === "pct-3");
  assert.equal(correct(q, [2, 0, 1]), true);
  assert.equal(correct(q, [0, 1]), false);
  assert.equal(correct(q, [0, 1, 2, 3]), false);
  const range = practiceQuestions.find((q) => q.id === "prob-4");
  assert.equal(correct(range, "0.6665"), true);
  assert.equal(correct(range, "0.6675"), true);
  assert.equal(correct(range, "0.668"), false);
  for (const s of ["Infinity", "NaN", "0x10", "1+1", "1,000", "--1"])
    assert.equal(numericValue(s), null, s);
  assert.equal(numericValue("-2.5e-2"), -0.025);
});
test("custom practice is unique, stops at exhaustion and only reuses with explicit consent", () => {
  const a = createPractice(input);
  assert.equal(new Set(a.items.map((i) => i.question.id)).size, 4);
  assert.equal(validAttempt(a), true);
  assert.equal(a.classification, "custom-illustrative");
  assert.throws(() =>
    createPractice({ ...input, topicIds: ["percentages"], count: 5 }),
  );
  assert.throws(() =>
    createPractice({ ...input, seen: practiceQuestions.map((q) => q.id) }),
  );
  assert.equal(
    createPractice({
      ...input,
      seen: practiceQuestions.map((q) => q.id),
      allowRepeats: true,
    }).items.length,
    4,
  );
  for (const patch of [
    { count: 0 },
    { seconds: 0 },
    { correct: NaN },
    { penalty: -1 },
  ])
    assert.throws(() => createPractice({ ...input, ...patch }));
});
test("deadlines, fixed-section locks and idempotent submission survive recovery", () => {
  let a = createPractice(input);
  const ids = a.items.map((i) => i.question.id);
  a = {
    ...a,
    navigation: "fixed-sections",
    sections: [
      { id: "first", seconds: 60 },
      { id: "second", seconds: 60 },
    ],
    items: a.items.map((i, n) => ({
      ...i,
      section: n < 2 ? "first" : "second",
    })),
  };
  assert.equal(editable(a, ids[0], 2000), true);
  assert.equal(editable(a, ids[2], 2000), false);
  assert.equal(editable(a, ids[0], 62000), false);
  assert.equal(editable(a, ids[2], 62000), true);
  const restored = JSON.parse(JSON.stringify(a));
  assert.equal(deadline(restored), 121000);
  assert.equal(editable(restored, ids[2], 122000), false);
  assert.throws(() => answer(restored, ids[0], "0", 62000));
  const done = submit(restored, 130000);
  assert.equal(done.submittedAt, 121000);
  assert.deepEqual(submit(done, 150000), done);
  assert.equal(editable(done, ids[2], 100000), false);
});
test("question-level marks and MCQ penalties leave MSQ/NAT unpenalized", () => {
  const a = createPractice({ ...input, count: 30 });
  for (const item of a.items) {
    const q = item.question;
    a.answers[q.id] =
      q.type === "msq"
        ? []
        : q.type === "mcq"
          ? String((Number(q.answer) + 1) % q.options.length)
          : "999999";
  }
  const r = evaluate(a),
    mcq = a.items.filter((i) => i.question.type === "mcq").length;
  assert.ok(Math.abs(r.score + mcq * (2 / 3)) < 1e-8);
  assert.equal(
    r.skipped,
    a.items.filter((i) => i.question.type === "msq").length,
  );
  for (const i of a.items) {
    const q = i.question;
    a.answers[q.id] =
      q.type === "mcq"
        ? q.answer
        : q.type === "msq"
          ? q.answer
          : String(q.answer.min);
  }
  assert.equal(evaluate(a).score, 60);
});
test("tampered snapshots and malformed sync payloads reject without throwing", () => {
  const a = createPractice(input);
  for (const value of [
    null,
    {},
    { ...a, items: [null] },
    { ...a, answers: { unknown: "0" } },
    { ...a, submittedAt: 99999999 },
    {
      ...a,
      items: [
        { ...a.items[0], question: { ...a.items[0].question, answer: "999" } },
      ],
    },
  ])
    assert.equal(validAttempt(value), false);
  assert.equal(
    validVault({ ...emptyVault(), notes: JSON.parse('{"__proto__":"bad"}') }),
    false,
  );
  assert.equal(
    validPayload({ schema: 1, learning: emptyVault(), workspace: {} }),
    false,
  );
});
test("storage revisions reject stale tabs, corruption and quota failure preserve existing work", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage"),
    store = storage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  try {
    const first = readVault(),
      saved = saveVault({ ...first, notes: { a: "Keep me" } }, 0);
    assert.equal(saved.revision, 1);
    assert.throws(() => saveVault({ ...first, notes: { a: "Stale" } }, 0));
    assert.equal(readVault().notes.a, "Keep me");
    store.quota(true);
    assert.throws(() => saveVault({ ...saved, notes: { a: "Lost" } }, 1));
    assert.equal(readVault().notes.a, "Keep me");
    store.quota(false);
    store.setItem(vaultKey, '{"bad":true}');
    assert.throws(() => readVault());
    assert.equal(store.getItem(vaultKey), '{"bad":true}');
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
});
test("result retries do not duplicate saved attempts", () => {
  const a = submit(createPractice(input), 3000);
  const first = addResult(emptyVault(), a);
  assert.equal(addResult(first, a).attempts.length, 1);
  assert.throws(() => addResult(emptyVault(), createPractice(input)));
});
test("owner and origin policy fail closed; revisions cannot be negative or fractional", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  assert.equal(allowedOwner(id, id), true);
  assert.equal(allowedOwner(id, undefined), false);
  assert.equal(allowedOwner("other", id), false);
  assert.equal(sameOrigin("https://evil.test", "https://anvaya.test"), false);
  assert.equal(sameOrigin(null, "https://anvaya.test"), false);
  assert.equal(sameOrigin("https://anvaya.test", "https://anvaya.test"), true);
  assert.equal(parseRevision(-1), null);
  assert.equal(parseRevision(1.1), null);
  assert.equal(parseRevision("1"), null);
  assert.equal(parseRevision(0), 0);
});
test("import moderation rejects missing permissions, editorial review, source keys and diagrams", () => {
  const pack = {
    version: "p1",
    examId: "gate-ee",
    cycle: "2026",
    stage: "paper",
    paperId: "EE",
    language: "en",
    officialPatternVersion: "v1",
    sourceLocator: "Q1",
    checkedOn: "2026-10-15",
    sourceUrl: "https://example.test/paper",
    license: "unresolved",
    review: { status: "pending", reviewer: null, reviewedAt: null },
    questions: [
      {
        id: "q",
        type: "nat",
        stem: "x",
        options: [],
        answer: { min: 2, max: 1 },
        marks: 1,
        explanation: "why",
        sourceQuestionNumber: "1",
        finalKeyUrl: "https://example.test/key",
        figureRequired: true,
        figureAccessible: false,
      },
    ],
  };
  const issues = packIssues(pack);
  assert.ok(issues.some((s) => s.includes("permission")));
  assert.ok(issues.some((s) => s.includes("editorial")));
  assert.ok(issues.some((s) => s.includes("figure")));
  assert.ok(issues.some((s) => s.includes("range")));
});

test("cloud is disabled unless deliberately enabled with complete configuration", async () => {
  const { cloudEnabled } = await import("../lib/platform/auth-policy.ts");
  const configured = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "test-placeholder",
    ANVAYA_OWNER_ID: "test-owner",
    ANVAYA_APP_ORIGIN: "https://anvaya.test",
  };
  for (const flag of [undefined, "false", "TRUE", "1", ""])
    assert.equal(
      cloudEnabled({ ...configured, ANVAYA_CLOUD_ENABLED: flag }),
      false,
    );
  assert.equal(
    cloudEnabled({ ...configured, ANVAYA_CLOUD_ENABLED: "true" }),
    true,
  );
  for (const key of Object.keys(configured))
    assert.equal(
      cloudEnabled({ ...configured, [key]: "", ANVAYA_CLOUD_ENABLED: "true" }),
      false,
    );
});

test("personal study notes, planner and result export restore without cloud and preserve deadlines", async () => {
  const { restoreLocalPayload, clearLocalLearning } =
    await import("../lib/platform/local-data.ts");
  const { workspaceKey, readWorkspace } = await import("../lib/workspace.ts");
  const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    ),
    store = storage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  try {
    let v = saveVault(
      {
        ...emptyVault(),
        notes: { "ssc:percentages": "Use the stated base" },
        completed: ["ssc:percentages"],
      },
      0,
    );
    const attempt = createPractice({
      ...input,
      topicIds: ["percentages"],
      count: 1,
    });
    const submitted = submit(attempt, 3000);
    v = saveVault(addResult(v, submitted), v.revision);
    const payload = {
      schema: 1,
      learning: v,
      workspace: {
        version: 1,
        tasks: [
          {
            id: "task",
            title: "Revise percentages",
            exam: "ssc",
            date: "2026-10-15",
            done: false,
          },
        ],
        papers: { private: { text: "Paper recall", seconds: 42 } },
      },
    };
    const backup = JSON.parse(JSON.stringify(payload));
    assert.equal(validPayload(backup), true);
    clearLocalLearning();
    assert.equal(readVault().attempts.length, 0);
    restoreLocalPayload(backup);
    assert.equal(readVault().notes["ssc:percentages"], "Use the stated base");
    assert.equal(readWorkspace().tasks[0].title, "Revise percentages");
    assert.equal(readWorkspace().papers.private.text, "Paper recall");
    assert.equal(readVault().attempts.length, 1);
    const active = createPractice(input);
    const current = readVault();
    saveVault({ ...current, active }, current.revision);
    assert.throws(() => restoreLocalPayload(backup), /Finish the active/);
    assert.equal(readVault().active.id, active.id);
    clearLocalLearning();
    restoreLocalPayload({
      ...backup,
      learning: { ...backup.learning, active },
    });
    assert.equal(deadline(readVault().active), deadline(active));
    store.setItem(vaultKey, "corrupt");
    clearLocalLearning();
    assert.equal(readVault().attempts.length, 0);
    assert.equal(store.getItem(workspaceKey), null);
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
});
