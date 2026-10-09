import { Image as ImageIcon, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/primitives";
import { deleteBanner, toggleBanner } from "@/features/admin/content/actions";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";
import { ActionButton } from "@/features/admin/ui/client-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Banners" };

/** Situação do banner em relação ao período programado */
function windowState(startsAt: string | null, endsAt: string | null) {
  const now = Date.now();
  return {
    expired: endsAt ? Date.parse(endsAt) <= now : false,
    scheduled: startsAt ? Date.parse(startsAt) > now : false,
  };
}

const PLACEMENT_LABEL: Record<string, string> = {
  home_hero: "Home — principal",
  home_middle: "Home — intermediário",
  home_specialist: "Home — especialistas",
  catalog_top: "Catálogo — topo",
};

export default async function AdminBannersPage() {
  const session = await requireAdmin("editor");
  await connection();
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("banners").select("*").order("placement").order("sort_order");
  const banners = data ?? [];

  return (
    <>
      <AdminPageHeader
        title="Banners"
        description="Imagens e chamadas da Home. Banners fora do período programado ficam ocultos automaticamente."
        crumbs={[{ label: "Banners" }]}
        actions={
          <Link href="/admin/banners/novo" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Novo banner
          </Link>
        }
      />
      {banners.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((b) => {
            const { expired, scheduled } = windowState(b.starts_at, b.ends_at);
            return (
              <li key={b.id} className="overflow-hidden rounded-xl border bg-surface">
                <div className="relative aspect-[12/5] bg-muted">
                  <Image src={b.desktop_image_url} alt="" fill sizes="400px" className="object-cover" />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <Badge tone="ink">{PLACEMENT_LABEL[b.placement]}</Badge>
                    {!b.is_active ? <Badge tone="muted">Inativo</Badge> : expired ? <Badge tone="danger">Expirado</Badge> : scheduled ? <Badge tone="warning">Agendado</Badge> : <Badge tone="success">No ar</Badge>}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold">{b.internal_name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{b.title ?? "Sem título"}</p>
                  {b.starts_at || b.ends_at ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b.starts_at ? `De ${formatDateTime(b.starts_at)} ` : ""}
                      {b.ends_at ? `até ${formatDateTime(b.ends_at)}` : ""}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/admin/banners/${b.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      <Pencil aria-hidden="true" /> Editar
                    </Link>
                    <ActionButton size="sm" variant="ghost" action={toggleBanner.bind(null, b.id, !b.is_active)}>
                      {b.is_active ? "Desativar" : "Ativar"}
                    </ActionButton>
                    {session.role !== "editor" ? (
                      <div className="ml-auto">
                        <DeleteButton compact action={deleteBanner.bind(null, b.id)} entityLabel={`o banner "${b.internal_name}"`} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="Nenhum banner cadastrado"
          description="Sem banners, a Home exibe uma abertura tipográfica com a busca."
          action={
            <Link href="/admin/banners/novo" className={buttonVariants()}>
              Criar banner
            </Link>
          }
        />
      )}
    </>
  );
}
