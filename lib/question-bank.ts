import releasedBank from "./banks/illustrative-2026-10-v1.json" with {type:"json"};
import type {Question} from "./catalog.ts";

// Released banks are append-only: change this ID and retain the old bank when
// changing a stem, answer key, or explanation used by saved attempts.
export const BANK_VERSION = "anvaya-illustrative-2026-10-v1";
export const BANK_KIND = "illustrative" as const;
const bank = (releasedBank.questions as Question[]).map(question => Object.freeze({...question, choices: Object.freeze([...question.choices])}));
export const questionBanks = Object.freeze({[BANK_VERSION]: Object.freeze(bank)});

export function bankQuestions(version = BANK_VERSION) {
  if (!Object.hasOwn(questionBanks, version)) throw new Error("This backup needs an unsupported question bank. Keep the original backup.");
  return questionBanks[version as keyof typeof questionBanks];
}
