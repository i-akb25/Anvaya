import test from "node:test";
import assert from "node:assert/strict";
import {
  lectureTopics,
  lectureResources,
  lectureKey,
  resourcesForTopic,
  filterLectureTopics,
  lectureTopicsForSyllabus,
  youtubeEmbed,
} from "../lib/platform/lectures.ts";
import {
  saveLectureProgress,
  parsePosition,
  formatPosition,
} from "../lib/platform/lecture-progress.ts";
import { studyUnits } from "../lib/platform/content.ts";
import { syllabusUnits } from "../lib/platform/syllabus.ts";
import {
  emptyVault,
  readVault,
  saveVault,
  validVault,
  validPayload,
} from "../lib/platform/vault.ts";
import { restoreLocalPayload } from "../lib/platform/local-data.ts";
const state = {
  status: "watching",
  seconds: 125,
  note: "Test note: preserve units.",
  updatedAt: "2026-10-15T17:00:00.000Z",
};
test("catalog has unique actual source links and no silent search-result or blank entries", () => {
  assert.equal(lectureResources.length, 100);
  assert.equal(
    new Set(lectureResources.map((r) => r.id)).size,
    lectureResources.length,
  );
  assert.equal(
    new Set(lectureResources.map((r) => r.url)).size,
    lectureResources.length,
  );
  assert.equal(
    new Set(lectureTopics.map((t) => t.id)).size,
    lectureTopics.length,
  );
  const hosts = [
    "www.youtube.com",
    "ocw.mit.edu",
    "nptel.ac.in",
    "www.khanacademy.org",
    "en.khanacademy.org",
  ];
  for (const r of lectureResources) {
    const u = new URL(r.url),
      evidence = new URL(r.evidenceUrl);
    assert.equal(u.protocol, "https:");
    assert.equal(evidence.protocol, "https:");
    assert.ok(hosts.includes(u.hostname), r.id);
    assert.ok(!/search|results/.test(u.pathname), r.id);
    assert.ok(r.title && r.publisher && r.checkedOn === "2026-10-15");
    assert.ok(
      ["publisher-page", "publisher-linked", "publisher-indexed"].includes(
        r.verification,
      ),
    );
    assert.ok(["English", "Hindi", "Not confirmed"].includes(r.language));
    if (r.youtubeId) assert.match(r.youtubeId, /^[\w-]{11}$/);
    assert.ok(
      lectureTopics.some((t) => t.resourceIds.includes(r.id)),
      r.id,
    );
  }
  for (const t of lectureTopics) {
    assert.ok(t.scope && t.exams.length);
    assert.equal(new Set(t.resourceIds).size, t.resourceIds.length);
    assert.ok(resourcesForTopic(t).every(Boolean));
  }
});
test("all released lessons connect to lecture topics without changing exam contexts", () => {
  for (const unit of studyUnits) {
    const topic = lectureTopics.find((t) => t.lessonSlug === unit.slug);
    assert.ok(topic, unit.slug);
    assert.deepEqual(
      [...topic.exams].sort(),
      [...unit.exams].sort(),
      unit.slug,
    );
    if (unit.version.includes("20261016") || unit.slug.startsWith("ssc-")) {
      assert.equal(topic.resourceIds.length, 0);
      assert.match(topic.scope, /no video/);
    } else assert.ok(topic.resourceIds.length, unit.slug);
  }
  for (const exam of [
    "upsc",
    "bpsc",
    "ssc",
    "sbi",
    "ibps",
    "cat",
    "gate-ee",
    "gate-ec",
    "gate-in",
    "ese",
  ])
    assert.ok(
      filterLectureTopics({ exam, availability: "available" }).length > 0,
      exam,
    );
  assert.ok(
    filterLectureTopics({ exam: "gate-ee" }).some((t) => t.id === "power"),
  );
  assert.ok(
    !filterLectureTopics({ exam: "gate-ec" }).some((t) => t.id === "power"),
  );
  assert.ok(
    filterLectureTopics({ exam: "gate-in" }).some((t) => t.id === "sensors"),
  );
  assert.ok(
    !filterLectureTopics({ exam: "gate-ee" }).some((t) => t.id === "sensors"),
  );
});
test("filters combine on the same resource and preserve honest curriculum gaps", () => {
  assert.ok(
    filterLectureTopics({ query: "  CAPACITORS  ", exam: "gate-ee" }).some(
      (t) => t.id === "capacitor-energy",
    ),
  );
  const hindi = filterLectureTopics({
    language: "Hindi",
    publisher: "Khan Academy",
  });
  assert.deepEqual(
    hindi.map((t) => t.id),
    ["ratios"],
  );
  assert.deepEqual(
    filterLectureTopics({ language: "Hindi", publisher: "MIT OpenCourseWare" }),
    [],
  );
  assert.ok(
    filterLectureTopics({ exam: "bpsc", availability: "gaps" }).some(
      (t) => t.id === "bihar-special",
    ),
  );
  assert.ok(
    !filterLectureTopics({ availability: "available" }).some(
      (t) => t.id === "bihar-special",
    ),
  );
  assert.ok(
    filterLectureTopics({ language: "Not confirmed", publisher: "NPTEL" })
      .length > 0,
  );
  assert.deepEqual(filterLectureTopics({ syllabusId: "missing" }), []);
  for (const row of syllabusUnits) {
    const mapped = lectureTopicsForSyllabus(row);
    assert.ok(mapped.every((t) => t.exams.includes(row.examId)));
    assert.equal(row.complete, false);
    assert.deepEqual(
      filterLectureTopics({ exam: row.examId, syllabusId: row.id }).map(
        (t) => t.id,
      ),
      mapped.map((t) => t.id),
    );
  }
});
test("private lecture updates preserve exam separation and do not mark lessons complete", () => {
  const v = emptyVault(),
    next = saveLectureProgress(v, "ssc", "percentages", "khan-percent", state);
  assert.equal(v.lectures, undefined);
  assert.deepEqual(next.completed, []);
  assert.deepEqual(next.notes, {});
  assert.equal(
    next.lectures[lectureKey("ssc", "percentages", "khan-percent")].seconds,
    125,
  );
  assert.equal(
    next.lectures[lectureKey("cat", "percentages", "khan-percent")],
    undefined,
  );
  assert.throws(() =>
    saveLectureProgress(v, "gate-ec", "power", "nptel-power", state),
  );
  assert.throws(() =>
    saveLectureProgress(v, "ssc", "percentages", "khan-ratio", state),
  );
  for (const patch of [
    { seconds: -1 },
    { seconds: 86401 },
    { seconds: 1.2 },
    { status: "verified" },
    { note: "x".repeat(20001) },
    { updatedAt: "not-a-date" },
  ]) {
    assert.throws(() =>
      saveLectureProgress(v, "ssc", "percentages", "khan-percent", {
        ...state,
        ...patch,
      }),
    );
    assert.equal(
      validVault({ ...v, lectures: { a: { ...state, ...patch } } }),
      false,
    );
  }
  assert.equal(validVault(v), true); // backups predating the new optional field
  assert.equal(validVault(JSON.parse(JSON.stringify(next))), true);
});
test("player URLs permit only known IDs and bounded timestamps", () => {
  const r = lectureResources.find((r) => r.id === "mit-rc");
  assert.equal(
    youtubeEmbed(r, 125),
    "https://www.youtube-nocookie.com/embed/COdQmA9g9S8?start=125&rel=0",
  );
  for (const value of [-1, NaN, Infinity, 1.5, 86401])
    assert.equal(youtubeEmbed(r, value), null);
  assert.equal(youtubeEmbed({ ...r, youtubeId: "bad?autoplay=1" }), null);
  assert.equal(
    youtubeEmbed(lectureResources.find((r) => r.id === "nptel-power")),
    null,
  );
  assert.equal(parsePosition("2", "05"), 125);
  assert.equal(formatPosition(125), "2:05");
  for (const [m, s] of [
    ["-1", "0"],
    ["1.5", "0"],
    ["0", "60"],
    ["Infinity", "0"],
    ["1440", "1"],
    ["", ""],
  ])
    assert.equal(parsePosition(m, s), null);
});
test("lecture notes restore through existing backups and stale tabs cannot overwrite them", () => {
  const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    ),
    map = new Map();
  let quota = false;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => {
        if (quota) throw Error("quota");
        map.set(k, v);
      },
      removeItem: (k) => map.delete(k),
    },
  });
  try {
    const v = saveVault(
      saveLectureProgress(
        emptyVault(),
        "ssc",
        "percentages",
        "khan-percent",
        state,
      ),
      0,
    );
    const payload = {
      schema: 1,
      learning: v,
      workspace: { version: 1, tasks: [], papers: {} },
    };
    assert.equal(validPayload(payload), true);
    restoreLocalPayload(JSON.parse(JSON.stringify(payload)));
    assert.deepEqual(readVault().lectures, v.lectures);
    assert.throws(
      () => saveVault({ ...v, lectures: {} }, v.revision),
      /another tab/,
    );
    assert.deepEqual(readVault().lectures, v.lectures);
    const current = readVault();
    quota = true;
    assert.throws(
      () => saveVault({ ...current, lectures: {} }, current.revision),
      /quota/,
    );
    assert.deepEqual(readVault().lectures, v.lectures);
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
});
