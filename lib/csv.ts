/**
 * CSV (RFC 4180) sem dependências. Detecta ";" (padrão do Excel em pt-BR) ou ",".
 */

export function detectDelimiter(text: string): ";" | "," {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons >= commas && semicolons > 0 ? ";" : ",";
}

export function parseCsv(input: string, delimiter?: ";" | ","): string[][] {
  const text = input.replace(/^﻿/, "");
  const sep = delimiter ?? detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === sep) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** Converte em objetos usando a primeira linha como cabeçalho (normalizado) */
export function parseCsvToObjects(input: string): { headers: string[]; rows: Record<string, string>[] } {
  const [header, ...body] = parseCsv(input);
  if (!header) return { headers: [], rows: [] };
  const headers = header.map((h) =>
    h
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "_"),
  );
  const rows = body.map((cells) =>
    Object.fromEntries(headers.map((h, i) => [h, (cells[i] ?? "").trim()])),
  );
  return { headers, rows };
}

function escapeCell(value: unknown, sep: string): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  // Evita injeção de fórmulas ao abrir no Excel/Sheets
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (text.includes('"') || text.includes(sep) || /[\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: unknown[][], delimiter: ";" | "," = ";"): string {
  const lines = [headers, ...rows].map((r) => r.map((cell) => escapeCell(cell, delimiter)).join(delimiter));
  // BOM para o Excel reconhecer UTF-8
  return `﻿${lines.join("\r\n")}\r\n`;
}
