export type Exam={id:string;name:string;group:string;official:string;subjects:string[];status:string};
export const subjects=["Indian Polity","History","Geography","Economy","General Science","Environment","Current Affairs","Bihar Special","Reasoning","Quantitative Aptitude","English","Electrical Engineering","Engineering Mathematics"];
export const exams:Exam[]=[
{id:"upsc",name:"UPSC Civil Services",group:"Civil Services",official:"https://upsc.gov.in/",subjects:subjects.slice(0,7).concat(["Reasoning"]),status:"Verify current notice"},
{id:"bpsc",name:"BPSC Combined Competitive",group:"Civil Services",official:"https://bpsc.bihar.gov.in/",subjects:subjects.slice(0,8).concat(["Reasoning"]),status:"72nd CCE: official notice reports postponement; verify revised date"},
{id:"ssc",name:"SSC CGL",group:"Recruitment",official:"https://ssc.gov.in/",subjects:["Reasoning","Quantitative Aptitude","English","General Science","History","Indian Polity","Geography","Economy","Current Affairs"],status:"Verify current notice"},
{id:"sbi",name:"SBI PO",group:"Banking",official:"https://sbi.co.in/web/careers",subjects:["Reasoning","Quantitative Aptitude","English","Current Affairs","Economy"],status:"Verify current notice"},
{id:"ibps",name:"IBPS PO",group:"Banking",official:"https://www.ibps.in/",subjects:["Reasoning","Quantitative Aptitude","English","Current Affairs","Economy"],status:"Verify current notice"},
{id:"gate",name:"GATE Electrical Engineering",group:"Engineering",official:"https://gate2026.iitg.ac.in/",subjects:["Electrical Engineering","Engineering Mathematics"],status:"Check current organizing institute"},
{id:"ese",name:"UPSC ESE Electrical",group:"Engineering",official:"https://upsc.gov.in/",subjects:["Electrical Engineering","Engineering Mathematics","General Science","Current Affairs"],status:"Verify current notice"},
{id:"cat",name:"CAT",group:"Management",official:"https://iimcat.ac.in/",subjects:["Reasoning","Quantitative Aptitude","English"],status:"Verify current notice"}
];
export type Question={id:string;topic:string;stem:string;choices:string[];correct:number;explanation:string;source:"illustrative";};
export const questions:Question[]=[
{id:"q1",topic:"Indian Polity",stem:"Which Article provides the right to approach the Supreme Court for enforcement of Fundamental Rights?",choices:["Article 14","Article 19","Article 32","Article 44"],correct:2,explanation:"Article 32 guarantees the right to constitutional remedies in the Supreme Court.",source:"illustrative"},
{id:"q2",topic:"History",stem:"Who founded the Maurya Empire?",choices:["Ashoka","Chandragupta Maurya","Bindusara","Bimbisara"],correct:1,explanation:"Chandragupta Maurya founded the Maurya dynasty.",source:"illustrative"},
{id:"q3",topic:"General Science",stem:"What is the SI unit of electric resistance?",choices:["Volt","Ampere","Ohm","Watt"],correct:2,explanation:"Electrical resistance is measured in ohms (Ω).",source:"illustrative"},
{id:"q4",topic:"Geography",stem:"Which river is commonly referred to as the Sorrow of Bihar?",choices:["Gandak","Kosi","Son","Punpun"],correct:1,explanation:"The Kosi is known for destructive floods and shifting channels.",source:"illustrative"},
{id:"q5",topic:"Electrical Engineering",stem:"In an ideal transformer, frequency on the secondary side is:",choices:["Twice the primary","Half the primary","Same as primary","Zero"],correct:2,explanation:"An ideal transformer changes voltage and current ratios, not frequency.",source:"illustrative"},
{id:"q6",topic:"Quantitative Aptitude",stem:"What is 20% of 250?",choices:["25","40","50","75"],correct:2,explanation:"0.2 × 250 = 50.",source:"illustrative"}
];
export function resourceUrl(topic:string,site:"youtube"|"pw"|"madeeasy"|"general"){const term=encodeURIComponent(topic+" competitive exam lecture");const urls={youtube:"https://www.youtube.com/results?search_query="+term,pw:"https://www.google.com/search?q="+encodeURIComponent("site:pw.live "+topic+" lecture"),madeeasy:"https://www.google.com/search?q="+encodeURIComponent("site:madeeasy.in "+topic+" lecture"),general:"https://www.google.com/search?q="+encodeURIComponent(topic+" exam notes official NCERT")};return urls[site]}
