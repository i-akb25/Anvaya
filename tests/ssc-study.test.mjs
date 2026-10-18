import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultSSCStudy,
  validSSCStudy,
  sscMistakes,
  sscDailyPlan,
  sscSubjectProgress,
  createSSCRetry,
  latestSSCResponses,
} from "../lib/platform/ssc-study.ts";
import {
  emptyVault,
  validVault,
  saveVault,
  readVault,
  validPayload,
} from "../lib/platform/vault.ts";
import { sscChapters, sscQuestions } from "../lib/platform/ssc.ts";
import {
  createPractice,
  submit,
  answer,
  validAttempt,
  evaluate,
  deadline,
} from "../lib/platform/engine.ts";
import { claimSSCLaunch } from "../lib/platform/ssc-handoff.ts";
const make = (now = 1000) =>
  createPractice({
    examId: "ssc",
    topicIds: [sscChapters[0].slug],
    count: 3,
    seconds: 180,
    correct: 2,
    penalty: 0.5,
    seen: [],
    allowRepeats: true,
    writerId: "test",
    now,
  });
const entry = (patch = {}) => ({
  note: "Check the units before dividing.",
  reason: "calculation",
  resolved: false,
  doubt: false,
  updatedAt: "2026-10-18T12:00:00Z",
  ...patch,
});
function missedVault() {
  const v = emptyVault(),
    a = submit(make(), 1200);
  v.attempts = [a];
  return v;
}
test("study settings remain optional for old vaults and validate every journal entry", () => {
  assert.equal(validVault(emptyVault()), true);
  const s = defaultSSCStudy();
  assert.equal(validSSCStudy(s), true);
  const id = sscQuestions[0].id;
  s.journal[id] = entry();
  assert.equal(validSSCStudy(s), true);
  for (const patch of [
    { minutes: 19 },
    { minutes: 181 },
    { minutes: 60.5 },
    { section: "bogus" },
    { journal: { constructor: entry() } },
    { journal: { [id]: entry({ note: "x".repeat(4001) }) } },
    { journal: { [id]: entry({ reason: "certified" }) } },
    { journal: { [id]: entry({ updatedAt: "yesterday" }) } },
    { journal: { [id]: entry({ doubt: "true" }) } },
  ])
    assert.equal(
      validSSCStudy({ ...s, ...patch }),
      false,
      JSON.stringify(patch).slice(0, 80),
    );
});
test("latest response follows submission time, improves automatic mistakes, and preserves private doubts", () => {
  const v = missedVault(),
    old = v.attempts[0],
    id = old.items[0].question.id;
  const newer = submit(
    {
      ...old,
      id: "retry",
      startedAt: 2000,
      submittedAt: null,
      answers: { [id]: String(old.items[0].question.answer) },
    },
    2100,
  );
  v.attempts = [old, newer];
  assert.equal(latestSSCResponses(v).get(id).status, "correct");
  assert.equal(sscMistakes(v).find((r) => r.question.id === id).open, false);
  v.sscStudy = {
    ...defaultSSCStudy(),
    journal: { [id]: entry({ doubt: true }) },
  };
  assert.equal(sscMistakes(v).find((r) => r.question.id === id).open, true);
  assert.equal(evaluate(old).skipped, 3);
});
test("manual resolution is reversible and does not rewrite original reports", () => {
  const v = missedVault(),
    id = v.attempts[0].items[0].question.id,
    original = JSON.stringify(v.attempts);
  v.sscStudy = {
    ...defaultSSCStudy(),
    journal: { [id]: entry({ resolved: true }) },
  };
  assert.equal(sscMistakes(v).find((r) => r.question.id === id).open, false);
  v.sscStudy.journal[id].resolved = false;
  assert.equal(sscMistakes(v).find((r) => r.question.id === id).open, true);
  assert.equal(JSON.stringify(v.attempts), original);
});
test("daily plan honours budget, scope, due dates, completion and missed-topic priority", () => {
  const v = missedVault(),
    slug = v.attempts[0].items[0].question.topicId;
  v.sscStudy = { ...defaultSSCStudy(), minutes: 60 };
  v.completed = [`ssc:${slug}`];
  v.revisionDue[`ssc:${slug}`] = "2026-10-17";
  let p = sscDailyPlan(v, "2026-10-18");
  assert.equal(p.tasks[0].kind, "recall");
  assert.equal(p.tasks[1].kind, "mistakes");
  assert.ok(p.tasks.reduce((n, t) => n + t.minutes, 0) <= 60);
  assert.ok(!p.tasks.some((t) => t.kind === "lesson" && t.href.includes(slug)));
  v.sscStudy.section = "statistics";
  p = sscDailyPlan(v, "2026-10-18");
  assert.equal(p.due, 0);
  assert.equal(p.missed, 0);
  assert.ok(
    p.tasks.every((t) =>
      sscChapters.some(
        (c) => c.section === "statistics" && t.href.includes(c.slug),
      ),
    ),
  );
  v.sscStudy.minutes = 20;
  p = sscDailyPlan(v, "2026-10-18");
  assert.equal(p.tasks.length, 1);
  assert.equal(p.tasks[0].minutes, 20);
});
test("subject evidence counts distinct latest answers and separates unanswered", () => {
  const v = missedVault(),
    a = v.attempts[0];
  v.attempts = [a, { ...a, id: "second" }];
  const totals = sscSubjectProgress(v).reduce(
    (n, p) => ({
      observed: n.observed + p.observed,
      unanswered: n.unanswered + p.unanswered,
    }),
    { observed: 0, unanswered: 0 },
  );
  assert.deepEqual(totals, { observed: 3, unanswered: 3 });
});
test("focused retry freezes only selected eligible questions and rejects doubtful, resolved, duplicate and active inputs", () => {
  const v = missedVault(),
    ids = v.attempts[0].items.map((i) => i.question.id),
    now = 3000;
  const a = createSSCRetry(v, ids.slice(0, 2), "retry-tab", now);
  assert.equal(validAttempt(a), true);
  assert.deepEqual(
    a.items.map((i) => i.question.id).sort(),
    ids.slice(0, 2).sort(),
  );
  assert.equal(a.ssc, undefined);
  assert.equal(a.sections[0].seconds, 120);
  assert.equal(a.navigation, "paper");
  assert.equal(deadline(a), 123000);
  assert.equal(
    evaluate(
      answer(
        a,
        a.items[0].question.id,
        String(a.items[0].question.answer),
        now + 1,
      ),
    ).right,
    1,
  );
  assert.equal(
    claimSSCLaunch(
      { ...v, active: a },
      JSON.stringify({ id: a.id, writerId: a.writerId }),
      "destination",
    ).active.writerId,
    "destination",
  );
  for (const list of [[], [ids[0], ids[0]], ["made-up"]])
    assert.throws(() => createSSCRetry(v, list, "tab", now));
  v.sscStudy = {
    ...defaultSSCStudy(),
    journal: {
      [ids[0]]: entry({ doubt: true }),
      [ids[1]]: entry({ resolved: true }),
    },
  };
  for (const id of ids.slice(0, 2))
    assert.throws(() => createSSCRetry(v, [id], "tab", now));
  assert.throws(() =>
    createSSCRetry({ ...v, active: a }, [ids[2]], "tab", now),
  );
});
test("journal survives validated backup and stale writers cannot overwrite it", () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
  };
  const v = missedVault();
  v.sscStudy = {
    ...defaultSSCStudy(),
    journal: { [sscQuestions[0].id]: entry() },
  };
  const saved = saveVault(v, 0);
  assert.deepEqual(readVault().sscStudy, v.sscStudy);
  const payload = JSON.parse(
    JSON.stringify({
      schema: 1,
      learning: saved,
      workspace: { version: 1, tasks: [], papers: {} },
    }),
  );
  assert.equal(validPayload(payload), true);
  assert.throws(
    () => saveVault({ ...v, sscStudy: defaultSSCStudy() }, 0),
    /another tab/,
  );
  assert.deepEqual(readVault().sscStudy, v.sscStudy);
  delete globalThis.localStorage;
});

test("equal timestamp SSC responses prefer the newest saved history entry", () => {
  const v = missedVault(),
    old = v.attempts[0],
    id = old.items[0].question.id;
  v.attempts = [
    {
      ...old,
      id: "new",
      answers: { [id]: String(old.items[0].question.answer) },
    },
    old,
  ];
  assert.equal(latestSSCResponses(v).get(id).status, "correct");
});
