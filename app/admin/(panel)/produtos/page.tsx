import { Download, Package, Plus, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { CONTENT_STATUS_LABELS } from "@/lib/constants";
import type { ContentStatus } from "@/types/catalog";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form-controls";
import { Pagination } from "@/components/ui/pagination";
import { categoryOptions, getAdminLookups, listAdminProducts, type AdminProductFilters } from "@/features/admin/queries";
import { ProductsTable } from "@/features/admin/products/products-table";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Produtos" };

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  await requireAdmin("editor");
  const params = await searchParams;
  const status = str(params.status) as ContentStatus | undefined;
  const filters: AdminProductFilters = {
    q: str(params.q),
    status: status && status in CONTENT_STATUS_LABELS ? status : undefined,
    category: str(params.categoria),
    brand: str(params.marca),
    flag: str(params.marcador) as AdminProductFilters["flag"],
    sort: str(params.ordem) as AdminProductFilters["sort"],
    page: Number(str(params.pagina) ?? 1) || 1,
  };
  const [result, lookups] = await Promise.all([listAdminProducts(filters), getAdminLookups()]);
  const categories = categoryOptions(lookups.categories);
  const hasFilters = Boolean(filters.q || filters.status || filters.category || filters.brand || filters.flag);

  const buildHref = (page: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && v && k !== "pagina") qs.set(k, v);
    if (page > 1) qs.set("pagina", String(page));
    const s = qs.toString();
    return s ? `/admin/produtos?${s}` : "/admin/produtos";
  };

  return (
    <>
      <AdminPageHeader
        title="Produtos"
        description={`${result.total} produto(s)`}
        crumbs={[{ label: "Produtos" }]}
        actions={
          <>
            <Link href="/admin/produtos/importar" className={buttonVariants({ variant: "outline" })}>
              <Upload aria-hidden="true" /> Importar CSV
            </Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download de arquivo (Route Handler), não navegação */}
            <a href="/admin/produtos/exportar" className={buttonVariants({ variant: "outline" })}>
              <Download aria-hidden="true" /> Exportar CSV
            </a>
            <Link href="/admin/produtos/novo" className={buttonVariants({ variant: "primary" })}>
              <Plus aria-hidden="true" /> Novo produto
            </Link>
          </>
        }
      />

      <form className="mb-5 grid gap-2 rounded-xl border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]">
        <Input name="q" defaultValue={filters.q} placeholder="Nome, SKU ou slug" aria-label="Buscar produtos" />
        <Select name="status" defaultValue={filters.status ?? ""} aria-label="Status">
          <option value="">Todos os status</option>
          {Object.entries(CONTENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="categoria" defaultValue={filters.category ?? ""} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select name="marca" defaultValue={filters.brand ?? ""} aria-label="Marca">
          <option value="">Todas as marcas</option>
          {lookups.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select name="marcador" defaultValue={filters.flag ?? ""} aria-label="Marcador">
          <option value="">Qualquer marcador</option>
          <option value="featured">Destaque</option>
          <option value="on_sale">Oferta</option>
          <option value="new">Novidade</option>
        </Select>
        <Select name="ordem" defaultValue={filters.sort ?? "updated"} aria-label="Ordenação">
          <option value="updated">Atualizados recentemente</option>
          <option value="created">Criados recentemente</option>
          <option value="name">Nome (A–Z)</option>
        </Select>
        <button type="submit" className={buttonVariants({ variant: "secondary" })}>
          Filtrar
        </button>
      </form>

      {result.rows.length ? (
        <>
          <ProductsTable rows={result.rows} categories={categories} />
          <Pagination className="mt-6" page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
        </>
      ) : (
        <EmptyState
          icon={Package}
          title={hasFilters ? "Nenhum produto encontrado com esses filtros" : "Nenhum produto cadastrado"}
          description={hasFilters ? "Ajuste ou limpe os filtros." : "Cadastre o primeiro produto ou importe uma planilha CSV."}
          action={
            <Link href={hasFilters ? "/admin/produtos" : "/admin/produtos/novo"} className={buttonVariants({ variant: "primary" })}>
              {hasFilters ? "Limpar filtros" : "Adicionar primeiro produto"}
            </Link>
          }
        />
      )}
    </>
  );
}
