export type Source = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  checkedOn: string;
  licenseNote: string;
};
export const sources: Source[] = [
  {
    id: "percent",
    title: "Prealgebra 2e · Understand Percent",
    url: "https://openstax.org/books/prealgebra-2e/pages/6-1-understand-percent",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote:
      "Read at publisher. Anvaya's examples are original; no textbook figures or exercises are reproduced.",
  },
  {
    id: "change",
    title: "Prealgebra 2e · Applications of Percent",
    url: "https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote: "Source-linked concepts, original worked problems.",
  },
  {
    id: "ratio",
    title: "Prealgebra 2e · Ratios and Rate",
    url: "https://openstax.org/books/prealgebra-2e/pages/5-6-ratios-and-rate",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote: "Source-linked concepts, original worked problems.",
  },
  {
    id: "probability",
    title: "Introductory Statistics 2e · Terminology",
    url: "https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote:
      "Source-linked concepts, original finite-sample-space problems.",
  },
  {
    id: "ohm",
    title: "College Physics 2e · Ohm's Law",
    url: "https://openstax.org/books/college-physics-2e/pages/20-2-ohms-law-resistance-and-simple-circuits",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote: "Source-linked formulas; original numerical problems.",
  },
  {
    id: "resistors",
    title: "College Physics 2e · Series and Parallel",
    url: "https://openstax.org/books/college-physics-2e/pages/21-1-resistors-in-series-and-parallel",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote: "Source-linked formulas; original numerical problems.",
  },
  {
    id: "kcl",
    title: "College Physics 2e · Kirchhoff's Rules",
    url: "https://openstax.org/books/college-physics-2e/pages/21-3-kirchhoffs-rules",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote: "Source-linked laws; original numerical problems.",
  },
  {
    id: "reading",
    title: "Writing Guide · Breaking the Whole into Its Parts",
    url: "https://openstax.org/books/writing-guide/pages/9-1-breaking-the-whole-into-its-parts",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote: "Original practice paragraph, not a copied passage or PYQ.",
  },
];
export type StudyUnit = {
  slug: string;
  title: string;
  subject: string;
  exams: string[];
  minutes: number;
  objective: string;
  sourceId: string;
  status: "source-checked";
  authorship: "AI-authored";
  review: string;
  version: string;
  concepts: { title: string; text: string }[];
  example: { problem: string; steps: string[]; answer: string };
  recall: string[];
  mistake: string;
};
const aptitude = [
  "upsc",
  "bpsc",
  "ssc",
  "sbi",
  "ibps",
  "cat",
  "gate-ee",
  "gate-ec",
  "gate-in",
  "ese",
];
const technical = ["gate-ee", "gate-ec", "gate-in", "ese"];
type Draft = Omit<StudyUnit, "status" | "authorship" | "review" | "version">;
const units: Draft[] = [
  {
    slug: "percentages",
    title: "Percentages: choose the right base",
    subject: "Quantitative Aptitude",
    exams: aptitude,
    minutes: 15,
    sourceId: "percent",
    objective: "Translate a percentage into a fraction of a specified base.",
    concepts: [
      {
        title: "Identify the whole",
        text: "Percent means per hundred. In A is p% of B, the base is B and A=(p/100)B. State the base before calculating.",
      },
      {
        title: "Reverse the statement",
        text: "If the part and percentage are known, divide the part by p/100 to recover the whole. Comparing A with B uses a different base from comparing B with A.",
      },
    ],
    example: {
      problem:
        "A study group completed 42 of 120 planned questions. What percentage is complete, and how many questions represent 80% completion?",
      steps: [
        "Completion fraction = 42/120 = 0.35.",
        "Multiply by 100: 35% complete.",
        "For the second target, the base remains 120: 0.80 × 120 = 96.",
      ],
      answer: "35% complete; 96 questions is the 80% target.",
    },
    recall: [
      "What is the base?",
      "Write part = fraction × whole.",
      "Reverse a percentage by dividing, not subtracting.",
    ],
    mistake: "A being 25% larger than B does not make B 25% smaller than A.",
  },
  {
    slug: "percentage-change",
    title: "Successive changes: use multipliers",
    subject: "Quantitative Aptitude",
    exams: aptitude,
    minutes: 18,
    sourceId: "change",
    objective:
      "Calculate increases, decreases and a reverse percentage without mixing bases.",
    concepts: [
      {
        title: "Change relative to the starting value",
        text: "Percentage change is (new−old)/old ×100. An increase of p% multiplies a value by 1+p/100; a decrease multiplies it by 1−p/100.",
      },
      {
        title: "Chain changes",
        text: "Successive changes act on successive bases. Multiply their factors. Equal percentage increases and decreases generally do not cancel.",
      },
    ],
    example: {
      problem:
        "A book costs ₹800 before a 15% increase followed by a 10% discount. Find the final price and net percentage change.",
      steps: [
        "After the increase: 800 × 1.15 = ₹920.",
        "After the discount: 920 × 0.90 = ₹828.",
        "Net change = (828−800)/800 ×100 = 3.5%.",
      ],
      answer: "₹828, a net increase of 3.5%.",
    },
    recall: [
      "Turn each change into a multiplier.",
      "Multiply before converting the net factor to percent.",
      "Keep percentage points distinct from percentage change.",
    ],
    mistake: "15% − 10% = 5% ignores the changed base.",
  },
  {
    slug: "ratios",
    title: "Ratios and rates: compare like with like",
    subject: "Quantitative Aptitude",
    exams: aptitude,
    minutes: 18,
    sourceId: "ratio",
    objective: "Use proportional parts and convert units in a rate.",
    concepts: [
      {
        title: "Proportional parts",
        text: "A ratio compares quantities. If A:B=a:b, write A=ak and B=bk. A known total gives (a+b)k. For a rate, keep units visible and convert them consistently.",
      },
      {
        title: "Unit rate",
        text: "Divide a quantity by the corresponding number of units to obtain a per-unit rate. Equivalent ratios follow from multiplying or dividing both terms by the same nonzero quantity.",
      },
    ],
    example: {
      problem:
        "Two departments share ₹7,200 in the ratio 5:7. A courier then travels 150 km in 2.5 hours. Find each share and the courier's average speed.",
      steps: [
        "Total parts = 12, so one part = ₹600.",
        "Shares = 5×600 = ₹3,000 and 7×600 = ₹4,200.",
        "Average speed = 150/2.5 = 60 km/h.",
      ],
      answer: "₹3,000 and ₹4,200; 60 km/h.",
    },
    recall: [
      "Write both quantities using a common k.",
      "Check that the shares sum to the total.",
      "Carry units through rate calculations.",
    ],
    mistake: "A ratio of 5:7 has 12 total parts, not 7.",
  },
  {
    slug: "probability",
    title: "Probability: define the sample space",
    subject: "Mathematics",
    exams: aptitude,
    minutes: 20,
    sourceId: "probability",
    objective: "Count outcomes and distinguish an event from its complement.",
    concepts: [
      {
        title: "Specify the experiment",
        text: "A sample space contains possible outcomes. An event is a subset. For equally likely finite outcomes, probability is favourable outcomes divided by total outcomes.",
      },
      {
        title: "Complements and conditions",
        text: "The complement of event A has probability 1−P(A). Once information restricts the possible outcomes, count inside that restricted sample space rather than the original one.",
      },
    ],
    example: {
      problem:
        "A fair six-sided die is rolled. Find P(even). If the result is known to exceed 3, find the probability it is even.",
      steps: [
        "Even outcomes in {1,2,3,4,5,6} are {2,4,6}: probability 3/6.",
        "Given the result exceeds 3, the remaining equally likely outcomes are {4,5,6}.",
        "Two of those three outcomes are even.",
      ],
      answer: "1/2 initially; 2/3 after the stated condition.",
    },
    recall: [
      "Define outcomes before counting.",
      "Check equal likelihood.",
      "A condition can change the denominator.",
    ],
    mistake:
      "Do not keep six outcomes after conditioning on a result greater than three.",
  },
  {
    slug: "ohms-law",
    title: "Ohm's law: model, units and power",
    subject: "Electric Circuits",
    exams: technical,
    minutes: 17,
    sourceId: "ohm",
    objective: "Use V=IR for an ideal ohmic resistor and check power units.",
    concepts: [
      {
        title: "State the model",
        text: "For an ideal ohmic resistor, V=IR. Resistance in ohms equals voltage in volts divided by current in amperes. This constant-resistance model is not a universal description of every electrical component.",
      },
      {
        title: "Power check",
        text: "For a resistor, power is VI. Substituting V=IR gives I²R and V²/R. These expressions provide independent checks when the model applies.",
      },
    ],
    example: {
      problem:
        "An ideal 18 Ω resistor has 9 V across it. Find current and power.",
      steps: [
        "I=V/R=9/18=0.5 A.",
        "P=VI=9×0.5=4.5 W.",
        "Check: I²R=(0.5)²×18=4.5 W.",
      ],
      answer: "0.5 A and 4.5 W.",
    },
    recall: [
      "Write the component model first.",
      "Convert mA to A before using SI formulas.",
      "Cross-check power with a second expression.",
    ],
    mistake: "A resistance specified in kΩ must be converted consistently.",
  },
  {
    slug: "series-parallel",
    title: "Resistor networks: connection before calculation",
    subject: "Electric Circuits",
    exams: technical,
    minutes: 20,
    sourceId: "resistors",
    objective: "Distinguish shared-current and shared-voltage connections.",
    concepts: [
      {
        title: "Series",
        text: "Series resistors carry the same current and their resistances add. Identify a branch without another current path at the intermediate node.",
      },
      {
        title: "Parallel",
        text: "Parallel branches connect to the same pair of nodes and have equal voltage. Their conductances add: 1/Req=Σ1/R. Two positive resistors in parallel have equivalent resistance below either branch resistance.",
      },
    ],
    example: {
      problem:
        "A 4 Ω resistor is in series with a parallel pair of 6 Ω and 3 Ω. Find the total resistance and source current at 12 V.",
      steps: [
        "Parallel resistance = (6×3)/(6+3)=2 Ω.",
        "Series total = 4+2=6 Ω.",
        "Source current = 12/6=2 A.",
      ],
      answer: "6 Ω total; 2 A source current.",
    },
    recall: [
      "Label nodes.",
      "Check shared voltage or shared current.",
      "Use physical bounds to catch arithmetic mistakes.",
    ],
    mistake:
      "Components drawn beside one another are not necessarily in series.",
  },
  {
    slug: "kirchhoff",
    title: "Kirchhoff's laws: write a node equation",
    subject: "Electric Circuits",
    exams: technical,
    minutes: 22,
    sourceId: "kcl",
    objective: "Choose a sign convention and solve a simple nodal equation.",
    concepts: [
      {
        title: "Current balance",
        text: "For the lumped-circuit model, Kirchhoff's junction rule expresses current conservation. Choose a consistent convention for currents entering and leaving a node.",
      },
      {
        title: "Voltage balance",
        text: "Kirchhoff's loop rule sums potential changes around a closed loop. Keep source polarity and assumed current direction explicit. A negative current solution means the actual direction opposes the assumption.",
      },
    ],
    example: {
      problem:
        "Node V connects to a 15 V node through 5 Ω and to ground through 10 Ω. Find V and each branch current.",
      steps: [
        "Take currents leaving V as positive: (V−15)/5 + V/10 = 0.",
        "Multiply by 10: 2V−30+V=0, so V=10 V.",
        "Source-to-node current = (15−10)/5=1 A; node-to-ground current =10/10=1 A.",
      ],
      answer: "V=10 V; each branch current has magnitude 1 A.",
    },
    recall: [
      "State the current convention.",
      "Use voltage differences in branch currents.",
      "Substitute the solution into the original equation.",
    ],
    mistake: "Using V/5 rather than (V−15)/5 loses the source-node voltage.",
  },
  {
    slug: "reading-analysis",
    title: "Reading: claim, evidence and inference",
    subject: "English and Comprehension",
    exams: [
      "upsc",
      "bpsc",
      "ssc",
      "sbi",
      "ibps",
      "cat",
      "gate-ee",
      "gate-ec",
      "gate-in",
    ],
    minutes: 18,
    sourceId: "reading",
    objective:
      "Separate the author's statement from an inference that needs more evidence.",
    concepts: [
      {
        title: "Read the parts together",
        text: "An analytical reading identifies the purpose of each part and how it contributes to the whole. Keep a writer's claim distinct from the evidence offered for it.",
      },
      {
        title: "Control inference",
        text: "When answering a comprehension question, support the answer with the supplied passage. Plausibility alone is insufficient. Watch for changes from some to all, correlation to causation, or observation to recommendation.",
      },
    ],
    example: {
      problem:
        "Original passage: 'After a library extended its evening hours, recorded visits increased. The report did not distinguish new visitors from repeat visits.' Can we conclude that more distinct people used the library?",
      steps: [
        "The measured quantity is recorded visits.",
        "One person may account for several visits.",
        "The passage explicitly lacks the distinct-person count.",
      ],
      answer:
        "No. Increased visits alone do not establish an increase in distinct users.",
    },
    recall: [
      "Name the measured quantity.",
      "Underline the evidence.",
      "Reject an inference that requires missing information.",
    ],
    mistake: "Replacing visits with visitors changes the claim.",
  },
];
export const studyUnits: StudyUnit[] = units.map((u) => ({
  ...u,
  status: "source-checked",
  authorship: "AI-authored",
  review:
    "Primary source opened and concepts compared; original numerical examples calculation-checked. No independent human editorial review is claimed.",
  version: `${u.slug}-sourcecheck-20261015-v1`,
}));
export function sourceFor(id: string) {
  const source = sources.find((s) => s.id === id);
  if (!source) throw Error("Unknown source");
  return source;
}
