import type { SSCProfile } from "./ssc-rules.ts";
export const destPassages = [
  {
    id: "study-centre-v1",
    title: "A community study centre",
    text: [
      "The community study centre opened its doors at eight each morning. Before the first visitors arrived, the coordinator checked the reading lamps, arranged the chairs and placed a fresh sheet beside the entrance. Visitors could write the subject they planned to study and the time they expected to leave. This simple record helped the team understand when the room was busiest without collecting unnecessary personal details.",
      "One table was reserved for quiet individual work. Another was used for small discussions during a fixed afternoon hour. The rules were displayed near both tables so that a new visitor did not have to guess what was expected. People kept their phones on silent and returned shared books to a labelled shelf. If a page was damaged, they reported it rather than trying to hide the problem from the next reader.",
      "On Saturdays, volunteers reviewed the week's activities. They compared the number of visits with the number of available seats, but did not assume that every visit represented a different person. They also asked readers whether the opening hours were useful. A longer opening day was considered only after checking staffing, lighting and travel arrangements. A popular suggestion was recorded as a proposal until the practical details were settled.",
      "The centre encouraged learners to divide large goals into manageable tasks. A useful task named a chapter, a short exercise and a point to revise later. Finishing a task meant checking the answer and explaining the method, not simply turning a page. When a learner made an error, the notebook recorded why the method failed and what evidence would support a better answer. Progress was measured through careful practice over time.",
      "At closing time, the last group returned the books, cleared the desks and checked that no belongings had been left behind. The coordinator saved the daily record and switched off the equipment. The next morning began with a clean room and a clear plan.",
    ].join("\n\n"),
  },
];
export type DestAttempt = {
  id: string;
  version: 1;
  passageId: string;
  target: string;
  profile: SSCProfile;
  seconds: number;
  startedAt: number;
  submittedAt: number | null;
  text: string;
  writerId: string;
};
export type DestStore = { active: DestAttempt | null; history: DestAttempt[] };
export function createDest(
  profile: SSCProfile,
  writerId: string,
  now: number,
): DestAttempt {
  if (
    !["standard", "compensatory"].includes(profile) ||
    !Number.isFinite(now) ||
    now < 0 ||
    !writerId
  )
    throw Error("Invalid DEST settings.");
  const passage = destPassages[0];
  return {
    id: crypto.randomUUID(),
    version: 1,
    passageId: passage.id,
    target: passage.text,
    profile,
    seconds: profile === "standard" ? 900 : 1200,
    startedAt: now,
    submittedAt: null,
    text: "",
    writerId,
  };
}
export function destDeadline(a: DestAttempt) {
  return a.startedAt + a.seconds * 1000;
}
export function validDest(value: unknown): value is DestAttempt {
  if (!value || typeof value !== "object") return false;
  const a = value as DestAttempt;
  return (
    a.version === 1 &&
    typeof a.id === "string" &&
    a.id.length > 0 &&
    typeof a.writerId === "string" &&
    a.writerId.length > 0 &&
    destPassages.some((p) => p.id === a.passageId && p.text === a.target) &&
    ["standard", "compensatory"].includes(a.profile) &&
    a.seconds === (a.profile === "standard" ? 900 : 1200) &&
    Number.isFinite(a.startedAt) &&
    a.startedAt >= 0 &&
    (a.submittedAt === null ||
      (Number.isFinite(a.submittedAt) &&
        a.submittedAt >= a.startedAt &&
        a.submittedAt <= destDeadline(a))) &&
    typeof a.text === "string" &&
    a.text.length <= 4000
  );
}
export function validDestStore(v: unknown): v is DestStore {
  if (!v || typeof v !== "object") return false;
  const s = v as DestStore;
  return (
    (s.active === null ||
      (validDest(s.active) && s.active.submittedAt === null)) &&
    Array.isArray(s.history) &&
    s.history.length <= 10 &&
    s.history.every((a) => validDest(a) && a.submittedAt !== null) &&
    new Set(s.history.map((a) => a.id)).size === s.history.length &&
    !s.history.some((a) => a.id === s.active?.id)
  );
}
export function typeDest(a: DestAttempt, text: string, now: number) {
  if (
    !validDest(a) ||
    a.submittedAt !== null ||
    now < a.startedAt ||
    now >= destDeadline(a) ||
    text.length > 4000
  )
    throw Error("DEST response is locked or too long.");
  return { ...a, text: text.replaceAll("\r\n", "\n") };
}
export function submitDest(a: DestAttempt, now: number) {
  if (!validDest(a) || !Number.isFinite(now))
    throw Error("Invalid DEST attempt.");
  return a.submittedAt === null
    ? {
        ...a,
        submittedAt: Math.max(a.startedAt, Math.min(now, destDeadline(a))),
      }
    : a;
}
/** Character-level Levenshtein distance. Not the SSC error-percentage formula. */
export function editDistance(left: string, right: string) {
  let row = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 1; i <= left.length; i++) {
    const next = [i];
    for (let j = 1; j <= right.length; j++)
      next[j] = Math.min(
        next[j - 1] + 1,
        row[j] + 1,
        row[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    row = next;
  }
  return row[right.length];
}
export function destReport(a: DestAttempt) {
  const edits = editDistance(a.target, a.text),
    elapsed = Math.max(
      0,
      ((a.submittedAt ?? destDeadline(a)) - a.startedAt) / 1000,
    );
  return {
    edits,
    elapsed,
    typed: a.text.length,
    target: a.target.length,
    wpm: elapsed > 0 ? a.text.length / 5 / (elapsed / 60) : 0,
  };
}
