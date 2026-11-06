"use client";

import { useParams } from "next/navigation";
import groupsData from "../../../data/official-model-groups.json";
import homeModelMap from "../../../data/home-model-map.json";
import labPro2CatalogData from "../../../data/lab-pro-2-catalog.json";
import labPro1CatalogData from "../../../data/lab-pro-1-catalog.json";
import royalSmart81CatalogData from "../../../data/royal-smart-81-catalog.json";

type Variant = {
  name: string;
  url: string;
  sourcePrice: number | null;
  officialImage: string | null;
  imageStatus?: string;
  priceStatus?: string;
};

type Group = {
  id: string;
  name: string;
  collection: string;
  variants: Variant[];
};

const groups = groupsData as Group[];
const doorDetailSlug = (sourceUrl: string) => {
  try {
    return new URL(sourceUrl).pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return sourceUrl.split("/").filter(Boolean).pop() || "";
  }
};
const labPro2Catalog = labPro2CatalogData as Variant[];
const labPro1Catalog = labPro1CatalogData as Variant[];
const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const RETAIL_MARKUP = 1.3333; // Наценка 33,33%
const retailPrice = (sourcePrice: number) => Math.ceil(sourcePrice * RETAIL_MARKUP / 100) * 100;

export default function ModelVariantsPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params.slug || ""));
  const group = groups.find(g => g.id === slug);

  const mergeFamilyIds: Record<string, string[]> = {
    "OFFICIAL-GROUP-0169": ["OFFICIAL-GROUP-0169", "OFFICIAL-GROUP-0170", "OFFICIAL-GROUP-0171", "OFFICIAL-GROUP-0172", "OFFICIAL-GROUP-0173", "OFFICIAL-GROUP-0174", "OFFICIAL-GROUP-0175", "OFFICIAL-GROUP-0176", "OFFICIAL-GROUP-0177"],
    "OFFICIAL-GROUP-0178": ["OFFICIAL-GROUP-0178", "OFFICIAL-GROUP-0179", "OFFICIAL-GROUP-0180", "OFFICIAL-GROUP-0181", "OFFICIAL-GROUP-0182", "OFFICIAL-GROUP-0183", "OFFICIAL-GROUP-0184", "OFFICIAL-GROUP-0185", "OFFICIAL-GROUP-0186"],
    "OFFICIAL-GROUP-0261": ["OFFICIAL-GROUP-0261", "OFFICIAL-GROUP-0262", "OFFICIAL-GROUP-0263", "OFFICIAL-GROUP-0264", "OFFICIAL-GROUP-0265", "OFFICIAL-GROUP-0266", "OFFICIAL-GROUP-0267", "OFFICIAL-GROUP-0268", "OFFICIAL-GROUP-0269", "OFFICIAL-GROUP-0270"],
    "OFFICIAL-GROUP-0149": ["OFFICIAL-GROUP-0149", "OFFICIAL-GROUP-0150"],
    "OFFICIAL-GROUP-0151": ["OFFICIAL-GROUP-0151", "OFFICIAL-GROUP-0152", "OFFICIAL-GROUP-0153", "OFFICIAL-GROUP-0154", "OFFICIAL-GROUP-0155", "OFFICIAL-GROUP-0156", "OFFICIAL-GROUP-0157", "OFFICIAL-GROUP-0158"],
    "OFFICIAL-GROUP-0027": ["OFFICIAL-GROUP-0027", "OFFICIAL-GROUP-0028", "OFFICIAL-GROUP-0029", "OFFICIAL-GROUP-0030", "OFFICIAL-GROUP-0031", "OFFICIAL-GROUP-0032", "OFFICIAL-GROUP-0033", "OFFICIAL-GROUP-0034", "OFFICIAL-GROUP-0035", "OFFICIAL-GROUP-0428"],
    "OFFICIAL-GROUP-0197": ["OFFICIAL-GROUP-0197", "OFFICIAL-GROUP-0198", "OFFICIAL-GROUP-0199", "OFFICIAL-GROUP-0200", "OFFICIAL-GROUP-0201", "OFFICIAL-GROUP-0202", "OFFICIAL-GROUP-0429", "OFFICIAL-GROUP-0430", "OFFICIAL-GROUP-0431", "OFFICIAL-GROUP-0432"],
    "OFFICIAL-GROUP-0211": ["OFFICIAL-GROUP-0211", "OFFICIAL-GROUP-0212", "OFFICIAL-GROUP-0213", "OFFICIAL-GROUP-0214", "OFFICIAL-GROUP-0215", "OFFICIAL-GROUP-0216", "OFFICIAL-GROUP-0217", "OFFICIAL-GROUP-0218", "OFFICIAL-GROUP-0219", "OFFICIAL-GROUP-0433", "OFFICIAL-GROUP-0434"],
    "OFFICIAL-GROUP-0245": ["OFFICIAL-GROUP-0245", "OFFICIAL-GROUP-0246", "OFFICIAL-GROUP-0247", "OFFICIAL-GROUP-0248", "OFFICIAL-GROUP-0249", "OFFICIAL-GROUP-0250", "OFFICIAL-GROUP-0251", "OFFICIAL-GROUP-0252", "OFFICIAL-GROUP-0435", "OFFICIAL-GROUP-0436"],
    "OFFICIAL-GROUP-0357": ["OFFICIAL-GROUP-0357", "OFFICIAL-GROUP-0358", "OFFICIAL-GROUP-0359", "OFFICIAL-GROUP-0360", "OFFICIAL-GROUP-0361", "OFFICIAL-GROUP-0362", "OFFICIAL-GROUP-0363", "OFFICIAL-GROUP-0364", "OFFICIAL-GROUP-0365", "OFFICIAL-GROUP-0366"],
  };

  const displayVariants = !group
    ? []
    : slug === "OFFICIAL-GROUP-0299"
      ? royalSmart81CatalogData
    : slug === "OFFICIAL-GROUP-0169"
      ? labPro1Catalog
      : slug === "OFFICIAL-GROUP-0178"
        ? labPro2Catalog
        : mergeFamilyIds[slug]
          ? groups
              .filter(g => mergeFamilyIds[slug].includes(g.id))
              .flatMap(g => g.variants)
              .filter((v, i, all) => all.findIndex(x => x.url === v.url) === i)
          : group.variants;

  if (!group) {
    return (
      <main style={{maxWidth: 1100, margin: "0 auto", padding: 24}}>
        <a href="/">← Весь каталог</a>
        <h1>Модель не найдена</h1>
      </main>
    );
  }

  return (
    <main style={{maxWidth: 1200, margin: "0 auto", padding: "24px 16px", color: "#222"}}>
      <header style={{display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 28}}>
        <a href="/" style={{color: "inherit"}}>← Весь каталог</a>
        <strong>ДекорПрестиж</strong>
      </header>

      <p style={{color: "#777", marginBottom: 8}}>{group.collection}</p>
      <h1 style={{fontSize: 32, margin: "0 0 10px"}}>{(homeModelMap as {displayName:string;groupId:string}[]).find(m => m.groupId === group.id)?.displayName || group.name}</h1>
      <p style={{color: "#666", marginBottom: 28}}>
        {slug === "OFFICIAL-GROUP-0299"
          ? "Все 81 вариант модели из каталога производителя. Выберите карточку, чтобы запросить комплектацию."
          : slug === "OFFICIAL-GROUP-0169"
          ? "Все 83 варианта модели из каталога производителя. Выберите карточку, чтобы запросить комплектацию."
          : slug === "OFFICIAL-GROUP-0178"
            ? "Все 81 вариант модели из каталога производителя. Выберите карточку, чтобы запросить комплектацию."
            : "Все доступные варианты этой модели. Выберите карточку, чтобы запросить комплектацию."}
      </p>

      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20}}>
        {displayVariants.map((variant, index) => (
          <article key={`${variant.name}-${index}`} style={{border: "1px solid #e5e5e5", borderRadius: 10, overflow: "hidden", background: "#fff"}}>
            <div style={{height: 290, background: "#f6f6f6", display: "flex", alignItems: "center", justifyContent: "center"}}>
              {variant.officialImage ? (
                <img src={variant.officialImage} alt={variant.name} loading="lazy" style={{width: "100%", height: "100%", objectFit: "contain"}} />
              ) : (
                <span style={{color: "#888", padding: 20, textAlign: "center"}}>Фотография варианта пока отсутствует</span>
              )}
            </div>
            <div style={{padding: 14}}>
              <h2 style={{fontSize: 16, lineHeight: 1.4, minHeight: 45, margin: "0 0 10px"}}>{variant.name}</h2>
              {["OFFICIAL-GROUP-0169", "OFFICIAL-GROUP-0178"].includes(slug) && (
                <a
                  href={`/door/${encodeURIComponent(doorDetailSlug(variant.url))}`}
                  style={{display: "inline-block", margin: "0 0 12px", color: "#6f6253", fontSize: 13, textDecoration: "underline"}}
                >
                  Подробнее о двери →
                </a>
              )}
              {variant.sourcePrice !== null ? (
                <strong style={{display: "block", fontSize: 19, marginBottom: 12}}>{fmt(retailPrice(variant.sourcePrice))}</strong>
              ) : (
                <strong style={{display: "block", fontSize: 16, marginBottom: 12}}>Цена уточняется</strong>
              )}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_STORE_EMAIL || ""}?subject=${encodeURIComponent("Запрос по двери: " + variant.name)}&body=${encodeURIComponent("Прошу уточнить наличие и комплектацию: " + variant.name + "\\nПредварительная цена: " + (variant.sourcePrice !== null ? fmt(retailPrice(variant.sourcePrice)) : "уточняется"))}`}
                style={{display: "block", padding: "11px 14px", borderRadius: 24, background: "#111", color: "#fff", textAlign: "center", textDecoration: "none", fontWeight: 600}}
              >
                Запросить вариант
              </a>
              <p style={{fontSize: 12, color: "#777", marginTop: 10}}>
                Цена предварительная, наличие подтвердит менеджер.
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
