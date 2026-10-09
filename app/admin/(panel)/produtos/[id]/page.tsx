import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { categoryOptions, getAdminLookups } from "@/features/admin/queries";
import { getCategoryAttributeMap, getProductForEdit } from "@/features/admin/products/load";
import { ProductForm } from "@/features/admin/products/product-form";
import { AdminPageHeader, StatusBadge } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, lookups, categoryAttributes] = await Promise.all([getProductForEdit(id), getAdminLookups(), getCategoryAttributeMap()]);
  if (!product) notFound();
  return (
    <>
      <AdminPageHeader
        title={product.input.name}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={product.status} /> Atualizado em {formatDateTime(product.updatedAt)}
          </span>
        }
        crumbs={[{ label: "Produtos", href: "/admin/produtos" }, { label: "Editar" }]}
      />
      <ProductForm
        key={product.updatedAt}
        isNew={false}
        initial={product.input}
        initialRelated={product.relatedProducts}
        lookups={{
          categories: categoryOptions(lookups.categories),
          brands: lookups.brands,
          attributes: lookups.attributes,
          environments: lookups.environments,
          categoryAttributes,
        }}
      />
    </>
  );
}
