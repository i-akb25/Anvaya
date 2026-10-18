import Link from "next/link";
import { StudyShell } from "@/components/study-shell";
import {
  sscSources,
  sscChapters,
  sscQuestions,
  sscRemaining,
  sscNotice,
} from "@/lib/platform/ssc";
import { lectureTopics } from "@/lib/platform/lectures";
export const metadata = {
  title: "SSC CGL · sources and review status | Anvaya",
};
export default function Page() {
  const topics = lectureTopics.filter((t) => t.id.startsWith("ssc-"));
  return (
    <StudyShell>
      <div className="breadcrumbs">
        <Link href="/ssc-cgl">SSC CGL</Link> / Sources & review status
      </div>
      <div className="page-heading">
        <span className="eyebrow">EVIDENCE BEFORE LABELS</span>
        <h1>Know what you are studying.</h1>
        <p>
          {sscChapters.length} original lessons and {sscQuestions.length}{" "}
          original questions. No independently human-reviewed items or
          authenticated imported PYQs are claimed. Author checks, publisher-link
          checks and an official answer key are different evidence levels.
        </p>
      </div>
      <div className="ssc-topic-grid">
        <section className="panel">
          <h2>Rules</h2>
          <p>
            The governing reference is the 2026 notice, §§13.8–13.11. Standard
            and compensatory practice profiles, separate DEST and post-specific
            papers use that reference. Practice subject order is a chosen table
            order, not a certified live exam interface.
          </p>
          <a href={sscNotice} target="_blank" rel="noreferrer">
            Official SSC notice ↗
          </a>
        </section>
        <section className="panel">
          <h2>Questions and keys</h2>
          <p>
            Original questions use authored keys and worked explanations. Source
            links point to concept/rule references; they are not SSC question
            numbers or final keys. Numerical regression checks do not replace
            subject-expert review.
          </p>
          <Link href="/content-review">Inspect a supplied paper pack →</Link>
        </section>
      </div>
      <section>
        <h2>Primary reading register</h2>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>
              Reference availability checked 18 October 2026; not certification
              of all linked chapter contents
            </caption>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Publisher</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody>
              {sscSources.map((s) => (
                <tr key={s.id}>
                  <th>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.title} ↗
                    </a>
                    <p className="small-copy">Record checked {s.checkedOn}</p>
                  </th>
                  <td>{s.publisher}</td>
                  <td>{s.licenseNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="ssc-section">
        <h2>Lecture availability</h2>
        <p>
          {topics.filter((t) => t.resourceIds.length).length} of {topics.length}{" "}
          SSC lesson topics have selected supporting video links. New NIOS
          mathematics links were found on the publisher’s subject table. Video
          fetching was limited; full playback, spoken language and complete
          lesson coverage are not certified. External players load only after
          your action.
        </p>
        <Link className="button" href="/lectures?exam=ssc">
          Browse linked SSC topics →
        </Link>
      </section>
      <section className="ssc-section">
        <h2>Official papers and current-year keys</h2>
        <p>
          The public SSC portal and answer-key index were checked. A directly
          accessible CGL question-paper/final-key pair could not be
          authenticated for import. Other SSC exam keys are not substituted. No
          five-year topic-frequency ranking is claimed without a defined,
          audited paper corpus.
        </p>
        <div className="question-actions">
          <a href="https://ssc.gov.in/" target="_blank" rel="noreferrer">
            SSC portal ↗
          </a>
          <a
            href="https://ssc.gov.in/home/answer-key"
            target="_blank"
            rel="noreferrer"
          >
            Official answer-key index ↗
          </a>
          <Link href="/my-practice">
            Use your permitted private question pack →
          </Link>
        </div>
        <p>
          For a supplied paper, record the exam, year, stage, paper/shift,
          original question number, paper URL, final-key URL and reuse
          permission. A tentative key or recalled coaching question must keep
          that status; importing it does not turn it into an authenticated
          official key.
        </p>
      </section>
      <section className="panel">
        <h2>Remaining external/content approvals</h2>
        <ul>
          {sscRemaining.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </StudyShell>
  );
}
