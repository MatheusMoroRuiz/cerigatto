"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { captureAttribution, trackEvent } from "@/lib/analytics/client";
import { getConsent, setConsent, subscribeConsent, type ConsentValue } from "@/lib/analytics/consent";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";

type Props = { ga4Id: string | null; gtmId: string | null; metaPixelId: string | null };

const GA_PATTERN = /^G-[A-Z0-9]{4,20}$/;
const GTM_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;
const PIXEL_PATTERN = /^[0-9]{6,20}$/;

function useConsent(): ConsentValue | null | "unknown" {
  return useSyncExternalStore(subscribeConsent, getConsent, () => "unknown");
}

/**
 * - Registra page_view e preserva UTMs (analytics próprio, anônimo).
 * - Carrega GA4/GTM/Meta Pixel SOMENTE se configurados e após consentimento.
 */
export function AnalyticsProvider({ ga4Id, gtmId, metaPixelId }: Props) {
  const pathname = usePathname();
  const consent = useConsent();
  const ga = ga4Id && GA_PATTERN.test(ga4Id) ? ga4Id : null;
  const gtm = gtmId && GTM_PATTERN.test(gtmId) ? gtmId : null;
  const pixel = metaPixelId && PIXEL_PATTERN.test(metaPixelId) ? metaPixelId : null;
  const hasThirdParty = Boolean(ga || gtm || pixel);

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    trackEvent("page_view", { path: pathname });
  }, [pathname]);

  return (
    <>
      {consent === "granted" && ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {consent === "granted" && gtm ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
      {consent === "granted" && pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
      {hasThirdParty && consent === null ? <CookieBanner /> : null}
    </>
  );
}

function CookieBanner() {
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferências de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-lg border bg-surface p-5 shadow-2xl sm:inset-x-6 sm:bottom-6"
    >
      <p className="text-sm leading-relaxed">
        Usamos ferramentas de medição (como Google Analytics) para entender o uso do site. Elas só são ativadas com sua
        permissão. Saiba mais na{" "}
        <Link href={routes.cookies()} className="font-semibold text-primary underline">
          Política de Cookies
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => setConsent("denied")}>
          Recusar
        </Button>
        <Button variant="secondary" onClick={() => setConsent("granted")}>
          Aceitar
        </Button>
      </div>
    </div>
  );
}
