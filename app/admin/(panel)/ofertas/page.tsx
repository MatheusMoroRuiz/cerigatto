import { Percent } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/primitives";
import { endOffer } from "@/features/admin/system/actions";
import { OfferForm } from "@/features/admin/system/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";
import { ActionButton } from "@/features/admin/ui/client-ui";

export const metadata: Metadata = { title: "Ofertas" };

function windowState(startsAt: string | null, endsAt: string | null) {
  const now = Date.now();
  return {
    ended: endsAt ? Date.parse(endsAt) <= now : false,
    scheduled: startsAt ? Date.parse(startsAt) > now : false,
  };
}

export default async function AdminOffersPage() {
  await requireAdmin("editor");
  await connection();
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("id, name, sku, status, price, price_display, sale_price, sale_label, sale_starts_at, sale_ends_at")
    .eq("is_on_sale", true)
    .is("deleted_at", null)
    .order("sale_ends_at", { ascending: true, nullsFirst: false });
  const offers = data ?? [];

  return (
    <>
      <AdminPageHeader
        title="Ofertas"
        description="Produtos marcados como oferta. Ofertas vencidas saem automaticamente do site; para criar uma nova, edite o produto e marque “Produto em oferta”."
        crumbs={[{ label: "Ofertas" }]}
        actions={
          <Link href="/admin/produtos" className={buttonVariants({ variant: "outline" })}>
            Escolher produto
          </Link>
        }
      />
      {offers.length ? (
        <ul className="grid gap-4">
          {offers.map((o) => {
            const { ended, scheduled } = windowState(o.sale_starts_at, o.sale_ends_at);
            return (
              <li key={o.id} className="rounded-xl border bg-surface p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/admin/produtos/${o.id}`} className="font-semibold hover:text-primary">
                      {o.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {o.sku ? `Cód. ${o.sku} · ` : ""}
                      {o.price_display === "show" && o.price != null ? `Preço normal ${formatCurrency(o.price)}` : "Preço sob consulta (exibe “Oferta especial — consulte condições”)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status !== "published" ? <Badge tone="warning">Produto não publicado</Badge> : null}
                    {ended ? (
                      <Badge tone="muted">Encerrada {o.sale_ends_at ? formatDateTime(o.sale_ends_at) : ""}</Badge>
                    ) : scheduled ? (
                      <Badge tone="warning">Começa {formatDateTime(o.sale_starts_at!)}</Badge>
                    ) : (
                      <Badge tone="success">Vigente</Badge>
                    )}
                    <ActionButton size="sm" variant="ghost" className="text-danger" action={endOffer.bind(null, o.id)}>
                      Encerrar oferta
                    </ActionButton>
                  </div>
                </div>
                <OfferForm product={o} />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={Percent}
          title="Nenhuma oferta ativa"
          description="Edite um produto e marque “Produto em oferta”, com preço promocional e período."
          action={
            <Link href="/admin/produtos" className={buttonVariants()}>
              Ir para produtos
            </Link>
          }
        />
      )}
    </>
  );
}
