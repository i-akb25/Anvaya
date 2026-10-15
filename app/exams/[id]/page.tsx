import {exams} from "@/lib/catalog";
import {ExamPath} from "@/components/classroom";
import {notFound} from "next/navigation";
export function generateStaticParams(){return exams.map(e=>({id:e.id}))}
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;if(!exams.some(e=>e.id===id))notFound();return <ExamPath id={id}/>}
