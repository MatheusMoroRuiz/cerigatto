export type NavLink = { label: string; href: string; enabled: boolean };

export type BusinessHour = {
  id: string;
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
  note: string | null;
};

export type SocialLink = { id: string; platform: SocialPlatform; url: string };

export type SocialPlatform = "instagram" | "facebook" | "youtube" | "linkedin" | "tiktok" | "pinterest" | "x";

export type WhatsAppSettings = {
  isEnabled: boolean;
  countryCode: string;
  phoneNumber: string | null;
  defaultMessage: string;
  productIntro: string;
  productOutro: string;
  quoteIntro: string;
  buttonLabel: string;
  floatingLabel: string;
  showFloatingButton: boolean;
  showFloatingLabelMobile: boolean;
  showOutOfHoursNotice: boolean;
  outOfHoursMessage: string;
};

export type BusinessInfo = {
  legalName: string | null;
  tradeName: string | null;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  streetNumber: string | null;
  complement: string | null;
  district: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  foundedYear: number | null;
  aboutTitle: string | null;
  aboutSummary: string | null;
  history: string | null;
  mission: string | null;
  valuesText: string | null;
};

export type SeoSettings = {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultOgImageUrl: string | null;
  googleSiteVerification: string | null;
  bingSiteVerification: string | null;
  noindexSite: boolean;
  localBusinessType: string;
};

export type SiteSettings = {
  siteName: string;
  shortName: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  topbarEnabled: boolean;
  topbarMessage: string | null;
  topbarLink: string | null;
  navLinks: NavLink[];
  theme: Record<string, string>;
  ga4Id: string | null;
  gtmId: string | null;
  metaPixelId: string | null;
  newsletterEnabled: boolean;
  demoNoticeEnabled: boolean;
};

export type SiteConfig = {
  site: SiteSettings;
  business: BusinessInfo;
  hours: BusinessHour[];
  social: SocialLink[];
  whatsapp: WhatsAppSettings;
  seo: SeoSettings;
};
