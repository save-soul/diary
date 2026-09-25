import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { getDiaryRouteParams } from "@/utils/getDiaryPath";
import getSortedEntries from "@/utils/getSortedEntries";
import type { DiaryEntry } from "@/types";
import { SITE } from "@/config";

export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const entries = getSortedEntries(await getCollection("diary")).filter(
    ({ data }) => !data.ogImage
  );

  return entries.map(entry => ({
    params: getDiaryRouteParams(entry.id, entry.data),
    props: entry,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  if (!SITE.dynamicOgImage) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return new Response(await generateOgImageForPost(props as DiaryEntry), {
    headers: { "Content-Type": "image/png" },
  });
};
