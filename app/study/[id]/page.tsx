import {materials} from "@/lib/materials";
import {PaperDesk} from "@/components/paper-desk";
import {notFound} from "next/navigation";
export function generateStaticParams(){return [{id:"private"},...materials.filter(m=>m.kind==="paper").map(m=>({id:m.id}))]}
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;if(id!=="private"&&!materials.some(m=>m.id===id&&m.kind==="paper"))notFound();return <PaperDesk key={id} id={id}/>}
