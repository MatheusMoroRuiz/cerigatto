"use client";

/** Último recurso: falha no layout raiz. Não exibe detalhes técnicos. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f2f3f0", color: "#14191f", margin: 0 }}>
        <main style={{ maxWidth: 560, margin: "15vh auto", padding: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Algo deu errado</h1>
          <p style={{ color: "#565e66" }}>
            O site está temporariamente indisponível. Tente novamente em alguns instantes.
          </p>
          {error.digest ? <p style={{ fontFamily: "monospace", fontSize: 12, color: "#565e66" }}>Código: {error.digest}</p> : null}
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 16, height: 44, padding: "0 20px", borderRadius: 8, border: 0, background: "#14191f", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
