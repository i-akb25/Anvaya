import type { Source, StudyUnit } from "./content.ts";
export const expansionSources: Source[] = [
  {
    id: "rights",
    title:
      "Indian Constitution at Work · Chapter 2, Rights in the Indian Constitution",
    url: "https://ncert.nic.in/textbook/pdf/keps202.pdf",
    publisher: "NCERT",
    checkedOn: "2026-10-15",
    licenseNote:
      "Read at publisher. Concise concept summary and original problems; no figures or textbook exercises reproduced.",
  },
  {
    id: "ecosystem",
    title: "Biology · Chapter 12, Ecosystem, energy flow",
    url: "https://ncert.gov.in/textbook/pdf/lebo112.pdf",
    publisher: "NCERT",
    checkedOn: "2026-10-15",
    licenseNote:
      "Read at publisher. Concise concept summary and original problems; no figures or textbook exercises reproduced.",
  },
  {
    id: "interest",
    title: "Prealgebra 2e · 6.4 Simple Interest",
    url: "https://openstax.org/books/prealgebra-2e/pages/6-4-solve-simple-interest-applications",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote:
      "Read at publisher. Concise concept summary and original problems; no figures or textbook exercises reproduced.",
  },
  {
    id: "capacitor",
    title: "College Physics 2e · 19.7 Energy Stored in Capacitors",
    url: "https://openstax.org/books/college-physics-2e/pages/19-7-energy-stored-in-capacitors",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote:
      "Read at publisher. Concise concept summary and original problems; no figures or textbook exercises reproduced.",
  },
  {
    id: "rc",
    title: "College Physics 2e · 21.6 RC Circuits",
    url: "https://openstax.org/books/college-physics-2e/pages/21-6-dc-circuits-containing-resistors-and-capacitors",
    publisher: "OpenStax",
    checkedOn: "2026-10-15",
    licenseNote:
      "Read at publisher. Concise concept summary and original problems; no figures or textbook exercises reproduced.",
  },
];
export const expansionUnits: Omit<
  StudyUnit,
  "status" | "authorship" | "review" | "version"
>[] = [
  {
    slug: "constitutional-rights",
    title: "Rights and Directive Principles: distinguish enforceability",
    subject: "Indian Polity",
    exams: ["upsc", "bpsc", "ssc"],
    sourceId: "rights",
    minutes: 15,
    objective: "Distinguish rights from policy guidance.",
    concepts: [
      {
        title: "Rights",
        text: "Fundamental Rights have constitutional protection and judicial remedies. They are not all absolute.",
      },
      {
        title: "Policy guidance",
        text: "Directive Principles guide welfare policy. They are non-justiciable, unlike Fundamental Rights.",
      },
    ],
    example: {
      problem: "Are all constitutional welfare goals directly enforceable?",
      steps: [
        "Identify the provision.",
        "Distinguish a right from a policy goal.",
        "Check its enforceability.",
      ],
      answer: "No: Directive Principles are non-justiciable.",
    },
    recall: ["Distinguish enforceability.", "Are all rights absolute?"],
    mistake: "Non-justiciable does not mean irrelevant.",
  },
  {
    slug: "ecosystems-energy",
    title: "Ecosystems: follow energy through trophic levels",
    subject: "Environment",
    exams: ["upsc", "bpsc", "ssc"],
    sourceId: "ecosystem",
    minutes: 15,
    objective: "Identify trophic levels and calculate energy transfer.",
    concepts: [
      {
        title: "Feeding roles",
        text: "Producers occupy the first trophic level. Herbivores feeding on them are primary consumers; animals feeding on those herbivores are secondary consumers.",
      },
      {
        title: "Energy budget",
        text: "Energy available decreases along successive trophic levels. Use the textbook 10% transfer model for these calculations; actual transfer efficiency varies.",
      },
    ],
    example: {
      problem:
        "Assume 10% transfer. Producers hold 30,000 kJ. Find primary and secondary consumer energy.",
      steps: [
        "Primary consumers receive 30,000 × 0.10 = 3,000 kJ.",
        "Secondary consumers receive 3,000 × 0.10 = 300 kJ.",
        "Two transfers give 30,000 × (0.10)².",
      ],
      answer: "3,000 kJ and 300 kJ.",
    },
    recall: [
      "Identify producers’ trophic level.",
      "Count transfers to secondary consumers.",
    ],
    mistake: "Secondary consumers are two transfers above producers.",
  },
  {
    slug: "simple-interest",
    title: "Simple interest: rate and time must agree",
    subject: "Quantitative Aptitude",
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
      "ese",
    ],
    sourceId: "interest",
    minutes: 15,
    objective: "Calculate simple interest and recover an unknown principal.",
    concepts: [
      {
        title: "Model",
        text: "Simple interest uses I = P × r × t, with an annual rate r written as a decimal and time t in years. The principal stays the interest base.",
      },
      {
        title: "Time and total",
        text: "Convert months to years by dividing by 12. The final amount is P + I. This model does not compound accumulated interest.",
      },
    ],
    example: {
      problem:
        "An original practice loan of ₹6,400 earns simple interest at 7.5% per year for 18 months. Find interest and total.",
      steps: [
        "Use r = 0.075 and t = 18/12 = 1.5.",
        "Interest = 6,400 × 0.075 × 1.5 = ₹720.",
        "Total = 6,400 + 720.",
      ],
      answer: "₹720 interest; ₹7,120 total.",
    },
    recall: [
      "Which quantity remains the interest base?",
      "How do you express 18 months with an annual rate?",
    ],
    mistake: "Do not substitute 7.5 for 0.075 or 18 for 1.5 years.",
  },
  {
    slug: "capacitor-energy",
    title: "Capacitors: charge and stored energy",
    subject: "Electric Circuits",
    exams: ["gate-ee", "gate-ec", "gate-in", "ese"],
    sourceId: "capacitor",
    minutes: 15,
    objective: "Calculate stored energy with consistent SI units.",
    concepts: [
      {
        title: "Ideal linear capacitor",
        text: "Q = CV. Stored energy U = ½CV² = ½QV = Q²/(2C). Use farads, volts and coulombs to obtain joules.",
      },
      {
        title: "Scaling",
        text: "At fixed capacitance, doubling voltage quadruples stored energy. State what stays fixed before comparing energies.",
      },
    ],
    example: {
      problem:
        "An ideal 40 μF capacitor is charged to 15 V. Find charge and stored energy.",
      steps: [
        "Convert capacitance to 40 × 10⁻⁶ F.",
        "Charge = 40 × 10⁻⁶ × 15 = 600 μC.",
        "Energy = 0.5 × 40 × 10⁻⁶ × 15² = 0.0045 J.",
      ],
      answer: "600 μC and 4.5 mJ.",
    },
    recall: [
      "Why is energy ½QV rather than QV?",
      "What happens to energy when voltage doubles at fixed C?",
    ],
    mistake:
      "Microfarads and millijoules require different conversion factors.",
  },
  {
    slug: "rc-transients",
    title: "RC transients: time constant and exponential response",
    subject: "Electric Circuits",
    exams: ["gate-ee", "gate-ec", "gate-in", "ese"],
    sourceId: "rc",
    minutes: 15,
    objective: "Calculate the response of an ideal series RC circuit.",
    concepts: [
      {
        title: "Time constant",
        text: "For a single resistor and capacitor, τ = RC in seconds. An initially uncharged capacitor charging from an ideal DC source follows Vc = Vs(1 − exp(−t/τ)).",
      },
      {
        title: "Discharge",
        text: "Discharging through R gives Vc = V0 exp(−t/τ). After one time constant, charging reaches about 63.2% of its final voltage; discharge retains about 36.8%.",
      },
    ],
    example: {
      problem:
        "An initially uncharged 20 μF capacitor charges through 10 kΩ from 10 V. Find τ and voltage at t = τ.",
      steps: [
        "Convert R = 10,000 Ω and C = 20 × 10⁻⁶ F.",
        "τ = 10,000 × 20 × 10⁻⁶ = 0.2 s.",
        "Vc(τ) = 10(1 − exp(−1)) ≈ 6.321 V.",
      ],
      answer: "0.2 s; approximately 6.321 V.",
    },
    recall: [
      "How do charging and discharging formulas differ?",
      "Is one time constant full charge?",
    ],
    mistake: "One time constant does not mean fully charged.",
  },
];
