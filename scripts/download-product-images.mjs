
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const productsPath = path.join(root, "src/data/products.json");
const outputDir = path.join(root, "public/images/doors");

await fs.mkdir(outputDir, { recursive: true });

const products = JSON.parse(await fs.readFile(productsPath, "utf8"));
const allowedHost = "labirintdoors.ru";
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

let downloaded = 0;
let skipped = 0;

for (const product of products) {
  if (!product.image) {
    skipped++;
    continue;
  }

  let url;
  try {
    url = new URL(product.image);
  } catch {
    console.log(`Пропуск: неверная ссылка — ${product.name}`);
    skipped++;
    continue;
  }

  if (url.protocol !== "https:" || url.hostname !== allowedHost) {
    console.log(`Пропуск: сторонний источник — ${product.name}`);
    skipped++;
    continue;
  }

  const ext = path.extname(url.pathname).toLowerCase();
  if (!extensions.has(ext)) {
    console.log(`Пропуск: неподдерживаемый формат — ${product.name}`);
    skipped++;
    continue;
  }

  const filename = `${String(product.id).replace(/[^a-zA-Z0-9_-]/g, "_")}${ext}`;
  const destination = path.join(outputDir, filename);

  try {
    const response = await fetch(url, {
      headers: { "user-agent": "DekorPrestizhImageImporter/1.0" },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      throw new Error(`Это не изображение: ${contentType}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000) throw new Error("Файл слишком маленький");

    await fs.writeFile(destination, bytes);
    product.image = `/images/doors/${filename}`;
    downloaded++;
    console.log(`Скачано: ${product.name}`);
  } catch (error) {
    console.log(`Ошибка: ${product.name} — ${error.message}`);
    skipped++;
  }
}

await fs.writeFile(productsPath, JSON.stringify(products, null, 2) + "\n");

console.log(`\nГотово. Скачано: ${downloaded}; пропущено: ${skipped}.`);
console.log("Проверьте соответствие фотографий моделям перед публикацией.");
