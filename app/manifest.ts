import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cerigatto Materiais de Construção",
    short_name: "Cerigatto",
    description: "Catálogo de materiais de construção em Bauru/SP",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f3f0",
    theme_color: "#14191f",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
