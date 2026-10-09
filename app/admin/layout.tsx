import type { Metadata } from "next";

/** Painel é dinâmico e autenticado: navegação pode aguardar o servidor */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Cerigatto" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-dvh flex-col bg-background">{children}</div>;
}
