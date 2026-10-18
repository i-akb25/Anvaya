// Runs a production server with deliberately fake provider configuration.
// Tests routing/deny paths only. Does not claim live Supabase/RLS verification.
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
const localOnly = process.argv.includes("--local-only");
const port = 3187,
  origin = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "-p",
    String(port),
    "--hostname",
    "127.0.0.1",
  ],
  {
    env: {
      ...process.env,
      ANVAYA_CLOUD_ENABLED: localOnly ? "false" : "true",
      SUPABASE_URL: "https://not-a-real-anvaya-project.supabase.co",
      SUPABASE_ANON_KEY: "test-public-placeholder",
      ANVAYA_OWNER_ID: "00000000-0000-4000-8000-000000000001",
      ANVAYA_APP_ORIGIN: origin,
      ANVAYA_TUTOR_ENABLED: localOnly ? "false" : "true",
      GEMINI_API_KEY: "test-placeholder-not-a-provider-key",
      ANVAYA_GEMINI_MODEL: "test-placeholder-model",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let ready = false;
let output = "";
child.stdout.on("data", (b) => {
  output += b.toString();
  if (output.includes("Ready")) ready = true;
});
child.stderr.on("data", (b) => {
  output += b.toString();
});
try {
  for (let n = 0; n < 100 && !ready; n++) {
    if (child.exitCode !== null)
      throw Error("Production test server exited before readiness");
    await delay(100);
  }
  assert.equal(ready, true, "Production test server did not become ready");
  for (let i = 1; i <= 8; i++) {
    const r = await fetch(origin + `/assets/ssc/ssc-visual-practice-${i}.svg`);
    assert.equal(r.status, 200, "SSC diagram route");
    assert.match(r.headers.get("content-type") ?? "", /image\/svg\+xml/);
  }
  for (const path of [
    "/",
    "/courses",
    "/courses/ohms-law",
    "/courses/constitutional-rights",
    "/courses/rc-transients",
    "/recall",
    "/classrooms",
    ...[
      "upsc",
      "bpsc",
      "sbi",
      "ibps",
      "cat",
      "gate-ee",
      "gate-ec",
      "gate-in",
      "ese",
    ].flatMap((id) => [`/classrooms/${id}`, `/classrooms/${id}/study`]),
    "/courses/nominal-real-output",
    "/courses/strain-calibration",
    "/lectures/ideal-transformer-ratios",
    "/ssc-cgl",
    "/ssc-cgl/study",
    "/ssc-cgl/dest",
    "/ssc-cgl/sources",
    "/courses/ssc-estimation-detail",
    "/courses/ssc-visual-practice",
    "/courses/ssc-trigonometry",
    "/lectures/ssc-trigonometry",
    "/today",
    "/coverage",
    "/content-review",
    "/library",
    "/current-affairs",
    "/mocks",
    "/tutor",
    "/courses/work-rates",
    "/lectures/work-rates",
    "/search",
    "/notebook",
    "/my-practice",
    "/lectures",
    "/lectures/percentages",
    "/lectures/constitutional-rights",
    "/lectures/rc-transients",
    "/lectures/bihar-special",
    "/syllabus",
    "/assessments",
    "/writing",
    "/account",
    "/results",
    "/results/legacy",
    "/practice",
    "/practice/custom",
    "/topics",
    "/planner",
    "/study/private",
  ]) {
    const r = await fetch(origin + path);
    assert.equal(r.status, 200, path);
    assert.ok(r.headers.get("content-security-policy"));
    assert.equal(r.headers.get("x-content-type-options"), "nosniff");
    const html = await r.text();
    if (path === "/courses")
      assert.equal(
        (html.match(/<article class="paper-card"/g) ?? []).length,
        6,
        "Course library must render a bounded page",
      );
    if (path === "/lectures")
      assert.equal(
        (html.match(/<article class="lecture-topic-row"/g) ?? []).length,
        6,
        "Lecture library must replace, not append pages",
      );
    if (path === "/ssc-cgl" || /^\/classrooms\/[^/]+$/.test(path))
      assert.ok(
        html.includes("Classroom sections") ||
          html.includes("SSC classroom sections") ||
          html.includes("Classroom sections".toLowerCase()),
        "Classrooms expose section navigation",
      );
    if (["/practice", "/practice/custom", "/assessments"].includes(path))
      assert.ok(
        html.includes("Start custom practice"),
        path + " should open the usable practice builder",
      );
    if (path.startsWith("/lectures")) {
      assert.ok(
        !html.includes("<iframe"),
        "External player must not load without consent",
      );
      assert.match(
        r.headers.get("content-security-policy"),
        /frame-src[^;]*https:\/\/www.youtube-nocookie.com/,
      );
    }
    if (path === "/lectures/percentages")
      assert.ok(html.includes("My explanation"));
    if (path === "/lectures/bihar-special")
      assert.ok(html.includes("Lecture curation is pending."));
    if (path === "/today") assert.ok(html.includes("A clear next step."));
    if (path === "/search")
      assert.ok(html.includes("Include my private content"));
    if (path === "/notebook") assert.ok(html.includes("My topic notebook."));
    if (path === "/my-practice") assert.ok(html.includes("My question desk."));
    if (path === "/recall") assert.ok(html.includes("Recall your learning."));
    if (["/topics", "/courses"].includes(path))
      assert.ok(
        html.includes("Start learning"),
        path + " should open usable lessons",
      );
  }
  assert.equal(
    (await fetch(origin + "/lectures/not-a-real-topic")).status,
    404,
  );
  for (const path of [
    "/classrooms/not-an-exam",
    "/classrooms/not-an-exam/study",
  ])
    assert.equal((await fetch(origin + path)).status, 404);
  const tutor = await fetch(origin + "/api/tutor");
  assert.equal(tutor.status, 200);
  assert.equal((await tutor.json()).configured, !localOnly);
  assert.equal(
    (
      await fetch(origin + "/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify({ consent: true }),
      })
    ).status,
    localOnly ? 503 : 401,
  );
  const invalidFeed = await fetch(
    origin + "/api/current-affairs?source=https://evil.example",
  );
  assert.equal(invalidFeed.status, 400);
  const account = await fetch(origin + "/api/account");
  assert.equal(account.status, 200);
  assert.deepEqual(await account.json(), {
    configured: !localOnly,
    signedIn: false,
  });
  assert.match(account.headers.get("cache-control"), /no-store/);
  const sync = await fetch(origin + "/api/sync");
  assert.equal(sync.status, localOnly ? 503 : 401);
  assert.equal((await sync.text()).includes("payload"), false);
  const csrf = await fetch(origin + "/api/account", {
    method: "POST",
    headers: {
      Origin: "https://evil.test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "signin",
      email: "a@example.test",
      password: "unused-test-password",
    }),
  });
  assert.equal(csrf.status, localOnly ? 503 : 403);
  const crossWrite = await fetch(origin + "/api/sync", {
    method: "PUT",
    headers: {
      Origin: "https://evil.test",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(crossWrite.status, localOnly ? 503 : 403);
  const signedOutWrite = await fetch(origin + "/api/sync", {
    method: "PUT",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(signedOutWrite.status, localOnly ? 503 : 401);
  const invalidLogin = await fetch(origin + "/api/account", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(invalidLogin.status, localOnly ? 503 : 400);
  console.log(
    "Production route/header checks and signed-out/origin deny paths passed. Live provider and RLS checks remain pending.",
  );
} finally {
  child.kill("SIGTERM");
  await new Promise((resolve) => {
    if (child.exitCode !== null) resolve();
    else {
      child.once("exit", resolve);
      setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, 3000).unref();
    }
  });
}
