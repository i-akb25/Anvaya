"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  CalendarDays,
  ArrowRight,
  Search,
  GraduationCap,
} from "lucide-react";
import { exams } from "@/lib/catalog";
import { materials } from "@/lib/materials";
import { studyUnits } from "@/lib/platform/content";
import { examCoverage } from "@/lib/exam-coverage";
import { StudyShell } from "./study-shell";
export function ExamCards({ filter = "" }: { filter?: string }) {
  return (
    <div className="course-grid">
      {exams
        .filter((e) =>
          (e.name + e.group).toLowerCase().includes(filter.toLowerCase()),
        )
        .map((e, i) => (
          <Link
            className="course-card"
            href={e.id === "ssc" ? "/ssc-cgl" : `/classrooms/${e.id}`}
            key={e.id}
          >
            <div className={`course-art art-${i % 4}`}>
              <span className="course-monogram">
                {e.id.startsWith("gate")
                  ? e.id.slice(5).toUpperCase()
                  : e.id.toUpperCase()}
              </span>
              <GraduationCap size={90} strokeWidth={0.7} />
              <span className="art-caption">ANVAYA / EXAM PATHS</span>
            </div>
            <div className="course-card-body">
              <span className="eyebrow">{e.group}</span>
              <h3>{e.name}</h3>
              <p>{e.subjects.length} subject areas · Official source links</p>
              <span className="course-link">
                Explore path <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>
        ))}
    </div>
  );
}
export function Classroom() {
  const [selected, setSelected] = useState("upsc");
  useEffect(() => {
    try {
      const v = localStorage.getItem("anvaya-exam");
      if (v && exams.some((e) => e.id === v)) setSelected(v);
    } catch {}
  }, []);
  const exam = exams.find((e) => e.id === selected)!;
  return (
    <StudyShell>
      <div className="question-actions">
        <Link className="button primary" href="/today">
          Open my study day →
        </Link>
        <Link className="button" href="/search">
          Search all study content →
        </Link>
        <Link className="button" href="/notebook">
          My notebook →
        </Link>
      </div>
      <div className="workspace-top">
        <span className="eyebrow">YOUR LEARNING SPACE</span>
        <span className="local-label">
          <i /> Private · Saved on this device
        </span>
      </div>
      <section className="classroom-hero">
        <div>
          <span className="pill">SHOW UP. GET ONE STEP CLOSER.</span>
          <h1>
            Big ambitions.
            <br />
            <em>Daily progress.</em>
          </h1>
          <p>
            Learn a concept, work through an example, then practise and revisit
            mistakes. Keep your study plan and notes connected.
          </p>
          <div className="hero-controls">
            <label htmlFor="exam-select">My exam</label>
            <select
              id="exam-select"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                try {
                  localStorage.setItem("anvaya-exam", e.target.value);
                } catch {}
              }}
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <Link
              className="button primary"
              href={selected === "ssc" ? "/ssc-cgl" : `/classrooms/${selected}`}
            >
              Open my path <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="study-stack stack-back">UNDERSTAND</div>
          <div className="study-stack stack-front">
            <span>01 / YOUR NEXT CHAPTER</span>
            <BookOpen size={52} strokeWidth={1} />
            <strong>
              Learn with
              <br />
              intent.
            </strong>
            <div className="stack-line" />
            <small>ONE IDEA AT A TIME ↗</small>
          </div>
          <span className="floating-label">
            Small steps. Strong foundations.
          </span>
        </div>
      </section>
      <section className="quick-grid">
        <Link href="/courses">
          <span className="quick-icon">
            <BookOpen />
          </span>
          <div>
            <h3>Learn a concept</h3>
            <p>{exam.name}</p>
          </div>
          <ArrowUpRight />
        </Link>
        <Link href="/papers">
          <span className="quick-icon">
            <FileText />
          </span>
          <div>
            <h3>Previous year papers</h3>
            <p>Read at the official source</p>
          </div>
          <ArrowUpRight />
        </Link>
        <Link href="/planner">
          <span className="quick-icon">
            <CalendarDays />
          </span>
          <div>
            <h3>Plan today’s study</h3>
            <p>Make time for what matters</p>
          </div>
          <ArrowUpRight />
        </Link>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR DIRECTION</span>
            <h2>One workspace. Different ambitions.</h2>
          </div>
          <Link href="/exams">
            All exam paths <ArrowRight size={17} />
          </Link>
        </div>
        <ExamCards />
      </section>
      <section className="editorial-band">
        <span className="eyebrow">A WORKSPACE THAT TELLS YOU WHAT’S READY</span>
        <h2>
          Good preparation starts
          <br />
          with trustworthy material.
        </h2>
        <p>
          Official resources are linked to their publishers. Source-checked
          foundation units and original practice are available. Independent
          human review, complete syllabi, authentic imported PYQ banks and
          official full mocks remain pending.
        </p>
        <Link href="/syllabus">
          Check source coverage <ArrowUpRight size={18} />
        </Link>
      </section>
    </StudyShell>
  );
}
export function ExamDirectory() {
  const [q, setQ] = useState("");
  return (
    <StudyShell>
      <div className="page-heading">
        <span className="eyebrow">EXPLORE EXAMS</span>
        <h1>Find your next chapter.</h1>
        <p>
          Separate paths for every exam. Start with subjects and official
          resources.
        </p>
        <label className="search-field">
          <Search size={19} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search CAT, GATE, banking…"
            aria-label="Search exam paths"
          />
        </label>
      </div>
      <ExamCards filter={q} />
      {!exams.some((e) =>
        (e.name + e.group).toLowerCase().includes(q.toLowerCase()),
      ) && (
        <p className="empty-state">
          No matching exam. Try an exam name or category.
        </p>
      )}
    </StudyShell>
  );
}
export function ExamPath({ id }: { id: string }) {
  const e = exams.find((e) => e.id === id)!,
    coverage = examCoverage.find((c) => c.examId === id)!,
    resources = materials.filter((m) => m.examId === id);
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link href="/exams">Exam paths</Link> / {e.name}
      </div>
      <div className="path-hero">
        <div>
          <span className="eyebrow">{e.group} / YOUR EXAM PATH</span>
          <h1>{e.name}</h1>
          <p>
            Organise your preparation by subject, work through original papers
            and capture what you learn.
          </p>
          <a
            className="button primary"
            href={e.official}
            target="_blank"
            rel="noreferrer"
          >
            Official exam portal <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="path-summary">
          <span className="eyebrow">SOURCE REFERENCE</span>
          <strong>{coverage.cycle}</strong>
          <p>Complete syllabus and exam rules await review.</p>
          <a href={coverage.sourceUrl} target="_blank" rel="noreferrer">
            Read authority source ↗
          </a>
        </div>
      </div>
      {id !== "ssc" && (
        <div className="editorial-band">
          <h2>Your learning classroom</h2>
          <p>
            Open lessons, topic drills, daily study and question-level mistake
            notes for this exam.
          </p>
          <Link className="button primary" href={`/classrooms/${id}`}>
            Open classroom →
          </Link>
        </div>
      )}
      {id === "ssc" && (
        <div className="editorial-band">
          <h2>Your SSC CGL classroom is ready.</h2>
          <p>
            Open worked lessons, topic drills, timed original papers and
            separate DEST practice.
          </p>
          <Link className="button primary" href="/ssc-cgl">
            Open SSC CGL →
          </Link>
        </div>
      )}
      <div className="path-layout">
        <section>
          <div className="section-heading">
            <h2>Subject workspace</h2>
            <span>{e.subjects.length} areas</span>
          </div>
          <p className="muted">
            Planning categories, not a complete verified syllabus. Open a
            subject to plan a session or find external study resources.
          </p>
          <div className="subject-list">
            {e.subjects.map((s, i) => (
              <details key={s}>
                <summary>
                  <span className="subject-no">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s}
                  <span className="subject-open">+</span>
                </summary>
                <div className="subject-content">
                  <p>
                    Bring your textbook or source material, write a short
                    objective, then revise with your own recall notes.
                  </p>
                  <Link
                    href={`/planner?subject=${encodeURIComponent(s)}&exam=${id}`}
                  >
                    Plan a study session →
                  </Link>
                  <Link
                    href={`/lectures?exam=${e.id}${s.includes("Engineering") && s !== "Engineering Mathematics" ? "" : `&subject=${encodeURIComponent(s === "English" ? "English and Comprehension" : s)}`}`}
                  >
                    Open lecture selections →
                  </Link>
                  <small>
                    Publisher-linked selections include source dates and visible
                    coverage gaps.
                  </small>
                </div>
              </details>
            ))}
          </div>
        </section>
        <aside className="path-sidebar">
          <div className="panel">
            <FileText />
            <h3>Original papers</h3>
            {resources.length ? (
              resources.map((m) => (
                <Link
                  key={m.id}
                  href={m.kind === "paper" ? `/study/${m.id}` : "/papers"}
                >
                  {m.title} ↗
                </Link>
              ))
            ) : (
              <>
                <p>A verified paper collection for this exam is pending.</p>
                <a href={e.official} target="_blank" rel="noreferrer">
                  Check the official portal ↗
                </a>
                <Link href="/study/private">
                  Study a PDF from your device →
                </Link>
              </>
            )}
          </div>
          <div className="panel">
            <h3>Learn & apply</h3>
            {studyUnits
              .filter((u) => u.exams.includes(id))
              .map((u) => (
                <Link key={u.slug} href={`/courses/${u.slug}?exam=${id}`}>
                  {u.title} →
                </Link>
              ))}
            <Link href={`/assessments?exam=${id}`}>
              Custom foundation practice →
            </Link>
            <Link href="/syllabus">Paper rules & verification gaps →</Link>
            <p>
              Complete exam curricula and official full mocks are not ready.
            </p>
          </div>
        </aside>
      </div>
    </StudyShell>
  );
}
