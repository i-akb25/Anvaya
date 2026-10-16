import { XMLParser } from "fast-xml-parser";
export const newsFeeds = {
  rbi: {
    title: "RBI press releases",
    url: "https://rbi.org.in/pressreleases_rss.xml",
    hosts: ["rbi.org.in", "www.rbi.org.in", "m.rbi.org.in"],
  },
  pib: {
    title: "PIB press releases",
    url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    hosts: ["pib.gov.in", "www.pib.gov.in"],
  },
};
export type NewsSource = keyof typeof newsFeeds;
export type NewsHeadline = { title: string; url: string; publishedAt: string };
export function sourceLink(raw: unknown, source: NewsSource) {
  if (typeof raw !== "string" || raw.length > 2000) return null;
  try {
    const u = new URL(raw.replaceAll("&amp;", "&"));
    return u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      newsFeeds[source].hosts.includes(u.hostname)
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function parseNewsFeed(xml: string, source: NewsSource): NewsHeadline[] {
  if (
    new TextEncoder().encode(xml).length > 256000 ||
    /<!\s*(?:DOCTYPE|ENTITY)/i.test(xml)
  )
    throw Error("Unsafe or oversized feed");
  const parser = new XMLParser({
    ignoreAttributes: true,
    processEntities: false,
    parseTagValue: false,
    trimValues: true,
  });
  const parsed = parser.parse(xml);
  const raw = parsed?.rss?.channel?.item;
  if (!raw) throw Error("RSS items unavailable");
  const items = Array.isArray(raw) ? raw : [raw];
  const seen = new Set<string>();
  return items
    .slice(0, 200)
    .flatMap((item) => {
      const url = sourceLink(item?.link, source),
        title =
          typeof item?.title === "string"
            ? item.title
                .replace(/<[^>]*>/g, "")
                .replaceAll("&amp;", "&")
                .trim()
            : "",
        date =
          typeof item?.pubDate === "string" ? Date.parse(item.pubDate) : NaN;
      if (
        !url ||
        !title ||
        title.length > 500 ||
        !Number.isFinite(date) ||
        seen.has(url)
      )
        return [];
      seen.add(url);
      return [{ title, url, publishedAt: new Date(date).toISOString() }];
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 20);
}
export async function pullNewsFeed(
  source: NewsSource,
  fetcher: typeof fetch = fetch,
) {
  let url = newsFeeds[source].url;
  for (let redirects = 0; redirects <= 2; redirects++) {
    const r = await fetcher(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      cache: "no-store",
    });
    if ([301, 302, 303, 307, 308].includes(r.status)) {
      const location = r.headers.get("location");
      await r.body?.cancel();
      const next = location && sourceLink(new URL(location, url).href, source);
      if (!next) throw Error("Feed redirected outside its publisher");
      url = next;
      continue;
    }
    if (!r.ok || !r.body) {
      await r.body?.cancel();
      throw Error("Publisher feed unavailable");
    }
    const reader = r.body.getReader(),
      parts: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 256000) {
        await reader.cancel();
        throw Error("Oversized feed");
      }
      parts.push(chunk.value);
    }
    const all = new Uint8Array(size);
    let start = 0;
    for (const part of parts) {
      all.set(part, start);
      start += part.byteLength;
    }
    const items = parseNewsFeed(new TextDecoder().decode(all), source);
    if (!items.length) throw Error("No usable publisher metadata");
    return {
      source,
      title: newsFeeds[source].title,
      checkedAt: new Date().toISOString(),
      items,
    };
  }
  throw Error("Too many publisher redirects");
}
