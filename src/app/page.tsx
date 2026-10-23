 "use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, ShoppingBag, Heart, Menu, ArrowRight, ShieldCheck, Truck, Wrench, Phone, X, SlidersHorizontal } from "lucide-react";
import allProducts from "../data/products.json";
import panels from "../data/panels.json";

type Product = { id:string; name:string; collection:string; category:string; price:number; sourcePrice:number|null; sourceUrl:string; status:string; panelRequired:string; description:string; image:string|null; imageStatus?:string; sourceType?:string; sourcePriceStatus?:string; verificationNote?:string; manufacturerSpecs?:Record<string,string | undefined>; published?:boolean };
type Panel = { id:string; name:string; price:number; sourcePrice:number; compatibility:string };
const products = (allProducts as Product[]).slice().sort((a,b) => Number(Boolean(b.image)) - Number(Boolean(a.image)) || Number(Boolean(b.manufacturerSpecs && Object.keys(b.manufacturerSpecs).length)) - Number(Boolean(a.manufacturerSpecs && Object.keys(a.manufacturerSpecs).length)) || a.name.localeCompare(b.name, "ru"));
const panelData = panels as Panel[];
const collections = Array.from(new Set(products.map(p => p.collection).filter(Boolean))).sort((a,b)=>a.localeCompare(b, "ru"));
const featuredCollections = ["Трендо","Эволаб","Сильвер","Кармина","Кредор","Леолаб","Платинум"].filter(c=>collections.includes(c));
const collectionCaptions:Record<string,string> = {"Трендо":"Современный стиль","Эволаб":"Инновации и комфорт","Сильвер":"Классика надёжности","Кармина":"Элегантность в деталях","Кредор":"Премиальная защита","Леолаб":"Стиль и технологии","Платинум":"Премиум-коллекция"};
const fmt = (n:number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const cheapestPanel = panelData.slice().sort((a,b)=>a.sourcePrice-b.sourcePrice)[0];
const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL || "";
const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || "";

export default function Home() {
  const [query,setQuery] = useState("");
  const [collection,setCollection] = useState("Все коллекции");
  const [showPanels,setShowPanels] = useState(false);
  const [selectedPanel,setSelectedPanel] = useState(cheapestPanel?.id || "");
  const [cart,setCart] = useState<{product:Product; panel?:Panel}[]>([]);
  const [cartOpen,setCartOpen] = useState(false);
  const [active,setActive] = useState<Product|null>(null);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [favorites,setFavorites] = useState<string[]>([]);
  const filtered = useMemo(()=>products.filter(p=>{
    const q=query.toLowerCase().trim();
    return (!q || p.name.toLowerCase().includes(q) || p.collection.toLowerCase().includes(q)) &&
      (collection==="Все коллекции" || p.collection===collection);
  }),[query,collection]);
  const getPrice = (p:Product, panel?:Panel) => {
    if (p.panelRequired.toLowerCase().includes("да") && panel) return Math.ceil(((p.sourcePrice||0)+panel.sourcePrice)*1.25/100)*100;
    return p.price;
  };
  const addCart = (p:Product, panel?:Panel) => { setCart(c=>[...c,{product:p,panel}]); setActive(null); setCartOpen(true); };
  const cartTotal = cart.reduce((s,x)=>s+getPrice(x.product,x.panel),0);
  const chooseProduct = (p:Product) => { setActive(p); setSelectedPanel(cheapestPanel?.id || ""); };
  const activeNeedsPanel = active?.panelRequired.toLowerCase().includes("да") ?? false;
  const activePanel = panelData.find(p=>p.id===selectedPanel);
  return <main>
    <div className="topline"><div className="container toplineInner"><span>Подбор входных дверей «Лабиринт»</span><span>Ежедневно · консультации по телефону</span></div></div>
    <header className="header"><div className="container headerMain">
      <button className="mobileToggle iconButton" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Меню"><Menu/></button>
      <a className="brand" href="#"><Image src="/images/logo-dekor-prestizh.jpg" alt="ДекорПрестиж" width={270} height={67} priority /></a>
      <label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по моделям, коллекциям, отделкам..." /></label>
      <div className="headerContact"><Phone size={17}/><div><b>{storePhone || "Консультация по дверям"}</b><small>{storePhone ? "Позвоните для уточнения" : "Телефон указывается перед запуском"}</small></div></div>
      <button className="iconButton" aria-label="Избранное"><Heart/></button>
      <button className="iconButton cartButton" onClick={()=>setCartOpen(true)} aria-label="Корзина"><ShoppingBag/><span>{cart.length}</span></button>
    </div>
    <div className={`navWrap ${mobileMenu?"navOpen":""}`}><div className="container nav">
      <a className="catalogButton" href="#catalog"><Menu size={18}/> Каталог дверей</a>
      <a href="#collections">Коллекции</a><a href="#panels">Внутренние панели</a><a href="#advantages">О компании</a><a href="#delivery">Доставка и установка</a><a href="#contacts">Контакты</a>
    </div></div></header>
    <section className="hero">
      <div className="heroImage" role="img" aria-label="Современная входная дверь в интерьере"/>
      <div className="heroShade"/>
      <div className="container heroContent"><p className="eyebrow">ВХОДНЫЕ ДВЕРИ «ЛАБИРИНТ»</p><h1>Стиль. Безопасность.<br/>Надёжность.</h1>
        <p className="heroText">Подберите входную дверь, отделку и комплектацию для вашего дома. Поможем разобраться в моделях и вариантах панелей. Баннер — визуализация стиля магазина.</p>
        <div className="heroActions"><a className="button buttonLight" href="#catalog">Перейти в каталог <ArrowRight size={17}/></a><a className="button buttonOutline" href="#contacts">Получить консультацию</a></div>
        <div className="heroBenefits"><span><ShieldCheck/>Гарантия качества</span><span><Truck/>Доставка и установка</span><span><Wrench/>Профессиональный монтаж</span></div>
      </div>
      <div className="heroTag"><small>КОЛЛЕКЦИЯ</small><strong>Трендо</strong><span>Современный дизайн<br/>для вашего дома</span></div>
    </section>
    <section id="collections" className="container collectionSection"><div className="sectionHeading"><div><p className="eyebrow">НАЙДИТЕ СВОЙ СТИЛЬ</p><h2>Популярные коллекции</h2></div><a href="#catalog">Все модели <ArrowRight size={16}/></a></div>
      <div className="collectionGrid">{featuredCollections.map((c,i)=><button key={c} className={`collectionTile tile${i+1}`} onClick={()=>{setCollection(c);document.getElementById("catalog")?.scrollIntoView({behavior:"smooth"});}}><span>{c}</span><small>{collectionCaptions[c] || "Коллекция дверей"}</small></button>)}</div>
    </section>
    <section id="catalog" className="container catalogSection">
      <aside className="filterPanel"><div className="filterTitle"><SlidersHorizontal/><h3>Подбор двери</h3></div>
        <label>Коллекция<select value={collection} onChange={e=>setCollection(e.target.value)}><option>Все коллекции</option>{collections.map(c=><option key={c}>{c}</option>)}</select></label>
        <label>Поиск по каталогу<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Название модели"/></label>
        <button className="button buttonDark full" onClick={()=>{setCollection("Все коллекции");setQuery("");}}>Сбросить фильтры</button>
        <div className="filterNote"><ShieldCheck size={18}/><span>Цена и комплектация требуют подтверждения перед заказом.</span></div>
      </aside>
      <div className="catalogMain"><div className="sectionHeading"><div><p className="eyebrow">ПОДБОР ДЛЯ ВАШЕГО ДОМА</p><h2>Каталог дверей</h2><p className="muted">{filtered.length} позиций · фото и цены требуют проверки перед публикацией</p></div></div>
        <div className="productsGrid">{filtered.slice(0,60).map((p,i)=><article className="productCard" key={p.id}>
          <button className="favorite" onClick={()=>setFavorites(f=>f.includes(p.id)?f.filter(x=>x!==p.id):[...f,p.id])} aria-label="В избранное"><Heart size={18} fill={favorites.includes(p.id)?"currentColor":"none"}/></button>
          <button className={`productImage ${p.image ? "hasRealPhoto" : "photoPending"}`} onClick={()=>chooseProduct(p)} aria-label={`Открыть ${p.name}`}>{p.image ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 700px) 50vw, 25vw"/> : <span className="photoPlaceholder"><span className="placeholderMonogram">ДП</span><b>ФОТО МОДЕЛИ</b><small>уточняется по каталогу производителя</small></span>}</button>
          <div className="productInfo"><p className="productCollection">{p.collection || "КАТАЛОГ"}</p><button className="productName" onClick={()=>chooseProduct(p)}>{p.name}</button><p className="productSub">{p.image ? "Фото из карточки производителя" : (p.panelRequired.toLowerCase().includes("да")?"Базовая дверь · нужна панель":"Фото и комплектация уточняются")}</p><div className="productBottom"><strong>{p.panelRequired.toLowerCase().includes("да") && cheapestPanel ? `от ${fmt(getPrice(p,cheapestPanel))}` : `от ${fmt(p.price)}`}</strong><button className="addButton" onClick={()=>chooseProduct(p)} aria-label="Выбрать комплектацию"><ArrowRight size={18}/></button></div><a className="sourceLink" href={p.sourceUrl || "https://labirintdoors.ru/katalog"} target="_blank" rel="noreferrer">Источник производителя ↗</a></div>
        </article>)}</div>
        {filtered.length>60 && <p className="muted center">Показаны первые 60 вариантов из {filtered.length}. Используйте поиск и фильтры, чтобы сузить список.</p>}
        {filtered.length===0 && <div className="emptyState">Ничего не найдено. Попробуйте изменить запрос.</div>}
      </div>
    </section>
    <section id="panels" className="panelBand"><div className="container panelBandInner"><div><p className="eyebrow">ИНДИВИДУАЛЬНАЯ ОТДЕЛКА</p><h2>Подберите внутреннюю панель</h2><p>Цвет, текстура, зеркало или декоративная вставка — подскажем, какие варианты подходят к выбранной модели.</p></div><a className="button buttonDark" href="#catalog" onClick={()=>setShowPanels(true)}>Посмотреть панели <ArrowRight size={16}/></a></div>
      {showPanels&&<div className="container panelList"><button className="closeInline" onClick={()=>setShowPanels(false)}><X size={16}/> Скрыть панели</button><div className="panelGrid">{panelData.map(p=><div className="panelChip" key={p.id}><span>{p.name}</span><b>{fmt(p.price)}</b></div>)}</div></div>}
    </section>
    <section id="advantages" className="container advantages"><div className="sectionHeading"><div><p className="eyebrow">СЕРВИС ДЕКОРПРЕСТИЖ</p><h2>Помогаем на каждом этапе</h2></div></div><div className="advGrid"><div><ShieldCheck/><h3>Подбор комплектации</h3><p>Помогаем уточнить модель, размеры и совместимую панель.</p></div><div><Truck/><h3>Доставка</h3><p>Условия и сроки доставки согласовываются с менеджером.</p></div><div><Wrench/><h3>Установка</h3><p>Обсудим монтаж, подготовку проёма и дополнительные работы.</p></div></div></section>
    <section id="delivery" className="consultBand"><div className="container consultInner"><div><p className="eyebrow">НУЖНА ПОМОЩЬ?</p><h2>Подберём дверь под ваш интерьер и бюджет</h2><p>Оставьте заявку — менеджер уточнит размеры, отделку, наличие и стоимость.</p></div><a className="button buttonLight" href={storeEmail ? `mailto:${storeEmail}?subject=${encodeURIComponent("Консультация по дверям")}` : "#contacts"}>{storeEmail ? "Запросить консультацию" : "Настроить контакты"} <ArrowRight size={17}/></a></div></section>
    <footer id="contacts" className="footer"><div className="container footerGrid"><div><Image src="/images/logo-dekor-prestizh.jpg" alt="ДекорПрестиж" width={230} height={58}/><p>Входные двери и решения для вашего дома.</p><small>© ДекорПрестиж · демонстрационная версия</small></div><div><b>Каталог</b><a href="#catalog">Все двери</a><a href="#collections">Коллекции</a><a href="#panels">Панели</a></div><div><b>Покупателям</b><a href="#delivery">Доставка и установка</a><a href="#advantages">Гарантия и сервис</a><a href="#contacts">Контакты</a></div><div><b>Связаться с нами</b><p>{storePhone || "Телефон не настроен"}</p>{storeEmail ? <a href={`mailto:${storeEmail}`}>{storeEmail}</a> : <small>Email не настроен. Укажите NEXT_PUBLIC_STORE_EMAIL в .env.local</small>}</div></div></footer>
    {active&&<div className="modalBackdrop" onClick={()=>setActive(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modalClose" onClick={()=>setActive(null)}><X/></button><p className="eyebrow">{active.collection || "ВХОДНАЯ ДВЕРЬ"}</p><h2>{active.name}</h2><p className="muted">{active.description}</p><div className="priceBox"><span>{activeNeedsPanel ? "Розничная цена двери без панели" : "Цена варианта в каталоге-источнике"}</span><strong>{fmt(active.price)}</strong></div>
      {activeNeedsPanel&&<><label className="modalLabel">Внутренняя панель<select value={selectedPanel} onChange={e=>setSelectedPanel(e.target.value)}>{panelData.map(p=><option key={p.id} value={p.id}>{p.name} — {fmt(p.price)}</option>)}</select></label><div className="priceBox"><span>Предварительная цена дверь + панель с наценкой</span><strong>{activePanel?fmt(getPrice(active,activePanel)):"Уточнить"}</strong></div><p className="warning">Совместимость выбранной панели с этой моделью пока не подтверждена. Расчёт предварительный; менеджер подтвердит комплектацию и цену.</p></>}
      <div className="sourceDetails">{active.sourceUrl && <a href={active.sourceUrl} target="_blank" rel="noreferrer">Открыть карточку производителя ↗</a>}{active.imageStatus && <small>{active.imageStatus}</small>}{active.sourcePriceStatus && <small>{active.sourcePriceStatus}</small>}{active.verificationNote && <p className="warning">{active.verificationNote}</p>}{active.manufacturerSpecs && Object.keys(active.manufacturerSpecs).length>0 && <div className="specGrid">{Object.entries(active.manufacturerSpecs).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div>}</div><a className="button buttonDark full" href={storeEmail ? `mailto:${storeEmail}?subject=${encodeURIComponent("Запрос по двери: "+active.name)}&body=${encodeURIComponent("Прошу уточнить цену, наличие и совместимость панели для: "+active.name+(activePanel?"\nПанель: "+activePanel.name:""))}` : "#contacts"}>{storeEmail ? "Запросить точную цену" : "Настроить email для заявки"}</a><button className="button buttonLight full" onClick={()=>addCart(active,activeNeedsPanel?activePanel:undefined)}>Добавить в список заявки</button><small className="muted">Демо: заявки пока не сохраняются на сервере и отправляются через почтовый клиент.</small></div></div>}
    {cartOpen&&<div className="modalBackdrop" onClick={()=>setCartOpen(false)}><div className="cartDrawer" onClick={e=>e.stopPropagation()}><div className="drawerHead"><h2>Список заявки ({cart.length})</h2><button className="iconButton" onClick={()=>setCartOpen(false)}><X/></button></div>{cart.length===0?<p className="muted">Пока ничего не добавлено.</p>:<><div className="cartItems">{cart.map((x,i)=><div className="cartItem" key={x.product.id+i}><div><b>{x.product.name}</b><small>{x.panel?`Панель: ${x.panel.name}`:"Комплектацию уточнить"}</small></div><strong>{fmt(getPrice(x.product,x.panel))}</strong><button onClick={()=>setCart(c=>c.filter((_,j)=>i!==j))}>Удалить</button></div>)}</div><div className="cartTotal"><span>Предварительная сумма</span><strong>{fmt(cartTotal)}</strong></div><p className="warning">Цены и совместимость не подтверждены; это запрос, а не оформленный заказ.</p><a className="button buttonDark full" href={storeEmail ? `mailto:${storeEmail}?subject=${encodeURIComponent("Заявка на двери")}&body=${encodeURIComponent(cart.map(x=>x.product.name+(x.panel?" — панель: "+x.panel.name:"")+" — "+fmt(getPrice(x.product,x.panel))).join("\n")+"\nИтого предварительно: "+fmt(cartTotal))}` : "#contacts"}>{storeEmail ? "Отправить заявку по email" : "Настроить email для заявки"}</a></>}</div></div>}
  </main>;
}
