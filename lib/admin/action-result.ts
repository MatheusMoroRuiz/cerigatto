/** Resultado padrão das Server Actions do painel */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Traduz erros comuns do PostgreSQL para mensagens úteis ao usuário */
export function friendlyDbError(error: { code?: string; message: string } | null, fallback = "Não foi possível salvar."): string {
  if (!error) return fallback;
  if (error.code === "23505") {
    if (/slug/.test(error.message)) return "Já existe um item com este endereço (slug). Escolha outro.";
    if (/sku/.test(error.message)) return "Já existe um produto com este SKU/código.";
    return "Já existe um registro com estes dados.";
  }
  if (error.code === "23503") return "Este item está em uso por outros registros e não pode ser removido.";
  if (error.code === "42501") return "Você não tem permissão para esta ação.";
  if (error.code === "23514") return "Algum valor está fora do formato permitido. Revise os campos.";
  if (error.code === "P0001") return error.message;
  return fallback;
}
