import type { NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import {
  newsFeeds,
  pullNewsFeed,
  type NewsSource,
} from "@/lib/platform/news-feed";
import { NextResponse } from "next/server";
const cached = {
  rbi: unstable_cache(() => pullNewsFeed("rbi"), ["anvaya-rbi-headlines-v1"], {
    revalidate: 900,
  }),
  pib: unstable_cache(() => pullNewsFeed("pib"), ["anvaya-pib-headlines-v1"], {
    revalidate: 900,
  }),
};
export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") ?? "rbi";
  if (!Object.hasOwn(newsFeeds, source))
    return NextResponse.json(
      { error: "Choose RBI or PIB." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  try {
    return NextResponse.json(
      {
        ...(await cached[source as NewsSource]()),
        classification:
          "Publisher feed metadata; individual stories not reviewed",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "The publisher feed could not be loaded. Open the official publisher; curated selections and your journal remain available.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
