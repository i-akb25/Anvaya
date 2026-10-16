"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { exams } from "@/lib/catalog";
import { lectureTopics, lectureResources } from "@/lib/platform/lectures";
import { studyUnits } from "@/lib/platform/content";
import {
  readVault,
  saveVault,
  emptyVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { readWorkspace, emptyWorkspace, type Workspace } from "@/lib/workspace";
import { afterDays, localDay } from "@/lib/platform/recall";
import {
  studyIndex,
  searchStudy,
  noteReviewQueue,
} from "@/lib/platform/discovery";
import { StudyShell } from "../study-shell";
function ExamSelect({
  value,
  onChange,
  all = true,
}: {
  value: string;
  onChange: (v: string) => void;
  all?: boolean;
}) {
  return (
    <label>
      Exam context
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {all && <option value="all">All exams</option>}
        {exams.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
    </label>
  );
}
export function SearchDesk() {
  const [query, setQuery] = useState(""),
    [exam, setExam] = useState("all"),
    [kind, setKind] = useState("all"),
    [privateNotes, setPrivate] = useState(false),
    [limit, setLimit] = useState(20),
    [status, setStatus] = useState("");
  const [v, setV] = useState<LearningVault>(),
    [w, setW] = useState<Workspace>();
  useEffect(() => {
    try {
      setV(readVault());
      setW(readWorkspace());
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  useEffect(() => setLimit(20), [query, exam, kind, privateNotes]);
  const index = studyIndex(v, w),
    rows = searchStudy(index, query, exam, kind, privateNotes);
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">FIND THE NEXT USEFUL THING</span>
        <h1>Your study, connected.</h1>
        <p>
          Search lessons, lecture topics, syllabus outlines and official paper
          links. Include your notes, plans and question packs when you need
          them. Searches stay in this browser.
        </p>
      </div>
      <div className="registry-filters">
        <label>
          Search study content
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fundamental rights, KCL, ratios…"
          />
        </label>
        <ExamSelect value={exam} onChange={setExam} />
        <label>
          Content type
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">Everything</option>
            {[...new Set(index.map((h) => h.kind))].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={privateNotes}
            onChange={(e) => setPrivate(e.target.checked)}
          />{" "}
          Include my private content
        </label>
      </div>
      <p role="status">{status || `${rows.length} matching results`}</p>
      <div className="lecture-topic-list">
        {rows.slice(0, limit).map((h) => (
          <article className="desk-search-row" key={h.id}>
            <span className="eyebrow">
              {h.kind}
              {h.private ? " · PRIVATE" : ""}
            </span>
            <h2>
              <Link href={h.href}>{h.title}</Link>
            </h2>
            <p>
              {h.body.slice(0, 240)}
              {h.body.length > 240 ? "…" : ""}
            </p>
            <small>{h.status}</small>
          </article>
        ))}
      </div>
      {!rows.length && (
        <div className="empty-state">
          No matching material. Try fewer filters or a broader term.
        </div>
      )}
      {rows.length > limit && (
        <button className="button" onClick={() => setLimit(limit + 20)}>
          Show more results
        </button>
      )}
    </StudyShell>
  );
}
export function NotebookDesk() {
  const [vault, setVault] = useState(emptyVault()),
    [exam, setExam] = useState("upsc"),
    [topic, setTopic] = useState("percentages"),
    [note, setNote] = useState(""),
    [query, setQuery] = useState(""),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState("");
  const key = `${exam}:${topic}`,
    dirty = note !== (vault.notes[key] ?? ""),
    current = lectureTopics.find(
      (t) => t.id === topic && t.exams.includes(exam),
    );
  useEffect(() => {
    const q = new URLSearchParams(location.search),
      ex = exams.some((e) => e.id === q.get("exam")) ? q.get("exam")! : "upsc",
      t =
        lectureTopics.find(
          (t) => t.id === q.get("topic") && t.exams.includes(ex),
        ) ?? lectureTopics.find((t) => t.exams.includes(ex))!;
    setExam(ex);
    setTopic(t.id);
    try {
      const v = readVault();
      setVault(v);
      setNote(v.notes[`${ex}:${t.id}`] ?? "");
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function leave() {
    return !dirty || window.confirm("Leave without saving this note?");
  }
  function choose(ex: string, id: string) {
    if (!leave()) return;
    setExam(ex);
    setTopic(id);
    setNote(vault.notes[`${ex}:${id}`] ?? "");
    setStatus("");
  }
  function save(days?: number) {
    try {
      const next = saveVault(
        {
          ...vault,
          notes: { ...vault.notes, [key]: note },
          revisionDue: days
            ? { ...vault.revisionDue, [key]: afterDays(days) }
            : vault.revisionDue,
        },
        vault.revision,
      );
      setVault(next);
      setStatus(
        days
          ? `Saved. Review scheduled for ${next.revisionDue[key]}.`
          : "Note saved in this browser.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  const topics = lectureTopics.filter(
    (t) =>
      t.exams.includes(exam) &&
      `${t.title} ${t.subject}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">THINK IN YOUR OWN WORDS</span>
        <h1>My topic notebook.</h1>
        <p>
          One note for each topic and exam context. These are your personal
          explanations, separate from publisher material. Notes are included in
          workspace backups.
        </p>
      </div>
      <div className="lecture-reader-layout">
        <aside className="lecture-outline">
          <ExamSelect
            value={exam}
            all={false}
            onChange={(ex) =>
              choose(ex, lectureTopics.find((t) => t.exams.includes(ex))!.id)
            }
          />
          <label>
            Find a topic
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <ol>
            {topics.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => choose(exam, t.id)}
                  aria-current={topic === t.id ? "step" : undefined}
                >
                  {t.title}
                  {vault.notes[`${exam}:${t.id}`]?.trim()
                    ? " · Note saved"
                    : ""}
                </button>
              </li>
            ))}
          </ol>
        </aside>
        <section className="lecture-workspace">
          <h2>{current?.title}</h2>
          <p>
            {current?.subject} · {exam}
          </p>
          <label>
            My topic note
            <textarea
              className="answer-editor"
              value={note}
              disabled={!ready}
              maxLength={100000}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain the idea, add a worked example, record a source or a doubt…"
            />
          </label>
          <div className="question-actions">
            <button
              className="button primary"
              disabled={!ready}
              onClick={() => save()}
            >
              Save note
            </button>
            <button
              className="button"
              disabled={!ready || !note.trim()}
              onClick={() => save(1)}
            >
              Save & review tomorrow
            </button>
            <button
              className="button"
              disabled={!ready || !note.trim()}
              onClick={() => save(7)}
            >
              Save & review in 7 days
            </button>
            <button
              className="button"
              onClick={() => {
                if (!leave()) return;
                try {
                  const v = readVault();
                  setVault(v);
                  setNote(v.notes[key] ?? "");
                  setReady(true);
                  setStatus("Latest saved data loaded.");
                } catch (e) {
                  setStatus((e as Error).message);
                }
              }}
            >
              Reload saved note
            </button>
          </div>
          <p role="status">{status}</p>
          <div className="question-actions">
            <Link
              href={`/lectures/${topic}?exam=${exam}`}
              onClick={(e) => {
                if (!leave()) e.preventDefault();
              }}
            >
              Topic lectures →
            </Link>
            {studyUnits.some((u) => u.slug === topic) && (
              <Link
                href={`/courses/${topic}?exam=${exam}`}
                onClick={(e) => {
                  if (!leave()) e.preventDefault();
                }}
              >
                Worked lesson →
              </Link>
            )}
            <Link
              href="/account"
              onClick={(e) => {
                if (!leave()) e.preventDefault();
              }}
            >
              Export study backup →
            </Link>
          </div>
          <p className="small-copy">
            Saving a note or setting a review date does not mark the syllabus
            complete.
          </p>
        </section>
      </div>
    </StudyShell>
  );
}
export function TodayDesk() {
  const [v, setV] = useState(emptyVault()),
    [w, setW] = useState<Workspace>(emptyWorkspace),
    [exam, setExam] = useState("all"),
    [today, setToday] = useState(""),
    [status, setStatus] = useState("");
  useEffect(() => {
    try {
      setV(readVault());
      setW(readWorkspace());
    } catch (e) {
      setStatus((e as Error).message);
    }
    setToday(localDay());
  }, []);
  const due = noteReviewQueue(v, exam, today),
    tasks = w.tasks
      .filter(
        (t) =>
          !t.done && (exam === "all" || t.exam === exam) && t.date <= today,
      )
      .sort((a, b) => a.date.localeCompare(b.date)),
    lectures = Object.entries(v.lectures ?? {})
      .filter(
        ([key, s]) =>
          s.status === "watching" &&
          (exam === "all" || key.startsWith(`${exam}:`)),
      )
      .sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))
      .slice(0, 3);
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">{today || "YOUR STUDY DAY"}</span>
        <h1>A clear next step.</h1>
        <p>
          Return to unfinished practice, today’s plan and concepts due for
          review. Everything here comes from your saved work on this device.
        </p>
      </div>
      <ExamSelect value={exam} onChange={setExam} />
      <p role="status">{status}</p>
      <div className="progress-overview">
        <div className="panel">
          <strong>{tasks.length}</strong>
          <p>Planned sessions due</p>
        </div>
        <div className="panel">
          <strong>{due.length}</strong>
          <p>Concepts scheduled for review</p>
        </div>
        <div className="panel">
          <strong>
            {
              v.completed.filter(
                (k) => exam === "all" || k.startsWith(`${exam}:`),
              ).length
            }
          </strong>
          <p>Completed foundation contexts</p>
        </div>
      </div>
      {v.active && (
        <section className="editorial-band">
          <h2>Finish your concept practice.</h2>
          <p>{v.active.examId} · Original timer remains in effect.</p>
          <Link className="button primary" href="/assessments">
            Resume practice →
          </Link>
        </section>
      )}
      {v.personal?.active && (
        <section className="editorial-band">
          <h2>Resume {v.personal.active.pack.title}</h2>
          <p>Personal question pack · original deadline preserved.</p>
          <Link className="button primary" href="/my-practice">
            Resume personal practice →
          </Link>
        </section>
      )}
      <div className="path-layout">
        <section>
          <h2>Your plan</h2>
          {tasks.slice(0, 8).map((t) => (
            <article className="desk-search-row" key={t.id}>
              <h3>{t.title}</h3>
              <p>
                {t.exam} · {t.date}
                {t.date < today ? " · Overdue" : ""}
              </p>
              <Link href="/planner">Open planner →</Link>
            </article>
          ))}
          {!tasks.length && (
            <p>
              No pending sessions due. Add a focused session to your planner.
            </p>
          )}
          <Link className="button" href="/planner">
            Plan a session →
          </Link>
          <h2>Continue watching</h2>
          {lectures.map(([key, s]) => {
            const [ex, topic, id] = key.split(":"),
              resource = lectureResources.find((r) => r.id === id),
              t = lectureTopics.find((t) => t.id === topic);
            return resource && t ? (
              <article className="desk-search-row" key={key}>
                <Link href={`/lectures/${topic}?exam=${ex}&resource=${id}`}>
                  {resource.title} →
                </Link>
                <p>
                  {ex} · Saved at {Math.floor(s.seconds / 60)}:
                  {String(s.seconds % 60).padStart(2, "0")}
                </p>
              </article>
            ) : null;
          })}
          {!lectures.length && <p>No lecture marked as watching.</p>}
        </section>
        <aside>
          <div className="panel">
            <h2>Review queue</h2>
            {due.slice(0, 10).map((r) => (
              <p key={r.key}>
                <Link href={`/notebook?exam=${r.exam}&topic=${r.topic.id}`}>
                  {r.topic.title} →
                </Link>
                <small>
                  {" "}
                  {r.exam} · Due {r.date}
                </small>
              </p>
            ))}
            {!due.length && (
              <p>
                No concepts due. Schedule a review from a lesson or your
                notebook.
              </p>
            )}
            <Link href="/recall">Foundation recall cards →</Link>
          </div>
          <div className="panel">
            <h2>Study tools</h2>
            <p>
              <Link href="/search">Search learning & my notes →</Link>
            </p>
            <p>
              <Link href="/notebook">My topic notebook →</Link>
            </p>
            <p>
              <Link href="/my-practice">
                Build practice with my questions →
              </Link>
            </p>
            <p>
              <Link href="/account">Back up my work →</Link>
            </p>
          </div>
        </aside>
      </div>
    </StudyShell>
  );
}
