import { z } from "zod";
import { parseDecimal } from "@/lib/format";

/** Colunas do modelo CSV de produtos (cabeçalhos aceitam acentos e maiúsculas) */
export const IMPORT_COLUMNS = [
  "sku",
  "nome",
  "categoria",
  "marca",
  "descricao",
  "preco",
  "status",
  "descricao_curta",
  "preco_promocional",
  "exibicao_preco",
  "unidade",
] as const;

export const EXPORT_COLUMNS = [
  "sku",
  "nome",
  "slug",
  "categoria",
  "marca",
  "descricao_curta",
  "descricao",
  "preco",
  "preco_promocional",
  "exibicao_preco",
  "unidade",
  "disponibilidade",
  "status",
  "destaque",
  "oferta",
] as const;

const STATUS_MAP: Record<string, "draft" | "published" | "archived"> = {
  rascunho: "draft",
  draft: "draft",
  publicado: "published",
  published: "published",
  ativo: "published",
  arquivado: "archived",
  archived: "archived",
  inativo: "draft",
};

const PRICE_DISPLAY_MAP: Record<string, "show" | "consult" | "on_request" | "hidden"> = {
  exibir: "show",
  show: "show",
  consulte: "consult",
  consult: "consult",
  "sob-consulta": "on_request",
  sob_consulta: "on_request",
  on_request: "on_request",
  ocultar: "hidden",
  hidden: "hidden",
};

const key = (v: string) => v.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");

export const importRowSchema = z
  .object({
    sku: z.string().trim().max(64).optional().default(""),
    nome: z.string().trim().min(2, "Nome obrigatório.").max(200, "Nome muito longo."),
    categoria: z.string().trim().max(120).optional().default(""),
    marca: z.string().trim().max(120).optional().default(""),
    descricao: z.string().trim().max(20000).optional().default(""),
    descricao_curta: z.string().trim().max(400, "Descrição curta acima de 400 caracteres.").optional().default(""),
    preco: z.string().optional().default(""),
    preco_promocional: z.string().optional().default(""),
    exibicao_preco: z.string().optional().default(""),
    unidade: z.string().trim().max(40).optional().default(""),
    status: z.string().optional().default(""),
  })
  .transform((row, ctx) => {
    const price = row.preco.trim() ? parseDecimal(row.preco) : null;
    if (row.preco.trim() && (price === null || price < 0)) ctx.addIssue({ code: "custom", message: "Preço inválido.", path: ["preco"] });
    const salePrice = row.preco_promocional.trim() ? parseDecimal(row.preco_promocional) : null;
    if (row.preco_promocional.trim() && (salePrice === null || salePrice < 0))
      ctx.addIssue({ code: "custom", message: "Preço promocional inválido.", path: ["preco_promocional"] });
    const status = row.status.trim() ? STATUS_MAP[key(row.status)] : "draft";
    if (!status) ctx.addIssue({ code: "custom", message: "Status deve ser rascunho, publicado ou arquivado.", path: ["status"] });
    const display = row.exibicao_preco.trim() ? PRICE_DISPLAY_MAP[key(row.exibicao_preco)] : price != null ? "show" : "consult";
    if (!display) ctx.addIssue({ code: "custom", message: "Exibição de preço inválida.", path: ["exibicao_preco"] });
    return {
      sku: row.sku || null,
      name: row.nome,
      category: row.categoria || null,
      brand: row.marca || null,
      description: row.descricao || null,
      shortDescription: row.descricao_curta || null,
      price,
      salePrice,
      priceDisplay: display ?? "consult",
      unit: row.unidade || "unidade",
      status: status ?? "draft",
    };
  });

export type ImportRow = z.output<typeof importRowSchema>;

export function templateCsvRows(): string[][] {
  return [
    ["SKU-0001", "Exemplo de produto 90x90", "Porcelanatos", "Nome da marca", "Descrição completa do produto.", "189,90", "rascunho", "Resumo curto", "", "exibir", "caixa"],
  ];
}
