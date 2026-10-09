import "server-only";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getRedirect } from "@/services/content";

/**
 * Conteúdo não encontrado: se existir um redirect cadastrado (ex.: slug
 * alterado), redireciona com 301/308; senão, 404.
 */
export async function notFoundOrRedirect(path: string): Promise<never> {
  const target = await getRedirect(path);
  if (target) {
    if (target.statusCode === 302 || target.statusCode === 307) redirect(target.destination);
    permanentRedirect(target.destination);
  }
  notFound();
}
