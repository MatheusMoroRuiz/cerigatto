import type { SiteConfig } from "@/types/settings";

/**
 * Valores padrão quando o banco ainda não respondeu/está vazio.
 * NÃO contém dados de contato inventados — telefone, e-mail, endereço e
 * horários começam vazios e são preenchidos pelo painel.
 */
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  site: {
    siteName: "Cerigatto Materiais de Construção",
    shortName: "Cerigatto",
    tagline: "Materiais de construção em Bauru/SP",
    description: null,
    logoUrl: null,
    logoDarkUrl: null,
    faviconUrl: null,
    topbarEnabled: false,
    topbarMessage: null,
    topbarLink: null,
    navLinks: [
      { label: "Produtos", href: "/produtos", enabled: true },
      { label: "Ofertas", href: "/ofertas", enabled: true },
      { label: "Marcas", href: "/marcas", enabled: true },
      { label: "Ambientes", href: "/ambientes", enabled: true },
      { label: "Dicas", href: "/dicas", enabled: true },
      { label: "Sobre a Cerigatto", href: "/sobre", enabled: true },
      { label: "Contato", href: "/contato", enabled: true },
    ],
    theme: {},
    ga4Id: null,
    gtmId: null,
    metaPixelId: null,
    newsletterEnabled: false,
    demoNoticeEnabled: false,
  },
  business: {
    legalName: null,
    tradeName: null,
    cnpj: null,
    phone: null,
    email: null,
    street: null,
    streetNumber: null,
    complement: null,
    district: null,
    city: "Bauru",
    state: "SP",
    postalCode: null,
    latitude: null,
    longitude: null,
    googleMapsUrl: null,
    foundedYear: null,
    aboutTitle: null,
    aboutSummary: null,
    history: null,
    mission: null,
    valuesText: null,
  },
  hours: [],
  social: [],
  whatsapp: {
    isEnabled: true,
    countryCode: "55",
    phoneNumber: null,
    defaultMessage: "Olá! Estou no site da Cerigatto Materiais de Construção e gostaria de atendimento.",
    productIntro: "Olá! Estou no site da Cerigatto Materiais de Construção e gostaria de consultar este produto:",
    productOutro: "Gostaria de verificar disponibilidade e condições.",
    quoteIntro:
      "Olá! Estou no site da Cerigatto Materiais de Construção e gostaria de solicitar um orçamento para os itens abaixo:",
    buttonLabel: "Consultar disponibilidade no WhatsApp",
    floatingLabel: "Fale com a Cerigatto",
    showFloatingButton: true,
    showFloatingLabelMobile: false,
    showOutOfHoursNotice: true,
    outOfHoursMessage:
      "Estamos fora do horário de atendimento, mas envie sua mensagem e responderemos assim que possível.",
  },
  seo: {
    defaultTitle: "Cerigatto Materiais de Construção em Bauru/SP",
    titleTemplate: "%s | Cerigatto Materiais de Construção",
    defaultDescription:
      "Catálogo de materiais de construção, pisos e revestimentos, tintas, elétrica, hidráulica e ferramentas em Bauru/SP. Consulte disponibilidade e solicite orçamento pelo WhatsApp.",
    defaultOgImageUrl: null,
    googleSiteVerification: null,
    bingSiteVerification: null,
    noindexSite: false,
    localBusinessType: "HardwareStore",
  },
};
