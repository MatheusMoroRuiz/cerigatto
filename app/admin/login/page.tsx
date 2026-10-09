import type { Metadata } from "next";
import { Suspense } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { Notice } from "@/components/ui/feedback";
import { Tape } from "@/components/ui/primitives";
import { LoginForm } from "@/features/admin/auth/auth-forms";

export const metadata: Metadata = { title: "Entrar" };

async function LoginContent({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  return isSupabaseConfigured() ? (
    <LoginForm next={next} />
  ) : (
    <Notice tone="warning">
      O painel precisa do Supabase configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      (veja o README).
    </Notice>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 text-secondary-foreground lg:flex">
        <div>
          <p className="font-display text-3xl font-extrabold italic" style={{ fontStretch: "112%" }}>
            CERIGA<span className="text-accent">TT</span>O
          </p>
          <p className="mt-1 font-mono text-xs tracking-[0.16em] text-secondary-foreground/60 uppercase">Painel administrativo</p>
        </div>
        <p className="font-display max-w-md text-4xl leading-tight font-bold">
          Catálogo, vitrines e atendimento — tudo em um só lugar.
        </p>
        <Tape className="absolute inset-x-0 bottom-0" />
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold">Entrar no painel</h1>
          <p className="mt-1 mb-8 text-sm text-muted-foreground">Acesso restrito à equipe da Cerigatto.</p>
          <Suspense fallback={<div className="skeleton h-64 rounded-md" />}>
            <LoginContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
