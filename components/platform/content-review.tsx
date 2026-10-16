"use client";
import { useState } from "react";
import Link from "next/link";
import { packIssues } from "@/lib/platform/moderation";
import { patterns } from "@/lib/platform/registry";
import { StudyShell } from "../study-shell";
export function ContentReview() {
  const [status, setStatus] = useState(""),
    [issues, setIssues] = useState<string[] | null>(null),
    [name, setName] = useState("");
  async function check(file?: File) {
    if (!file) return;
    setName(file.name);
    setIssues(null);
    try {
      if (file.size > 2_000_000) throw Error("Choose a pack under 2 MB.");
      const p: unknown = JSON.parse(await file.text());
      const errors = packIssues(p);
      setIssues(errors);
      setStatus(
        "Local validation finished. No content was uploaded or published.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function template() {
    const value = {
      version: "draft-v1",
      examId: "gate-ee",
      cycle: "2027",
      stage: "paper",
      paperId: "replace-with-official-paper-id",
      language: "English",
      officialPatternVersion: patterns.find((p) => p.examId === "gate-ee")!
        .version,
      license: "unresolved",
      sourceUrl: "https://replace-with-publisher.example/paper",
      sourceLocator: "Replace with paper page and question range",
      checkedOn: "2026-10-16",
      review: { status: "pending", reviewer: null, reviewedAt: null },
      questions: [],
    };
    const u = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "anvaya-question-pack-draft.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">SOURCE → RIGHTS → KEY → REVIEW</span>
        <h1>Review before publication.</h1>
        <p>
          A local preflight for question-pack metadata, answer formats and
          missing provenance. Passing validation is not proof of authenticity,
          permission or human review. This tool cannot publish to Anvaya.
        </p>
      </div>
      <section className="panel">
        <h2>Question-pack preflight</h2>
        <p>
          Prepare material only when you have redistribution permission. A
          publicly downloadable paper is not automatically licensed for
          rehosting. Use publisher links when rights are unresolved.
        </p>
        <label>
          Choose reviewed-pack JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              check(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <button className="button" onClick={template}>
          Download empty draft template
        </button>
        <p role="status">{status}</p>
        {issues && (
          <>
            <h3>
              {name}:{" "}
              {issues.length
                ? `${issues.length} issues found`
                : "Schema checks passed"}
            </h3>
            {issues.length ? (
              <ul>
                {issues.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p>
                Now independently confirm the source, redistribution rights,
                every answer, accepted range, required figure and full pattern
                coverage. The pack remains unpublished.
              </p>
            )}
          </>
        )}
      </section>
      <section className="panel">
        <h2>Editorial release requirements</h2>
        <ol>
          <li>
            Record the official paper, stage, year, language and question
            numbers.
          </li>
          <li>
            Resolve redistribution permission. Keep link-only material at its
            publisher.
          </li>
          <li>
            Compare every key against the final official key, including
            corrections and accepted numerical ranges.
          </li>
          <li>Provide readable required figures and original explanations.</li>
          <li>
            Record the named reviewer and date. A name typed into JSON is a
            claim that still needs verification.
          </li>
          <li>
            Commit an approved version through repository review, run
            deterministic scoring fixtures and match the complete pattern before
            enabling any official simulation.
          </li>
        </ol>
        <div className="question-actions">
          <Link href="/coverage">Inspect coverage →</Link>
          <Link href="/my-practice">Private supplied-key practice →</Link>
          <Link href="/papers">Official paper links →</Link>
        </div>
      </section>
    </StudyShell>
  );
}
