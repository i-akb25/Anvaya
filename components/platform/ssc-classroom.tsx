"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { StudyShell } from "../study-shell";
import {
  sscChapters,
  sscFurtherReading,
  sscNotice,
  sscQuestions,
  sscRemaining,
  sscSections,
  type SSCSection,
} from "@/lib/platform/ssc";
import {
  sscPlan,
  type SSCProfile,
  type SSCStage,
} from "@/lib/platform/ssc-rules";
import { createSSCAttempt } from "@/lib/platform/ssc-exam";
import {
  emptyVault,
  readVault,
  saveVault,
  seenQuestions,
  type LearningVault,
} from "@/lib/platform/vault";
import { ResultReport } from "./assessment";
import { sscHandoffKey } from "@/lib/platform/ssc-handoff";
export function SSCClassroom() {
  const [v, setV] = useState<LearningVault>(emptyVault()),
    [ready, setReady] = useState(false),
    [filter, setFilter] = useState("common"),
    [search, setSearch] = useState(""),
    [stage, setStage] = useState<SSCStage>("tier1"),
    [profile, setProfile] = useState<SSCProfile>("standard"),
    [repeat, setRepeat] = useState(false),
    [status, setStatus] = useState("");
  useEffect(() => {
    try {
      setV(readVault());
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  const rows = sscChapters.filter(
    (c) =>
      (filter === "all" ||
        (filter === "common"
          ? !["statistics", "finance"].includes(c.section)
          : filter === c.section)) &&
      (c.title + " " + c.tags.join(" "))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const complete = sscChapters.filter((c) =>
    v.completed.includes(`ssc:${c.slug}`),
  ).length;
  const next = sscChapters.find(
    (c) =>
      !["statistics", "finance"].includes(c.section) &&
      !v.completed.includes(`ssc:${c.slug}`),
  );
  const plan = sscPlan(stage, profile),
    latest = v.attempts.find((a) => a.ssc);
  function start() {
    try {
      const latestVault = readVault();
      if (
        latestVault.active ||
        latestVault.personal?.active ||
        latestVault.sscDest?.active
      )
        throw Error("Finish or resume your active timed attempt first.");
      if (latestVault.revision !== v.revision)
        throw Error(
          "Workspace changed in another tab. Reload before starting.",
        );
      const attempt = createSSCAttempt({
        stage,
        profile,
        seen: seenQuestions(latestVault, "ssc"),
        allowRepeats: repeat,
        writerId: crypto.randomUUID(),
        now: Date.now(),
      });
      setV(
        saveVault({ ...latestVault, active: attempt }, latestVault.revision),
      );
      try {
        sessionStorage.setItem(
          sscHandoffKey,
          JSON.stringify({ id: attempt.id, writerId: attempt.writerId }),
        );
      } catch {}
      window.location.assign("/assessments?exam=ssc");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <StudyShell>
      <div className="ssc-hero">
        <div>
          <span className="eyebrow">YOUR SSC CGL CLASSROOM · 2026 SCHEME</span>
          <h1>
            Understand it.
            <br />
            Solve it. Recall it.
          </h1>
          <p>
            Work through a lesson, test the idea and return to your mistakes.
            Your notes, completed lessons and practice results stay on this
            device.
          </p>
          <div className="question-actions">
            <Link
              className="button primary"
              href={next ? `/courses/${next.slug}?exam=ssc` : "/recall"}
            >
              {next ? "Continue learning" : "Open revision"}
              <ArrowRight size={17} />
            </Link>
            <a className="button" href="#ssc-rehearsal">
              Timed practice
            </a>
          </div>
        </div>
        <aside className="ssc-progress">
          <BookOpen size={30} />
          <strong>
            {complete}
            <span> / {sscChapters.length}</span>
          </strong>
          <p>Condensed lessons marked complete</p>
          <progress
            value={complete}
            max={sscChapters.length}
            aria-label="SSC lesson completion"
          />
          <small>
            Completion tracks your work, not mastery of the full official
            syllabus.
          </small>
        </aside>
      </div>
      <div className="ssc-quick-links">
        <Link href="/recall">
          <CheckCircle2 size={18} />
          Due revision
        </Link>
        <Link href="/ssc-cgl/study">Study plan & mistake notebook</Link>
        <Link href="/notebook">My notes</Link>
        <Link href="/results">Mistakes & results</Link>
        <Link href="/current-affairs">Current affairs</Link>
        <Link href="/ssc-cgl/sources">Sources & review status</Link>
        <Link href="/ssc-cgl/dest">
          <Clock3 size={18} />
          Separate DEST
        </Link>
      </div>
      {(v.active || v.personal?.active || v.sscDest?.active) && (
        <div className="panel">
          <h2>Resume your timed session</h2>
          <p>Your original deadline continues while away.</p>
          <Link
            className="button primary"
            href={
              v.sscDest?.active
                ? "/ssc-cgl/dest"
                : v.personal?.active
                  ? "/my-practice"
                  : "/assessments"
            }
          >
            Resume saved attempt →
          </Link>
        </div>
      )}
      <section className="ssc-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LEARN → APPLY → REVISE</span>
            <h2>Your topic path</h2>
          </div>
          <span>{sscQuestions.length} original MCQs</span>
        </div>
        <p>
          These are original AI-authored essentials with worked examples and
          recall prompts. They are mapped to the official syllabus, with author
          checks only. Independent review and complete syllabus depth are
          pending. The source notice is a coverage reference, not an answer key.
        </p>
        <div className="library-toolbar">
          <label>
            Subject
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="common">Common papers</option>
              <option value="all">All branches</option>
              {Object.entries(sscSections).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Find a topic
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try triangles, tense or Excel"
            />
          </label>
        </div>
        <div className="ssc-topic-grid">
          {rows.map((c, i) => {
            const done = v.completed.includes(`ssc:${c.slug}`),
              count = sscQuestions.filter((q) => q.topicId === c.slug).length;
            return (
              <article className="ssc-topic-card" key={c.slug}>
                <div className="ssc-card-top">
                  <span className="eyebrow">
                    {sscSections[c.section as SSCSection]}
                  </span>
                  <span
                    aria-label={done ? "Lesson completed" : "Not completed"}
                  >
                    {done ? (
                      <CheckCircle2 size={21} />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                </div>
                <h3>{c.title}</h3>
                <p className="small-copy">{c.tags.join(" · ")}</p>
                <small>
                  20 min reading · {count} original questions ·{" "}
                  {done ? "Completed" : "Ready to learn"}
                </small>
                <div className="question-actions">
                  <Link
                    className="button primary"
                    href={`/courses/${c.slug}?exam=ssc`}
                  >
                    Learn →
                  </Link>
                  <Link href={`/assessments?exam=ssc&topic=${c.slug}`}>
                    Topic drill →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        {!rows.length && <p>No matching topic.</p>}
        <details className="panel">
          <summary>Arithmetic and probability foundations</summary>
          <p>Use these existing worked lessons alongside the SSC path.</p>
          <div className="question-actions">
            {[
              "percentages",
              "percentage-change",
              "ratios",
              "profit-discount",
              "work-rates",
              "relative-speed",
              "simple-interest",
              "compound-interest",
              "probability",
            ].map((slug) => (
              <Link key={slug} href={`/courses/${slug}?exam=ssc`}>
                {slug.replaceAll("-", " ")} →
              </Link>
            ))}
          </div>
        </details>
      </section>
      <section id="ssc-rehearsal" className="ssc-section">
        <span className="eyebrow">COMPLETE-COUNT ORIGINAL PRACTICE</span>
        <h2>Rehearse a paper.</h2>
        <p>
          Questions are original, not PYQs, and difficulty is not calibrated to
          SSC. Subject-table order is a deliberate rehearsal choice; live
          subject-order behaviour is not certified. Common-paper subjects close
          when their timers expire; no return or early skip is allowed. Special
          papers use a single whole-paper timer with free question navigation.
        </p>
        <div className="practice-builder">
          <label>
            Paper
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as SSCStage)}
            >
              <option value="tier1">Tier-I · 100 questions · 200 marks</option>
              <option value="tier2-common">
                Tier-II Paper-I objective · 150 questions · 450 marks
              </option>
              <option value="tier2-statistics">
                Tier-II Statistics · 100 questions · 200 marks
              </option>
              <option value="tier2-finance">
                Tier-II Finance & Economics · 100 questions · 200 marks
              </option>
            </select>
          </label>
          <label>
            Timing profile
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value as SSCProfile)}
            >
              <option value="standard">Standard duration</option>
              <option value="compensatory">
                Compensatory practice duration
              </option>
            </select>
          </label>
          <p>
            {plan.reduce((n, r) => n + r.seconds, 0) / 60} minutes total. The
            compensatory profile is for rehearsal only and does not establish
            eligibility. Correct: +{stage === "tier2-common" ? 3 : 2}; wrong: −
            {stage === "tier2-common" ? "1" : "0.50"}; unanswered: 0.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />
            Allow questions seen in earlier attempts
          </label>
          <p className="small-copy">
            The bank supports a limited number of full papers. Starting another
            may require explicit reuse of previously seen questions; no
            duplicate question is inserted within a paper. Use topic drills
            between rehearsals.
          </p>
          <button
            className="button primary"
            disabled={
              !ready ||
              !!v.active ||
              !!v.personal?.active ||
              !!v.sscDest?.active
            }
            onClick={start}
          >
            Start original SSC rehearsal →
          </button>
        </div>
        <p role="status">{status}</p>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>
              2026 notice §13.8–13.9 · selected practice profile
            </caption>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Questions</th>
                <th>Time</th>
                <th>Maximum</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((r) => (
                <tr key={r.id}>
                  <th>{r.title}</th>
                  <td>{r.count}</td>
                  <td>{r.seconds / 60} min</td>
                  <td>{r.count * (stage === "tier2-common" ? 3 : 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stage === "tier2-common" && (
          <div className="editorial-band">
            <h3>Two sessions, separate outcomes.</h3>
            <p>
              The objective paper has a 390-mark merit portion and a separate
              60-mark qualifying computer component. After the objective
              session, take the re-registration break before starting DEST. The
              notice does not prescribe a break duration here; no countdown runs
              between these practice sessions.
            </p>
            <Link className="button" href="/ssc-cgl/dest">
              Open separate DEST desk →
            </Link>
          </div>
        )}
      </section>
      <section className="ssc-section">
        <h2>Applicable-post papers</h2>
        <p>
          Finance/Economics rehearsal enforces 40 Accounts and 60
          Economics/Governance questions within one shared timer; these
          proportions follow the 80/120-mark syllabus split at two marks per
          question. Verify your post applicability.
        </p>
        <div className="ssc-topic-grid">
          {[
            [
              "statistics",
              "Statistics",
              "For shortlisted JSO / Statistical Investigator Grade-II candidates",
            ],
            [
              "finance",
              "Finance & Economics",
              "For shortlisted Assistant Audit / Accounts Officer candidates",
            ],
          ].map(([id, title, scope]) => (
            <article className="ssc-topic-card" key={id}>
              <h3>{title}</h3>
              <p>{scope}. Verify your applicable post and notification.</p>
              <p>
                Official scheme: 100 questions, 200 marks, 120 minutes standard
                (160 compensatory), +2 / −0.50. These are separate papers, not
                sections of common Paper-I.
              </p>
              <p>
                {
                  sscQuestions.filter((q) =>
                    sscChapters.some(
                      (c) => c.slug === q.topicId && c.section === id,
                    ),
                  ).length
                }{" "}
                original questions and{" "}
                {sscChapters.filter((c) => c.section === id).length} lessons
                available. Full-count original rehearsal is ready; questions are
                author-checked and not independently reviewed or calibrated.
              </p>
              <button
                className="button"
                onClick={() => {
                  setFilter(id);
                  document
                    .querySelector(".library-toolbar")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Open branch lessons →
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setStage(
                    id === "statistics" ? "tier2-statistics" : "tier2-finance",
                  );
                  document
                    .getElementById("ssc-rehearsal")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Configure branch rehearsal →
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="ssc-section">
        <h2>Syllabus, sources and remaining work</h2>
        <p>
          The subject tags above are a condensed study index. Use the official
          syllabus (§13.10–13.11) for the authoritative scope; a completed
          lesson does not certify that every listed subtopic has been taught.
        </p>
        <a className="button" href={sscNotice} target="_blank" rel="noreferrer">
          Read SSC CGL 2026 notice ↗
        </a>
        <div className="ssc-topic-grid">
          <article className="panel">
            <h3>Further reading</h3>
            <ul>
              {sscFurtherReading.map(([title, url]) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {title} ↗
                  </a>
                </li>
              ))}
            </ul>
            <p>
              External resources retain their own access and copyright rules. No
              video is claimed for a topic without a curated link.
            </p>
          </article>
          <article className="panel">
            <h3>Coverage still to finish</h3>
            <ul>
              {sscRemaining.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
            <Link href="/my-practice">Add your permitted question packs →</Link>
          </article>
        </div>
      </section>
      {latest && (
        <section className="ssc-section">
          <h2>Your latest SSC rehearsal</h2>
          <ResultReport attempt={latest} />
        </section>
      )}
    </StudyShell>
  );
}
