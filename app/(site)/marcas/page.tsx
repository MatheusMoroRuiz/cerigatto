import { Tag } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { absoluteUrl } from "@/lib/env";
import { routes } from "@/lib/routes";
import { getBrands } from "@/services/catalog";
import { EmptyState } from "@/components/ui/feedback";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Marcas",
  description: "Conheça as marcas de materiais de construção e acabamento disponíveis no catálogo da Cerigatto, em Bauru/SP.",
  alternates: { canonical: absoluteUrl(routes.brands()) },
};

export default async function BrandsPage() {
  const brands = await getBrands();
  const groups = new Map<string, typeof brands>();
  for (const brand of [...brands].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))) {
    const letter = brand.name[0]?.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "") ?? "#";
    groups.set(letter, [...(groups.get(letter) ?? []), brand]);
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Marcas" }]}
        eyebrow="Marcas"
        title="Marcas do catálogo"
        description="Encontre produtos pela marca de sua preferência."
      />
      <Container className="py-10 sm:py-14">
        {brands.length === 0 ? (
          <EmptyState icon={Tag} title="Nenhuma marca cadastrada" description="As marcas aparecerão aqui assim que forem cadastradas no painel." />
        ) : (
          <div className="space-y-10">
            {[...groups.entries()].map(([letter, items]) => (
              <section key={letter} aria-labelledby={`letra-${letter}`} className="grid gap-4 sm:grid-cols-[80px_1fr]">
                <h2 id={`letra-${letter}`} className="font-display text-4xl font-bold text-primary">
                  {letter}
                </h2>
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {items.map((brand) => (
                    <li key={brand.id}>
                      <Link
                        href={routes.brand(brand.slug)}
                        className="group flex h-full min-h-28 flex-col justify-between rounded-lg border bg-surface p-5 transition-colors hover:border-foreground"
                      >
                        {brand.logoUrl ? (
                          <Image src={brand.logoUrl} alt={brand.name} width={160} height={60} className="h-10 w-auto object-contain object-left" />
                        ) : (
                          <span className="font-display text-lg font-bold" style={{ fontStretch: "115%" }}>
                            {brand.name}
                          </span>
                        )}
                        <span className="mt-4 text-sm font-semibold text-primary group-hover:underline">Ver produtos</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
