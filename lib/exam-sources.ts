// This is a dated link registry, not an imported or immutable official syllabus.
// Only claim what was checked: the official portal and syllabus directory.
export type ExamSource = {
  id:string; cycle:number; paper:string; authority:string; checkedOn:string;
  portal:string; syllabusDirectory:string; syllabusPdf:string; pattern:string;
  verification:"official-portal-and-syllabus-directory";
};
export const examSources:Record<string,ExamSource> = Object.fromEntries(
  ["EE","EC","IN"].map(paper => [`gate-${paper.toLowerCase()}`, {
    id:`gate-2027-${paper.toLowerCase()}-links-2026-10-14-v1`, cycle:2027, paper,
    authority:"IIT Madras · GATE 2027", checkedOn:"2026-10-14",
    portal:"https://gate2027.iitm.ac.in/",
    syllabusDirectory:"https://gate2027.iitm.ac.in/exam_papers_and_syllabus",
    syllabusPdf:`https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/${paper}_GATE2027_Syllabus.pdf`,
    pattern:"https://gate2027.iitm.ac.in/question_paper_pattern",
    verification:"official-portal-and-syllabus-directory" as const,
  }]),
);
