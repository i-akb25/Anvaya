"use client";
import { useEffect, useState } from "react";
import { exams } from "@/lib/catalog";
import { StudyShell } from "../study-shell";
import {
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import {
  publishedBriefings,
  officialReadingSources,
  validBriefing,
  type Briefing,
} from "@/lib/platform/briefings";
import type { NewsHeadline } from "@/lib/platform/news-feed";
import { localDay } from "@/lib/platform/recall";
export function BriefingDesk() {
  const [feed, setFeed] = useState<NewsHeadline[]>([]),
    [feedStatus, setFeedStatus] = useState(""),
    [loadingFeed, setLoadingFeed] = useState(false);
  async function loadFeed(source: "rbi" | "pib") {
    setLoadingFeed(true);
    setFeed([]);
    try {
      const r = await fetch(`/api/current-affairs?source=${source}`);
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      if (!Array.isArray(data.items)) throw Error("Invalid feed response");
      setFeed(data.items);
      setFeedStatus(
        `${data.title}: metadata fetched ${data.checkedAt}. Cached for up to 15 minutes; individual stories have not been reviewed.`,
      );
    } catch (e) {
      setFeedStatus((e as Error).message);
    } finally {
      setLoadingFeed(false);
    }
  }
  const [v, setV] = useState<LearningVault>(emptyVault()),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState(""),
    [exam, setExam] = useState("all"),
    [query, setQuery] = useState(""),
    [day, setDay] = useState(""),
    [editing, setEditing] = useState<Briefing | null>(null),
    [ack, setAck] = useState(false);
  useEffect(() => {
    try {
      setV(readVault());
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
    setDay(localDay());
  }, []);
  const own = v.briefings ?? [],
    rows = [
      ...publishedBriefings.map((b) => ({ ...b, private: false })),
      ...own.map((b) => ({ ...b, private: true })),
    ]
      .filter(
        (b) =>
          (exam === "all" || b.exams.includes(exam)) &&
          (b.title + " " + b.summary)
            .toLowerCase()
            .includes(query.toLowerCase()),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  function save() {
    if (!editing) return;
    if (!validBriefing(editing)) {
      setStatus(
        "Check dates, HTTPS source, exam context, title, summary and correction note. Checked date cannot precede the event/source date.",
      );
      return;
    }
    if (editing.status !== "draft" && !ack) {
      setStatus(
        "Open and check the source before marking your private entry reviewed.",
      );
      return;
    }
    try {
      const entries = own.some((b) => b.id === editing.id)
        ? own.map((b) => (b.id === editing.id ? editing : b))
        : [editing, ...own];
      setV(saveVault({ ...v, briefings: entries }, v.revision));
      setEditing(null);
      setStatus(
        "Private briefing saved. Nothing was published or sent to a provider.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">READ · CHECK · CONNECT</span>
        <h1>Current affairs, with a source.</h1>
        <p>
          Dated reading selections and a private review journal. This is a
          curated snapshot, not a live or exhaustive daily news feed. Public
          selections have AI source checks; independent human review is pending.
        </p>
      </div>
      <section className="panel">
        <h2>Discover at the official publisher</h2>
        <p>
          Load up to 20 RSS headlines from RBI or PIB. Anvaya fetches public
          metadata; your notes and searches are not sent. Feed items are
          unreviewed, and publisher outages are shown explicitly.
        </p>
        <div className="question-actions">
          <button
            className="button"
            disabled={loadingFeed}
            onClick={() => loadFeed("rbi")}
          >
            Load RBI headlines
          </button>
          <button
            className="button"
            disabled={loadingFeed}
            onClick={() => loadFeed("pib")}
          >
            Load PIB headlines
          </button>
        </div>
        <p role="status">{feedStatus}</p>
        {feed.map((item) => (
          <article className="revision-item" key={item.url}>
            <p>
              {item.publishedAt.slice(0, 10)} · Unreviewed publisher metadata
            </p>
            <h3>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.title} ↗
              </a>
            </h3>
            <button
              className="button"
              disabled={!ready || own.length >= 100}
              onClick={() => {
                setEditing({
                  id: `brief-${crypto.randomUUID()}`,
                  version: 1,
                  title: item.title.slice(0, 200),
                  date: item.publishedAt.slice(0, 10),
                  sourceUrl: item.url,
                  summary: "",
                  exams: [exam === "all" ? "upsc" : exam],
                  status: "draft",
                  checkedOn: day,
                  correction: "",
                  recall: "",
                });
                setAck(false);
              }}
            >
              Draft my reviewed summary
            </button>
          </article>
        ))}
      </section>
      <div className="content-provenance">
        <strong>Selection last checked 16 October 2026</strong>
        <p>
          Always open the publisher for later corrections. A government release
          reports its issuer's claims; it is not independent impact evaluation.
          Private reviewed entries reflect your own check.
        </p>
      </div>
      <div className="library-toolbar">
        <label>
          Search briefings
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          Exam
          <select value={exam} onChange={(e) => setExam(e.target.value)}>
            <option value="all">All exams</option>
            {exams.map((e) => (
              <option value={e.id} key={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p role="status">{status}</p>
      <div className="question-actions">
        <button
          className="button"
          disabled={!ready || own.length >= 100}
          onClick={() => {
            setEditing({
              id: `brief-${crypto.randomUUID()}`,
              version: 1,
              title: "",
              date: day,
              sourceUrl: "",
              summary: "",
              exams: [exam === "all" ? "upsc" : exam],
              status: "draft",
              checkedOn: day,
              correction: "",
              recall: "",
            });
            setAck(false);
          }}
        >
          Add private briefing
        </button>
        <button
          className="button"
          onClick={() => {
            try {
              setV(readVault());
              setReady(true);
              setStatus("Latest saved journal loaded.");
            } catch (e) {
              setStatus((e as Error).message);
            }
          }}
        >
          Reload saved journal
        </button>
      </div>
      {editing && (
        <section className="panel">
          <h2>
            {own.some((b) => b.id === editing.id)
              ? "Revise private entry"
              : "New private entry"}
          </h2>
          <label>
            Title
            <input
              maxLength={200}
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
            />
          </label>
          <label>
            Source or event date
            <input
              type="date"
              value={editing.date}
              onChange={(e) => setEditing({ ...editing, date: e.target.value })}
            />
          </label>
          <label>
            Checked on
            <input
              type="date"
              value={editing.checkedOn}
              onChange={(e) =>
                setEditing({ ...editing, checkedOn: e.target.value })
              }
            />
          </label>
          <label>
            Source URL
            <input
              type="url"
              value={editing.sourceUrl}
              maxLength={2000}
              onChange={(e) =>
                setEditing({ ...editing, sourceUrl: e.target.value })
              }
            />
          </label>
          <label>
            Exam context
            <select
              value={editing.exams[0]}
              onChange={(e) =>
                setEditing({ ...editing, exams: [e.target.value] })
              }
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            My original summary
            <textarea
              maxLength={3000}
              value={editing.summary}
              onChange={(e) =>
                setEditing({ ...editing, summary: e.target.value })
              }
            />
          </label>
          <label>
            Recall question
            <input
              maxLength={1000}
              value={editing.recall}
              onChange={(e) =>
                setEditing({ ...editing, recall: e.target.value })
              }
            />
          </label>
          <label>
            Review status
            <select
              value={editing.status}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  status: e.target.value as Briefing["status"],
                })
              }
            >
              {["draft", "reviewed", "corrected", "withdrawn"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Correction or withdrawal reason
            <textarea
              maxLength={1000}
              value={editing.correction}
              onChange={(e) =>
                setEditing({ ...editing, correction: e.target.value })
              }
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            I opened the source, checked my summary and understand this remains
            my private review.
          </label>
          <div className="question-actions">
            <button className="button primary" onClick={save}>
              Save private briefing
            </button>
            <button className="button" onClick={() => setEditing(null)}>
              Cancel edit
            </button>
          </div>
        </section>
      )}
      <div className="search-results">
        {rows.map((b) => (
          <article className="search-result" key={`${b.private}:${b.id}`}>
            <span className="eyebrow">
              {b.date} ·{" "}
              {b.private ? "My private entry" : "AI source-checked selection"} ·{" "}
              {b.status}
            </span>
            <h2>{b.title}</h2>
            {b.status === "withdrawn" ? (
              <p>
                This entry is withdrawn. Do not use its prior summary for
                revision.
              </p>
            ) : (
              <p>{b.summary}</p>
            )}
            {b.correction && (
              <p>
                <strong>Correction:</strong> {b.correction}
              </p>
            )}
            <a href={b.sourceUrl} target="_blank" rel="noreferrer">
              Open original source ↗
            </a>
            <p className="muted">
              Checked {b.checkedOn} · version{b.version}
            </p>
            {b.recall && b.status !== "withdrawn" && (
              <details>
                <summary>Recall prompt</summary>
                <p>{b.recall}</p>
              </details>
            )}
            {b.private && (
              <button
                className="button"
                onClick={() => {
                  setEditing({ ...b, version: b.version + 1 });
                  setAck(false);
                }}
              >
                Revise or withdraw
              </button>
            )}
          </article>
        ))}
      </div>
      <h2>Keep reading at the publisher</h2>
      {officialReadingSources.map((s) => (
        <p key={s.url}>
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.title} ↗
          </a>
        </p>
      ))}
    </StudyShell>
  );
}
