import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { ImportView } from "@/features/admin/products/import-view";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Importar produtos" };

export default async function ImportPage() {
  await requireAdmin("editor");
  return (
    <>
      <AdminPageHeader
        title="Importar produtos (CSV)"
        description="Cadastre ou atualize produtos em massa a partir de uma planilha."
        crumbs={[{ label: "Produtos", href: "/admin/produtos" }, { label: "Importar" }]}
      />
      <ImportView />
    </>
  );
}
