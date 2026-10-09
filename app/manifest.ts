import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cerigatto Materiais de Construção",
    short_name: "Cerigatto",
    description: "Catálogo de materiais de construção em Bauru/SP",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4f7",
    theme_color: "#18204a",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
