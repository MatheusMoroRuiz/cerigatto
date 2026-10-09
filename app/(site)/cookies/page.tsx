import { routes } from "@/lib/routes";
import { LegalPage, legalPageMetadata } from "@/features/content/legal-page";

export function generateMetadata() {
  return legalPageMetadata("cookies", routes.cookies());
}

export default function Page() {
  return <LegalPage slug="cookies" />;
}
