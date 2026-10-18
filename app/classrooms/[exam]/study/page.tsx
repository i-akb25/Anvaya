import { ExamStudyDesk } from "@/components/platform/ssc-study";
import { exams } from "@/lib/catalog";
import { notFound, redirect } from "next/navigation";
export function generateStaticParams() {
  return exams.map((e) => ({ exam: e.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ exam: string }>;
}) {
  const { exam } = await params;
  return {
    title: `${exams.find((e) => e.id === exam)?.name ?? "Exam"} study & mistakes | Anvaya`,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ exam: string }>;
}) {
  const { exam } = await params;
  if (!exams.some((e) => e.id === exam)) notFound();
  if (exam === "ssc") redirect("/ssc-cgl/study");
  return <ExamStudyDesk key={exam} examId={exam} />;
}
