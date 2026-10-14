import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Anvaya | Preparation workspace",description:"Exam preparation, linked syllabus, topic resources and practice tests.",robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
