import { ShieldX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Sem permissão" };

export default function NoPermissionPage() {
  return (
    <EmptyState
      icon={ShieldX}
      title="Você não tem permissão para acessar esta área"
      description="Peça a um super administrador para ajustar o seu papel em Administradores."
      action={
        <Link href="/admin" className={buttonVariants()}>
          Voltar ao dashboard
        </Link>
      }
    />
  );
}
