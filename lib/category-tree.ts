import type { Category, CategoryNode, CategorySummary } from "@/types/catalog";

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>(categories.map((c) => [c.id, { ...c, children: [] }]));
  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (list: CategoryNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR"));
    list.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

/** Caminho da raiz até a categoria (para breadcrumbs) */
export function getCategoryPath(categories: Category[], categoryId: string | null | undefined): CategorySummary[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const path: CategorySummary[] = [];
  const seen = new Set<string>();
  let current = categoryId ? byId.get(categoryId) : undefined;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift({ id: current.id, name: current.name, slug: current.slug, parentId: current.parentId });
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

export function findNode(tree: CategoryNode[], slug: string): CategoryNode | null {
  for (const node of tree) {
    if (node.slug === slug) return node;
    const found = findNode(node.children, slug);
    if (found) return found;
  }
  return null;
}

/** WhatsApp da categoria mais próxima na árvore (subcategoria herda da mãe) */
export function resolveCategoryWhatsApp(categories: Category[], categoryId: string | null | undefined): string | null {
  const path = getCategoryPath(categories, categoryId);
  const byId = new Map(categories.map((c) => [c.id, c]));
  for (let i = path.length - 1; i >= 0; i--) {
    const number = byId.get(path[i]!.id)?.whatsappNumber;
    if (number) return number;
  }
  return null;
}
