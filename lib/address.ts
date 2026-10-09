import { formatPostalCode } from "./format";

/** Endereço em uma linha; null quando a rua não foi cadastrada */
export function formatAddress(b: {
  street: string | null;
  streetNumber: string | null;
  complement: string | null;
  district: string | null;
  city: string;
  state: string;
  postalCode: string | null;
}): string | null {
  if (!b.street) return null;
  const line1 = [b.street, b.streetNumber].filter(Boolean).join(", ");
  const parts = [line1, b.complement, b.district, `${b.city}/${b.state}`, b.postalCode ? `CEP ${formatPostalCode(b.postalCode)}` : null];
  return parts.filter(Boolean).join(" · ");
}
