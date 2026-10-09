"use client";

import { Download, FileUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { parseCsvToObjects } from "@/lib/csv";
import { importRowSchema, IMPORT_COLUMNS } from "@/lib/validation/import";
import { Button, buttonVariants } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/primitives";
import { AdminCard, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { importProducts, type ImportReport } from "./import-actions";

type PreviewRow = { line: number; raw: Record<string, string>; error: string | null };

export function ImportView() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [mode, setMode] = useState<"create_only" | "create_and_update">("create_only");
  const [report, setReport] = useState<ImportReport | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    setReport(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo acima de 5 MB. Divida em partes menores.");
      return;
    }
    const text = await file.text();
    const { headers, rows: parsed } = parseCsvToObjects(text);
    setFileName(file.name);
    setMissingColumns(["nome"].filter((c) => !headers.includes(c)));
    setRows(
      parsed.slice(0, 2000).map((raw, i) => {
        const result = importRowSchema.safeParse(raw);
        return { line: i + 2, raw, error: result.success ? null : result.error.issues.map((x) => x.message).join(" ") };
      }),
    );
  }

  const valid = rows.filter((r) => !r.error);
  const invalid = rows.length - valid.length;

  return (
    <div className="grid gap-6">
      <AdminCard title="1. Baixe o modelo" description="Use ponto e vírgula (;) como separador — padrão do Excel em português.">
        <div className="flex flex-wrap items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download de arquivo (Route Handler) */}
          <a href="/admin/produtos/importar/modelo" className={buttonVariants({ variant: "outline" })}>
            <Download aria-hidden="true" /> Baixar modelo CSV
          </a>
          <p className="text-sm text-muted-foreground">Colunas: {IMPORT_COLUMNS.join(", ")}.</p>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Categoria e marca devem existir no painel (nome ou slug).</li>
          <li>O SKU identifica o produto. Sem SKU, sempre cria um produto novo.</li>
          <li>Status: rascunho, publicado ou arquivado (padrão: rascunho). Exibição do preço: exibir, consulte, sob-consulta ou ocultar.</li>
          <li>Imagens e variações são adicionadas depois, na edição do produto.</li>
        </ul>
      </AdminCard>

      <AdminCard title="2. Envie a planilha">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-strong bg-muted/30 px-4 py-10 text-center hover:border-primary">
          <FileUp className="size-7 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-semibold">{fileName ?? "Escolher arquivo .csv"}</span>
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
        </label>
        {missingColumns.length ? <Notice tone="danger" className="mt-4">Coluna obrigatória ausente: {missingColumns.join(", ")}.</Notice> : null}
      </AdminCard>

      {rows.length ? (
        <AdminCard
          title="3. Confira a pré-visualização"
          description={`${rows.length} linha(s): ${valid.length} válida(s), ${invalid} com erro (serão ignoradas).`}
        >
          <Table>
            <thead>
              <tr>
                <Th>Linha</Th>
                <Th>SKU</Th>
                <Th>Nome</Th>
                <Th>Categoria</Th>
                <Th>Marca</Th>
                <Th>Preço</Th>
                <Th>Status</Th>
                <Th>Validação</Th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((row) => (
                <tr key={row.line} className={row.error ? "bg-danger/5" : undefined}>
                  <Td className="font-mono text-xs">{row.line}</Td>
                  <Td className="font-mono text-xs">{row.raw.sku || "—"}</Td>
                  <Td>{row.raw.nome}</Td>
                  <Td>{row.raw.categoria}</Td>
                  <Td>{row.raw.marca}</Td>
                  <Td>{row.raw.preco}</Td>
                  <Td>{row.raw.status || "rascunho"}</Td>
                  <Td>{row.error ? <span className="text-xs text-danger">{row.error}</span> : <Badge tone="success">OK</Badge>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {rows.length > 200 ? <p className="mt-2 text-xs text-muted-foreground">Mostrando as 200 primeiras linhas.</p> : null}

          <fieldset className="mt-6 grid gap-2">
            <legend className="mb-2 text-sm font-semibold">Quando o SKU já existir:</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" checked={mode === "create_only"} onChange={() => setMode("create_only")} />
              Ignorar a linha (não altera produtos existentes)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" checked={mode === "create_and_update"} onChange={() => setMode("create_and_update")} />
              Atualizar o produto existente com os dados da planilha
            </label>
          </fieldset>

          <Button
            className="mt-6"
            variant="primary"
            size="lg"
            disabled={pending || valid.length === 0 || missingColumns.length > 0}
            onClick={() =>
              startTransition(async () => {
                const result = await importProducts({ rows: valid.map((r) => r.raw), mode });
                if (result.ok && result.data) {
                  setReport(result.data);
                  toast.success(result.message ?? "Importação concluída");
                } else if (!result.ok) toast.error(result.error);
              })
            }
          >
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Importar {valid.length} linha(s)
          </Button>
        </AdminCard>
      ) : null}

      {report ? (
        <AdminCard title="Resultado">
          <p className="text-sm">
            <strong>{report.created}</strong> criado(s) · <strong>{report.updated}</strong> atualizado(s) · <strong>{report.skipped}</strong> ignorado(s) ·{" "}
            <strong>{report.errors.length}</strong> com erro
          </p>
          {report.errors.length ? (
            <ul className="mt-3 space-y-1 text-sm text-danger">
              {report.errors.map((e) => (
                <li key={e.line}>
                  Linha {e.line}: {e.message}
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/admin/produtos?ordem=created" className={`${buttonVariants({ variant: "outline" })} mt-4`}>
            Ver produtos importados
          </Link>
        </AdminCard>
      ) : null}
    </div>
  );
}
