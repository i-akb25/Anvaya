import { lectureTopics } from "@/lib/platform/lectures";
import { LectureReader } from "@/components/platform/lectures";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return lectureTopics.map((t) => ({ slug: t.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = lectureTopics.find((t) => t.id === slug);
  return { title: `${topic?.title ?? "Topic not found"} | Anvaya lectures` };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = lectureTopics.find((t) => t.id === slug);
  if (!topic) notFound();
  return <LectureReader key={slug} topic={topic} />;
}
