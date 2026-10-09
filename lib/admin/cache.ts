import "server-only";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";

/**
 * Invalida o cache público após alterações no painel (leitura imediata da
 * própria escrita). Chame somente dentro de Server Actions.
 */
export function invalidate(...tags: string[]) {
  for (const tag of new Set(tags)) updateTag(tag);
}

export const invalidateProduct = (slug?: string | null, previousSlug?: string | null) =>
  invalidate(
    CACHE_TAGS.products,
    CACHE_TAGS.collections,
    ...(slug ? [CACHE_TAGS.product(slug)] : []),
    ...(previousSlug ? [CACHE_TAGS.product(previousSlug), CACHE_TAGS.redirects] : []),
  );
