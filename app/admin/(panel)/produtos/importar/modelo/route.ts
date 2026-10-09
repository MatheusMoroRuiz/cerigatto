import { getAdminSession } from "@/lib/auth/session";
import { toCsv } from "@/lib/csv";
import { IMPORT_COLUMNS, templateCsvRows } from "@/lib/validation/import";

export async function GET() {
  if (!(await getAdminSession())) return new Response("Não autorizado", { status: 401 });
  return new Response(toCsv([...IMPORT_COLUMNS], templateCsvRows()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-importacao-produtos.csv"',
      "Cache-Control": "no-store",
    },
  });
}
