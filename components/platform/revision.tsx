"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  emptyVault,
  readVault,
  type LearningVault,
} from "@/lib/platform/vault";
import { localDay } from "@/lib/platform/recall";
import { studyUnits } from "@/lib/platform/content";
import { evaluate } from "@/lib/platform/engine";
import { ResultReport } from "./assessment";
import { StudyShell } from "../study-shell";
export function ProgressDesk() {
  const [vault, setVault] = useState<LearningVault>(emptyVault()),
    [selected, setSelected] = useState<string | null>(null),
    [status, setStatus] = useState("");
  useEffect(() => {
    try {
      const v = readVault();
      setVault(v);
      setSelected(v.attempts[0]?.id ?? null);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, []);
  const current = vault.attempts.find((a) => a.id === selected),
    latest = new Map<string, { topic: string; exam: string; wrong: boolean }>();
  for (const a of [...vault.attempts].reverse())
    for (const row of evaluate(a).rows)
      latest.set(`${a.examId}:${row.id}`, {
        topic: row.topicId,
        exam: a.examId,
        wrong: row.status !== "correct",
      });
  const missed = [...latest.values()].filter((v) => v.wrong),
    due = Object.entries(vault.revisionDue).filter(
      ([, date]) => date <= localDay(),
    );
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">MAKE THE NEXT ATTEMPT BETTER</span>
        <h1>Progress you can explain.</h1>
        <p>
          Review your saved attempts, return to missed concepts and recall
          completed units. Foundation-practice results do not predict exam ranks
          or readiness.
        </p>
      </div>
      <div className="progress-overview">
        <div className="panel">
          <strong>{vault.completed.length}</strong>
          <p>Completed exam/unit contexts</p>
        </div>
        <div className="panel">
          <strong>{vault.attempts.length}</strong>
          <p>Saved practice attempts</p>
        </div>
        <div className="panel">
          <strong>{due.length}</strong>
          <p>Recall sessions due</p>
        </div>
      </div>
      <div className="path-layout">
        <section>
          <h2>Results</h2>
          {vault.attempts.length ? (
            <label>
              Choose attempt
              <select
                value={selected ?? ""}
                onChange={(e) => setSelected(e.target.value)}
              >
                {vault.attempts.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.examId} · {new Date(a.startedAt).toLocaleString()} ·{" "}
                    {evaluate(a).score.toFixed(2)}/{evaluate(a).maximum}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="empty-state">
              <p>No new practice results yet.</p>
              <Link href="/assessments">Start a concept practice →</Link>
            </div>
          )}
          {current && <ResultReport attempt={current} />}
        </section>
        <aside>
          <div className="panel">
            <h2>Recall queue</h2>
            <Link href="/recall">Open all recall cards →</Link>
            {due.map(([key, date]) => {
              const [exam, slug] = key.split(":"),
                unit = studyUnits.find((u) => u.slug === slug);
              return (
                <div className="revision-item" key={key}>
                  <Link
                    href={
                      unit
                        ? `/courses/${slug}?exam=${exam}`
                        : `/notebook?exam=${exam}&topic=${slug}`
                    }
                  >
                    {unit?.title ?? slug} →
                  </Link>
                  <p>
                    {exam} · Due {date}
                  </p>
                  <Link
                    className="button"
                    href={
                      unit
                        ? `/recall?exam=${exam}`
                        : `/notebook?exam=${exam}&topic=${slug}`
                    }
                  >
                    Recall, reveal & rate →
                  </Link>
                </div>
              );
            })}
            {!due.length && (
              <p>No scheduled recalls due. Complete a unit to schedule one.</p>
            )}
          </div>
          <div className="panel">
            <h2>Revisit missed concepts</h2>
            {[...new Set(missed.map((m) => `${m.exam}:${m.topic}`))].map(
              (key) => {
                const [exam, slug] = key.split(":");
                return (
                  <Link key={key} href={`/courses/${slug}?exam=${exam}`}>
                    {studyUnits.find((u) => u.slug === slug)?.title ?? slug} ·{" "}
                    {exam} →
                  </Link>
                );
              },
            )}
            {!missed.length && <p>No missed questions in saved attempts.</p>}
            <p className="small-copy">
              Based on the latest response to each question within its exam
              context. Unanswered items also return here.
            </p>
          </div>
        </aside>
      </div>
      <p role="status">{status}</p>
      <div className="question-actions">
        <Link href="/account">Account, sync & backups →</Link>
        <Link href="/results/legacy">Earlier practice results →</Link>
      </div>
    </StudyShell>
  );
}
