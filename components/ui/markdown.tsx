import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

/**
 * Renderiza Markdown do painel com segurança: HTML bruto é ignorado
 * (react-markdown não interpreta HTML por padrão) e apenas links http(s),
 * mailto, tel e relativos são aceitos.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-cerigatto", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={(url) => (/^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : "")}
        components={{
          a: ({ href, children: content }) => {
            if (!href) return <span>{content}</span>;
            if (href.startsWith("/")) return <Link href={href}>{content}</Link>;
            return (
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                {content}
              </a>
            );
          },
          h1: ({ children: content }) => <h2>{content}</h2>,
          img: () => null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
