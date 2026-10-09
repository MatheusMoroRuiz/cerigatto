/**
 * Captura de tela de página inteira para revisão visual.
 * Uso: pnpm tsx scripts/dev/screenshot.ts <url> <arquivo.png> [largura]
 */
import { chromium } from "@playwright/test";

async function main() {
  const [url = "http://localhost:3000", out = "screenshot.png", width = "1440"] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  // Força o carregamento de imagens lazy
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
