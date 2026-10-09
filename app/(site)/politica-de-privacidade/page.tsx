import { routes } from "@/lib/routes";
import { LegalPage, legalPageMetadata } from "@/features/content/legal-page";

export function generateMetadata() {
  return legalPageMetadata("politica-de-privacidade", routes.privacy());
}

export default function Page() {
  return <LegalPage slug="politica-de-privacidade" />;
}
