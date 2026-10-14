export type Scoring={correct:number;incorrect:number;unanswered:number;score:number;maxScore:number;accuracy:number};
export function evaluate(answers:Record<string,number>,items:{id:string;correct:number}[],positive:number,negative:number):Scoring{
if(!Number.isFinite(positive)||!Number.isFinite(negative)||positive<0||negative<0)throw new Error("Invalid marks");
let correct=0,incorrect=0,unanswered=0;for(const q of items){const a=answers[q.id];if(a===undefined){unanswered++;continue}if(a===q.correct)correct++;else incorrect++}
const attempted=correct+incorrect;return{correct,incorrect,unanswered,score:Number((correct*positive-incorrect*negative).toFixed(2)),maxScore:items.length*positive,accuracy:attempted?Math.round(correct/attempted*100):0}
}
