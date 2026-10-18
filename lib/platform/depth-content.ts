import release from "./depth-content.json" with { type: "json" };
import type { Source, StudyUnit } from "./content.ts";
import type { StudyQuestion } from "./questions.ts";
export const depthUnits = release.units as StudyUnit[];
export const depthQuestions = release.questions as StudyQuestion[];
export const depthSources = release.sources as Source[];
