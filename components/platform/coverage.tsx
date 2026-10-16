"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { coverageRows } from "@/lib/platform/coverage";
import { StudyShell } from "../study-shell";
export function CoverageDesk() {
  const [account, setAccount] = useState("Checking…"),
    [tutor, setTutor] = useState("Checking…");
  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) =>
        setAccount(
          d.configured
            ? d.signedIn
              ? "Configured; this owner is signed in"
              : "Configured; not signed in"
            : "OFF: local-only mode",
        ),
      )
      .catch(() =>
        setAccount("Provider unavailable; local study remains available"),
      );
    fetch("/api/tutor", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) =>
        setTutor(
          d.configured
            ? "Configured; authenticated request and budget checks still required"
            : "OFF: no provider calls",
        ),
      )
      .catch(() => setTutor("Availability unknown"));
  }, []);
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">WHAT EXISTS · WHAT STILL NEEDS REVIEW</span>
        <h1>Coverage you can inspect.</h1>
        <p>
          Counts show available material, not readiness, syllabus completion or
          independently human-reviewed content. Shared foundation lessons can
          appear in several exam contexts. No current official full mock or
          imported authenticated PYQ bank is published.
        </p>
      </div>
      <div className="table-scroll">
        <table>
          <caption>Current ten-exam content inventory</caption>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Foundation lessons</th>
              <th>Original questions</th>
              <th>Syllabus outline sections</th>
              <th>Sections with selected primary-source subtopics</th>
              <th>Listed topics without curated video</th>
            </tr>
          </thead>
          <tbody>
            {coverageRows().map((r) => (
              <tr key={r.exam.id}>
                <th scope="row">
                  <Link href={`/exams/${r.exam.id}`}>{r.exam.name}</Link>
                </th>
                <td>{r.lessons}</td>
                <td>{r.questions}</td>
                <td>{r.syllabusSections}</td>
                <td>{r.highlightedSections}</td>
                <td>
                  {r.topicsWithoutVideo}/{r.listedTopics}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="panel">
        <h2>Readiness by requirement</h2>
        <ol>
          <li>
            Official syllabus: versioned references and selected subtopic
            checks. Full ten-track transcription and editorial sign-off pending.
          </li>
          <li>
            Lessons: worked examples, recall and connected practice. Full
            subject and advanced-topic depth pending.
          </li>
          <li>
            Question bank: original source-linked questions with checked keys.
            Independent human review and permitted authentic PYQ ingestion
            pending.
          </li>
          <li>
            Mock engine: custom sectional timing, navigation and marking
            available. Full official simulations are gated on rules, final keys
            and complete paper coverage.
          </li>
          <li>
            Specialised coverage: Bihar basin source reading, constraint
            reasoning and dated affairs selections available. These are limited
            selections.
          </li>
          <li>
            Private PDFs: durable browser storage and original download
            available. Separate device copy required; file bytes are not synced
            in the JSON backup.
          </li>
          <li>
            Quality: automated regression/build/deny-path checks. Live
            multi-device and comprehensive physical-device/accessibility review
            remain separate gates.
          </li>
          <li>
            Accounts and tutor: optional configuration, authenticated isolation
            and budget controls. Live provider verification cannot be inferred
            from a passing local test.
          </li>
        </ol>
      </section>
      <section className="panel">
        <h2>Current service availability</h2>
        <p>Account/sync: {account}</p>
        <p>AI tutor: {tutor}</p>
        <p>
          These flags report configuration, not successful two-device sync or AI
          answer quality.
        </p>
        <div className="question-actions">
          <Link href="/account">Account & backups →</Link>
          <Link href="/library">Private PDFs →</Link>
          <Link href="/current-affairs">Current-affairs journal →</Link>
          <Link href="/mocks">Custom sectional practice →</Link>
          <Link href="/tutor">Optional tutor →</Link>
        </div>
      </section>
    </StudyShell>
  );
}
