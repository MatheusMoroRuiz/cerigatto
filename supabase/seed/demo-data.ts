/**
 * DADOS DE DEMONSTRAÇÃO — fonte única.
 *
 * - Gera supabase/seed.sql (pnpm db:seed:generate)
 * - Alimenta o "modo demonstração" (CERIGATTO_DEMO_MODE=true) quando o
 *   Supabase ainda não está configurado.
 *
 * Todas as MARCAS e PRODUTOS abaixo são FICTÍCIOS e servem apenas para
 * demonstrar o sistema. Nenhum dado institucional da Cerigatto (endereço,
 * telefone, horários, história) é inventado aqui.
 *
 * Fotos: Unsplash (licença Unsplash, uso livre).
 */

export type DemoSpec = { attribute: string; value: string };
export type DemoVariantGroup = {
  name: string;
  required?: boolean;
  values: { label: string; sku?: string; price?: number; salePrice?: number }[];
};

export type DemoProduct = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  unit: string;
  short: string;
  description: string;
  images: { photo: string; alt: string }[];
  priceDisplay: "show" | "consult" | "on_request" | "hidden";
  price?: number;
  salePrice?: number;
  saleLabel?: string;
  saleDays?: number;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  recommended?: boolean;
  availability?: "available_on_request" | "made_to_order" | "temporarily_unavailable" | "discontinued";
  specs?: DemoSpec[];
  variants?: DemoVariantGroup[];
  tags?: string[];
  environments?: string[];
  manufacturer?: string;
  model?: string;
  dimensions?: string;
  weightKg?: number;
  warranty?: string;
  packageContents?: string;
  ctaLabel?: string;
};

/** UUID determinístico e válido (v4) para relacionar os dados de demonstração */
export function demoId(kind: DemoKind, n: number): string {
  return `${KIND_PREFIX[kind]}-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

type DemoKind =
  | "category"
  | "brand"
  | "product"
  | "attribute"
  | "environment"
  | "tag"
  | "banner"
  | "collection"
  | "post"
  | "blogCategory"
  | "page"
  | "image"
  | "option"
  | "variant"
  | "spec"
  | "faq";

const KIND_PREFIX: Record<DemoKind, string> = {
  category: "c0000000",
  brand: "b0000000",
  product: "a0000000",
  attribute: "a7700000",
  environment: "e0000000",
  tag: "7a900000",
  banner: "ba000000",
  collection: "c0110000",
  post: "b1000000",
  blogCategory: "b1c00000",
  page: "9a900000",
  image: "1a900000",
  option: "0b700000",
  variant: "7a400000",
  spec: "5bec0000",
  faq: "fa900000",
};

export function unsplash(photo: string, width = 1600): string {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=80`;
}

// -----------------------------------------------------------------------------
// Categorias (árvore)
// -----------------------------------------------------------------------------
export const demoCategories: {
  slug: string;
  name: string;
  parent?: string;
  description: string;
  photo?: string;
  icon?: string;
  featured?: boolean;
  attributes?: string[];
}[] = [
  { slug: "materiais-basicos", name: "Materiais Básicos", icon: "brick-wall", featured: true, photo: "photo-1541888946425-d81bb19240f5", description: "Cimento, argamassa, blocos, tijolos e impermeabilizantes para a estrutura da obra." },
  { slug: "cimentos-e-argamassas", name: "Cimentos e Argamassas", parent: "materiais-basicos", photo: "photo-1533378890784-b2a5b0a59d40", description: "Cimentos, argamassas colantes e de assentamento.", attributes: ["tipo", "embalagem", "aplicacao"] },
  { slug: "tijolos-e-blocos", name: "Tijolos e Blocos", parent: "materiais-basicos", photo: "photo-1495578942200-c5f5d2137def", description: "Tijolos cerâmicos, blocos de concreto e blocos estruturais.", attributes: ["formato", "material"] },
  { slug: "impermeabilizantes", name: "Impermeabilizantes", parent: "materiais-basicos", photo: "photo-1487088678257-3a541e6e3922", description: "Mantas, aditivos e argamassas poliméricas.", attributes: ["tipo", "embalagem", "aplicacao"] },

  { slug: "pisos-e-revestimentos", name: "Pisos e Revestimentos", icon: "grid-3x3", featured: true, photo: "photo-1600328604921-300918f36018", description: "Porcelanatos, cerâmicas e rejuntes para todos os ambientes." },
  { slug: "porcelanatos", name: "Porcelanatos", parent: "pisos-e-revestimentos", photo: "photo-1706629503571-c165023a7792", description: "Porcelanatos polidos, acetinados e técnicos em grandes formatos.", attributes: ["formato", "acabamento", "cor", "espessura", "area-por-caixa", "aplicacao"] },
  { slug: "ceramicas", name: "Cerâmicas", parent: "pisos-e-revestimentos", photo: "photo-1523350165414-082d792c4bcc", description: "Pisos e revestimentos cerâmicos para paredes e áreas internas.", attributes: ["formato", "acabamento", "cor", "area-por-caixa", "aplicacao"] },
  { slug: "rejuntes", name: "Rejuntes", parent: "pisos-e-revestimentos", photo: "photo-1584354273341-3eb96574e5be", description: "Rejuntes cimentícios, acrílicos e epóxi.", attributes: ["cor", "tipo", "embalagem"] },

  { slug: "tintas", name: "Tintas", icon: "paint-roller", featured: true, photo: "photo-1562259949-e8e7689d7828", description: "Tintas, vernizes e acessórios de pintura." },
  { slug: "tintas-para-parede", name: "Tintas para Parede", parent: "tintas", photo: "photo-1456086272160-b28b0645b729", description: "Tintas acrílicas e látex para paredes internas e externas.", attributes: ["acabamento", "volume", "rendimento", "aplicacao", "cor"] },
  { slug: "acessorios-de-pintura", name: "Acessórios de Pintura", parent: "tintas", photo: "photo-1525909002-1b05e0c869d8", description: "Rolos, pincéis, bandejas e fitas.", attributes: ["material"] },

  { slug: "eletrica", name: "Elétrica", icon: "plug-zap", featured: true, photo: "photo-1601462904263-f2fa0c851cb9", description: "Fios, cabos, tomadas, interruptores e iluminação." },
  { slug: "fios-e-cabos", name: "Fios e Cabos", parent: "eletrica", photo: "photo-1601462904263-f2fa0c851cb9", description: "Cabos flexíveis e rígidos para instalações residenciais.", attributes: ["bitola", "comprimento", "cor"] },
  { slug: "tomadas-e-interruptores", name: "Tomadas e Interruptores", parent: "eletrica", photo: "photo-1612257911111-074bd8388f88", description: "Módulos, placas e conjuntos montados.", attributes: ["cor", "corrente", "material"] },
  { slug: "iluminacao", name: "Iluminação", parent: "eletrica", photo: "photo-1513506003901-1e6a229e2d15", description: "Pendentes, lâmpadas LED e luminárias.", attributes: ["potencia", "voltagem", "cor-da-luz", "material"] },

  { slug: "hidraulica", name: "Hidráulica", icon: "droplets", featured: true, photo: "photo-1646009445351-b8192e095f3a", description: "Tubos, conexões, registros e caixas d'água." },
  { slug: "tubos-e-conexoes", name: "Tubos e Conexões", parent: "hidraulica", photo: "photo-1545193329-4a052e14eb8f", description: "Tubos e conexões de PVC soldável e roscável.", attributes: ["diametro", "comprimento", "material"] },
  { slug: "registros", name: "Registros", parent: "hidraulica", photo: "photo-1619365566184-272a34acfeb9", description: "Registros de gaveta e de pressão.", attributes: ["diametro", "material", "acabamento"] },

  { slug: "ferramentas", name: "Ferramentas", icon: "hammer", featured: true, photo: "photo-1426927308491-6380b6a9936f", description: "Ferramentas elétricas e manuais para obra e manutenção." },
  { slug: "ferramentas-eletricas", name: "Ferramentas Elétricas", parent: "ferramentas", photo: "photo-1504148455328-c376907d081c", description: "Furadeiras, parafusadeiras, serras e esmerilhadeiras.", attributes: ["potencia", "voltagem", "rotacao"] },
  { slug: "ferramentas-manuais", name: "Ferramentas Manuais", parent: "ferramentas", photo: "photo-1581783898377-1c85bf937427", description: "Martelos, chaves, trenas, colheres de pedreiro e níveis.", attributes: ["material", "comprimento"] },

  { slug: "banheiro", name: "Banheiro", icon: "bath", featured: true, photo: "photo-1584622650111-993a426fbf0a", description: "Louças, metais, chuveiros e acessórios para banheiro." },
  { slug: "loucas-sanitarias", name: "Louças Sanitárias", parent: "banheiro", photo: "photo-1629079447777-1e605162dc8d", description: "Bacias, cubas e lavatórios.", attributes: ["cor", "material", "acabamento"] },
  { slug: "metais-para-banheiro", name: "Metais para Banheiro", parent: "banheiro", photo: "photo-1600488999585-e4364713b90a", description: "Torneiras, misturadores e acabamentos de registro.", attributes: ["acabamento", "material"] },
  { slug: "chuveiros", name: "Chuveiros", parent: "banheiro", photo: "photo-1651951646668-46562cfb4518", description: "Chuveiros elétricos e duchas.", attributes: ["potencia", "voltagem", "acabamento"] },

  { slug: "cozinha", name: "Cozinha", icon: "chef-hat", featured: true, photo: "photo-1556911220-bff31c812dba", description: "Cubas, torneiras e acessórios para cozinha." },
  { slug: "cubas-e-pias", name: "Cubas e Pias", parent: "cozinha", photo: "photo-1588854337236-6889d631faa8", description: "Cubas de inox, pias e tanques.", attributes: ["material", "acabamento", "formato"] },
  { slug: "torneiras-de-cozinha", name: "Torneiras de Cozinha", parent: "cozinha", photo: "photo-1610278764397-388d11c35ddb", description: "Torneiras de mesa, de parede e gourmet.", attributes: ["acabamento", "material"] },
];

// -----------------------------------------------------------------------------
// Marcas — TODAS FICTÍCIAS
// -----------------------------------------------------------------------------
const FICTIONAL = "Marca fictícia criada para demonstrar o catálogo. Substitua pelas marcas reais no painel.";

export const demoBrands: { slug: string; name: string; description: string; featured?: boolean }[] = [
  { slug: "monteval-ceramica", name: "Monteval Cerâmica", description: FICTIONAL, featured: true },
  { slug: "cromalis-tintas", name: "Cromalis Tintas", description: FICTIONAL, featured: true },
  { slug: "ferrobase", name: "Ferrobase", description: FICTIONAL, featured: true },
  { slug: "aquavia-metais", name: "Aquavia Metais", description: FICTIONAL, featured: true },
  { slug: "lumitra", name: "Lumitra", description: FICTIONAL, featured: true },
  { slug: "solidar-cimentos", name: "Solidar Cimentos", description: FICTIONAL, featured: true },
  { slug: "pedra-alta-loucas", name: "Pedra Alta Louças", description: FICTIONAL, featured: true },
  { slug: "condutta-cabos", name: "Condutta Cabos", description: FICTIONAL },
];

// -----------------------------------------------------------------------------
// Atributos (modelo flexível de especificações)
// -----------------------------------------------------------------------------
export const demoAttributes: {
  slug: string;
  name: string;
  unit?: string;
  group?: string;
  filterable?: boolean;
}[] = [
  { slug: "formato", name: "Formato", unit: "cm", group: "Dimensões", filterable: true },
  { slug: "acabamento", name: "Acabamento", filterable: true },
  { slug: "cor", name: "Cor", filterable: true },
  { slug: "espessura", name: "Espessura", unit: "mm", group: "Dimensões" },
  { slug: "area-por-caixa", name: "Área por caixa", unit: "m²", group: "Embalagem" },
  { slug: "aplicacao", name: "Aplicação", filterable: true },
  { slug: "tipo", name: "Tipo", filterable: true },
  { slug: "embalagem", name: "Embalagem", group: "Embalagem", filterable: true },
  { slug: "volume", name: "Volume", group: "Embalagem", filterable: true },
  { slug: "rendimento", name: "Rendimento", group: "Desempenho" },
  { slug: "material", name: "Material", filterable: true },
  { slug: "bitola", name: "Bitola", unit: "mm²", filterable: true },
  { slug: "comprimento", name: "Comprimento", group: "Dimensões" },
  { slug: "corrente", name: "Corrente", unit: "A", filterable: true },
  { slug: "potencia", name: "Potência", unit: "W", group: "Desempenho" },
  { slug: "voltagem", name: "Voltagem", filterable: true },
  { slug: "cor-da-luz", name: "Cor da luz", filterable: true },
  { slug: "diametro", name: "Diâmetro", group: "Dimensões", filterable: true },
  { slug: "rotacao", name: "Rotação", unit: "rpm", group: "Desempenho" },
];

// -----------------------------------------------------------------------------
// Ambientes
// -----------------------------------------------------------------------------
export const demoEnvironments: { slug: string; name: string; summary: string; photo: string; content: string }[] = [
  { slug: "banheiro", name: "Banheiro", photo: "photo-1620626011761-996317b8d101", summary: "Revestimentos que resistem à umidade, metais bem escolhidos e louças fáceis de limpar.", content: "Um banheiro bem resolvido começa pela impermeabilização e termina nos detalhes: o acabamento do metal, a cor do rejunte e a iluminação do espelho.\n\nAntes de escolher o revestimento, defina o caimento do piso para o ralo e verifique o tipo de registro instalado — isso orienta a escolha do acabamento correto." },
  { slug: "cozinha", name: "Cozinha", photo: "photo-1617228069096-4638a7ffc906", summary: "Superfícies fáceis de limpar, cuba na medida certa e torneira com bom alcance.", content: "Na cozinha, a combinação entre piso resistente a manchas, revestimento de parede atrás da bancada e uma torneira com bica alta faz diferença no dia a dia.\n\nMeça a bancada antes de escolher a cuba e considere a pressão de água do imóvel para escolher a torneira." },
  { slug: "sala", name: "Sala", photo: "photo-1600210492493-0946911123ea", summary: "Grandes formatos, cores neutras e iluminação em camadas.", content: "Porcelanatos de grande formato reduzem as juntas e ampliam visualmente o ambiente. Combine com pintura em tons neutros e pendentes para criar pontos de luz." },
  { slug: "quarto", name: "Quarto", photo: "photo-1616486029423-aaa4789e8c9a", summary: "Conforto térmico, cores calmas e tomadas nos lugares certos.", content: "Planeje tomadas ao lado da cama e para climatização antes de pintar. Tons suaves e acabamento acetinado facilitam a limpeza das paredes." },
  { slug: "area-externa", name: "Área externa", photo: "photo-1646083329522-f2dce8ed4063", summary: "Pisos antiderrapantes, tintas para fachada e materiais que aguentam sol e chuva.", content: "Para áreas externas prefira pisos com acabamento antiderrapante e tintas com resistência a intempéries. Atenção ao caimento para escoamento da água." },
  { slug: "lavanderia", name: "Lavanderia", photo: "photo-1682888818612-1c18ebecf3ec", summary: "Tanque, pontos de água e revestimentos resistentes à umidade.", content: "Defina a posição da máquina, do tanque e do ponto de esgoto antes de revestir. Revestimentos cerâmicos na parede evitam infiltrações." },
  { slug: "churrasqueira", name: "Churrasqueira", photo: "photo-1623625434531-d130448273c1", summary: "Área gourmet com materiais resistentes ao calor e fáceis de limpar.", content: "Em áreas gourmet, use revestimentos que suportem gordura e calor e preveja pontos de água e iluminação adequados." },
];

// -----------------------------------------------------------------------------
// Produtos — FICTÍCIOS
// -----------------------------------------------------------------------------
export const demoProducts: DemoProduct[] = [
  // ---- Porcelanatos
  {
    slug: "porcelanato-acetinado-calacata-90x90", name: "Porcelanato Acetinado Calacata 90x90", sku: "PRC-90090-CAL",
    category: "porcelanatos", brand: "monteval-ceramica", unit: "caixa",
    short: "Porcelanato retificado com veios suaves inspirados no mármore Calacata, ideal para salas e áreas internas amplas.",
    description: "Porcelanato retificado de grande formato com acabamento acetinado, que reduz reflexos e facilita a limpeza.\n\n### Indicações\n- Pisos e paredes de áreas internas\n- Salas, quartos, cozinhas e banheiros\n\n### Dicas de instalação\nUtilize argamassa AC-III e desempenadeira dentada. Recomenda-se junta mínima de 2 mm com rejunte acrílico ou epóxi.",
    images: [{ photo: "photo-1706629503571-c165023a7792", alt: "Piso de porcelanato branco com veios cinza em ambiente amplo" }, { photo: "photo-1706629503586-2731f65587ae", alt: "Ambiente com piso de porcelanato marmorizado" }],
    priceDisplay: "show", price: 189.9, salePrice: 164.9, onSale: true, saleLabel: "Oferta especial", saleDays: 45, featured: true,
    specs: [{ attribute: "formato", value: "90x90" }, { attribute: "acabamento", value: "Acetinado" }, { attribute: "cor", value: "Branco" }, { attribute: "espessura", value: "9,5" }, { attribute: "area-por-caixa", value: "1,62" }, { attribute: "aplicacao", value: "Piso e parede" }],
    variants: [{ name: "Formato", values: [{ label: "60x60", sku: "PRC-60060-CAL", price: 129.9 }, { label: "90x90", sku: "PRC-90090-CAL", price: 189.9, salePrice: 164.9 }, { label: "120x120", sku: "PRC-12012-CAL", price: 279.9 }] }],
    tags: ["marmorizado", "retificado", "grande-formato"], environments: ["sala", "quarto", "cozinha"],
    dimensions: "90 x 90 cm", warranty: "Conforme fabricante", packageContents: "2 peças por caixa (1,62 m²)",
  },
  {
    slug: "porcelanato-polido-nero-120x120", name: "Porcelanato Polido Nero 120x120", sku: "PRC-12012-NER",
    category: "porcelanatos", brand: "monteval-ceramica", unit: "caixa",
    short: "Porcelanato preto polido de alto brilho para ambientes sofisticados.",
    description: "Superfície polida de alto brilho em tom preto profundo. Indicado para áreas internas secas, como salas e halls.\n\nPor ser polido, não é recomendado para áreas molhadas ou externas.",
    images: [{ photo: "photo-1534503442463-e0ddba45cf4c", alt: "Piso escuro de porcelanato em ambiente interno" }],
    priceDisplay: "consult", isNew: true,
    specs: [{ attribute: "formato", value: "120x120" }, { attribute: "acabamento", value: "Polido" }, { attribute: "cor", value: "Preto" }, { attribute: "espessura", value: "10" }, { attribute: "area-por-caixa", value: "1,44" }, { attribute: "aplicacao", value: "Piso interno" }],
    tags: ["grande-formato", "retificado"], environments: ["sala"],
  },
  {
    slug: "porcelanato-externo-cimento-60x120", name: "Porcelanato Externo Cimento 60x120", sku: "PRC-60120-CIM",
    category: "porcelanatos", brand: "monteval-ceramica", unit: "caixa",
    short: "Acabamento antiderrapante com visual de cimento queimado para áreas externas.",
    description: "Porcelanato técnico com textura que aumenta a aderência, ideal para varandas, áreas de churrasqueira e quintais.",
    images: [{ photo: "photo-1614598632980-35ee54daa5b9", alt: "Revestimento cinza com textura de cimento" }],
    priceDisplay: "show", price: 149.9, recommended: true,
    specs: [{ attribute: "formato", value: "60x120" }, { attribute: "acabamento", value: "Antiderrapante" }, { attribute: "cor", value: "Cinza" }, { attribute: "area-por-caixa", value: "1,44" }, { attribute: "aplicacao", value: "Área externa" }],
    tags: ["antiderrapante", "cimento-queimado"], environments: ["area-externa", "churrasqueira"],
  },
  {
    slug: "porcelanato-madeira-freijo-20x120", name: "Porcelanato Madeira Freijó 20x120", sku: "PRC-20120-FRE",
    category: "porcelanatos", brand: "monteval-ceramica", unit: "caixa",
    short: "Réguas com aparência de madeira natural e a resistência do porcelanato.",
    description: "Visual aconchegante de madeira com a praticidade do porcelanato: não risca com facilidade e é fácil de limpar.",
    images: [{ photo: "photo-1611072337226-1140ab367200", alt: "Textura de madeira clara em réguas" }],
    priceDisplay: "show", price: 119.9, featured: true,
    specs: [{ attribute: "formato", value: "20x120" }, { attribute: "acabamento", value: "Acetinado" }, { attribute: "cor", value: "Madeira clara" }, { attribute: "area-por-caixa", value: "1,20" }, { attribute: "aplicacao", value: "Piso interno" }],
    tags: ["amadeirado", "retificado"], environments: ["quarto", "sala"],
  },
  // ---- Cerâmicas
  {
    slug: "revestimento-ceramico-metro-white-10x20", name: "Revestimento Cerâmico Metro White 10x20", sku: "CER-1020-MTW",
    category: "ceramicas", brand: "monteval-ceramica", unit: "caixa",
    short: "Clássico revestimento estilo metrô, brilhante, para cozinhas e banheiros.",
    description: "Peças com bordas bisotadas e acabamento brilhante. Combina com rejuntes claros ou contrastantes.",
    images: [{ photo: "photo-1523350165414-082d792c4bcc", alt: "Parede com azulejos cerâmicos" }],
    priceDisplay: "show", price: 69.9, onSale: true, salePrice: 59.9, saleDays: 30,
    specs: [{ attribute: "formato", value: "10x20" }, { attribute: "acabamento", value: "Brilhante" }, { attribute: "cor", value: "Branco" }, { attribute: "area-por-caixa", value: "1,00" }, { attribute: "aplicacao", value: "Parede" }],
    tags: ["subway"], environments: ["cozinha", "banheiro", "lavanderia"],
  },
  {
    slug: "piso-ceramico-hidraulico-20x20", name: "Piso Cerâmico Hidráulico Estampado 20x20", sku: "CER-2020-HID",
    category: "ceramicas", brand: "monteval-ceramica", unit: "caixa",
    short: "Estampas geométricas inspiradas no ladrilho hidráulico.",
    description: "Perfeito para dar personalidade a lavabos, cozinhas e áreas gourmet.",
    images: [{ photo: "photo-1551893478-d726eaf0442c", alt: "Revestimento com padrão geométrico" }],
    priceDisplay: "consult", isNew: true,
    specs: [{ attribute: "formato", value: "20x20" }, { attribute: "acabamento", value: "Acetinado" }, { attribute: "cor", value: "Estampado" }, { attribute: "aplicacao", value: "Piso e parede" }],
    tags: ["estampado"], environments: ["cozinha", "banheiro"],
  },
  // ---- Rejuntes
  {
    slug: "rejunte-acrilico-cinza-platina-1kg", name: "Rejunte Acrílico Cinza Platina 1 kg", sku: "REJ-ACR-CPL1",
    category: "rejuntes", brand: "solidar-cimentos", unit: "pote",
    short: "Rejunte acrílico pronto para uso, flexível e de fácil aplicação.",
    description: "Indicado para porcelanatos e cerâmicas em áreas internas e externas. Pronto para uso.",
    images: [{ photo: "photo-1584354273341-3eb96574e5be", alt: "Revestimento cerâmico com rejunte" }],
    priceDisplay: "show", price: 32.9,
    specs: [{ attribute: "cor", value: "Cinza" }, { attribute: "tipo", value: "Acrílico" }, { attribute: "embalagem", value: "1 kg" }],
    variants: [{ name: "Cor", values: [{ label: "Cinza platina" }, { label: "Branco" }, { label: "Grafite" }, { label: "Bege" }] }],
    tags: ["rejunte"],
  },
  // ---- Cimentos e argamassas
  {
    slug: "cimento-cp-ii-e-32-50kg", name: "Cimento CP II-E-32 50 kg", sku: "CIM-CP2E-50",
    category: "cimentos-e-argamassas", brand: "solidar-cimentos", unit: "saco",
    short: "Cimento Portland composto para concreto, reboco e assentamento.",
    description: "Cimento de uso geral para estruturas, contrapisos, rebocos e assentamento de blocos.\n\n### Armazenamento\nMantenha os sacos em local seco, sobre estrados e afastados das paredes. Empilhe no máximo 10 sacos.",
    images: [{ photo: "photo-1533378890784-b2a5b0a59d40", alt: "Obra com armação de ferro e concreto" }],
    priceDisplay: "consult", featured: true, recommended: true,
    specs: [{ attribute: "tipo", value: "CP II-E-32" }, { attribute: "embalagem", value: "50 kg" }, { attribute: "aplicacao", value: "Concreto e reboco" }],
    tags: ["cimento", "estrutura"], ctaLabel: "Consultar preço por quantidade", weightKg: 50,
  },
  {
    slug: "argamassa-ac-iii-porcelanato-20kg", name: "Argamassa AC-III para Porcelanato 20 kg", sku: "ARG-AC3-20",
    category: "cimentos-e-argamassas", brand: "solidar-cimentos", unit: "saco",
    short: "Argamassa colante de alta aderência para porcelanatos e grandes formatos.",
    description: "Indicada para assentamento de porcelanatos em pisos e paredes internas e externas.",
    images: [{ photo: "photo-1541888946425-d81bb19240f5", alt: "Trabalhadores em canteiro de obras" }],
    priceDisplay: "show", price: 54.9, onSale: true, salePrice: 47.9, saleDays: 20,
    specs: [{ attribute: "tipo", value: "AC-III" }, { attribute: "embalagem", value: "20 kg" }, { attribute: "aplicacao", value: "Porcelanato" }],
    tags: ["argamassa"], weightKg: 20,
  },
  {
    slug: "argamassa-assentamento-multiuso-20kg", name: "Argamassa Multiuso para Assentamento 20 kg", sku: "ARG-MUL-20",
    category: "cimentos-e-argamassas", brand: "solidar-cimentos", unit: "saco",
    short: "Para assentamento de blocos e tijolos e revestimento de paredes.",
    description: "Argamassa pronta: basta adicionar água. Uso em alvenaria de vedação e reboco.",
    images: [{ photo: "photo-1504307651254-35680f356dfd", alt: "Profissionais trabalhando em obra" }],
    priceDisplay: "on_request",
    specs: [{ attribute: "tipo", value: "Multiuso" }, { attribute: "embalagem", value: "20 kg" }, { attribute: "aplicacao", value: "Alvenaria" }],
    tags: ["argamassa"],
  },
  // ---- Tijolos e blocos
  {
    slug: "bloco-de-concreto-estrutural-14x19x39", name: "Bloco de Concreto Estrutural 14x19x39", sku: "BLC-141939",
    category: "tijolos-e-blocos", brand: "solidar-cimentos", unit: "unidade",
    short: "Bloco estrutural para alvenaria com função estrutural.",
    description: "Bloco vazado de concreto com resistência para alvenaria estrutural. Consulte quantidade mínima para entrega.",
    images: [{ photo: "photo-1520758594221-872948699332", alt: "Blocos de concreto empilhados" }],
    priceDisplay: "consult",
    specs: [{ attribute: "formato", value: "14x19x39" }, { attribute: "material", value: "Concreto" }],
    tags: ["estrutura", "alvenaria"], ctaLabel: "Solicitar orçamento",
  },
  {
    slug: "tijolo-ceramico-8-furos", name: "Tijolo Cerâmico 8 Furos 9x19x19", sku: "TIJ-8F-91919",
    category: "tijolos-e-blocos", brand: "solidar-cimentos", unit: "milheiro",
    short: "Tijolo cerâmico de vedação, vendido por milheiro.",
    description: "Tijolo de vedação para paredes internas e externas.",
    images: [{ photo: "photo-1495578942200-c5f5d2137def", alt: "Parede de tijolos cerâmicos" }],
    priceDisplay: "consult", recommended: true,
    specs: [{ attribute: "formato", value: "9x19x19" }, { attribute: "material", value: "Cerâmica" }],
    tags: ["alvenaria"], ctaLabel: "Solicitar orçamento",
  },
  // ---- Impermeabilizantes
  {
    slug: "argamassa-polimerica-impermeabilizante-18kg", name: "Argamassa Polimérica Impermeabilizante 18 kg", sku: "IMP-POL-18",
    category: "impermeabilizantes", brand: "solidar-cimentos", unit: "caixa",
    short: "Impermeabilização de banheiros, cozinhas, lajes e reservatórios.",
    description: "Sistema bicomponente aplicado com trincha. Recomendado para áreas molhadas antes do revestimento.",
    images: [{ photo: "photo-1487088678257-3a541e6e3922", alt: "Blocos de concreto pintados" }],
    priceDisplay: "show", price: 159.9, featured: true,
    specs: [{ attribute: "tipo", value: "Bicomponente" }, { attribute: "embalagem", value: "18 kg" }, { attribute: "aplicacao", value: "Áreas molhadas" }],
    tags: ["impermeabilizacao"], environments: ["banheiro", "lavanderia"],
  },
  // ---- Tintas
  {
    slug: "tinta-acrilica-premium-fosca-branco-neve", name: "Tinta Acrílica Premium Fosca Branco Neve", sku: "TIN-ACR-FBN",
    category: "tintas-para-parede", brand: "cromalis-tintas", unit: "lata",
    short: "Alto rendimento e cobertura para paredes internas e externas.",
    description: "Tinta acrílica premium com acabamento fosco, que disfarça imperfeições da parede.\n\n### Rendimento\nAté 380 m² por demão na lata de 18 L, dependendo da superfície.",
    images: [{ photo: "photo-1562259949-e8e7689d7828", alt: "Pessoa pintando parede com rolo" }, { photo: "photo-1456086272160-b28b0645b729", alt: "Latas de tinta de cores variadas" }],
    priceDisplay: "show", price: 489.9, featured: true, onSale: true, salePrice: 429.9, saleDays: 30,
    specs: [{ attribute: "acabamento", value: "Fosco" }, { attribute: "volume", value: "18 L" }, { attribute: "rendimento", value: "Até 380 m²/demão" }, { attribute: "aplicacao", value: "Interna e externa" }, { attribute: "cor", value: "Branco" }],
    variants: [{ name: "Embalagem", values: [{ label: "3,6 L", sku: "TIN-ACR-FBN-36", price: 129.9 }, { label: "18 L", sku: "TIN-ACR-FBN-18", price: 489.9, salePrice: 429.9 }] }],
    tags: ["pintura", "acrilica"], environments: ["sala", "quarto", "area-externa"],
  },
  {
    slug: "tinta-acrilica-acetinada-cinza-urbano", name: "Tinta Acrílica Acetinada Cinza Urbano", sku: "TIN-ACR-ACU",
    category: "tintas-para-parede", brand: "cromalis-tintas", unit: "lata",
    short: "Acabamento acetinado lavável para áreas de grande circulação.",
    description: "Ideal para corredores, quartos infantis e cozinhas. Pode ser limpa com pano úmido.",
    images: [{ photo: "photo-1585676737728-432f58d5fdba", alt: "Lata de tinta sobre mesa branca" }],
    priceDisplay: "show", price: 139.9, isNew: true,
    specs: [{ attribute: "acabamento", value: "Acetinado" }, { attribute: "volume", value: "3,6 L" }, { attribute: "rendimento", value: "Até 70 m²/demão" }, { attribute: "aplicacao", value: "Interna" }, { attribute: "cor", value: "Cinza" }],
    variants: [{ name: "Embalagem", values: [{ label: "3,6 L", price: 139.9 }, { label: "18 L", price: 559.9 }] }],
    tags: ["pintura", "lavavel"], environments: ["quarto", "cozinha"],
  },
  {
    slug: "tinta-emborrachada-fachada", name: "Tinta Emborrachada para Fachada 18 L", sku: "TIN-EMB-18",
    category: "tintas-para-parede", brand: "cromalis-tintas", unit: "lata",
    short: "Proteção elástica contra chuva e microfissuras em fachadas.",
    description: "Forma uma película elástica que acompanha a movimentação da parede.",
    images: [{ photo: "photo-1550002233-59d811d29b95", alt: "Lata de tinta amarela ao lado de parede azul" }],
    priceDisplay: "consult",
    specs: [{ attribute: "acabamento", value: "Fosco" }, { attribute: "volume", value: "18 L" }, { attribute: "aplicacao", value: "Externa" }, { attribute: "cor", value: "Branco" }],
    tags: ["pintura", "fachada"], environments: ["area-externa"],
  },
  {
    slug: "kit-rolo-de-la-23cm-com-bandeja", name: "Kit Rolo de Lã 23 cm com Bandeja", sku: "ACP-KIT-23",
    category: "acessorios-de-pintura", brand: "cromalis-tintas", unit: "kit",
    short: "Rolo de lã sintética, cabo e bandeja para pintura de paredes.",
    description: "Kit prático para pintura com tintas acrílicas e látex.",
    images: [{ photo: "photo-1525909002-1b05e0c869d8", alt: "Rolos de pintura coloridos" }],
    priceDisplay: "show", price: 39.9,
    specs: [{ attribute: "material", value: "Lã sintética" }],
    tags: ["pintura"], packageContents: "1 rolo de 23 cm, 1 cabo, 1 bandeja",
  },
  {
    slug: "trincha-cerdas-gris-2-polegadas", name: "Trincha Cerdas Gris 2\"", sku: "ACP-TRI-2",
    category: "acessorios-de-pintura", brand: "cromalis-tintas", unit: "unidade",
    short: "Trincha para recortes e acabamentos.",
    description: "Cerdas firmes para recortes em cantos, rodapés e esquadrias.",
    images: [{ photo: "photo-1516962080544-eac695c93791", alt: "Rolo e trincha de pintura" }],
    priceDisplay: "show", price: 14.9,
    specs: [{ attribute: "material", value: "Cerdas gris" }],
    tags: ["pintura"],
  },
  // ---- Elétrica
  {
    slug: "cabo-flexivel-2-5mm-rolo-100m", name: "Cabo Flexível 2,5 mm² Rolo 100 m", sku: "ELE-CAB-25-100",
    category: "fios-e-cabos", brand: "condutta-cabos", unit: "rolo",
    short: "Cabo flexível 750 V para circuitos de tomadas.",
    description: "Cabo de cobre flexível com isolação antichama. Indicado para circuitos de tomadas de uso geral.",
    images: [{ photo: "photo-1601462904263-f2fa0c851cb9", alt: "Fios elétricos coloridos" }],
    priceDisplay: "show", price: 279.9, featured: true,
    specs: [{ attribute: "bitola", value: "2,5" }, { attribute: "comprimento", value: "100 m" }, { attribute: "cor", value: "Azul" }],
    variants: [{ name: "Cor", values: [{ label: "Azul" }, { label: "Preto" }, { label: "Vermelho" }, { label: "Verde" }, { label: "Branco" }] }, { name: "Bitola", values: [{ label: "1,5 mm²", price: 189.9 }, { label: "2,5 mm²", price: 279.9 }, { label: "4,0 mm²", price: 449.9 }, { label: "6,0 mm²", price: 649.9 }] }],
    tags: ["eletrica", "fios"],
  },
  {
    slug: "conjunto-tomada-2p-t-10a-branco", name: "Conjunto Tomada 2P+T 10 A Branco", sku: "ELE-TOM-10B",
    category: "tomadas-e-interruptores", brand: "lumitra", unit: "unidade",
    short: "Tomada padrão brasileiro com placa 4x2.",
    description: "Conjunto montado com placa e suporte. Atende ao padrão NBR 14136.",
    images: [{ photo: "photo-1612257911111-074bd8388f88", alt: "Interruptor de parede" }],
    priceDisplay: "show", price: 12.9,
    specs: [{ attribute: "cor", value: "Branco" }, { attribute: "corrente", value: "10" }, { attribute: "material", value: "Termoplástico" }],
    variants: [{ name: "Corrente", values: [{ label: "10 A", price: 12.9 }, { label: "20 A", price: 15.9 }] }],
    tags: ["eletrica"],
  },
  {
    slug: "interruptor-simples-preto-fosco", name: "Interruptor Simples Preto Fosco", sku: "ELE-INT-PF",
    category: "tomadas-e-interruptores", brand: "lumitra", unit: "unidade",
    short: "Interruptor de design minimalista em preto fosco.",
    description: "Linha de acabamento contemporâneo com placa sem parafusos aparentes.",
    images: [{ photo: "photo-1508920291026-c344bbfca1ab", alt: "Régua de tomadas montada na parede" }],
    priceDisplay: "show", price: 24.9, isNew: true,
    specs: [{ attribute: "cor", value: "Preto" }, { attribute: "corrente", value: "10" }, { attribute: "material", value: "Termoplástico" }],
    tags: ["eletrica", "design"],
  },
  {
    slug: "pendente-industrial-aluminio-preto", name: "Pendente Industrial Alumínio Preto", sku: "ILU-PEN-IND",
    category: "iluminacao", brand: "lumitra", unit: "unidade",
    short: "Pendente cúpula em alumínio para bancadas e mesas.",
    description: "Cúpula em alumínio com pintura eletrostática. Compatível com lâmpadas E27.",
    images: [{ photo: "photo-1512418408532-5445158b1445", alt: "Três pendentes pretos" }, { photo: "photo-1592622515232-6e3e2a0d3d9a", alt: "Pendente preto aceso" }],
    priceDisplay: "show", price: 159.9, featured: true, onSale: true, salePrice: 129.9, saleDays: 15,
    specs: [{ attribute: "material", value: "Alumínio" }, { attribute: "voltagem", value: "Bivolt" }, { attribute: "cor-da-luz", value: "Conforme lâmpada" }],
    tags: ["iluminacao", "industrial"], environments: ["cozinha", "sala", "churrasqueira"],
  },
  {
    slug: "lampada-led-bulbo-9w", name: "Lâmpada LED Bulbo 9 W", sku: "ILU-LED-9W",
    category: "iluminacao", brand: "lumitra", unit: "unidade",
    short: "Lâmpada LED econômica com base E27.",
    description: "Economia de energia e longa vida útil.",
    images: [{ photo: "photo-1559924508-1461423083c5", alt: "Lâmpada acesa em pendente" }],
    priceDisplay: "show", price: 9.9,
    specs: [{ attribute: "potencia", value: "9" }, { attribute: "voltagem", value: "Bivolt" }, { attribute: "cor-da-luz", value: "Branca fria" }],
    variants: [{ name: "Cor da luz", values: [{ label: "Branca fria 6500K" }, { label: "Branca quente 3000K" }] }],
    tags: ["iluminacao", "led"],
  },
  // ---- Hidráulica
  {
    slug: "tubo-pvc-soldavel-25mm-6m", name: "Tubo PVC Soldável 25 mm Barra 6 m", sku: "HID-TUB-25",
    category: "tubos-e-conexoes", brand: "aquavia-metais", unit: "barra",
    short: "Tubo para água fria em instalações prediais.",
    description: "Tubo de PVC soldável para condução de água fria.",
    images: [{ photo: "photo-1545193329-4a052e14eb8f", alt: "Tubo branco de PVC" }],
    priceDisplay: "show", price: 34.9,
    specs: [{ attribute: "diametro", value: "25 mm" }, { attribute: "comprimento", value: "6 m" }, { attribute: "material", value: "PVC" }],
    variants: [{ name: "Diâmetro", values: [{ label: "20 mm", price: 26.9 }, { label: "25 mm", price: 34.9 }, { label: "32 mm", price: 54.9 }, { label: "50 mm", price: 89.9 }] }],
    tags: ["hidraulica", "pvc"],
  },
  {
    slug: "joelho-90-pvc-soldavel-25mm", name: "Joelho 90° PVC Soldável 25 mm", sku: "HID-JOE-25",
    category: "tubos-e-conexoes", brand: "aquavia-metais", unit: "unidade",
    short: "Conexão para mudança de direção em 90°.",
    description: "Conexão soldável para água fria.",
    images: [{ photo: "photo-1729169927271-7826d8aae360", alt: "Tubos e conexões empilhados" }],
    priceDisplay: "show", price: 1.9,
    specs: [{ attribute: "diametro", value: "25 mm" }, { attribute: "material", value: "PVC" }],
    tags: ["hidraulica", "pvc"],
  },
  {
    slug: "registro-de-gaveta-3-4-bruto", name: "Registro de Gaveta 3/4\" Bruto", sku: "HID-REG-34",
    category: "registros", brand: "aquavia-metais", unit: "unidade",
    short: "Registro de gaveta em liga metálica para instalações de água.",
    description: "Utilize com acabamento compatível da mesma linha.",
    images: [{ photo: "photo-1619365566184-272a34acfeb9", alt: "Torneira de latão com gotas de água" }],
    priceDisplay: "consult",
    specs: [{ attribute: "diametro", value: "3/4\"" }, { attribute: "material", value: "Latão" }, { attribute: "acabamento", value: "Bruto" }],
    tags: ["hidraulica"],
  },
  // ---- Ferramentas
  {
    slug: "furadeira-de-impacto-650w", name: "Furadeira de Impacto 650 W", sku: "FER-FUR-650",
    category: "ferramentas-eletricas", brand: "ferrobase", unit: "unidade",
    short: "Furadeira com impacto para alvenaria, madeira e metal.",
    description: "Mandril de 1/2\", controle de velocidade e reversão. Acompanha empunhadura auxiliar e limitador de profundidade.",
    images: [{ photo: "photo-1504148455328-c376907d081c", alt: "Furadeira sem fio vermelha" }],
    priceDisplay: "show", price: 349.9, featured: true, recommended: true,
    specs: [{ attribute: "potencia", value: "650" }, { attribute: "voltagem", value: "127 V" }, { attribute: "rotacao", value: "0–3000" }],
    variants: [{ name: "Voltagem", values: [{ label: "127 V" }, { label: "220 V" }] }],
    tags: ["ferramentas"], warranty: "12 meses (conforme fabricante)", packageContents: "Furadeira, empunhadura auxiliar e limitador de profundidade",
  },
  {
    slug: "parafusadeira-a-bateria-12v", name: "Parafusadeira a Bateria 12 V", sku: "FER-PAR-12",
    category: "ferramentas-eletricas", brand: "ferrobase", unit: "unidade",
    short: "Leve e compacta, com 2 velocidades e luz LED.",
    description: "Ideal para montagem de móveis e pequenos reparos.",
    images: [{ photo: "photo-1622044939413-0b829c342434", alt: "Parafusadeira sem fio verde e preta" }],
    priceDisplay: "show", price: 399.9, isNew: true, onSale: true, salePrice: 359.9, saleDays: 25,
    specs: [{ attribute: "potencia", value: "12 V" }, { attribute: "voltagem", value: "Bivolt (carregador)" }, { attribute: "rotacao", value: "0–1300" }],
    tags: ["ferramentas", "bateria"],
  },
  {
    slug: "martelo-unha-27mm-cabo-fibra", name: "Martelo de Unha 27 mm Cabo de Fibra", sku: "FER-MAR-27",
    category: "ferramentas-manuais", brand: "ferrobase", unit: "unidade",
    short: "Cabeça forjada e cabo antivibração.",
    description: "Martelo de unha para carpintaria e uso geral.",
    images: [{ photo: "photo-1586864387789-628af9feed72", alt: "Martelo de garra preto e prateado" }],
    priceDisplay: "show", price: 59.9,
    specs: [{ attribute: "material", value: "Aço forjado e fibra" }],
    tags: ["ferramentas"],
  },
  {
    slug: "jogo-de-chaves-combinadas-8-pecas", name: "Jogo de Chaves Combinadas 8 Peças", sku: "FER-CHV-8",
    category: "ferramentas-manuais", brand: "ferrobase", unit: "jogo",
    short: "Chaves combinadas de 8 a 19 mm em aço cromo-vanádio.",
    description: "Acompanha estojo organizador.",
    images: [{ photo: "photo-1503789146722-cf137a3c0fea", alt: "Chaves ajustáveis" }],
    priceDisplay: "show", price: 119.9,
    specs: [{ attribute: "material", value: "Cromo-vanádio" }],
    tags: ["ferramentas"],
  },
  {
    slug: "kit-ferramentas-basico-casa", name: "Kit de Ferramentas Básico para Casa", sku: "FER-KIT-CASA",
    category: "ferramentas-manuais", brand: "ferrobase", unit: "kit",
    short: "Martelo, chaves de fenda, alicate e trena em uma maleta.",
    description: "O essencial para pequenos reparos domésticos.",
    images: [{ photo: "photo-1581783898377-1c85bf937427", alt: "Martelo e chave de fenda" }],
    priceDisplay: "show", price: 189.9, recommended: true,
    specs: [{ attribute: "material", value: "Aço carbono" }],
    tags: ["ferramentas", "kit"],
  },
  // ---- Banheiro
  {
    slug: "cuba-de-apoio-retangular-branca", name: "Cuba de Apoio Retangular Branca", sku: "BAN-CUB-RET",
    category: "loucas-sanitarias", brand: "pedra-alta-loucas", unit: "unidade",
    short: "Cuba de apoio em louça com linhas retas.",
    description: "Para bancadas de banheiro e lavabo. Torneira de mesa ou parede vendida separadamente.",
    images: [{ photo: "photo-1629079447777-1e605162dc8d", alt: "Pia de cerâmica branca com espelho" }],
    priceDisplay: "show", price: 329.9, featured: true,
    specs: [{ attribute: "cor", value: "Branco" }, { attribute: "material", value: "Louça" }, { attribute: "acabamento", value: "Brilhante" }],
    tags: ["banheiro"], environments: ["banheiro"], dimensions: "50 x 36 x 13 cm",
  },
  {
    slug: "bacia-com-caixa-acoplada-dual-flush", name: "Bacia com Caixa Acoplada Dual Flush", sku: "BAN-BAC-DF",
    category: "loucas-sanitarias", brand: "pedra-alta-loucas", unit: "conjunto",
    short: "Acionamento duplo para economia de água.",
    description: "Conjunto com bacia, caixa acoplada e mecanismo de acionamento duplo.",
    images: [{ photo: "photo-1631889993959-41b4e9c6e3c5", alt: "Banheiro com vaso sanitário e pia" }],
    priceDisplay: "consult", availability: "made_to_order",
    specs: [{ attribute: "cor", value: "Branco" }, { attribute: "material", value: "Louça" }],
    tags: ["banheiro", "economia-de-agua"], environments: ["banheiro"],
  },
  {
    slug: "misturador-monocomando-lavatorio-preto", name: "Misturador Monocomando para Lavatório Preto Fosco", sku: "BAN-MIS-PF",
    category: "metais-para-banheiro", brand: "aquavia-metais", unit: "unidade",
    short: "Monocomando de bica alta em preto fosco.",
    description: "Controle de temperatura e vazão em um único comando. Indicado para cubas de apoio.",
    images: [{ photo: "photo-1602761004880-0cbb1ba589d2", alt: "Torneira preta em pia branca" }],
    priceDisplay: "show", price: 689.9, isNew: true, featured: true,
    specs: [{ attribute: "acabamento", value: "Preto fosco" }, { attribute: "material", value: "Latão" }],
    variants: [{ name: "Acabamento", values: [{ label: "Preto fosco", price: 689.9 }, { label: "Cromado", price: 589.9 }, { label: "Dourado escovado", price: 799.9 }] }],
    tags: ["banheiro", "design"], environments: ["banheiro"],
  },
  {
    slug: "torneira-de-mesa-cromada-lavatorio", name: "Torneira de Mesa Cromada para Lavatório", sku: "BAN-TOR-CR",
    category: "metais-para-banheiro", brand: "aquavia-metais", unit: "unidade",
    short: "Torneira de mesa com arejador e acabamento cromado.",
    description: "Modelo clássico para lavatórios e lavabos.",
    images: [{ photo: "photo-1600488999585-e4364713b90a", alt: "Pia branca com torneira cromada" }],
    priceDisplay: "show", price: 149.9, onSale: true, salePrice: 119.9, saleDays: 10,
    specs: [{ attribute: "acabamento", value: "Cromado" }, { attribute: "material", value: "Latão" }],
    tags: ["banheiro"], environments: ["banheiro"],
  },
  {
    slug: "chuveiro-eletrico-multitemperaturas-7500w", name: "Chuveiro Elétrico Multitemperaturas 7500 W", sku: "BAN-CHU-7500",
    category: "chuveiros", brand: "lumitra", unit: "unidade",
    short: "Quatro temperaturas e espalhador amplo.",
    description: "Verifique a bitola do circuito e o disjuntor antes da instalação.",
    images: [{ photo: "photo-1651951646668-46562cfb4518", alt: "Banheiro com box de vidro e chuveiro" }],
    priceDisplay: "show", price: 179.9,
    specs: [{ attribute: "potencia", value: "7500" }, { attribute: "voltagem", value: "220 V" }, { attribute: "acabamento", value: "Branco" }],
    variants: [{ name: "Voltagem", values: [{ label: "127 V (5500 W)", price: 169.9 }, { label: "220 V (7500 W)", price: 179.9 }] }],
    tags: ["banheiro"], environments: ["banheiro"],
  },
  // ---- Cozinha
  {
    slug: "cuba-inox-gourmet-60x40", name: "Cuba Inox Gourmet 60x40", sku: "COZ-CUB-6040",
    category: "cubas-e-pias", brand: "aquavia-metais", unit: "unidade",
    short: "Cuba de embutir em aço inox escovado com cantos retos.",
    description: "Acompanha válvula e sifão. Profundidade generosa para panelas grandes.",
    images: [{ photo: "photo-1588854337236-6889d631faa8", alt: "Cozinha com bancada e cuba" }],
    priceDisplay: "show", price: 899.9, featured: true, recommended: true,
    specs: [{ attribute: "material", value: "Aço inox 304" }, { attribute: "acabamento", value: "Escovado" }, { attribute: "formato", value: "60x40" }],
    tags: ["cozinha", "inox"], environments: ["cozinha", "churrasqueira"],
  },
  {
    slug: "torneira-gourmet-bica-movel", name: "Torneira Gourmet com Bica Móvel", sku: "COZ-TOR-GOU",
    category: "torneiras-de-cozinha", brand: "aquavia-metais", unit: "unidade",
    short: "Bica flexível com duas funções de jato.",
    description: "Combina com cubas gourmet e bancadas de pedra.",
    images: [{ photo: "photo-1610278764397-388d11c35ddb", alt: "Torneira de aço inoxidável em pia" }],
    priceDisplay: "show", price: 549.9, isNew: true, onSale: true, salePrice: 489.9, saleDays: 30,
    specs: [{ attribute: "acabamento", value: "Inox escovado" }, { attribute: "material", value: "Latão" }],
    tags: ["cozinha"], environments: ["cozinha", "churrasqueira"],
  },
  {
    slug: "torneira-de-parede-cozinha-cromada", name: "Torneira de Parede para Cozinha Cromada", sku: "COZ-TOR-PAR",
    category: "torneiras-de-cozinha", brand: "aquavia-metais", unit: "unidade",
    short: "Bica longa giratória para cozinhas e tanques.",
    description: "Modelo de parede com arejador articulado.",
    images: [{ photo: "photo-1587093430416-0dc23a0c62c1", alt: "Torneira de inox em pia branca" }],
    priceDisplay: "show", price: 129.9, availability: "temporarily_unavailable",
    specs: [{ attribute: "acabamento", value: "Cromado" }, { attribute: "material", value: "Latão" }],
    tags: ["cozinha"], environments: ["cozinha", "lavanderia"],
  },
];

// -----------------------------------------------------------------------------
// Banners da Home (fotos ilustrativas)
// -----------------------------------------------------------------------------
export const demoBanners: {
  internalName: string;
  placement: "home_hero" | "home_middle" | "home_specialist" | "catalog_top";
  photo: string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  textPosition?: "left" | "center" | "right";
  overlay?: number;
}[] = [
  { internalName: "Hero — obra completa (demo)", placement: "home_hero", photo: "photo-1541888946425-d81bb19240f5", alt: "Equipe trabalhando em canteiro de obras", eyebrow: "Materiais de construção em Bauru", title: "Do alicerce ao acabamento, em um só lugar.", subtitle: "Encontre o material certo para cada etapa e consulte disponibilidade direto com nossa equipe pelo WhatsApp.", buttonText: "Ver departamentos", buttonUrl: "/produtos", overlay: 55 },
  { internalName: "Hero — pisos (demo)", placement: "home_hero", photo: "photo-1706629503586-2731f65587ae", alt: "Ambiente amplo com piso de porcelanato marmorizado", eyebrow: "Pisos e revestimentos", title: "Grandes formatos para ambientes que respiram.", subtitle: "Porcelanatos acetinados, polidos e técnicos para cada ambiente da casa.", buttonText: "Explorar porcelanatos", buttonUrl: "/categoria/porcelanatos", overlay: 45 },
  { internalName: "Hero — banheiro (demo)", placement: "home_hero", photo: "photo-1584622650111-993a426fbf0a", alt: "Banheiro moderno com chuveiro e lavatório", eyebrow: "Banheiro", title: "Metais e louças que fazem diferença no dia a dia.", subtitle: "Misturadores, cubas e chuveiros para reformar sem complicação.", buttonText: "Ver produtos para banheiro", buttonUrl: "/categoria/banheiro", textPosition: "left", overlay: 50 },
  { internalName: "Faixa intermediária — tintas (demo)", placement: "home_middle", photo: "photo-1562259949-e8e7689d7828", alt: "Pintura de parede com rolo", eyebrow: "Tintas", title: "Cor nova sem errar na quantidade.", subtitle: "Diga a metragem das paredes e nossa equipe ajuda a calcular quantas latas você precisa.", buttonText: "Ver tintas", buttonUrl: "/categoria/tintas", overlay: 50 },
  { internalName: "Especialistas (demo)", placement: "home_specialist", photo: "photo-1503387762-592deb58ef4e", alt: "Pessoa desenhando projeto arquitetônico", eyebrow: "Atendimento", title: "Mande a lista da sua obra. A gente organiza o orçamento.", subtitle: "Monte sua Lista de Orçamento no site ou envie fotos e medidas pelo WhatsApp.", buttonText: "Falar com um especialista", buttonUrl: "/contato", overlay: 60 },
];

// -----------------------------------------------------------------------------
// Blog / Dicas (conteúdo educativo genérico)
// -----------------------------------------------------------------------------
export const demoBlogCategories = [
  { slug: "construcao", name: "Construção" },
  { slug: "reforma", name: "Reforma" },
  { slug: "pisos", name: "Pisos" },
  { slug: "tintas", name: "Tintas" },
  { slug: "hidraulica", name: "Hidráulica" },
  { slug: "eletrica", name: "Elétrica" },
  { slug: "decoracao", name: "Decoração" },
  { slug: "ferramentas", name: "Ferramentas" },
  { slug: "manutencao", name: "Manutenção" },
];

export const demoPosts: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  photo: string;
  alt: string;
  readingMinutes: number;
  daysAgo: number;
  featured?: boolean;
  products?: string[];
  content: string;
}[] = [
  {
    slug: "como-calcular-a-quantidade-de-piso",
    title: "Como calcular a quantidade de piso para a sua obra",
    excerpt: "Uma conta simples evita sobra cara ou falta no meio do assentamento. Veja como medir e quanto de margem considerar.",
    category: "pisos", photo: "photo-1600328604921-300918f36018", alt: "Piso cerâmico em tons de bege e marrom", readingMinutes: 4, daysAgo: 5, featured: true,
    products: ["porcelanato-acetinado-calacata-90x90", "argamassa-ac-iii-porcelanato-20kg", "rejunte-acrilico-cinza-platina-1kg"],
    content: "## 1. Meça a área do ambiente\n\nMultiplique o comprimento pela largura de cada cômodo. Em ambientes em L, divida em retângulos e some as áreas.\n\n## 2. Some a margem de perda\n\n- **Assentamento reto:** acrescente cerca de 10%.\n- **Diagonal ou espinha de peixe:** considere de 15% a 20%.\n- **Grandes formatos:** a perda em recortes costuma ser maior.\n\n## 3. Converta para caixas\n\nDivida a área total (já com a margem) pela metragem de cada caixa, informada na embalagem, e arredonde sempre para cima.\n\n> Exemplo: sala de 4 m × 5 m = 20 m². Com 10% de margem, 22 m². Se a caixa tem 1,62 m², são 13,6 → **14 caixas**.\n\n## 4. Compre tudo do mesmo lote\n\nPeças de lotes diferentes podem ter variação de tonalidade. Por isso, vale comprar a quantidade total de uma vez e guardar algumas peças para manutenção futura.\n\nNa dúvida, envie as medidas pelo WhatsApp que nossa equipe ajuda na conta.",
  },
  {
    slug: "fosco-acetinado-ou-semibrilho",
    title: "Fosco, acetinado ou semibrilho: qual acabamento de tinta escolher?",
    excerpt: "O acabamento muda a aparência e a facilidade de limpeza da parede. Entenda as diferenças antes de comprar.",
    category: "tintas", photo: "photo-1456086272160-b28b0645b729", alt: "Latas de tinta de várias cores", readingMinutes: 5, daysAgo: 12,
    products: ["tinta-acrilica-premium-fosca-branco-neve", "tinta-acrilica-acetinada-cinza-urbano", "kit-rolo-de-la-23cm-com-bandeja"],
    content: "## Fosco\n\nDisfarça imperfeições e dá um visual elegante. É a escolha mais comum para tetos e salas, mas costuma ser menos resistente à limpeza.\n\n## Acetinado\n\nTem um leve brilho e é mais fácil de limpar. Funciona bem em quartos, corredores e cozinhas.\n\n## Semibrilho\n\nMais resistente à umidade e à limpeza frequente, indicado para portas, rodapés e áreas de muito uso. Evidencia mais as imperfeições da parede.\n\n## Dica\n\nAntes de pintar, corrija trincas e aplique selador em paredes novas. A preparação da superfície influencia tanto quanto a tinta escolhida.",
  },
  {
    slug: "qual-bitola-de-fio-usar",
    title: "Qual bitola de fio usar em cada circuito da casa?",
    excerpt: "Iluminação, tomadas e chuveiro pedem bitolas diferentes. Veja uma referência geral e por que contratar um eletricista.",
    category: "eletrica", photo: "photo-1601462904263-f2fa0c851cb9", alt: "Fios elétricos coloridos", readingMinutes: 4, daysAgo: 20,
    products: ["cabo-flexivel-2-5mm-rolo-100m", "conjunto-tomada-2p-t-10a-branco", "chuveiro-eletrico-multitemperaturas-7500w"],
    content: "Esta é apenas uma referência geral. O dimensionamento correto depende da distância, da carga e do projeto elétrico, e deve ser feito por um profissional habilitado seguindo a NBR 5410.\n\n## Referências comuns em residências\n\n| Circuito | Bitola usual |\n| --- | --- |\n| Iluminação | 1,5 mm² |\n| Tomadas de uso geral | 2,5 mm² |\n| Tomadas de cozinha e lavanderia | 2,5 mm² a 4 mm² |\n| Chuveiro elétrico | 6 mm² a 10 mm² |\n\n## Cores dos condutores\n\nUse azul-claro para o neutro e verde ou verde-amarelo para o terra. Isso facilita manutenções futuras.\n\n## Segurança em primeiro lugar\n\nNunca aumente o disjuntor sem verificar a bitola do fio. Disjuntor maior que o suportado pelo cabo pode causar aquecimento e incêndio.",
  },
  {
    slug: "checklist-para-reformar-o-banheiro",
    title: "Checklist para reformar o banheiro sem dor de cabeça",
    excerpt: "Da impermeabilização à escolha do metal: a ordem certa das etapas para não refazer serviço.",
    category: "reforma", photo: "photo-1620626011761-996317b8d101", alt: "Banheiro com banheira branca e planta", readingMinutes: 6, daysAgo: 33,
    products: ["argamassa-polimerica-impermeabilizante-18kg", "misturador-monocomando-lavatorio-preto", "cuba-de-apoio-retangular-branca"],
    content: "## 1. Planeje os pontos de água e esgoto\n\nDefina a posição do vaso, do lavatório e do chuveiro antes de quebrar qualquer parede.\n\n## 2. Impermeabilize a área do box\n\nAplique impermeabilizante no piso e subindo pelas paredes do box. Faça o teste de estanqueidade antes de revestir.\n\n## 3. Escolha revestimentos adequados\n\nPrefira pisos com acabamento acetinado ou antiderrapante na área molhada.\n\n## 4. Compatibilize registros e acabamentos\n\nO acabamento do registro precisa ser compatível com a base instalada na parede. Anote a marca e a linha.\n\n## 5. Deixe os metais e louças por último\n\nInstale após o rejunte e a limpeza da obra, evitando riscos e manchas.",
  },
];

// -----------------------------------------------------------------------------
// Páginas legais e institucionais (modelos — revisar com assessoria jurídica)
// -----------------------------------------------------------------------------
export const demoPages: { slug: string; title: string; summary: string; content: string }[] = [
  {
    slug: "politica-de-privacidade",
    title: "Política de Privacidade",
    summary: "Como tratamos os dados pessoais de quem visita o site e entra em contato com a Cerigatto.",
    content: "Esta política explica quais dados pessoais são tratados quando você utiliza este site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).\n\n## Dados que coletamos\n\n- **Formulário de contato:** nome, telefone/WhatsApp, e-mail, assunto e mensagem, informados por você.\n- **Navegação:** registramos eventos anônimos (por exemplo, produtos visualizados e cliques no botão do WhatsApp) associados a um identificador de sessão aleatório, sem nome, e-mail ou telefone.\n- **Lista de Orçamento e Favoritos:** ficam salvos apenas no seu navegador (armazenamento local) até você limpá-los.\n\n## Para que usamos\n\n- Responder às suas solicitações e orçamentos;\n- Entender quais produtos e conteúdos são mais procurados, para melhorar o catálogo;\n- Cumprir obrigações legais.\n\n## WhatsApp\n\nAo clicar em um botão do WhatsApp, você é direcionado ao aplicativo e a conversa passa a seguir também as políticas do WhatsApp.\n\n## Compartilhamento\n\nNão vendemos dados pessoais. Os dados podem ser processados por fornecedores de infraestrutura (hospedagem e banco de dados) contratados para operar o site.\n\n## Seus direitos\n\nVocê pode solicitar acesso, correção ou exclusão dos seus dados pessoais pelos canais informados na página de contato.\n\n## Atualizações\n\nEsta política pode ser atualizada. A data da última atualização aparece nesta página.",
  },
  {
    slug: "termos-de-uso",
    title: "Termos de Uso",
    summary: "Condições de uso do catálogo digital da Cerigatto.",
    content: "## Natureza do site\n\nEste site é um **catálogo digital**. Não há venda, pagamento ou checkout on-line. Preços, quando exibidos, são informativos e podem mudar sem aviso; disponibilidade, condições e valores finais são confirmados pela nossa equipe no atendimento.\n\n## Imagens e informações\n\nAs imagens são ilustrativas. Cores e texturas podem variar conforme a tela e o lote do fabricante. Confira as especificações técnicas com nossa equipe antes da compra.\n\n## Lista de Orçamento\n\nA Lista de Orçamento é uma ferramenta para organizar os itens que você quer cotar. Ela não gera pedido, reserva de produto nem compromisso de compra.\n\n## Propriedade intelectual\n\nTextos, marcas e elementos visuais do site não podem ser reproduzidos sem autorização.\n\n## Contato\n\nDúvidas sobre estes termos podem ser enviadas pelos canais da página de contato.",
  },
  {
    slug: "cookies",
    title: "Política de Cookies",
    summary: "Quais tecnologias de armazenamento o site utiliza.",
    content: "## O que usamos\n\n- **Armazenamento local do navegador:** guarda sua Lista de Orçamento, Favoritos e um identificador de sessão anônimo usado em estatísticas internas. Esses dados não identificam você.\n- **Cookies de sessão administrativa:** usados apenas pela equipe da Cerigatto ao acessar o painel.\n\n## Ferramentas de terceiros\n\nSe ferramentas de medição (como Google Analytics ou Meta Pixel) forem ativadas, elas só serão carregadas após o seu consentimento no aviso de cookies, e você poderá alterar sua escolha a qualquer momento.\n\n## Como apagar\n\nVocê pode limpar os dados do site nas configurações do seu navegador.",
  },
];

// -----------------------------------------------------------------------------
// FAQ geral (orientações de atendimento, sem prometer prazos ou condições)
// -----------------------------------------------------------------------------
export const demoFaqs: { question: string; answer: string }[] = [
  { question: "Posso comprar pelo site?", answer: "O site é um catálogo. Você encontra os produtos, monta sua Lista de Orçamento e envia para nossa equipe pelo WhatsApp, que confirma disponibilidade, valores e condições." },
  { question: "Os preços exibidos são finais?", answer: "Quando aparecem, os preços são informativos. Valores finais, descontos por quantidade e condições são confirmados no atendimento." },
  { question: "Como funciona a Lista de Orçamento?", answer: "Adicione produtos, escolha variações e quantidades e toque em \"Enviar lista pelo WhatsApp\". A lista fica salva no seu navegador até você limpá-la." },
];
