import Image from "next/image";
export function QuestionFigure({
  figure,
}: {
  figure: { src: string; alt: string } | undefined;
}) {
  if (!figure) return null;
  return (
    <figure className="practice-figure">
      <Image
        src={figure.src}
        alt={figure.alt}
        width={480}
        height={240}
        unoptimized
      />
      <figcaption>{figure.alt}</figcaption>
    </figure>
  );
}
