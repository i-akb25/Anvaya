import { releaseUnits } from "./release-content.ts";
import catalog from "./lecture-catalog.json" with { type: "json" };
import { syllabusUnits, type SyllabusUnit } from "./syllabus.ts";
export type LectureResource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  language: "English" | "Hindi" | "Not confirmed";
  kind: "lecture" | "collection" | "course";
  evidenceUrl: string;
  checkedOn: string;
  verification: "publisher-linked" | "publisher-page" | "publisher-indexed";
  youtubeId?: string;
};
export type LectureTopic = {
  id: string;
  title: string;
  subject: string;
  exams: string[];
  resourceIds: string[];
  scope: string;
  aliases: string[];
  lessonSlug?: string;
};
export const lectureResources = catalog.resources as LectureResource[];
export const lectureTopics: LectureTopic[] = [
  ...(catalog.topics as LectureTopic[]),
  ...releaseUnits.map((u) => ({
    id: u.slug,
    title: u.title,
    subject: u.subject,
    exams: u.exams,
    resourceIds: [],
    scope:
      "Source-linked reading and worked lesson available; no video curated yet.",
    aliases: [u.slug.replaceAll("-", " ")],
    lessonSlug: u.slug,
  })),
];
export const lectureCatalogVersion = catalog.version;
export function resourcesForTopic(topic: LectureTopic) {
  return topic.resourceIds.map((id) =>
    lectureResources.find((r) => r.id === id)!,
  );
}
export function lectureTopicsForSyllabus(row: SyllabusUnit) {
  const title = row.title.toLowerCase();
  const ids = new Set(row.topicIds);
  const rules: [RegExp, string[]][] = [
    [
      /polity|constitution|governance/,
      [
        "constitutional-rights",
        "constitution",
        "welfare",
        "local-government",
        "state-government",
        "political-parties",
        "democracy",
        "secularism",
      ],
    ],
    [
      /history|culture/,
      [
        "ancient-history",
        "medieval-history",
        "modern-world",
        "world-wars",
        "resistance",
        "national-movement",
      ],
    ],
    [/geography/, ["climate", "agriculture", "transport", "population"]],
    [/bihar/, ["bihar-special"]],
    [
      /economy|finance|banking/,
      [
        "indian-economy",
        "economic-planning",
        "growth-development",
        "poverty",
        "demand-elasticity",
        "production",
        "markets",
        "national-income",
      ],
    ],
    [/banking/, ["banking-awareness"]],
    [
      /science|general awareness|general studies/,
      [
        "measurement",
        "matter",
        "chemistry",
        "mechanics",
        "energy",
        "light",
        "electricity",
        "sound",
        "cells",
        "health",
      ],
    ],
    [/environment|biodiversity/, ["ecosystems-energy", "natural-environment"]],
    [/current affairs/, ["current-affairs"]],
    [/reasoning|mental ability|decision/, ["reasoning-puzzles"]],
    [
      /quant|numeracy|mathematical abilities|general aptitude/,
      [
        "percentages",
        "percentage-change",
        "ratios",
        "simple-interest",
        "probability",
      ],
    ],
    [/english|reading|verbal/, ["reading-analysis"]],
    [
      /interpretation|statistical|statistics/,
      [
        "data-collection",
        "data-presentation",
        "central-tendency",
        "dispersion",
        "probability",
      ],
    ],
    [/mathematics/, ["linear-algebra", "probability"]],
    [
      /circuits|networks/,
      [
        "ohms-law",
        "series-parallel",
        "kirchhoff",
        "capacitor-energy",
        "rc-transients",
        "networks",
      ],
    ],
    [/signals/, ["signals"]],
    [/machines/, ["machines"]],
    [/power systems/, ["power"]],
    [/control/, ["control"]],
    [/measurements/, ["measurements"]],
    [/sensors|industrial instrumentation/, ["sensors"]],
    [/analog/, ["analog"]],
    [/digital|electronics,/, ["digital"]],
    [/power electronics/, ["power-electronics"]],
    [/communications|communication and optical/, ["communications"]],
    [/optical/, ["optical-instruments"]],
    [
      /electromagnet|electricity and magnetism|fields/,
      ["electromagnetic-fields"],
    ],
    [/electronic devices/, ["electronic-devices"]],
    [/ethics/, ["ethics"]],
    [/computer|data entry/, ["computer-skills"]],
  ];
  for (const [pattern, topics] of rules)
    if (pattern.test(title)) topics.forEach((id) => ids.add(id));
  return lectureTopics.filter(
    (t) => ids.has(t.id) && t.exams.includes(row.examId),
  );
}
export type LectureFilters = {
  exam?: string;
  subject?: string;
  query?: string;
  language?: string;
  publisher?: string;
  availability?: string;
  syllabusId?: string;
};
export function filterLectureTopics(filters: LectureFilters) {
  const {
    exam = "all",
    subject = "all",
    query = "",
    language = "all",
    publisher = "all",
    availability = "all",
    syllabusId = "all",
  } = filters;
  const row = syllabusUnits.find(
    (s) => s.id === syllabusId && (exam === "all" || s.examId === exam),
  );
  const mapped = row ? lectureTopicsForSyllabus(row).map((t) => t.id) : [];
  if (syllabusId !== "all" && !row) return [];
  const needle = query.toLocaleLowerCase().trim();
  return lectureTopics.filter((t) => {
    const resources = resourcesForTopic(t);
    return (
      (exam === "all" || t.exams.includes(exam)) &&
      (subject === "all" || t.subject === subject) &&
      (syllabusId === "all" || mapped.includes(t.id)) &&
      (availability !== "available" || resources.length > 0) &&
      (availability !== "gaps" || resources.length === 0) &&
      ((language === "all" && publisher === "all") ||
        resources.some(
          (r) =>
            (language === "all" || r.language === language) &&
            (publisher === "all" || r.publisher === publisher),
        )) &&
      [
        t.title,
        t.subject,
        ...t.aliases,
        ...resources.flatMap((r) => [r.title, r.publisher]),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle)
    );
  });
}
export function lectureKey(exam: string, topicId: string, resourceId: string) {
  const topic = lectureTopics.find(
    (t) =>
      t.id === topicId &&
      t.exams.includes(exam) &&
      t.resourceIds.includes(resourceId),
  );
  if (!topic)
    throw Error("Lecture does not belong to this exam/topic context.");
  return `${exam}:${topicId}:${resourceId}`;
}
export function youtubeEmbed(resource: LectureResource, seconds = 0) {
  if (
    !resource.youtubeId ||
    !/^[\w-]{11}$/.test(resource.youtubeId) ||
    !Number.isInteger(seconds) ||
    seconds < 0 ||
    seconds > 86400
  )
    return null;
  return `https://www.youtube-nocookie.com/embed/${resource.youtubeId}?start=${seconds}&rel=0`;
}
export function verificationLabel(resource: LectureResource) {
  return {
    "publisher-linked": "Linked by the publisher",
    "publisher-page": "Publisher page checked",
    "publisher-indexed": "Publisher search listing checked",
  }[resource.verification];
}
