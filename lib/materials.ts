export type Material = {
  id: string;
  examId: string;
  title: string;
  kind: "paper" | "archive";
  year?: number;
  url: string;
  keyUrl?: string;
  note: string;
};
export const materials: Material[] = [
  {
    id: "ssc-cgl-authority",
    examId: "ssc",
    title: "SSC CGL · official paper and answer-key availability",
    kind: "archive",
    url: "https://ssc.gov.in/",
    keyUrl: "https://ssc.gov.in/home/answer-key",
    note: "Official portal/answer-key index checked 18 October 2026. No directly accessible CGL paper paired with its final key was authenticated for import. This opens the publisher index, not a scored PYQ test. Candidate-specific or time-limited access may apply.",
  },
  ...["EE", "EC", "IN"].map((code) => ({
    id: `gate-${code.toLowerCase()}-2026`,
    examId: `gate-${code.toLowerCase()}`,
    title: `GATE 2026 · ${code} question paper`,
    kind: "paper" as const,
    year: 2026,
    url: `https://gate2027.iitm.ac.in/static/doc/download/2026/QPs/${code}.pdf`,
    keyUrl: `https://gate2027.iitm.ac.in/static/doc/download/2026/Keys/${code}_Keys.pdf`,
    note: "Listed by the official GATE 2027 download archive. Open the original paper and key at the publisher; automated scoring is not available.",
  })),
  ...["gate-ee", "gate-ec", "gate-in"].map((examId) => ({
    id: `${examId}-archive`,
    examId,
    title: "GATE previous papers & answer keys",
    kind: "archive" as const,
    url: "https://gate2027.iitm.ac.in/download",
    note: "Official archive. Select your paper code and year. EE, EC and IN are separate papers.",
  })),
  ...["upsc", "ese"].map((examId) => ({
    id: `${examId}-archive`,
    examId,
    title:
      examId === "upsc"
        ? "UPSC Civil Services previous papers"
        : "UPSC Engineering Services previous papers",
    kind: "archive" as const,
    url: "https://www.upsc.gov.in/examinations/previous-question-papers",
    note: "Official UPSC archive. Choose the examination, stage, year and paper before downloading.",
  })),
];
export const sourceCheckedOn = "14 October 2026";
