import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getDiaryPath } from "@/utils/getDiaryPath";
import getSortedEntries from "@/utils/getSortedEntries";
import { SITE } from "@/config";

export async function GET() {
  const entries = await getCollection("diary");
  const sortedEntries = getSortedEntries(entries);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedEntries.map(({ data, id }) => ({
      link: getDiaryPath(id, data),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.pubDatetime),
      categories: data.tags,
    })),
  });
}
