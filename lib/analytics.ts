import {bankQuestions} from "./question-bank.ts";
import type {Attempt, ReviewRecord} from "./practice.ts";

export function questionKey(examId:string, bankVersion:string, questionId:string) {
  return `${examId}:${bankVersion}:${questionId}`;
}
export function attemptQuestions(attempt:Attempt) {
  const bank = bankQuestions(attempt.bankVersion);
  return attempt.questionIds.map(id => {
    const q = bank.find(item => item.id === id);
    if (!q) throw new Error("Attempt question is unavailable");
    return q;
  });
}
export function topicPerformance(attempts:Attempt[], examId = "all") {
  const rows = new Map<string,{topic:string;correct:number;incorrect:number;skipped:number;penalties:number}>();
  const filtered = attempts.filter(a => examId === "all" || (a.config.examId ?? "general") === examId);
  for (const attempt of filtered) {
    for (const q of attemptQuestions(attempt)) {
      const row = rows.get(q.topic) ?? {topic:q.topic,correct:0,incorrect:0,skipped:0,penalties:0};
      const answer = attempt.answers[q.id];
      if (answer === undefined) row.skipped++;
      else if (answer === q.correct) row.correct++;
      else {row.incorrect++; row.penalties += attempt.config.negative}
      rows.set(q.topic,row);
    }
  }
  return [...rows.values()].map(row => ({...row,penalties:Number(row.penalties.toFixed(2)),
    observations:row.correct+row.incorrect+row.skipped,
    accuracy:row.correct+row.incorrect ? Math.round(row.correct/(row.correct+row.incorrect)*100) : null}))
    .sort((a,b) => (a.accuracy ?? -1)-(b.accuracy ?? -1) || a.topic.localeCompare(b.topic));
}
export function revisionQueue(attempts:Attempt[], reviews:ReviewRecord[], examId = "all") {
  type Question = ReturnType<typeof attemptQuestions>[number];
  const latest = new Map<string,{key:string;question:Question;attempt:Attempt;reason:"incorrect"|"unanswered"}>();
  for (const attempt of [...attempts].reverse().sort((a,b) => Date.parse(a.createdAt)-Date.parse(b.createdAt))) {
    const context = attempt.config.examId ?? "general";
    if (examId !== "all" && context !== examId) continue;
    for (const question of attemptQuestions(attempt)) {
      const key = questionKey(context,attempt.bankVersion,question.id);
      const answer = attempt.answers[question.id];
      if (answer === question.correct) latest.delete(key);
      else latest.set(key,{key,question,attempt,reason:answer === undefined ? "unanswered" : "incorrect"});
    }
  }
  const reviewed = new Map(reviews.map(row => [row.key,Date.parse(row.reviewedAt)]));
  return [...latest.values()].filter(row => (reviewed.get(row.key) ?? -Infinity) < Date.parse(row.attempt.createdAt))
    .sort((a,b) => Date.parse(a.attempt.createdAt)-Date.parse(b.attempt.createdAt));
}
