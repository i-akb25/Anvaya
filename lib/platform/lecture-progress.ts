import { lectureKey } from "./lectures.ts";
import type { LearningVault } from "./vault.ts";
export type LectureState = {
  status: "planned" | "watching" | "completed" | "unavailable";
  seconds: number;
  note: string;
  updatedAt: string;
};
export function validLectureState(value: unknown): value is LectureState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as LectureState;
  return (
    ["planned", "watching", "completed", "unavailable"].includes(r.status) &&
    Number.isInteger(r.seconds) &&
    r.seconds >= 0 &&
    r.seconds <= 86400 &&
    typeof r.note === "string" &&
    r.note.length <= 20000 &&
    typeof r.updatedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(r.updatedAt) &&
    Number.isFinite(Date.parse(r.updatedAt))
  );
}
export function saveLectureProgress(
  v: LearningVault,
  exam: string,
  topic: string,
  resource: string,
  state: LectureState,
): LearningVault {
  if (!validLectureState(state))
    throw Error("Invalid lecture progress; nothing saved.");
  const key = lectureKey(exam, topic, resource);
  return { ...v, lectures: { ...v.lectures, [key]: { ...state } } };
}
export function parsePosition(minutes: string, seconds: string) {
  if (!/^\d{1,4}$/.test(minutes) || !/^\d{1,2}$/.test(seconds)) return null;
  const m = Number(minutes),
    s = Number(seconds),
    total = m * 60 + s;
  return s < 60 && total <= 86400 ? total : null;
}
export function formatPosition(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
