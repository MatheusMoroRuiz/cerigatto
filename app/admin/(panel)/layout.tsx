import { Suspense } from "react";
import { ROLE_LABELS, requireAdmin } from "@/lib/auth/session";
import { Skeleton } from "@/components/ui/primitives";
import { AdminShell } from "@/features/admin/shell/admin-shell";

async function Gate({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin("editor");
  return (
    <AdminShell role={session.role} roleLabel={ROLE_LABELS[session.role]} userLabel={session.name ?? session.email ?? "Equipe"}>
      {children}
    </AdminShell>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh">
      <div className="hidden w-64 bg-secondary lg:block" />
      <div className="flex-1 space-y-4 p-8">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

/** Todo o painel exige autenticação verificada no servidor */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
