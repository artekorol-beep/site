/**
 * Best-effort official image matcher for the DekorPrestizh catalogue.
 * Only reads public pages on labirintdoors.ru, follows official product links,
 * and records an image only when the model name has a strong match.
 * Run from an internet-connected environment: npm run catalog:images
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const productsPath = path.join(root, 'src', 'data', 'products.json');
const officialHost = 'labirintdoors.ru';
const delayMs = 350;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const decode = s => String(s || '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const textFromHtml = s => decode(String(s || '').replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
  .replace(/\s+/g, ' ').trim();
const norm = s => textFromHtml(String(s || '').toLowerCase().replace(/ё/g, 'е'))
  .replace(/[^a-zа-я0-9]+/gi, ' ').replace(/\s+/g, ' ').trim();
const stopWords = new Set(['входная','дверь','двери','лабиринт','купить','руб','рублей','рубль','официальный','сайт','завода','в','на','с']);
const tokens = s => norm(s).split(' ').filter(t => t.length > 1 && !stopWords.has(t));
function safeOfficialUrl(raw, base = `https://${officialHost}`) {
  try {
    const u = new URL(decode(raw), base);
    if (u.protocol !== 'https:' || u.hostname !== officialHost) return null;
    u.hash = '';
    return u.href;
  } catch { return null; }
}
function attr(attrs, key) {
  const re = new RegExp(`(?:^|\\s)${key}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  return decode(attrs.match(re)?.[2] || '');
}
function getMeta(html, prop) {
  const rx = /<meta\b([^>]+)>/gi;
  let m;
  while ((m = rx.exec(html))) {
    const attrs = m[1];
    if ([attr(attrs, 'property'), attr(attrs, 'name')].some(x => x.toLowerCase() === prop.toLowerCase())) {
      return attr(attrs, 'content');
    }
  }
  return '';
}
function getTitle(html) {
  return textFromHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '') ||
    textFromHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}
function getExactPageImage(html, targetName) {
  const title = norm(getTitle(html));
  const target = tokens(targetName);
  const pageTokens = new Set(tokens(title));
  const score = target.length ? target.filter(t => pageTokens.has(t)).length / target.length : 0;
  if (score < 0.7) return null;
  for (const key of ['og:image', 'twitter:image']) {
    const raw = getMeta(html, key);
    const url = safeOfficialUrl(raw, `https://${officialHost}`);
    if (url && /\/images\//i.test(url)) return { url, score, title: getTitle(html) };
  }
  // Fallback: product-page image URLs from the official asset host only.
  const images = [...html.matchAll(/<(?:img|source)\b([^>]+)>/gi)].map(m => {
    const src = attr(m[1], 'src') || attr(m[1], 'data-src') || attr(m[1], 'data-original');
    const url = safeOfficialUrl(src, `https://${officialHost}`);
    const alt = attr(m[1], 'alt') || attr(m[1], 'title');
    return url && /\/images\//i.test(url) ? { url, alt, score: similarity(targetName, alt) } : null;
  }).filter(Boolean).sort((a,b) => b.score-a.score);
  if (images[0] && images[0].score >= 0.7) return { ...images[0], title: getTitle(html) };
  return null;
}
function similarity(a, b) {
  const aa = new Set(tokens(a));
  const bb = new Set(tokens(b));
  if (!aa.size || !bb.size) return 0;
  let overlap = 0;
  for (const x of aa) if (bb.has(x)) overlap++;
  return overlap / Math.max(aa.size, bb.size);
}
function productLinks(html) {
  const out = [];
  const rx = /<a\b([^>]*\bhref\s*=\s*(["'])(.*?)\2[^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = rx.exec(html))) {
    const attrs = m[1];
    const href = safeOfficialUrl(m[3]);
    if (!href || !/(vhodnaya-dver|\/product|\/catalog\/)/i.test(href)) continue;
    const inner = m[4];
    const altTexts = [...inner.matchAll(/<(?:img|source)\b([^>]+)>/gi)].map(x => attr(x[1], 'alt') || attr(x[1], 'title')).join(' ');
    const label = [textFromHtml(inner), attr(attrs, 'title'), attr(attrs, 'aria-label'), altTexts].filter(Boolean).join(' ');
    if (!label) continue;
    out.push({ url: href, label, score: 0 });
  }
  return out;
}
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'DekorPrestizhCatalogVerifier/1.0 (manual catalog verification)' },
    redirect: 'follow', signal: AbortSignal.timeout(18000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const finalUrl = safeOfficialUrl(res.url);
  if (!finalUrl) throw new Error('Redirected outside the official host; stopped');
  return await res.text();
}

const products = JSON.parse(await fs.readFile(productsPath, 'utf8'));
const pageCache = new Map();
async function page(url) {
  if (!pageCache.has(url)) {
    await sleep(delayMs);
    try { pageCache.set(url, await fetchHtml(url)); }
    catch (e) { console.warn(`Skip ${url}: ${e.message}`); pageCache.set(url, null); }
  }
  return pageCache.get(url);
}

// Collection/listing pages are fetched once, then their visible links are used
// to resolve a product-specific official page. Never copy an image from a
// generic collection banner and never use non-official image hosts.
const listingUrls = [...new Set(products.map(p => safeOfficialUrl(p.sourceUrl)).filter(Boolean))];
const listings = [];
for (const url of listingUrls) {
  const html = await page(url);
  if (html) listings.push({ url, html, links: productLinks(html) });
}
let matched = 0;
let checked = 0;
for (const product of products) {
  if (product.image && product.imageStatus?.includes('Оригинальное изображение найдено')) continue;
  const source = safeOfficialUrl(product.sourceUrl);
  if (!source) continue;
  let productUrl = null;
  let productHtml = await page(source);
  const exact = productHtml && getExactPageImage(productHtml, product.name);
  if (exact) {
    productUrl = source;
  } else {
    const candidates = listings.flatMap(l => l.links.map(a => ({ ...a, listingUrl: l.url })));
    const targetTokens = tokens(product.name);
    const possible = candidates.map(a => ({ ...a, score: similarity(product.name, a.label) }))
      .filter(a => a.score >= 0.72 && targetTokens.some(t => tokens(a.label).includes(t)))
      .sort((a,b) => b.score-a.score);
    if (possible.length && (!possible[1] || possible[0].score > possible[1].score)) {
      productUrl = possible[0].url;
      productHtml = await page(productUrl);
    }
  }
  checked++;
  if (!productHtml || !productUrl) continue;
  const image = getExactPageImage(productHtml, product.name);
  if (image && image.score >= 0.7) {
    product.sourceUrl = productUrl;
    product.image = image.url;
    product.imageSourceUrl = image.url;
    product.imageStatus = 'Оригинальное изображение найдено на индивидуальной официальной карточке; коммерческие права на использование необходимо подтвердить.';
    product.lastChecked = new Date().toISOString().slice(0,10);
    product.status = 'Фото сопоставлено по названию официальной карточки; цена и комплектация требуют проверки.';
    product.published = false;
    matched++;
  }
}
await fs.writeFile(productsPath, JSON.stringify(products, null, 2) + '\n');
console.log(`Checked ${checked} product records via ${pageCache.size} official pages.`);
console.log(`Exact product-image matches recorded: ${matched}.`);
console.log('No product has been published automatically. Review image rights and prices before launch.');
