import Link from "next/link";
import { routes } from "@/lib/routes";
import { getCategoryTree } from "@/services/catalog";
import { buttonVariants } from "@/components/ui/button";
import { Container, Tape } from "@/components/ui/primitives";
import { SearchBar } from "@/features/search/search-bar";

/** 404 amigável: busca, departamentos e caminho de volta */
export async function NotFoundContent() {
  const tree = await getCategoryTree();
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-mono text-sm tracking-[0.16em] text-muted-foreground uppercase">Erro 404</p>
        <Tape thin className="mt-4 w-24" />
        <h1 className="font-display mt-6 text-4xl leading-tight font-bold text-balance sm:text-5xl">
          Essa página saiu da obra.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          O endereço pode ter mudado ou o produto não está mais no catálogo. Tente buscar pelo nome ou código:
        </p>
        <div className="mt-8">
          <SearchBar />
        </div>
        {tree.length ? (
          <div className="mt-10">
            <p className="mb-3 text-sm font-semibold">Ou navegue pelos departamentos</p>
            <ul className="flex flex-wrap gap-2">
              {tree.map((c) => (
                <li key={c.id}>
                  <Link
                    href={routes.category(c.slug)}
                    className="inline-flex rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-medium hover:border-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Link href={routes.home()} className={`${buttonVariants({ variant: "secondary", size: "lg" })} mt-10`}>
          Voltar para a página inicial
        </Link>
      </div>
    </Container>
  );
}
