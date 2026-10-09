"use client";

import { ClipboardList, Copy, ImageOff, Minus, Plus, Share2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AlertDialog } from "radix-ui";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { getAttribution, getSessionId, trackEvent } from "@/lib/analytics/client";
import { formatQuantity, parseDecimal } from "@/lib/format";
import { routes } from "@/lib/routes";
import { buildQuoteListMessage, pluralizeUnit } from "@/lib/whatsapp";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/form-controls";
import { useWhatsApp } from "@/features/whatsapp/use-whatsapp";
import { WhatsAppIcon } from "@/features/whatsapp/whatsapp-icon";
import { recordQuoteRequest } from "./actions";
import { itemKey, type QuoteItem } from "./model";
import { quoteListActions, useQuoteList } from "./store";

const noopSubscribe = () => () => {};

function QuantityEditor({ item }: { item: QuoteItem }) {
  const key = itemKey(item);
  return (
    <div className="flex h-10 w-36 items-stretch overflow-hidden rounded-md border border-border-strong bg-surface">
      <button
        type="button"
        className="w-10 hover:bg-muted"
        aria-label={`Diminuir quantidade de ${item.name}`}
        onClick={() => quoteListActions.setQuantity(key, Math.max(1, item.quantity - 1))}
      >
        <Minus className="mx-auto size-4" aria-hidden="true" />
      </button>
      <input
        aria-label={`Quantidade de ${item.name}`}
        inputMode="decimal"
        defaultValue={formatQuantity(item.quantity)}
        key={item.quantity}
        onBlur={(event) => quoteListActions.setQuantity(key, parseDecimal(event.target.value) ?? item.quantity)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="w-full min-w-0 border-x text-center font-mono text-sm font-semibold outline-none focus-visible:bg-primary-soft"
      />
      <button
        type="button"
        className="w-10 hover:bg-muted"
        aria-label={`Aumentar quantidade de ${item.name}`}
        onClick={() => quoteListActions.setQuantity(key, item.quantity + 1)}
      >
        <Plus className="mx-auto size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function QuoteListView() {
  const list = useQuoteList();
  // Evita "piscar" a lista vazia antes de ler o localStorage
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const { buildUrl, config } = useWhatsApp();

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" aria-hidden="true" />;
  }

  if (list.items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Sua Lista de Orçamento está vazia"
        description="Adicione produtos com a quantidade desejada e envie tudo de uma vez para nossa equipe pelo WhatsApp."
        action={
          <Link href={routes.products()} className={buttonVariants({ variant: "primary", size: "lg" })}>
            Explorar produtos
          </Link>
        }
      />
    );
  }

  const message = buildQuoteListMessage({
    intro: config.whatsapp.quoteIntro,
    note: list.note,
    items: list.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      brand: item.brand,
      variant: item.variant,
      quantity: item.quantity,
      unit: item.unit,
      url: `${config.siteUrl}${routes.product(item.slug)}`,
    })),
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Lista copiada");
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Minha Lista de Orçamento — Cerigatto", text: message });
        trackEvent("share", { metadata: { origin: "quote_list" } });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }
    await copy();
  }

  function onSend() {
    trackEvent("quote_list_submit", { metadata: { items: list.items.length } });
    trackEvent("whatsapp_click", { metadata: { origin: "quote_list" } });
    const attribution = getAttribution();
    void recordQuoteRequest({
      items: list.items.map((i) => ({ productId: i.productId, variant: i.variant, quantity: i.quantity })),
      note: list.note || undefined,
      sessionId: getSessionId(),
      sourcePage: window.location.pathname,
      utm: Object.fromEntries(Object.entries(attribution).filter(([, v]) => typeof v === "string")) as Record<string, string>,
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
      <div>
        <ul className="divide-y rounded-xl border bg-surface" data-testid="quote-items">
          {list.items.map((item) => {
            const key = itemKey(item);
            return (
              <li key={key} className="flex gap-4 p-4 sm:p-5" data-testid="quote-item">
                <Link href={routes.product(item.slug)} className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <ImageOff className="m-auto mt-7 size-6 text-muted-foreground" aria-hidden="true" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={routes.product(item.slug)} className="line-clamp-2 font-semibold hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[item.brand, item.sku ? `Cód. ${item.sku}` : null].filter(Boolean).join(" · ")}
                  </p>
                  {item.variant ? <p className="mt-1 text-sm">{item.variant}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <QuantityEditor item={item} />
                    <span className="text-sm text-muted-foreground">{pluralizeUnit(item.unit, item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        quoteListActions.remove(key);
                        trackEvent("quote_list_remove", { productId: item.productId });
                      }}
                      className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={routes.products()} className={buttonVariants({ variant: "ghost" })}>
            + Adicionar mais produtos
          </Link>
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <Button variant="ghost" className="text-muted-foreground hover:text-danger">
                <Trash2 aria-hidden="true" />
                Limpar lista
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-secondary/50" />
              <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-6 shadow-2xl">
                <AlertDialog.Title className="font-display text-lg font-bold">Limpar a lista?</AlertDialog.Title>
                <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                  Todos os {list.items.length} itens serão removidos deste navegador.
                </AlertDialog.Description>
                <div className="mt-6 flex justify-end gap-2">
                  <AlertDialog.Cancel asChild>
                    <Button variant="outline">Cancelar</Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <Button variant="danger" onClick={() => quoteListActions.clear()}>
                      Limpar lista
                    </Button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      </div>

      <aside className="lg:sticky lg:top-40 lg:self-start">
        <div className="rounded-xl border bg-surface p-5 sm:p-6">
          <p className="font-display text-xl font-bold">Resumo da solicitação</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.items.length} {list.items.length === 1 ? "item" : "itens"} — sem pagamento on-line.
          </p>
          <label htmlFor="quote-note" className="mt-5 mb-2 block text-sm font-semibold">
            Observações <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <Textarea
            id="quote-note"
            value={list.note}
            maxLength={1000}
            onChange={(event) => quoteListActions.setNote(event.target.value)}
            placeholder="Ex.: preciso de entrega no bairro X; obra começa em 15 dias."
            className="min-h-24"
          />
          <p className="mt-2 text-xs text-muted-foreground">Não inclua dados sensíveis. A mensagem é enviada pelo seu WhatsApp.</p>
          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href={buildUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSend}
              data-testid="send-quote-whatsapp"
              className="inline-flex h-14 items-center justify-center gap-2.5 rounded-md bg-whatsapp px-5 text-base font-semibold text-whatsapp-foreground hover:bg-whatsapp-hover"
            >
              <WhatsAppIcon className="size-5" />
              Enviar lista pelo WhatsApp
            </a>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={copy}>
                <Copy aria-hidden="true" />
                Copiar
              </Button>
              <Button variant="outline" onClick={share}>
                <Share2 aria-hidden="true" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
        <details className="mt-4 rounded-xl border bg-surface p-5 text-sm">
          <summary className="cursor-pointer font-semibold">Pré-visualizar mensagem</summary>
          <pre className="mt-3 font-sans text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground" data-testid="quote-message">
            {message}
          </pre>
        </details>
      </aside>
    </div>
  );
}
