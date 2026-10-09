import type { Metadata } from "next";
import { NewPasswordForm } from "@/features/admin/auth/auth-forms";

export const metadata: Metadata = { title: "Nova senha" };

export default function NewPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold">Criar nova senha</h1>
        <p className="mt-1 mb-8 text-sm text-muted-foreground">Defina a senha de acesso ao painel.</p>
        <NewPasswordForm />
      </div>
    </main>
  );
}
