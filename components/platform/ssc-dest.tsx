"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StudyShell } from "../study-shell";
import {
  createDest,
  destDeadline,
  destReport,
  submitDest,
  typeDest,
  type DestAttempt,
} from "@/lib/platform/ssc-dest";
import {
  emptyVault,
  readVault,
  saveVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { sscNotice } from "@/lib/platform/ssc";
import type { SSCProfile } from "@/lib/platform/ssc-rules";
function Report({ a }: { a: DestAttempt }) {
  const r = useMemo(() => destReport(a), [a]);
  return (
    <article className="panel">
      <h2>DEST practice report</h2>
      <p>
        {r.typed} characters typed · {r.target} target characters · {r.elapsed}{" "}
        seconds
      </p>
      <p>
        {r.edits} character edits needed to match the complete passage. Case,
        spaces, punctuation and line breaks count. Missing remainder counts as
        deletions.
      </p>
      <p>
        Typing rate: {r.wpm.toFixed(1)} five-character words/minute, including
        errors. This is a practice metric, not an SSC result or pass/fail
        decision. Regional evaluation rules are not reproduced here.
      </p>
      <details>
        <summary>Review your saved text</summary>
        <pre className="dest-text">{a.text || "No response"}</pre>
      </details>
    </article>
  );
}
export function DestDesk() {
  const [v, setV] = useState<LearningVault>(emptyVault()),
    [writer, setWriter] = useState(""),
    [ready, setReady] = useState(false),
    [profile, setProfile] = useState<SSCProfile>("standard"),
    [now, setNow] = useState(0),
    [status, setStatus] = useState(""),
    [result, setResult] = useState<DestAttempt | null>(null);
  useEffect(() => {
    setWriter(crypto.randomUUID());
    setNow(Date.now());
    try {
      setV(readVault());
      setReady(true);
    } catch (e) {
      setStatus((e as Error).message);
    }
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const a = v.sscDest?.active,
    owned = a?.writerId === writer;
  function persist(next: LearningVault) {
    try {
      setV(saveVault(next, v.revision));
      setStatus("");
      return true;
    } catch (e) {
      setStatus((e as Error).message);
      return false;
    }
  }
  function finish() {
    if (!a || !owned) return;
    const done = submitDest(a, Date.now());
    if (
      persist({
        ...v,
        sscDest: {
          active: null,
          history: [done, ...(v.sscDest?.history ?? [])].slice(0, 10),
        },
      })
    )
      setResult(done);
  }
  useEffect(() => {
    if (a && owned && now >= destDeadline(a)) finish();
  }, [now, a, owned]);
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link href="/ssc-cgl">SSC CGL</Link> / Separate DEST session
      </div>
      <div className="page-heading">
        <span className="eyebrow">TIER-II · SESSION II</span>
        <h1>Accuracy, one keystroke at a time.</h1>
        <p>
          Original English passage of about 2,000 characters. Start only when
          ready after your objective session and break. Standard duration 15
          minutes; compensatory practice profile 20 minutes. The regional office
          determines actual eligibility and evaluation instructions.
        </p>
        <a href={sscNotice} target="_blank" rel="noreferrer">
          Official notice §13.9 · DEST ↗
        </a>
      </div>
      {!a && (
        <div className="panel">
          <label>
            Timing profile{" "}
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value as SSCProfile)}
            >
              <option value="standard">Standard · 15 minutes</option>
              <option value="compensatory">
                Compensatory practice · 20 minutes
              </option>
            </select>
          </label>
          <p>
            This does not determine accommodation eligibility. Copy by typing;
            paste/drop are disabled in the input as practice aids. This is not
            an anti-cheat system. The original deadline survives reloads and the
            timer continues when this page is closed.
          </p>
          <button
            className="button primary"
            disabled={!ready}
            onClick={() => {
              try {
                if (v.active || v.personal?.active)
                  throw Error("Finish the active objective practice first.");
                const next = createDest(profile, writer, Date.now());
                if (
                  persist({
                    ...v,
                    sscDest: {
                      active: next,
                      history: v.sscDest?.history ?? [],
                    },
                  })
                )
                  setResult(null);
              } catch (e) {
                setStatus((e as Error).message);
              }
            }}
          >
            Start separate DEST session
          </button>
        </div>
      )}
      {a && (
        <>
          <div className="attempt-toolbar">
            <strong role="timer">
              {Math.max(0, Math.ceil((destDeadline(a) - now) / 1000))} seconds
              remaining
            </strong>
            <span>{a.text.length} characters typed</span>
          </div>
          {!owned && (
            <div className="panel">
              <p>
                Resume this saved attempt with its original deadline. Taking
                over prevents an older tab from saving.
              </p>
              <button
                className="button"
                onClick={() => {
                  try {
                    const current = readVault();
                    if (current.sscDest?.active?.id !== a.id)
                      throw Error("Attempt changed; reload first.");
                    setV(
                      saveVault(
                        {
                          ...current,
                          sscDest: {
                            ...current.sscDest,
                            active: {
                              ...current.sscDest.active,
                              writerId: writer,
                            },
                          },
                        },
                        current.revision,
                      ),
                    );
                  } catch (e) {
                    setStatus((e as Error).message);
                  }
                }}
              >
                Take over saved DEST
              </button>
            </div>
          )}
          <div className="ssc-dest-grid">
            <section className="panel">
              <h2>Original reference passage</h2>
              <pre className="dest-text" onCopy={(e) => e.preventDefault()}>
                {a.target}
              </pre>
            </section>
            <section className="panel">
              <label htmlFor="dest-response">
                Type the passage exactly, including paragraph breaks
              </label>
              <textarea
                id="dest-response"
                className="dest-response"
                value={a.text}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                maxLength={4000}
                disabled={!owned || now >= destDeadline(a)}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onChange={(e) => {
                  try {
                    persist({
                      ...v,
                      sscDest: {
                        ...v.sscDest!,
                        active: typeDest(a, e.target.value, Date.now()),
                      },
                    });
                  } catch (err) {
                    setStatus((err as Error).message);
                  }
                }}
              />
              <p className="small-copy">
                Each accepted change saves on this device. Export your workspace
                for a backup.
              </p>
              <button
                className="button primary"
                disabled={!owned}
                onClick={() => {
                  if (window.confirm("Finish and lock this DEST practice?"))
                    finish();
                }}
              >
                Finish DEST
              </button>
            </section>
          </div>
        </>
      )}
      <p role="status">{status}</p>
      {result && <Report a={result} />}
      <section>
        <h2>Saved DEST reports</h2>
        {!v.sscDest?.history.length && <p>No completed sessions yet.</p>}
        {v.sscDest?.history.map((h) => (
          <details key={h.id}>
            <summary>
              {new Date(h.startedAt).toLocaleString()} · {h.profile} ·{" "}
              {h.text.length} characters
            </summary>
            <Report a={h} />
          </details>
        ))}
      </section>
    </StudyShell>
  );
}
