"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container, Tape } from "@/components/ui/primitives";

/** Erro inesperado em páginas públicas — sem detalhes técnicos para o visitante */
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="py-20">
      <div className="max-w-xl">
        <Tape thin className="w-20" />
        <h1 className="font-display mt-6 text-3xl font-bold">Não foi possível carregar esta página</h1>
        <p className="mt-3 text-muted-foreground">
          Tente novamente em instantes. Se o problema continuar, fale com a nossa equipe pelo WhatsApp.
        </p>
        {error.digest ? <p className="mt-2 font-mono text-xs text-muted-foreground">Código: {error.digest}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => retry()}>
            Tentar novamente
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Ir para a página inicial
          </Link>
        </div>
      </div>
    </Container>
  );
}
