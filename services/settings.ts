import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";
import { getSource } from "./sources";

export async function getSiteConfig() {
  "use cache";
  cacheLife("settings");
  cacheTag(CACHE_TAGS.settings);
  return getSource().getSiteConfig();
}
