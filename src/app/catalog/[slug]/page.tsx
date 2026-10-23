
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import allProducts from "../../../data/products.json";
import rawPanels from "../../../data/panels.json";

type Product = {
  id: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  sourcePrice: number | null;
  sourceUrl: string;
  panelRequired: string;
  description: string;
  image: string | null;
  imageStatus?: string;
  gallery?: { src: string; label: string }[];
  galleryNote?: string;
  sourcePriceStatus?: string;
  verificationNote?: string;
  manufacturerSpecs?: Record<string, string | undefined>;
};

type Panel = {
  id: string;
  name: string;
  price: number;
  sourcePrice: number;
  compatibility: string;
  image?: string;
  imageSourceUrl?: string;
  imageStatus?: string;
};

const products = allProducts as Product[];
const panels = rawPanels as Panel[];
const visiblePanels = panels.filter(
  (panel) => !["PANEL-073", "PANEL-080"].includes(panel.id)
);

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";

const calculateDoorPrice = (
  doorSourcePrice: number | null,
  panelSourcePrice: number
) =>
  Math.ceil(((doorSourcePrice || 0) + panelSourcePrice) * 1.25 / 100) * 100;

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params.slug || ""));

  const product = products.find((item) => item.id === slug);

  const [selectedPanelId, setSelectedPanelId] = useState(
    visiblePanels[0]?.id || ""
  );
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selectedPanel = visiblePanels.find(
    (panel) => panel.id === selectedPanelId
  );

  const gallery = product
    ? (product.gallery?.length
        ? product.gallery
        : product.image
          ? [{ src: product.image, label: "Основное фото" }]
          : [])
    : [];
  const safePhotoIndex = gallery.length
    ? Math.min(activePhotoIndex, gallery.length - 1)
    : 0;
  const activePhoto = gallery[safePhotoIndex];

  const estimatedPrice = product && selectedPanel
    ? calculateDoorPrice(product.sourcePrice, selectedPanel.sourcePrice)
    : product?.price || 0;

  const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL || "";

  const requestText = [
    "Заявка с сайта ДекорПрестиж",
    `Базовая модель: ${product?.name || ""}`,
    `Коллекция: ${product?.collection || ""}`,
    `Выбранная накладка: ${selectedPanel?.name || "Не выбрана"}`,
    `Цена накладки: ${selectedPanel ? formatPrice(selectedPanel.price) : "Не выбрана"}`,
    `Предварительная цена двери с накладкой: ${formatPrice(estimatedPrice)}`,
    `Имя: ${customerName || "Не указано"}`,
    `Телефон: ${phone || "Не указан"}`,
    `Страница производителя: ${product?.sourceUrl || ""}`,
    "",
    "Просьба подтвердить совместимость, комплектацию, наличие и актуальную цену.",
  ].join("\n");

  if (!product) {
    return (
      <main className="model-page">
        <header className="model-header">
          <a className="model-brand" href="/">ДекорПрестиж</a>
          <a href="/">← Весь каталог</a>
        </header>

        <section className="model-not-found">
          <h1>Модель не найдена</h1>
          <p>Возможно, ссылка устарела.</p>
          <a className="model-button" href="/">
            Вернуться в каталог
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="model-page">
      <header className="model-header">
        <a className="model-brand" href="/">ДекорПрестиж</a>
        <a href="/">← Весь каталог</a>
      </header>

      <div className="model-layout">
        <section className="model-visual">
          <div className="model-main-image">
            {activePhoto ? (
              <button
                type="button"
                className="model-main-image-trigger"
                onClick={() => setLightboxOpen(true)}
                aria-label="Увеличить фотографию"
              >
                <img src={activePhoto.src} alt={`${product.name} — ${activePhoto.label}`} />
                <span className="model-zoom-hint">Увеличить фото ↗</span>
              </button>
            ) : (
              <div className="model-placeholder">
                <span>ДП</span>
                <b>ФОТО МОДЕЛИ</b>
                <small>Фотография двери уточняется у производителя</small>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="model-gallery-thumbs" aria-label="Фотографии модели">
              {gallery.map((photo, index) => (
                <button
                  type="button"
                  key={`${photo.src}-${index}`}
                  className={`model-gallery-thumb ${index === safePhotoIndex ? "is-active" : ""}`}
                  onClick={() => setActivePhotoIndex(index)}
                  aria-label={`Показать фото: ${photo.label}`}
                  aria-pressed={index === safePhotoIndex}
                >
                  <img src={photo.src} alt="" />
                  <span>{photo.label}</span>
                </button>
              ))}
            </div>
          )}
          {product.galleryNote && <p className="model-gallery-note">{product.galleryNote}</p>}

          <p className="model-muted">{product.name}</p>

          {product.imageStatus && <p className="model-gallery-note">{product.imageStatus}</p>}

          {product.sourceUrl && (
            <a
              className="model-source-link"
              href={product.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Открыть карточку производителя ↗
            </a>
          )}
        </section>

        <section className="model-details">
          <p className="model-eyebrow">{product.collection}</p>

          <h1>{product.name}</h1>

          <p className="model-description">
            Выберите накладку для комплектации двери. Цена накладки и
            предварительная стоимость двери пересчитываются при выборе.
            Совместимость выбранного сочетания подтвердит менеджер.
          </p>

          <div className="model-price-box">
            <span>Предварительная стоимость двери с накладкой</span>
            <strong>{formatPrice(estimatedPrice)}</strong>
            <small>
              Расчёт: цена двери производителя плюс цена накладки
              производителя, наценка 25%, округление вверх до 100 ₽.
            </small>
          </div>

          {product.manufacturerSpecs && Object.keys(product.manufacturerSpecs).length > 0 && (
            <section className="model-specs">
              <div className="model-specs-heading">
                <p className="model-eyebrow">ХАРАКТЕРИСТИКИ</p>
                <h2>Конструкция и комплектация</h2>
              </div>
              <div className="model-spec-grid">
                {Object.entries(product.manufacturerSpecs).map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
              <p className="model-gallery-note">Характеристики приведены по карточке производителя и требуют подтверждения для выбранной комплектации.</p>
            </section>
          )}

          <section className="model-options">
            <div className="model-options-heading">
              <div>
                <p className="model-eyebrow">ВАРИАНТЫ ОТДЕЛКИ</p>
                <h2>Выберите накладку</h2>
              </div>
              <span>{visiblePanels.length} вариантов</span>
            </div>

            <p className="model-muted">
              Нажмите на карточку, чтобы выбрать накладку. Цена на карточке
              указана отдельно от предварительной стоимости двери.
            </p>

            <div className="model-panel-grid">
              {visiblePanels.map((panel) => {
                const isSelected = panel.id === selectedPanelId;

                const doorWithPanelPrice = calculateDoorPrice(
                  product.sourcePrice,
                  panel.sourcePrice
                );

                return (
                  <button
                    type="button"
                    key={panel.id}
                    className={`model-panel-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setSelectedPanelId(panel.id)}
                    aria-pressed={isSelected}
                  >
                    <div className={`model-panel-photo ${panel.image ? "has-panel-photo" : ""}`}>
                      {panel.image ? (
                        <img src={panel.image} alt={panel.name} />
                      ) : (
                        <>
                          <span>ДП</span>
                          <small>Фото накладки уточняется</small>
                        </>
                      )}
                    </div>

                    <span className="model-panel-name">
                      {panel.name}
                    </span>

                    <span className="model-panel-price">
                      Накладка: {formatPrice(panel.price)}
                    </span>

                    <span className="model-panel-total">
                      Дверь с накладкой: {formatPrice(doorWithPanelPrice)}
                    </span>

                    <span className="model-panel-select">
                      {isSelected ? "✓ Выбрано" : "Выбрать вариант"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <p className="model-warning">
            Совместимость накладок с этой моделью пока не подтверждена.
            Все варианты и цены предварительные. Перед заказом менеджер
            проверит выбранную комплектацию.
          </p>

          {product.verificationNote && (
            <p className="model-warning">{product.verificationNote}</p>
          )}

          <section className="model-request">
            <h2>Запросить комплектацию</h2>

            <p className="model-muted">
              Оставьте имя и телефон, чтобы менеджер мог связаться с вами
              и подтвердить цену и наличие.
            </p>

            <label>
              Ваше имя
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Как к вам обращаться"
              />
            </label>

            <label>
              Телефон для связи
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 ..."
              />
            </label>

            {storeEmail ? (
              <a
                className="model-button"
                href={`mailto:${storeEmail}?subject=${encodeURIComponent(
                  "Заявка: " + product.name
                )}&body=${encodeURIComponent(requestText)}`}
              >
                Отправить заявку менеджеру
              </a>
            ) : (
              <p className="model-warning">
                Email менеджера пока не настроен. Укажите
                NEXT_PUBLIC_STORE_EMAIL в .env.local.
              </p>
            )}

            <p className="model-footnote">
              Онлайн-оплаты нет. Кнопка заявки открывает почтовую программу
              на устройстве; автоматическое сохранение заявок на сервере
              пока не подключено.
            </p>
          </section>
        </section>
      </div>

      {lightboxOpen && activePhoto && (
        <div className="model-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фотографии" onClick={() => setLightboxOpen(false)}>
          <button type="button" className="model-lightbox-close" aria-label="Закрыть" onClick={() => setLightboxOpen(false)}>×</button>
          {gallery.length > 1 && (
            <button
              type="button"
              className="model-lightbox-prev"
              aria-label="Предыдущее фото"
              onClick={(event) => { event.stopPropagation(); setActivePhotoIndex((safePhotoIndex + gallery.length - 1) % gallery.length); }}
            >‹</button>
          )}
          <img src={activePhoto.src} alt={`${product.name} — ${activePhoto.label}`} onClick={(event) => event.stopPropagation()} />
          {gallery.length > 1 && (
            <button
              type="button"
              className="model-lightbox-next"
              aria-label="Следующее фото"
              onClick={(event) => { event.stopPropagation(); setActivePhotoIndex((safePhotoIndex + 1) % gallery.length); }}
            >›</button>
          )}
          <p>{activePhoto.label} · {safePhotoIndex + 1} из {gallery.length}</p>
        </div>
      )}
    </main>
  );
}
