import { exams } from "../catalog.ts";
import { studyUnits } from "./content.ts";
import { practiceQuestions } from "./questions.ts";
import { syllabusUnits, type SyllabusUnit } from "./syllabus.ts";
import { patterns } from "./registry.ts";
import { lectureTopics } from "./lectures.ts";
/** Concise selection of checked subtopics, not a complete syllabus transcription. */
const highlights: Record<string, Record<string, string[]>> = {
  "gate-ee": {
    "engineering mathematics": [
      "Matrix equations and eigenvalues",
      "Calculus and vector integrals",
      "Differential equations",
      "Complex analysis",
      "Probability and regression",
    ],
    "electric circuits": [
      "Dependent sources",
      "Nodal and mesh methods",
      "Network theorems",
      "Transients and AC resonance",
      "Two-port and three-phase networks",
    ],
    "electromagnetic fields": [
      "Electrostatics",
      "Magnetic fields",
      "Induction and magnetic circuits",
    ],
    "signals and systems": [
      "Signal transformations",
      "LTI systems",
      "Sampling and Fourier analysis",
      "Laplace and Z transforms",
    ],
    "electrical machines": [
      "Transformers",
      "DC machines",
      "Induction machines",
      "Synchronous machines",
      "Losses and efficiency",
    ],
    "power systems": [
      "Transmission and distribution",
      "Load flow",
      "Faults",
      "Protection",
      "Stability",
    ],
    "control systems": [
      "Modelling",
      "Feedback",
      "Stability criteria",
      "Compensators and PID",
      "State space",
    ],
    "electrical and electronic measurements": [
      "Bridges",
      "Instrument transformers",
      "Meters and oscilloscopes",
      "Error analysis",
    ],
    "analog and digital electronics": [
      "Diodes and amplifiers",
      "Op-amps and filters",
      "Logic",
      "Data converters",
    ],
    "power electronics": [
      "Power switches",
      "DC converters",
      "Rectifiers",
      "Inverters and PWM",
    ],
  },
  "gate-in": {
    "engineering mathematics": [
      "Matrices and tensors",
      "Calculus",
      "Differential equations",
      "Complex variables",
      "Probability",
      "Numerical methods and backpropagation",
    ],
    "electricity and magnetism": [
      "Electric and magnetic fields",
      "Induction",
      "Magnetic circuits",
      "Maxwell equations",
    ],
    "electrical circuits and machines": [
      "Practical sources",
      "Transient and AC networks",
      "Network theorems",
      "Two-port models",
      "Transformers and PMSMs",
      "Converters and sensing",
    ],
    "signals and systems": [
      "Sampling",
      "Transforms",
      "Convolution and correlation",
      "FIR and IIR filters",
    ],
    "control systems": [
      "Feedback",
      "Stability",
      "Time delays",
      "Actuators",
      "PID tuning",
      "PLC and DCS",
    ],
    "analog electronics": [
      "Semiconductor circuits",
      "Op-amps",
      "Noise",
      "Grounding and shielding",
    ],
    "digital electronics": [
      "Logic and state machines",
      "ADC and DAC specifications",
      "Embedded systems",
      "IoT and AI applications",
    ],
    measurements: [
      "Standards and uncertainty",
      "Bridges",
      "Electrical quantities",
      "Digital instruments",
    ],
    "sensors and industrial instrumentation": [
      "Resistive and reactive sensors",
      "Motion and force",
      "Pressure and flow",
      "Temperature",
      "Level and chemical measurements",
    ],
    "communication and optical instrumentation": [
      "Modulation",
      "Networks and4–20mA",
      "Optical sources and detectors",
      "Interferometry",
      "Fiber sensing",
      "NIR, UV-VIS and mass spectrometry",
    ],
  },
  ssc: {
    "quantitative aptitude": [
      "Numbers and fractions",
      "Percentages and ratios",
      "Roots and averages",
      "Interest and trading arithmetic",
      "Partnership and mixtures",
      "Work and motion",
      "School algebra",
      "Geometry",
      "Solid mensuration",
      "Trigonometry",
      "Data charts",
    ],
    "mathematical abilities": [
      "Number operations",
      "Percentages and ratios",
      "Interest, profit and discount",
      "Mixtures, work and motion",
      "Algebra",
      "Geometry and mensuration",
      "Trigonometry",
      "Descriptive statistics and simple probability",
    ],
    reasoning: [
      "Analogies and classifications",
      "Series",
      "Spatial and figure reasoning",
      "Coding",
      "Inference",
      "Critical thinking",
      "Emotional and social intelligence",
    ],
    "general awareness": [
      "Current events",
      "History and culture",
      "Geography",
      "Economy and public policy",
      "Scientific research",
    ],
    "english comprehension": ["English comprehension and correct usage"],
    "english language": [
      "Vocabulary and grammar",
      "Error detection",
      "Voice and narration",
      "Sentence order",
      "Cloze and comprehension",
    ],
    "computer knowledge": [
      "Hardware and memory",
      "Windows and office tools",
      "Internet and email",
    ],
  },
};
export function subtopicHighlights(u: SyllabusUnit) {
  const rows = highlights[u.examId]?.[u.title.toLowerCase()];
  if (!rows) return null;
  return {
    items: rows,
    checkedOn: "2026-10-16",
    scope:
      "Selected subtopics compared with the primary PDF. Full transcription, depth mapping and independent human review remain pending.",
  };
}
export function coverageRows() {
  return exams.map((exam) => {
    const units = studyUnits.filter((u) => u.exams.includes(exam.id)),
      syllabus = syllabusUnits.filter((s) => s.examId === exam.id),
      topics = lectureTopics.filter((t) => t.exams.includes(exam.id));
    return {
      exam,
      lessons: units.length,
      questions: practiceQuestions.filter((q) =>
        units.some((u) => u.slug === q.topicId),
      ).length,
      syllabusSections: syllabus.length,
      highlightedSections: syllabus.filter((s) => subtopicHighlights(s)).length,
      listedTopics: topics.length,
      topicsWithoutVideo: topics.filter((t) => !t.resourceIds.length).length,
      patternReferences: patterns.filter((p) => p.examId === exam.id).length,
      completeCurriculum: false,
      officialMocks: 0,
      authenticatedPyqs: 0,
    };
  });
}
