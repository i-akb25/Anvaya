import release from "./all-exam-content.json" with { type: "json" };
import type { Source, StudyUnit } from "./content.ts";
import type { StudyQuestion } from "./questions.ts";
export const allExamUnits = release.units as StudyUnit[];
export const allExamQuestions = release.questions as StudyQuestion[];
export const allExamSources = release.sources as Source[];
