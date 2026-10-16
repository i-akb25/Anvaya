import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyVault,
  validVault,
  validPayload,
  readVault,
  saveVault,
} from "../lib/platform/vault.ts";
import {
  emptyWorkspace,
  saveTaskEdit,
  saveWorkspace,
  readWorkspace,
} from "../lib/workspace.ts";
import {
  studyIndex,
  searchStudy,
  noteReviewQueue,
} from "../lib/platform/discovery.ts";
import {
  emptyPersonal,
  validPersonalPack,
  validPersonalPractice,
  importPersonalPack,
  createPersonalAttempt,
  answerPersonal,
  submitPersonal,
  personalScore,
  personalDeadline,
} from "../lib/platform/personal-practice.ts";
import { restoreLocalPayload } from "../lib/platform/local-data.ts";
const pack = {
  schema: 1,
  id: "my-pack",
  version: "v1",
  title: "My original test questions",
  examId: "ssc",
  questions: [
    {
      id: "q1",
      type: "mcq",
      stem: "What is 2 + 3?",
      options: ["4", "5", "6"],
      answer: [1],
      explanation: "Two plus three equals five.",
    },
    {
      id: "q2",
      type: "msq",
      stem: "Select the even numbers.",
      options: ["2", "3", "4"],
      answer: [0, 2],
      explanation: "2 and 4 divide evenly by 2.",
    },
    {
      id: "q3",
      type: "numeric",
      stem: "Enter −2.5.",
      answer: { min: -2.5, max: -2.5 },
      explanation: "The requested decimal is negative two and a half.",
      sourceUrl: "https://example.org/my-source",
    },
  ],
};
function storageTest(run) {
  const desc = Object.getOwnPropertyDescriptor(globalThis, "localStorage"),
    data = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => data.set(k, v),
      removeItem: (k) => data.delete(k),
    },
  });
  try {
    run();
  } finally {
    if (desc) Object.defineProperty(globalThis, "localStorage", desc);
    else delete globalThis.localStorage;
  }
}
test("search defaults to public content, handles aliases and keeps private text out of URLs", () => {
  const v = {
    ...emptyVault(),
    notes: { "ssc:constitutional-rights": "private-marker-8102" },
    personal: { ...emptyPersonal(), packs: [pack] },
  };
  const index = studyIndex(v, {
    ...emptyWorkspace,
    tasks: [
      {
        id: "task1",
        title: "private-task-8102",
        exam: "ssc",
        date: "2026-10-16",
        done: false,
      },
    ],
  });
  assert.ok(
    searchStudy(index, "fundamental rights").some((h) =>
      h.title.toLowerCase().includes("rights"),
    ),
  );
  assert.equal(searchStudy(index, "private-marker-8102").length, 0);
  const hits = searchStudy(index, "private-marker-8102", "ssc", "all", true);
  assert.equal(hits.length, 1);
  assert.ok(hits[0].href.startsWith("/notebook?"));
  assert.ok(!hits[0].href.includes("8102"));
  assert.equal(
    searchStudy(index, "private-marker-8102", "cat", "all", true).length,
    0,
  );
  assert.ok(
    searchStudy(index, "private-task-8102", "ssc", "My plan", true).length,
  );
  assert.ok(
    searchStudy(
      index,
      "My original test questions",
      "ssc",
      "My question pack",
      true,
    ).length,
  );
  assert.ok(searchStudy(index, "KCL").length);
});
test("notebook review contexts include non-lesson topics without leaking across exams", () => {
  const v = {
    ...emptyVault(),
    notes: { "gate-ee:power": "Note" },
    revisionDue: {
      "gate-ee:power": "2026-10-16",
      "ssc:percentages": "2026-10-17",
      "cat:power": "2026-10-01",
    },
  };
  assert.deepEqual(
    noteReviewQueue(v, "all", "2026-10-16").map((r) => r.key),
    ["gate-ee:power"],
  );
  assert.equal(noteReviewQueue(v, "ssc", "2026-10-16").length, 0);
});
test("personal pack validation bounds untrusted JSON and never accepts official metadata as verification", () => {
  assert.equal(validPersonalPack(pack), true);
  for (const patch of [
    { examId: "other" },
    { questions: [] },
    { questions: [pack.questions[0], pack.questions[0]] },
    { questions: [{ ...pack.questions[0], answer: [99] }] },
    { questions: [{ ...pack.questions[0], sourceUrl: "javascript:alert(1)" }] },
    {
      questions: [
        {
          ...pack.questions[0],
          sourceUrl: "https://user:password@example.org",
        },
      ],
    },
    { questions: [{ ...pack.questions[2], answer: { min: 2, max: 1 } }] },
    { questions: [{ ...pack.questions[0], id: "constructor" }] },
  ])
    assert.equal(validPersonalPack({ ...pack, ...patch }), false);
  const p = importPersonalPack(emptyPersonal(), pack);
  assert.equal(importPersonalPack(p, pack).packs.length, 1);
  assert.throws(
    () => importPersonalPack(p, { ...pack, title: "Changed same version" }),
    /new version/,
  );
  assert.equal(
    importPersonalPack(p, { ...pack, version: "v2" }).packs.length,
    2,
  );
  assert.equal(validPersonalPractice({ ...p, results: [{}] }), false);
});
test("personal practice freezes questions, scores MCQ/MSQ/numeric deterministically and retains original deadline", () => {
  let a = createPersonalAttempt(pack, 3, 60, 2, 0.5, 1000);
  assert.equal(a.classification, "personal-unverified");
  assert.equal(new Set(a.questions.map((q) => q.id)).size, 3);
  pack.questions[0].options[0] = "temporarily changed";
  assert.notEqual(
    a.questions.find((q) => q.id === "q1").options[0],
    "temporarily changed",
  );
  pack.questions[0].options[0] = "4";
  a = answerPersonal(a, "q1", [1], 2000);
  a = answerPersonal(a, "q2", [2, 0], 2000);
  a = answerPersonal(a, "q3", "-2.5", 2000);
  assert.equal(personalScore(a).score, 6);
  assert.equal(personalScore(a).correct, 3);
  a = answerPersonal(a, "q1", [0], 3000);
  a = answerPersonal(a, "q2", [0], 3000);
  assert.equal(personalScore(a).score, 1.5);
  assert.throws(() => answerPersonal(a, "q3", "NaN", 3000));
  assert.throws(() => answerPersonal(a, "q1", [1], 61000));
  const resumed = JSON.parse(JSON.stringify(a));
  assert.equal(personalDeadline(resumed), 61000);
  const done = submitPersonal(resumed, 90000);
  assert.equal(done.submittedAt, 61000);
  assert.deepEqual(submitPersonal(done, 95000), done);
  assert.throws(() => answerPersonal(done, "q1", [1], 4000));
  assert.throws(() => createPersonalAttempt(pack, 4, 60, 1, 0, 1000));
});
test("personal attempts and question packs survive backup restore; active practice blocks replacement", () =>
  storageTest(() => {
    const a = createPersonalAttempt(pack, 2, 60, 1, 0, 1000),
      personal = { packs: [pack], active: a, results: [] };
    let v = saveVault({ ...emptyVault(), personal }, 0);
    assert.equal(validVault(v), true);
    assert.throws(
      () =>
        restoreLocalPayload({
          schema: 1,
          learning: emptyVault(),
          workspace: emptyWorkspace,
        }),
      /Finish/,
    );
    const done = submitPersonal(a, 2000);
    v = saveVault(
      { ...v, personal: { ...personal, active: null, results: [done] } },
      v.revision,
    );
    const backup = JSON.parse(
      JSON.stringify({ schema: 1, learning: v, workspace: emptyWorkspace }),
    );
    assert.equal(validPayload(backup), true);
    restoreLocalPayload(backup);
    assert.deepEqual(readVault().personal.results[0].questions, done.questions);
    assert.equal(validVault(emptyVault()), true);
  }));
test("planner task edits preserve newer paper notes and reject stale task snapshots", () =>
  storageTest(() => {
    const baseline = readWorkspace();
    saveWorkspace({
      ...baseline,
      papers: { private: { text: "newer paper note", seconds: 20 } },
    });
    const saved = saveTaskEdit(baseline, {
      ...baseline,
      tasks: [
        {
          id: "a",
          title: "Read",
          exam: "ssc",
          date: "2026-10-16",
          done: false,
        },
      ],
    });
    assert.equal(saved.papers.private.text, "newer paper note");
    assert.throws(
      () => saveTaskEdit(baseline, { ...baseline, tasks: [] }),
      /another tab/,
    );
    assert.equal(readWorkspace().tasks.length, 1);
  }));
