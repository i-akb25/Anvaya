import releasedBank from "./banks/illustrative-2026-10-v1.json" with {type:"json"};
export type Exam={id:string;name:string;group:string;official:string;subjects:string[];status:string};
export const subjects=["Indian Polity","History","Geography","Economy","General Science","Environment","Current Affairs","Bihar Special","Reasoning","Quantitative Aptitude","English","Electrical Engineering","Electronics and Communication Engineering","Instrumentation Engineering","Engineering Mathematics"];
export const exams:Exam[]=[
{id:"upsc",name:"UPSC Civil Services",group:"Civil Services",official:"https://upsc.gov.in/",subjects:subjects.slice(0,7).concat(["Reasoning"]),status:"Verify current notice"},
{id:"bpsc",name:"BPSC Combined Competitive",group:"Civil Services",official:"https://bpsc.bihar.gov.in/",subjects:subjects.slice(0,8).concat(["Reasoning"]),status:"Verify target-year official notice and revised dates"},
{id:"ssc",name:"SSC CGL",group:"Recruitment",official:"https://ssc.gov.in/",subjects:["Reasoning","Quantitative Aptitude","English","General Science","History","Indian Polity","Geography","Economy","Current Affairs"],status:"Verify current notice"},
{id:"sbi",name:"SBI PO",group:"Banking",official:"https://sbi.co.in/web/careers",subjects:["Reasoning","Quantitative Aptitude","English","Current Affairs","Economy"],status:"Verify current notice"},
{id:"ibps",name:"IBPS PO",group:"Banking",official:"https://www.ibps.in/",subjects:["Reasoning","Quantitative Aptitude","English","Current Affairs","Economy"],status:"Verify current notice"},
{id:"gate-ee",name:"GATE Electrical Engineering (EE)",group:"Engineering",official:"https://gate2027.iitm.ac.in/",subjects:["Electrical Engineering","Engineering Mathematics"],status:"Verify target-year notice"},
{id:"gate-ec",name:"GATE Electronics and Communication (EC)",group:"Engineering",official:"https://gate2027.iitm.ac.in/",subjects:["Electronics and Communication Engineering","Engineering Mathematics"],status:"Verify target-year notice"},
{id:"gate-in",name:"GATE Instrumentation Engineering (IN)",group:"Engineering",official:"https://gate2027.iitm.ac.in/",subjects:["Instrumentation Engineering","Electrical Engineering","Engineering Mathematics"],status:"Verify target-year notice"},
{id:"ese",name:"UPSC ESE Electrical",group:"Engineering",official:"https://upsc.gov.in/",subjects:["Electrical Engineering","Engineering Mathematics","General Science","Current Affairs"],status:"Verify current notice"},
{id:"cat",name:"CAT",group:"Management",official:"https://iimcat.ac.in/",subjects:["Reasoning","Quantitative Aptitude","English"],status:"Verify current notice"}
];
export type Question={id:string;topic:string;stem:string;choices:string[];correct:number;explanation:string;source:"illustrative";};
export const questions:Question[] = releasedBank.questions as Question[];
export function resourceUrl(topic:string,site:"youtube"|"pw"|"madeeasy"|"general"){const term=encodeURIComponent(topic+" competitive exam lecture");const urls={youtube:"https://www.youtube.com/results?search_query="+term,pw:"https://www.google.com/search?q="+encodeURIComponent("site:pw.live "+topic+" lecture"),madeeasy:"https://www.google.com/search?q="+encodeURIComponent("site:madeeasy.in "+topic+" lecture"),general:"https://www.google.com/search?q="+encodeURIComponent(topic+" exam notes official NCERT")};return urls[site]}
