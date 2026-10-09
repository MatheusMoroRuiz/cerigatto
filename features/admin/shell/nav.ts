import type { AppRole } from "@/types/catalog";

export type AdminNavItem = { href: string; label: string; icon: string; minRole: AppRole };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Visão geral",
    items: [{ href: "/admin", label: "Dashboard", icon: "layout-dashboard", minRole: "editor" }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: "package", minRole: "editor" },
      { href: "/admin/categorias", label: "Categorias", icon: "folder-tree", minRole: "editor" },
      { href: "/admin/marcas", label: "Marcas", icon: "tag", minRole: "editor" },
      { href: "/admin/atributos", label: "Atributos", icon: "list-checks", minRole: "editor" },
      { href: "/admin/ofertas", label: "Ofertas", icon: "percent", minRole: "editor" },
    ],
  },
  {
    label: "Vitrine e conteúdo",
    items: [
      { href: "/admin/banners", label: "Banners", icon: "image", minRole: "editor" },
      { href: "/admin/vitrines", label: "Coleções / Vitrines", icon: "layout-grid", minRole: "editor" },
      { href: "/admin/ambientes", label: "Ambientes", icon: "sofa", minRole: "editor" },
      { href: "/admin/dicas", label: "Blog / Dicas", icon: "newspaper", minRole: "editor" },
      { href: "/admin/paginas", label: "Páginas", icon: "file-text", minRole: "editor" },
    ],
  },
  {
    label: "Atendimento",
    items: [
      { href: "/admin/contatos", label: "Contatos", icon: "inbox", minRole: "editor" },
      { href: "/admin/solicitacoes", label: "Solicitações", icon: "clipboard-list", minRole: "editor" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/seo", label: "SEO e redirects", icon: "search-check", minRole: "admin" },
      { href: "/admin/configuracoes", label: "Configurações", icon: "settings", minRole: "admin" },
      { href: "/admin/administradores", label: "Administradores", icon: "users", minRole: "super_admin" },
      { href: "/admin/auditoria", label: "Auditoria", icon: "history", minRole: "admin" },
    ],
  },
];
