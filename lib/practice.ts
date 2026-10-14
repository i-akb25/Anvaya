import {exams} from "./catalog.ts";
import {BANK_KIND, BANK_VERSION, bankQuestions} from "./question-bank.ts";
import {evaluate, type Scoring} from "./scoring.ts";

export type Mode = "mixed" | "topic";
export type TestConfig = {mode:Mode; topic:string; count:number; durationMinutes:number; positive:number; negative:number; examId?:string};
export type Attempt = Scoring & {
  id:string; createdAt:string; config:TestConfig; answers:Record<string,number>;
  questionIds:string[]; elapsedSeconds:number; bankVersion:string; kind:typeof BANK_KIND;
};
export type Draft = {
  id:string; writerId:string; bankVersion:string; kind:typeof BANK_KIND; config:TestConfig;
  questionIds:string[]; answers:Record<string,number>; marked:string[]; index:number;
  startedAt:number; updatedAt:number;
};
export type ReviewRecord = {key:string; reviewedAt:string};
type Workspace = {attempts:Attempt[]; draft:Draft|null; reviews:ReviewRecord[]};
export class DraftConflictError extends Error {}
export const STORAGE_KEY = "anvaya-workspace-v2";
export const LEGACY_KEY = "anvaya-practice-v1";
export const BACKUP_FORMAT = "anvaya-workspace-v2";
const MAX_BYTES = 2_000_000;
const empty = ():Workspace => ({attempts:[], draft:null, reviews:[]});
const isRecord = (v:unknown):v is Record<string,unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const identifier = (v:unknown):v is string => typeof v === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(v);
const validDate = (v:unknown):v is string => typeof v === "string" && v.length <= 40 && Number.isFinite(Date.parse(v));

export function validateConfig(value:unknown):TestConfig {
  if (!isRecord(value)) throw new Error("Invalid test settings");
  const c = value as unknown as TestConfig;
  if (!["mixed","topic"].includes(c.mode) || typeof c.topic !== "string" || c.topic.length > 150 ||
    !Number.isInteger(c.count) || c.count < 1 || c.count > 100 ||
    !Number.isInteger(c.durationMinutes) || c.durationMinutes < 1 || c.durationMinutes > 240 ||
    !Number.isFinite(c.positive) || c.positive <= 0 || c.positive > 100 ||
    !Number.isFinite(c.negative) || c.negative < 0 || c.negative > 100 ||
    (c.examId !== undefined && c.examId !== "general" && !exams.some(e => e.id === c.examId))) {
    throw new Error("Use 1–100 questions, 1–240 whole minutes, positive marks up to 100 and a deduction from 0 to 100.");
  }
  return {mode:c.mode, topic:c.topic, count:c.count, durationMinutes:c.durationMinutes,
    positive:c.positive, negative:c.negative, examId:c.examId ?? "general"};
}

export function buildTest(config:TestConfig, version = BANK_VERSION) {
  const c = validateConfig(config);
  const pool = bankQuestions(version).filter(q => c.mode !== "topic" || q.topic === c.topic);
  return pool.slice(0, Math.min(c.count, pool.length));
}

function responses(ids:unknown, answers:unknown, version:string) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 100 || new Set(ids).size !== ids.length || !isRecord(answers)) {
    throw new Error("Invalid saved question set");
  }
  const bank = bankQuestions(version);
  const items = ids.map(id => {
    const question = bank.find(q => q.id === id);
    if (!question) throw new Error("Saved question is missing from its bank");
    return question;
  });
  const clean:Record<string,number> = {};
  for (const [id,answer] of Object.entries(answers)) {
    const question = items.find(q => q.id === id);
    if (!question || typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= question.choices.length) {
      throw new Error("Invalid saved answer");
    }
    clean[id] = answer;
  }
  return {items, answers:clean, questionIds:items.map(q => q.id)};
}

export function validateAttempt(value:unknown):Attempt {
  if (!isRecord(value) || !identifier(value.id) || !validDate(value.createdAt) ||
    typeof value.elapsedSeconds !== "number" || !Number.isFinite(value.elapsedSeconds) || value.elapsedSeconds < 0 || value.elapsedSeconds > 86400) {
    throw new Error("Invalid attempt");
  }
  // Original v1 backups are the known illustrative bank, never official mocks.
  const version = value.bankVersion === undefined ? BANK_VERSION : value.bankVersion;
  if (typeof version !== "string" || (value.kind !== undefined && value.kind !== BANK_KIND)) throw new Error("Invalid bank provenance");
  const config = validateConfig(value.config);
  const selected = responses(value.questionIds, value.answers, version);
  return {id:value.id, createdAt:value.createdAt, config, answers:selected.answers, questionIds:selected.questionIds,
    elapsedSeconds:value.elapsedSeconds, bankVersion:version, kind:BANK_KIND,
    ...evaluate(selected.answers, selected.items, config.positive, config.negative)};
}

export function createAttempt(config:TestConfig, answers:Record<string,number>, questionIds:string[], elapsedSeconds:number, id = crypto.randomUUID(), version = BANK_VERSION):Attempt {
  return validateAttempt({id, createdAt:new Date().toISOString(), config, answers, questionIds, elapsedSeconds, bankVersion:version, kind:BANK_KIND});
}

export function validateDraft(value:unknown):Draft {
  if (!isRecord(value) || !identifier(value.id) || !identifier(value.writerId) || typeof value.bankVersion !== "string" || value.kind !== BANK_KIND ||
    typeof value.startedAt !== "number" || !Number.isSafeInteger(value.startedAt) || value.startedAt < 0 ||
    typeof value.updatedAt !== "number" || !Number.isSafeInteger(value.updatedAt) || value.updatedAt < value.startedAt ||
    !Number.isInteger(value.index) || !Array.isArray(value.marked) || new Set(value.marked).size !== value.marked.length) throw new Error("Invalid saved session");
  const config = validateConfig(value.config);
  const selected = responses(value.questionIds, value.answers, value.bankVersion);
  if ((value.index as number) < 0 || (value.index as number) >= selected.items.length || value.marked.some(id => !selected.questionIds.includes(id))) throw new Error("Invalid question navigation");
  return {id:value.id, writerId:value.writerId, bankVersion:value.bankVersion, kind:BANK_KIND, config,
    questionIds:selected.questionIds, answers:selected.answers, marked:value.marked as string[], index:value.index as number,
    startedAt:value.startedAt, updatedAt:value.updatedAt};
}

export function elapsedSeconds(draft:Draft, now = Date.now()) {
  return Math.min(draft.config.durationMinutes * 60, Math.max(0, Math.floor((now - draft.startedAt) / 1000)));
}

function validateReviews(value:unknown):ReviewRecord[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 1000) throw new Error("Invalid review history");
  return value.map(row => {
    if (!isRecord(row) || typeof row.key !== "string" || !/^[a-zA-Z0-9_:-]{1,250}$/.test(row.key) || !validDate(row.reviewedAt)) throw new Error("Invalid review record");
    return {key:row.key, reviewedAt:row.reviewedAt};
  });
}

// Reads fail visibly rather than replacing damaged data with an empty workspace.
export function readWorkspace():Workspace {
  if (typeof window === "undefined") return empty();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== null) {
    const data:unknown = JSON.parse(raw);
    if (!isRecord(data) || !Array.isArray(data.attempts) || data.attempts.length > 50) throw new Error("Saved practice data could not be read. Export the raw data before clearing it.");
    return {attempts:data.attempts.map(validateAttempt), draft:data.draft == null ? null : validateDraft(data.draft), reviews:validateReviews(data.reviews)};
  }
  const legacy = window.localStorage.getItem(LEGACY_KEY);
  if (!legacy) return empty();
  const parsed:unknown = JSON.parse(legacy);
  if (!Array.isArray(parsed) || parsed.length > 50) throw new Error("Saved history could not be read. Keep a backup before clearing it.");
  return {...empty(), attempts:parsed.map(validateAttempt)};
}

function writeWorkspace(workspace:Workspace) {
  // A single write keeps history, recovery and review changes together on failure.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export function readAttempts():Attempt[] {
  try {return readWorkspace().attempts} catch {return []}
}
export function readDraft():Draft|null {return readWorkspace().draft}
export function claimDraft(value:Draft) {
  const draft = validateDraft(value);
  const state = readWorkspace();
  if (state.attempts.some(a => a.id === draft.id)) throw new Error("This session was already submitted.");
  if (state.draft && state.draft.id !== draft.id) throw new Error("Resume or discard the existing session first.");
  writeWorkspace({...state, draft});
  return draft;
}
export function saveDraft(value:Draft) {
  const draft = validateDraft(value);
  const state = readWorkspace();
  if (!state.draft || state.draft.id !== draft.id || state.draft.writerId !== draft.writerId || state.attempts.some(a => a.id === draft.id)) {
    throw new DraftConflictError("This session changed in another tab. Return to setup and resume it here.");
  }
  writeWorkspace({...state, draft});
}
export function discardDraft(id:string) {
  const state = readWorkspace();
  if (state.draft?.id === id) writeWorkspace({...state, draft:null});
}
export function saveAttempt(attempt:Attempt, writerId?:string) {
  try {
    const safe = validateAttempt(attempt);
    const state = readWorkspace();
    if (writerId && (!state.draft || state.draft.id !== safe.id || state.draft.writerId !== writerId)) throw new Error("Session ownership changed");
    writeWorkspace({...state, attempts:[safe,...state.attempts.filter(a => a.id !== safe.id)].slice(0,50),
      draft:state.draft?.id === safe.id ? null : state.draft});
    return true;
  } catch {return false}
}
export function exportAttempts() {
  return JSON.stringify({format:BACKUP_FORMAT, exportedAt:new Date().toISOString(), ...readWorkspace()}, null, 2);
}
export function exportRawPractice() {
  return JSON.stringify({format:"anvaya-recovery-raw", current:window.localStorage.getItem(STORAGE_KEY), legacy:window.localStorage.getItem(LEGACY_KEY)}, null, 2);
}
export function importAttempts(text:string):number {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("Backup must be smaller than 2 MB");
  const data:unknown = JSON.parse(text);
  if (!isRecord(data) || ![BACKUP_FORMAT,"anvaya-practice-v1"].includes(data.format as string) || !Array.isArray(data.attempts) || data.attempts.length > 50) throw new Error("Choose an Anvaya practice backup with up to 50 attempts");
  const incoming = data.attempts.map(validateAttempt);
  const draft = data.draft == null ? null : validateDraft(data.draft);
  const reviews = validateReviews(data.reviews);
  const state = readWorkspace();
  if (state.draft && draft && state.draft.id !== draft.id) throw new Error("Discard or finish your saved session before importing another session.");
  const attempts = Array.from(new Map([...state.attempts,...incoming].map(a => [a.id,a])).values())
    .sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0,50);
  const mergedReviews = new Map<string,ReviewRecord>();
  for (const row of [...state.reviews,...reviews]) {
    const previous = mergedReviews.get(row.key);
    if (!previous || Date.parse(row.reviewedAt) > Date.parse(previous.reviewedAt)) mergedReviews.set(row.key,row);
  }
  // Keep a live local draft; otherwise restore the imported draft only if unfinished.
  const nextDraft = state.draft ?? draft;
  writeWorkspace({attempts, draft:nextDraft && !attempts.some(a => a.id === nextDraft.id) ? nextDraft : null,
    reviews:[...mergedReviews.values()].sort((a,b) => Date.parse(b.reviewedAt)-Date.parse(a.reviewedAt)).slice(0,1000)});
  return attempts.length;
}
export function clearAttempts() {
  // Clear the legacy key first so deleting v2 cannot resurrect older attempts.
  window.localStorage.removeItem(LEGACY_KEY);
  window.localStorage.removeItem(STORAGE_KEY);
}
export function markReviewed(key:string, reviewedAt = new Date().toISOString()) {
  const record = validateReviews([{key,reviewedAt}])[0];
  const state = readWorkspace();
  writeWorkspace({...state,reviews:[record,...state.reviews.filter(r => r.key !== key)].slice(0,1000)});
}
