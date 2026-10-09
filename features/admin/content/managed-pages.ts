/** Páginas que possuem rota no site. Novas páginas exigem uma rota no código. */
export const MANAGED_PAGES: Record<string, { label: string; path: string }> = {
  sobre: { label: "Sobre a Cerigatto (texto principal)", path: "/sobre" },
  "politica-de-privacidade": { label: "Política de Privacidade", path: "/politica-de-privacidade" },
  "termos-de-uso": { label: "Termos de Uso", path: "/termos-de-uso" },
  cookies: { label: "Política de Cookies", path: "/cookies" },
};
