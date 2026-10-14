"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {Brand} from "./brand";
export function StudyShell({children}:{children:React.ReactNode}) {
  const pathname=usePathname(),[open,setOpen]=useState(false);
  return <div className="study-shell"><a className="skip-link" href="#study-main">Skip to learning</a><aside className={`study-rail ${open?"rail-open":""}`}>
    <div className="rail-brand"><Brand/><button className="rail-toggle" aria-expanded={open} aria-controls="study-navigation" onClick={()=>setOpen(!open)}>{open?"Close":"Menu"}</button></div>
    <nav id="study-navigation" aria-label="Study navigation">{[["/","Today","01"],["/exams","Exams","02"],["/topics","Topics","03"],["/learn","Learn","04"],["/practice","Practise","05"],["/results","Review","06"]].map(([href,label,no])=><Link key={href} href={href} aria-current={pathname===href||(href!=="/"&&pathname.startsWith(href))?"page":undefined} onClick={()=>setOpen(false)}><span>{no}</span>{label}</Link>)}</nav>
    <div className="rail-note"><span className="eyebrow">A SMALL ROUTINE</span><p>Understand the idea.<br/>Work through it.<br/>Return to what you missed.</p><Link href="/results">Backups & study history →</Link></div>
  </aside><main id="study-main" className="study-main">{children}<footer className="study-footer"><span>Anvaya · Learn with intent.</span><span>Notes and progress stay in this browser. <Link href="/results">Export a backup.</Link></span><a href="mailto:akbsupportinfo@gmail.com">Support ↗</a></footer></main></div>;
}
