import { studyUnits } from "@/lib/platform/content";
import { UnitReader } from "@/components/platform/learning";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return studyUnits.map((u) => ({ slug: u.slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = studyUnits.find((u) => u.slug === slug);
  if (!unit) notFound();
  return <UnitReader key={slug} unit={unit} />;
}
