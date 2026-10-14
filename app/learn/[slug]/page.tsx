import {draftPreviewEnabled} from "@/lib/content-policy";
import {notFound} from "next/navigation";
import {lessons} from "@/lib/learning";
import {LessonReader} from "@/components/lesson-reader";
export function generateStaticParams(){return lessons.map(lesson=>({slug:lesson.slug}))}
export default async function LessonPage({params}:{params:Promise<{slug:string}>}){if(!draftPreviewEnabled)notFound();const{slug}=await params;const lesson=lessons.find(l=>l.slug===slug);if(!lesson)notFound();return <LessonReader lesson={lesson}/>}
