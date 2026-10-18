"use client";
import { useState } from "react";
import { createGateAttempt, gateAvailability } from "@/lib/platform/gate-exam";
import {
  gateRuleSource,
  type GatePaper,
  type GateProfile,
} from "@/lib/platform/gate-rules";
import {
  readVault,
  saveVault,
  seenQuestions,
  type LearningVault,
} from "@/lib/platform/vault";
import { practiceHandoffKey } from "@/lib/platform/practice-handoff";
import Link from "next/link";
export function GateRehearsal({
  paper,
  vault,
}: {
  paper: GatePaper;
  vault: LearningVault;
}) {
  const [profile, setProfile] = useState<GateProfile>("standard"),
    [repeat, setRepeat] = useState(false),
    [status, setStatus] = useState("");
  const availability = gateAvailability(
    paper,
    repeat ? [] : seenQuestions(vault, paper),
  );
  function start() {
    try {
      const v = readVault();
      if (v.revision !== vault.revision)
        throw Error("Workspace changed. Reload before starting.");
      if (v.active || v.personal?.active || v.sscDest?.active)
        throw Error("Finish or resume your active timed session first.");
      const a = createGateAttempt({
        paper,
        profile,
        allowRepeats: repeat,
        seen: seenQuestions(v, paper),
        writerId: crypto.randomUUID(),
        now: Date.now(),
      });
      saveVault({ ...v, active: a }, v.revision);
      try {
        sessionStorage.setItem(
          practiceHandoffKey,
          JSON.stringify({ examId: paper, id: a.id, writerId: a.writerId }),
        );
      } catch {}
      window.location.assign(`/assessments?exam=${paper}`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <div className="panel">
      <h3>GATE · full-count original rehearsal</h3>
      <p>
        65 unique questions · 100 marks · one whole-paper timer. GA 15,
        engineering mathematics 13 and technical 72 marks. MCQs lose one-third
        of their assigned mark for a wrong answer. Wrong MSQ/NAT and blanks
        score 0; MSQ requires the exact set, with no partial credit.
      </p>
      <p className="small-copy">
        Original foundation questions, not PYQs. Difficulty and full subject
        breadth are not calibrated. The nine maths / 46 technical question
        allocation and 1/2-mark assignments are this rehearsal’s choices; only
        the marks split, 65-question total and marking rules follow the source
        pattern.
      </p>
      <label>
        GATE timing profile
        <select
          value={profile}
          onChange={(e) => setProfile(e.target.value as GateProfile)}
        >
          <option value="standard">Standard · 180 minutes</option>
          <option value="compensatory">
            Compensatory practice · 240 minutes
          </option>
        </select>
      </label>
      <p className="small-copy">
        Compensatory practice does not establish accommodation eligibility.
        Consult the official instructions and applicable certificates.
      </p>
      <label className="check-label">
        <input
          type="checkbox"
          checked={repeat}
          onChange={(e) => setRepeat(e.target.checked)}
        />
        Allow questions seen in previous attempts of this paper
      </label>
      <ul>
        {availability.map((r) => (
          <li key={r.domain}>
            {r.title}: {r.available} {repeat ? "available" : "unseen"} /
            {r.required} required
          </li>
        ))}
      </ul>
      <p className="small-copy">
        The GA pool supports one unseen full attempt; later attempts need
        explicit reuse. No duplicate is inserted within a paper, and reshuffling
        does not create a calibrated mock.
      </p>
      <div className="question-actions">
        <button
          className="button primary"
          onClick={start}
          disabled={
            availability.some((r) => r.available < r.required) ||
            !!vault.active ||
            !!vault.personal?.active ||
            !!vault.sscDest?.active
          }
        >
          Start original GATE rehearsal
        </button>
        <Link href="/tools/calculator">Try practice calculator →</Link>
        <a href={gateRuleSource} target="_blank" rel="noreferrer">
          2027 official pattern reference ↗
        </a>
      </div>
      <p role="status">{status}</p>
    </div>
  );
}
