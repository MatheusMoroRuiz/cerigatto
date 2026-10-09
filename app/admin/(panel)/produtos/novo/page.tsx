import type { Metadata } from "next";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { categoryOptions, getAdminLookups } from "@/features/admin/queries";
import { emptyProduct, getCategoryAttributeMap } from "@/features/admin/products/load";
import { ProductForm } from "@/features/admin/products/product-form";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  await requireAdmin("editor");
  await connection();
  const [lookups, categoryAttributes] = await Promise.all([getAdminLookups(), getCategoryAttributeMap()]);
  return (
    <>
      <AdminPageHeader title="Novo produto" crumbs={[{ label: "Produtos", href: "/admin/produtos" }, { label: "Novo" }]} />
      <ProductForm
        isNew
        initial={emptyProduct(crypto.randomUUID())}
        initialRelated={[]}
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
