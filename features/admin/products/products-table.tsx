"use client";

import { Copy, ExternalLink, ImageOff, Pencil, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ContentStatus } from "@/types/catalog";
import type { ActionResult } from "@/lib/admin/action-result";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Checkbox, Select } from "@/components/ui/form-controls";
import { Badge } from "@/components/ui/primitives";
import { StatusBadge, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { ConfirmAction } from "@/features/admin/ui/client-ui";
import {
  deleteProducts,
  duplicateProduct,
  setProductsCategory,
  setProductsFeatured,
  setProductsStatus,
} from "./actions";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: ContentStatus;
  is_featured: boolean;
  is_on_sale: boolean;
  is_new: boolean;
  updated_at: string;
  price_display: string;
  price: number | null;
  category: { name: string } | null;
  brand: { name: string } | null;
  images: { url: string; is_cover: boolean; sort_order: number }[];
};

export function ProductsTable({ rows, categories }: { rows: AdminProductRow[]; categories: { id: string; label: string }[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [pending, startTransition] = useTransition();
  const ids = [...selected];
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const run = (fn: () => Promise<ActionResult<unknown>>) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        toast.success(result.message ?? "Pronto");
        setSelected(new Set());
        router.refresh();
      } else toast.error(result.error);
    });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      {selected.size > 0 ? (
        <div className="sticky top-16 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-xl border bg-secondary p-3 text-secondary-foreground shadow-lg">
          <span className="px-2 text-sm font-semibold">{selected.size} selecionado(s)</span>
          <Button size="sm" variant="accent" disabled={pending} onClick={() => run(() => setProductsStatus(ids, "published"))}>
            Publicar
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent text-secondary-foreground" disabled={pending} onClick={() => run(() => setProductsStatus(ids, "draft"))}>
            Desativar (rascunho)
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent text-secondary-foreground" disabled={pending} onClick={() => run(() => setProductsFeatured(ids, true))}>
            <Star aria-hidden="true" /> Destacar
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent text-secondary-foreground" disabled={pending} onClick={() => run(() => setProductsFeatured(ids, false))}>
            Remover destaque
          </Button>
          <div className="flex items-center gap-1">
            <Select
              aria-label="Nova categoria"
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="h-9 w-56 text-sm text-foreground"
            >
              <option value="">Alterar categoria…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Button size="sm" variant="accent" disabled={!bulkCategory || pending} onClick={() => run(() => setProductsCategory(ids, bulkCategory))}>
              Aplicar
            </Button>
          </div>
          <a
            href={`/admin/produtos/exportar?ids=${ids.join(",")}`}
            className="inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold hover:bg-secondary-foreground/10"
          >
            Exportar CSV
          </a>
          <ConfirmAction
            trigger={
              <Button size="sm" variant="danger" className="ml-auto">
                <Trash2 aria-hidden="true" /> Excluir
              </Button>
            }
            title={`Excluir ${selected.size} produto(s)?`}
            description="Os produtos deixam de aparecer no site e no painel. A exclusão é lógica (soft delete): um administrador pode recuperá-los pelo banco de dados."
            confirmLabel="Excluir"
            action={() => deleteProducts(ids)}
            onDone={() => {
              setSelected(new Set());
              router.refresh();
            }}
          />
        </div>
      ) : null}

      <Table>
        <thead>
          <tr>
            <Th className="w-10">
              <Checkbox
                aria-label="Selecionar todos"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
              />
            </Th>
            <Th>Produto</Th>
            <Th>SKU</Th>
            <Th>Categoria</Th>
            <Th>Marca</Th>
            <Th>Status</Th>
            <Th>Marcadores</Th>
            <Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const cover = [...row.images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)[0];
            return (
              <tr key={row.id} className={cn("hover:bg-muted/40", selected.has(row.id) && "bg-primary-soft/60")}>
                <Td>
                  <Checkbox aria-label={`Selecionar ${row.name}`} checked={selected.has(row.id)} onChange={() => toggle(row.id)} />
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                      {cover ? (
                        <Image src={cover.url} alt="" fill sizes="44px" className="object-cover" />
                      ) : (
                        <ImageOff className="m-auto mt-3 size-5 text-muted-foreground" aria-label="Sem imagem" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/admin/produtos/${row.id}`} className="line-clamp-1 font-semibold hover:text-primary">
                        {row.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {row.price_display === "show" && row.price != null ? formatCurrency(row.price) : "Preço sob consulta"} · atualizado{" "}
                        {formatDateTime(row.updated_at)}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td className="font-mono text-xs">{row.sku ?? "—"}</Td>
                <Td>{row.category?.name ?? <span className="text-danger">Sem categoria</span>}</Td>
                <Td>{row.brand?.name ?? "—"}</Td>
                <Td>
                  <StatusBadge status={row.status} />
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {row.is_featured ? <Badge tone="accent">Destaque</Badge> : null}
                    {row.is_on_sale ? <Badge tone="danger">Oferta</Badge> : null}
                    {row.is_new ? <Badge tone="ink">Novo</Badge> : null}
                  </div>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/produtos/${row.id}`} className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted" aria-label={`Editar ${row.name}`} title="Editar">
                      <Pencil className="size-4" />
                    </Link>
                    {row.status === "published" ? (
                      <a href={routes.product(row.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted" aria-label="Ver no site" title="Ver no site">
                        <ExternalLink className="size-4" />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      title="Duplicar"
                      aria-label={`Duplicar ${row.name}`}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await duplicateProduct(row.id);
                          if (result.ok && result.data) {
                            toast.success(result.message ?? "Cópia criada");
                            router.push(`/admin/produtos/${result.data.id}`);
                          } else if (!result.ok) toast.error(result.error);
                        })
                      }
                      className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted"
                    >
                      <Copy className="size-4" />
                    </button>
                    <ConfirmAction
                      trigger={
                        <button type="button" title="Excluir" aria-label={`Excluir ${row.name}`} className="inline-flex size-9 items-center justify-center rounded-md text-danger hover:bg-danger/10">
                          <Trash2 className="size-4" />
                        </button>
                      }
                      title="Excluir produto?"
                      description={`"${row.name}" deixará de aparecer no site e no painel.`}
                      confirmLabel="Excluir"
                      action={() => deleteProducts([row.id])}
                      onDone={() => router.refresh()}
                    />
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
