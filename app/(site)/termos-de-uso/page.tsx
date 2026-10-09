import { routes } from "@/lib/routes";
import { LegalPage, legalPageMetadata } from "@/features/content/legal-page";

export function generateMetadata() {
  return legalPageMetadata("termos-de-uso", routes.terms());
}

export default function Page() {
  return <LegalPage slug="termos-de-uso" />;
}
