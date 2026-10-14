import type { Metadata } from "next";
import "./globals.css";
const deploymentHost=process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const metadata:Metadata={metadataBase:new URL(deploymentHost?`https://${deploymentHost}`:"http://localhost:3000"),title:"Anvaya | Preparation workspace",description:"Exam preparation, linked syllabus, topic resources and practice tests.",icons:{icon:"/icon.svg",apple:"/brand/apple-touch-icon.png"},openGraph:{title:"Anvaya | Preparation workspace",description:"Connected learning, grounded preparation.",type:"website"},robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
