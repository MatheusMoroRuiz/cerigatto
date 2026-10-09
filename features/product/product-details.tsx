import { ChevronDown } from "lucide-react";
import type { ProductDetail } from "@/types/catalog";
import { formatNumber } from "@/lib/format";
import { toEmbedUrl } from "@/lib/video";
import { Markdown } from "@/components/ui/markdown";
import { Heading } from "@/components/ui/primitives";

function formatSpecValue(value: string, unit: string | null): string {
  if (!unit) return value;
  // Só acrescenta a unidade quando o valor é numérico (ex.: "9,5" -> "9,5 mm")
  return /^[\d.,\s–-]+$/.test(value) ? `${value} ${unit}` : value;
}

/** Agrupa especificações ("Dimensões", "Embalagem"...) para a tabela técnica */
export function groupSpecifications(specs: ProductDetail["specifications"]) {
  const groups = new Map<string, { label: string; value: string }[]>();
  for (const spec of specs) {
    const list = groups.get(spec.group) ?? [];
    list.push({ label: spec.label, value: formatSpecValue(spec.value, spec.unit) });
    groups.set(spec.group, list);
  }
  return [...groups.entries()];
}

function SpecTable({ rows, caption }: { rows: { label: string; value: string }[]; caption: string }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.label}-${row.value}`} className="border-b last:border-b-0">
            <th scope="row" className="w-2/5 py-3 pr-4 text-left font-medium text-muted-foreground">
              {row.label}
            </th>
            <td className="py-3 font-medium">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Descrição, especificações, medidas, informações adicionais, vídeo e FAQ */
export function ProductDetails({ product }: { product: ProductDetail }) {
  const specGroups = groupSpecifications(product.specifications);
  const measures = [
    product.dimensions ? { label: "Dimensões", value: product.dimensions } : null,
    product.weightKg != null ? { label: "Peso", value: `${formatNumber(product.weightKg)} kg` } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);
  const additional = [
    product.manufacturer ? { label: "Fabricante", value: product.manufacturer } : null,
    product.brand ? { label: "Marca", value: product.brand.name } : null,
    product.model ? { label: "Modelo", value: product.model } : null,
    product.sku ? { label: "Código (SKU)", value: product.sku } : null,
    product.warranty ? { label: "Garantia", value: product.warranty } : null,
    product.packageContents ? { label: "Conteúdo da embalagem", value: product.packageContents } : null,
    product.environments.length ? { label: "Ambientes indicados", value: product.environments.map((e) => e.name).join(", ") } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);
  const video = toEmbedUrl(product.videoUrl);

  return (
    <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <div className="min-w-0 space-y-12">
        {product.description ? (
          <section aria-labelledby="descricao">
            <Heading id="descricao" size="sm" className="mb-5">
              Descrição
            </Heading>
            <Markdown>{product.description}</Markdown>
          </section>
        ) : null}

        {video ? (
          <section aria-labelledby="video">
            <Heading id="video" size="sm" className="mb-5">
              Vídeo
            </Heading>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
              <iframe
                src={video}
                title={`Vídeo: ${product.name}`}
                className="absolute inset-0 size-full"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        {product.notes ? (
          <section aria-labelledby="observacoes" className="rounded-lg border-l-4 border-accent bg-surface p-5">
            <h2 id="observacoes" className="mb-2 font-semibold">
              Observações
            </h2>
            <Markdown>{product.notes}</Markdown>
          </section>
        ) : null}

        {product.faqs.length ? (
          <section aria-labelledby="perguntas">
            <Heading id="perguntas" size="sm" className="mb-5">
              Perguntas frequentes
            </Heading>
            <div className="divide-y rounded-lg border bg-surface">
              {product.faqs.map((faq) => (
                <details key={faq.id} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <Markdown>{faq.answer}</Markdown>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="space-y-8">
        {specGroups.length ? (
          <section aria-labelledby="especificacoes" className="rounded-xl border bg-surface p-6">
            <Heading id="especificacoes" size="sm" className="mb-4">
              Especificações técnicas
            </Heading>
            <div className="space-y-6">
              {specGroups.map(([group, rows]) => (
                <div key={group}>
                  {specGroups.length > 1 ? (
                    <p className="mb-1 font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">{group}</p>
                  ) : null}
                  <SpecTable rows={rows} caption={group} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {measures.length ? (
          <section aria-labelledby="medidas" className="rounded-xl border bg-surface p-6">
            <Heading id="medidas" size="sm" className="mb-4">
              Medidas
            </Heading>
            <SpecTable rows={measures} caption="Medidas do produto" />
          </section>
        ) : null}

        {additional.length ? (
          <section aria-labelledby="informacoes" className="rounded-xl border bg-surface p-6">
            <Heading id="informacoes" size="sm" className="mb-4">
              Informações adicionais
            </Heading>
            <SpecTable rows={additional} caption="Informações adicionais" />
          </section>
        ) : null}
      </div>
    </div>
  );
}
