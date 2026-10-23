import json, math, re, os, unicodedata
from pathlib import Path
root=Path('/mnt/data/_work_dekor')
products_path=root/'src/data/products.json'
panels_path=root/'src/data/panels.json'
products=json.load(open(products_path,encoding='utf-8'))
panels=json.load(open(panels_path,encoding='utf-8'))

def norm(s):
    s=unicodedata.normalize('NFKD',str(s or '')).lower().replace('ё','е')
    s=re.sub(r'^входная дверь\s*','',s)
    s=re.sub(r'[^а-яa-z0-9]+',' ',s)
    return re.sub(r'\s+',' ',s).strip()

def markup(p): return int(math.ceil(float(p)*1.25/100)*100)

collection_urls={
 'Трендо':'https://labirintdoors.ru/katalog/trendo',
 'Эволаб':'https://labirintdoors.ru/katalog/evolab',
 'Сильвер':'https://labirintdoors.ru/katalog/kollektsiya-silver',
 'Кармина':'https://labirintdoors.ru/katalog/vhodnye-dveri-v-kvartiru/karmina',
 'Кредор':'https://labirintdoors.ru/katalog/credor',
 'Леолаб':'https://labirintdoors.ru/katalog/leolab',
 'Платинум':'https://labirintdoors.ru/katalog/kollektsiya-platinum',
 'Пазл':'https://labirintdoors.ru/katalog/pazl',
 'Лофт':'https://labirintdoors.ru/katalog/loft',
 'Арт':'https://labirintdoors.ru/katalog/kollektsiya-art-grafit',
 'Лайн Вайт':'https://labirintdoors.ru/katalog/kollektsiya-line-white',
 'Скайлаб':'https://labirintdoors.ru/katalog/skylab',
 'Роял':'https://labirintdoors.ru/katalog/royal',
 'Пиано':'https://labirintdoors.ru/katalog/kollektsiya-piano',
 'Шторм':'https://labirintdoors.ru/katalog/storm',
 'Соналаб':'https://labirintdoors.ru/katalog/vhodnye-dveri-labirint-sonalab',
 'Гранд':'https://labirintdoors.ru/katalog/grand',
 'Бетон':'https://labirintdoors.ru/katalog/kollektsiya-beton',
 'Инфинити':'https://labirintdoors.ru/katalog/infinity',
 'Классик':'https://labirintdoors.ru/katalog/classic',
 'Лаб 3 Смарт':'https://labirintdoors.ru/vhodnye-dveri-s-elektronnym-zamkom',
 'Входные двери':'https://labirintdoors.ru/katalog',
}
# Normalize source records from existing source workbook and the earlier collection page pass.
for p in products:
    if p.get('collection') in ('nan','None','NULL'): p['collection']=''
    if p.get('sourceUrl') in ('nan','None','NULL'): p['sourceUrl']=''
    p['imageSourceUrl']=p.get('image') if p.get('image') else ''
    p['imageStatus']='Оригинальная фотография ещё не сопоставлена'
    p['lastChecked']='2026-10-23'
    p['sourceType']='Прайс Excel' if str(p.get('id','')).startswith('PRICE-') else 'Предварительная выгрузка каталога'
    if str(p.get('id','')).startswith('PRICE-'):
        p['status']='Прайс Excel от 28.08.2026; перед публикацией подтвердить актуальную цену и комплектацию'
        if 'под панель' in p.get('name','').lower():
            p['panelRequired']='Да'
    else:
        coll=p.get('collection','')
        p['sourceUrl']=p.get('sourceUrl') or collection_urls.get(coll,'https://labirintdoors.ru/katalog')
        p['sourceType']='Официальная страница коллекции производителя'
        p['status']='Название и цена из страницы коллекции производителя; проверить индивидуальную карточку перед публикацией'
        p['panelRequired']='Нет — вариант отделки указан в названии карточки'
    # price in project is the marked-up advertised/source price for ready-finished product or base door.
    if isinstance(p.get('sourcePrice'),(int,float)):
        p['price']=markup(p['sourcePrice'])

# Explicit, current source checks from the official home page / collection pages and current linked product pages.
# Fields record only what the public text actually states; product photos are added only where an exact manufacturer image is matched.
verified = [
    # collection, name, source price, collection/page URL, individual product page URL, image URL, spec dict, note
    ('Входные двери','Лаб 3 Смарт 10 — Белый рельеф софт',66700,'https://labirintdoors.ru/katalog','https://labirintdoors.ru/vhodnaya-dver-lab-3-smart-10-belyy-relief-soft','',{
        'Сталь':'1,5 мм','Толщина двери':'120 мм','Толщина полотна':'104 мм','Уплотнение':'3 контура (1 магнитный)',
        'Утепление':'Базальтовая плита в полотне и коробе','Основной замок':'Электронный Конан Z6MAX с Wi‑Fi',
        'Дополнительный замок':'Гардиан 82.01, 4-й класс','Размеры':'880×2050 и 960×2050 мм'
    },'Цена и характеристики подтверждены индивидуальной карточкой производителя.'),
    ('Скайлаб','Скайлаб с зеркалом Аркада — Веллюто ферро с патиной',53700,'https://labirintdoors.ru/katalog/skylab','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Лаб 1 Про','Лаб 1 Про 03 — Капучино',45300,'https://labirintdoors.ru/katalog','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Кармина','Кармина 29 — Капучино',44100,'https://labirintdoors.ru/katalog/vhodnye-dveri-v-kvartiru/karmina','https://labirintdoors.ru/vhodnaya-dver-karmina-29-kapuchino','',{
        'Сталь':'1,5 мм','Толщина двери':'120 мм','Толщина полотна':'104 мм','Уплотнение':'3 контура',
        'Утепление':'Базальтовая плита в полотне и коробе','Основной замок':'Кале 442, 4-й класс',
        'Дополнительный замок':'Кале 447L, 3-й класс','Размеры':'880×2050 и 960×2050 мм'
    },'Цена и характеристики подтверждены индивидуальной карточкой производителя.'),
    ('Соналаб','Соналаб с зеркалом Дольче — Белый софт',54500,'https://labirintdoors.ru/katalog/vhodnye-dveri-labirint-sonalab','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Иссида','Иссида 09 — Капучино',58700,'https://labirintdoors.ru/katalog','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Лаб 2 Про','Лаб 2 Про с зеркалом Максимум — Белый софт',47900,'https://labirintdoors.ru/katalog','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Эволаб','Эволаб с зеркалом Панорама с тонировкой — Черный кварц',54700,'https://labirintdoors.ru/katalog/evolab','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Пиано Смарт 2.0','Пиано Смарт 2.0 панель 31 — Белый софт',78100,'https://labirintdoors.ru/katalog/kollektsiya-piano','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Платинум','Платинум 33 — Белый софт',47700,'https://labirintdoors.ru/katalog/kollektsiya-platinum','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Роял','Роял 22 — Белый софт, черная вставка',50700,'https://labirintdoors.ru/katalog/royal','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Карбон','Карбон — стекло черное фацет ФЛС-570, Белый софт',40500,'https://labirintdoors.ru/katalog','', '', {},'Цена и название присутствуют на главной странице производителя; индивидуальную карточку нужно проверить.'),
    ('Трендо','Трендо 23 — Белый софт',45700,'https://labirintdoors.ru/katalog/trendo','https://labirintdoors.ru/vhodnaya-dver-trendo-23-white','https://labirintdoors.ru/images/006/078/310/6078310/990xnoinc/trendo-23-white.jpg',{
        'Сталь':'1,8 мм','Толщина двери':'125 мм','Толщина полотна':'115 мм','Уплотнение':'3 контура',
        'Утепление':'Базальтовая плита в полотне и коробе','Размеры':'880×2050 и 960×2050 мм'
    },'Фотография сопоставлена с индивидуальной карточкой производителя; характеристики базовой серии сверить перед публикацией.'),
    ('Эволаб','Эволаб 29 — Белый рельеф софт',50100,'https://labirintdoors.ru/katalog/evolab','https://labirintdoors.ru/vhodnaya-dver-evolab-29-belyy-relief-soft','https://labirintdoors.ru/images/010/365/068/10365068/990xnoinc/Labirint-evolab-29-white.jpg',{
        'Сталь':'1,8 мм','Толщина двери':'125 мм','Толщина полотна':'105 мм','Уплотнение':'3 контура (1 магнитный)',
        'Утепление':'Базальтовая плита и шумовибропоглощающий материал','Размеры':'880×2050 и 960×2050 мм'
    },'ВНИМАНИЕ: страница коллекции показывает 50 100 ₽, в выдаче индивидуальной карточки встречалась иная цена. Подтвердить актуальную цену перед публикацией.')
]
# Additional items taken from the public visible first page of the manufacturer's catalog and collection listings.
more = [
 ('Классик','Классик антик медный 05 — Венге светлый',34100,'https://labirintdoors.ru/katalog/classic'),
 ('Урбан','Урбан 13 — Белый софт',43700,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Урбан','Урбан 13 — Грей софт',43700,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Классик','Классик антик медный 13 — Белый софт',36100,'https://labirintdoors.ru/katalog/classic'),
 ('Урбан','Урбан 14 — Эковенге',42900,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Урбан','Урбан 14 — Дуб кантри белый горизонтальный',42900,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Классик','Классик антик медный 14 — Дуб кантри белый горизонтальный',35300,'https://labirintdoors.ru/katalog/classic'),
 ('Классик','Классик антик медный 14 — Эковенге',35300,'https://labirintdoors.ru/katalog/classic'),
 ('Урбан','Урбан 15 — Алмон 25',43700,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Урбан','Урбан 17 — Золотой дуб',43700,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Классик','Классик антик медный 15 — Алмон 25',36100,'https://labirintdoors.ru/katalog/classic'),
 ('Классик','Классик антик медный 17 — Золотой дуб',36100,'https://labirintdoors.ru/katalog/classic'),
 ('Нью-Йорк','Нью-Йорк с зеркалом 18 — Белое дерево',48300,'https://labirintdoors.ru/katalog'),
 ('Арт','Арт с зеркалом 18 — Белое дерево',43700,'https://labirintdoors.ru/katalog/kollektsiya-art-grafit'),
 ('Сильвер','Сильвер с зеркалом 18 — Белое дерево',43900,'https://labirintdoors.ru/katalog/kollektsiya-silver'),
 ('Урбан','Урбан с зеркалом 18 — Белое дерево',45300,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Термомагнит','Термомагнит с зеркалом 18 — Белое дерево',46700,'https://labirintdoors.ru/katalog/termo-magnit'),
 ('Классик','Классик антик медный с зеркалом 18 — Белое дерево',37700,'https://labirintdoors.ru/katalog/classic'),
 ('Классик','Классик шагрень черная с зеркалом 18 — Белое дерево',37700,'https://labirintdoors.ru/katalog/classic'),
 ('Арт','Арт с зеркалом 19 — Грей софт',43700,'https://labirintdoors.ru/katalog/kollektsiya-art-grafit'),
 ('Урбан','Урбан с зеркалом 19 — Грей софт',45300,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Урбан','Урбан с зеркалом 19 — Белый софт',45300,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Сильвер','Сильвер с зеркалом 19 — Грей софт',43900,'https://labirintdoors.ru/katalog/kollektsiya-silver'),
 ('Сильвер','Сильвер с зеркалом 19 — Белый софт',43900,'https://labirintdoors.ru/katalog/kollektsiya-silver'),
 ('Урбан','Урбан 21 — Бетон светлый',43700,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Бетон','Бетон 21 — Бетон светлый',45700,'https://labirintdoors.ru/katalog/kollektsiya-beton'),
 ('Бетон','Бетон 22 — Белый софт, черная вставка',46300,'https://labirintdoors.ru/katalog/kollektsiya-beton'),
 ('Бетон','Бетон 22 — Графит софт, черная вставка',46300,'https://labirintdoors.ru/katalog/kollektsiya-beton'),
 ('Сильвер','Сильвер 22 — Графит софт, черная вставка',42900,'https://labirintdoors.ru/katalog/kollektsiya-silver'),
 ('Сильвер','Сильвер 22 — Белый софт, черная вставка',42900,'https://labirintdoors.ru/katalog/kollektsiya-silver'),
 ('Урбан','Урбан 22 — Графит софт, черная вставка',44300,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Урбан','Урбан 22 — Белый софт, черная вставка',44300,'https://labirintdoors.ru/katalog/kollektsiya-urban'),
 ('Арт','Арт 22 — Белый софт, черная вставка',42700,'https://labirintdoors.ru/katalog/kollektsiya-art-grafit'),
 ('Арт','Арт 22 — Графит софт, черная вставка',42700,'https://labirintdoors.ru/katalog/kollektsiya-art-grafit'),
 ('Арт','Арт 13 — Графит софт',42100,'https://labirintdoors.ru/katalog/kollektsiya-art-grafit'),
 ('Термомагнит','Термомагнит 23 — Белый софт',45100,'https://labirintdoors.ru/katalog/termo-magnit'),
 ('Термомагнит','Термомагнит 23 — Ванилла веллюто',45100,'https://labirintdoors.ru/katalog/termo-magnit'),
 ('Сильвер','Сильвер 23 — Белый софт',42300,'https://labirintdoors.ru/katalog/kollektsiya-silver'),
 ('Лайн Вайт','Лайн Вайт с зеркалом 18 — Белое дерево',43300,'https://labirintdoors.ru/katalog/kollektsiya-line-white'),
 ('Лайн Вайт','Лайн Вайт 06 — Сандал белый',40900,'https://labirintdoors.ru/katalog/kollektsiya-line-white'),
 ('Лайн Вайт','Лайн Вайт с зеркалом 19 — Грей софт',43300,'https://labirintdoors.ru/katalog/kollektsiya-line-white'),
 ('Лайн Вайт','Лайн Вайт с зеркалом 19 — Белый софт',43300,'https://labirintdoors.ru/katalog/kollektsiya-line-white'),
 ('Лайн Вайт','Лайн Вайт с зеркалом 18 — Бетон светлый',43300,'https://labirintdoors.ru/katalog/kollektsiya-line-white'),
 ('Лофт','Лофт 24 — Белый софт',36700,'https://labirintdoors.ru/katalog/loft'),
 ('Лофт','Лофт 24 — Бетон светлый',36700,'https://labirintdoors.ru/katalog/loft'),
 ('Лофт','Лофт 24 — Графит софт',36700,'https://labirintdoors.ru/katalog/loft'),
 ('Лофт','Лофт 21 — Белый софт',36700,'https://labirintdoors.ru/katalog/loft'),
 ('Лофт','Лофт 21 — Бетон светлый',36700,'https://labirintdoors.ru/katalog/loft'),
 ('Лофт','Лофт 21 — Грей софт',36700,'https://labirintdoors.ru/katalog/loft'),
 ('Пазл','Пазл 29 — Черный кварц',38700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 29 — Дуб кантри темный',38700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 29 — Белый рельеф софт',38700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 29 — Серый рельеф софт',38700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом 32 тонированным — Белый рельеф софт',41100,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом 32 тонированным — Серый рельеф софт',41100,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 31 — Белый софт, зеркальная вставка с тонировкой',39700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 31 — Черный кварц, зеркальная вставка с тонировкой',39700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 22 — Белый софт, черный молдинг',39300,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 22 — Графит софт, черный молдинг',39300,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом Максимум — Белый софт',41300,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом тонированным Максимум — Черный кварц',42300,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом Панорама — Белый софт',43300,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом Панорама с тонировкой — Черный кварц',43300,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом Аркада — Веллюто ферро с патиной',42300,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом Дольче — Капучино',41100,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл с зеркалом Дольче — Белый софт',41100,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 03 — Белый софт',38700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 03 — Капучино',38700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 03 — Сандал белый',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 03 — Орех бренди',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 03 — Орех премиум',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 04 — Беленый дуб',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 04 — Венге',37100,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 05 — Венге светлый',36700,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 06 — Сандал белый',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 06 — Белое дерево',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 06 — Сандал серый',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пазл','Пазл 07 — Белое дерево',37900,'https://labirintdoors.ru/katalog/pazl'),
 ('Пиано','Пиано с тонированным зеркалом Максимум — Черный кварц',51900,'https://labirintdoors.ru/katalog/kollektsiya-piano'),
 ('Пиано','Пиано с зеркалом Фацет — Белый софт',52900,'https://labirintdoors.ru/katalog/kollektsiya-piano'),
 ('Пиано','Пиано 28 — Грунт под покраску',51700,'https://labirintdoors.ru/katalog/kollektsiya-piano'),
 ('Шторм','Шторм 29 — Белый рельеф софт',48700,'https://labirintdoors.ru/katalog/storm'),
 ('Шторм','Шторм 29 — Серый рельеф софт',48700,'https://labirintdoors.ru/katalog/storm'),
 ('Гранд','Гранд с зеркалом Панорама — Белый софт',53900,'https://labirintdoors.ru/katalog/grand'),
 ('Гранд','Гранд с зеркалом Панорама с тонировкой — Черный кварц',53900,'https://labirintdoors.ru/katalog/grand'),
 ('Бетон','Бетон 21 — Бетон светлый',45700,'https://labirintdoors.ru/katalog/kollektsiya-beton'),
 ('Бетон','Бетон 22 — Белый софт, черная вставка',46300,'https://labirintdoors.ru/katalog/kollektsiya-beton'),
]
# No guessed product photograph: source image is assigned only for two exact matches shown in the manufacturer's product image results.
existing_keys=set((norm(p.get('name')),norm(p.get('collection'))) for p in products)
by_key={norm(p.get('name')):p for p in products}
next_id=1
for x in verified:
    coll,name,price,collection_url,detail_url,image,specs,note=x
    key=norm(name)
    p=by_key.get(key)
    if not p:
        p={
            'id':f'LIVE-{len(products)+1:04d}','name':name,'collection':coll,'category':f'Входные двери > {coll}',
            'price':markup(price),'sourcePrice':price,'sourceUrl':detail_url or collection_url,
            'status':'Проверено по официальной странице производителя 23.10.2026; перед публикацией перепроверить цену',
            'panelRequired':'Нет — опубликованный вариант уже включает внутреннюю отделку','description':name,
            'image':image or None
        }
        products.append(p); by_key[key]=p
    p['collection']=coll
    p['category']=f'Входные двери > {coll}'
    p['sourcePrice']=price
    p['price']=markup(price)
    p['sourceUrl']=detail_url or collection_url
    p['collectionUrl']=collection_url
    p['sourceType']='Официальная карточка/страница производителя'
    p['lastChecked']='2026-10-23'
    p['sourcePriceStatus']='Проверить цену перед публикацией'
    p['status']='Проверено по официальной странице производителя; перед публикацией перепроверить цену'
    p['panelRequired']='Нет — опубликованный вариант уже включает внутреннюю отделку'
    p['manufacturerSpecs']=specs
    p['verificationNote']=note
    if image:
        p['image']=image
        p['imageSourceUrl']=image
        p['imageStatus']='Сопоставлена с конкретной моделью на официальном домене производителя; право коммерческого использования проверить'
    else:
        p['image']=p.get('image') if p.get('image') and str(p.get('image')).startswith('http') else None
        p['imageStatus']='Нужна фотография конкретного варианта; пока оставлено пустым во избежание подмены похожей дверью'

for coll,name,price,url in more:
    key=norm(name)
    if key in by_key:
        # Ensure the existing row points to the actual collection page if it was only an older draft.
        p=by_key[key]
        # Where the official main catalog exposes a variant directly, update/mark the row as source-confirmed.
        p['collection']=coll
        p['category']=f'Входные двери > {coll}'
        p['sourceUrl']=url
        p['sourceType']='Официальная страница каталога производителя'
        p['lastChecked']='2026-10-23'
        p['status']='Название и цена сверены с доступным текстом официального каталога 23.10.2026; перед публикацией проверить индивидуальную карточку'
        p['sourcePriceStatus']='Цена есть в списке коллекции; индивидуальная карточка может отличаться'
        p['panelRequired']='Нет — вариант отделки указан в названии карточки'
        # Keep source price as specified for these exact public current listing prices.
        p['sourcePrice']=price
        p['price']=markup(price)
        p['imageStatus']='Нужна фотография конкретного варианта; пока оставлено пустым во избежание подмены похожей дверью'
        p['image']=None if not p.get('imageSourceUrl') else p.get('image')
    else:
        p={
            'id':f'LIVE-{len(products)+1:04d}','name':name,'collection':coll,'category':f'Входные двери > {coll}',
            'price':markup(price),'sourcePrice':price,'sourceUrl':url,
            'status':'Название и цена сверены с доступным текстом официального каталога 23.10.2026; перед публикацией проверить индивидуальную карточку',
            'panelRequired':'Нет — вариант отделки указан в названии карточки','description':f'{name}. Вариант из официальной страницы каталога. Перед заказом проверить актуальную цену, характеристики и доступность.',
            'image':None,'imageSourceUrl':'','imageStatus':'Нужна фотография конкретного варианта; пока оставлено пустым во избежание подмены похожей дверью',
            'lastChecked':'2026-10-23','sourceType':'Официальная страница каталога производителя',
            'sourcePriceStatus':'Цена есть в списке коллекции; индивидуальная карточка может отличаться'
        }
        products.append(p); by_key[key]=p

# Add deep links and metadata for specific individual cards whose product pages are known.
exact_details = {
 norm('Лаб 3 Смарт 10 — Белый рельеф софт'):('https://labirintdoors.ru/vhodnaya-dver-lab-3-smart-10-belyy-relief-soft',{
  'Сталь':'1,5 мм','Толщина двери':'120 мм','Толщина полотна':'104 мм','Уплотнение':'3 контура (1 магнитный)',
  'Утепление':'Базальтовая плита в полотне и коробе','Основной замок':'Электронный Конан Z6MAX с Wi‑Fi',
  'Дополнительный замок':'Гардиан 82.01, 4-й класс','Размеры':'880×2050 и 960×2050 мм'}),
 norm('Кармина 29 — Капучино'):('https://labirintdoors.ru/vhodnaya-dver-karmina-29-kapuchino',{
  'Сталь':'1,5 мм','Толщина двери':'120 мм','Толщина полотна':'104 мм','Уплотнение':'3 контура',
  'Утепление':'Базальтовая плита в полотне и коробе','Основной замок':'Кале 442, 4-й класс',
  'Дополнительный замок':'Кале 447L, 3-й класс','Размеры':'880×2050 и 960×2050 мм'}),
 norm('Трендо 23 — Белый софт'):('https://labirintdoors.ru/vhodnaya-dver-trendo-23-white',{
  'Сталь':'1,8 мм','Толщина двери':'125 мм','Толщина полотна':'115 мм','Уплотнение':'3 контура',
  'Утепление':'Базальтовая плита в полотне и коробе','Размеры':'880×2050 и 960×2050 мм'}),
 norm('Эволаб 29 — Белый рельеф софт'):('https://labirintdoors.ru/vhodnaya-dver-evolab-29-belyy-relief-soft',{
  'Сталь':'1,8 мм','Толщина двери':'125 мм','Толщина полотна':'105 мм','Уплотнение':'3 контура (1 магнитный)',
  'Утепление':'Базальтовая плита и шумовибропоглощающий материал','Размеры':'880×2050 и 960×2050 мм'}),
 norm('Эволаб 29 — Капучино'):('https://labirintdoors.ru/vhodnaya-dver-evolab-29-kapuchino',{}),
 norm('Кармина 09 — Капучино'):('https://labirintdoors.ru/vhodnaya-dver-karmina-09-kapuchino',{}),
 norm('Соналаб 29 — Капучино'):('https://labirintdoors.ru/vhodnaya-dver-sonalab-29-kapuchino',{}),
 norm('Роял 10 — Белый рельеф софт'):('https://labirintdoors.ru/vhodnaya-dver-royal-10-belyy-relief-soft',{}),
 norm('Лаб 1 Про 10 — Белый рельеф софт'):('https://labirintdoors.ru/vhodnaya-dver-lab-1-pro-10-belyy-relief-soft',{}),
 norm('Пиано Смарт 2.0 панель 29 — Капучино'):('https://labirintdoors.ru/vhodnaya-dver-piano-smart-2-0-panel-29-kapuchino',{}),
 norm('Термолаб 3 графит 29 — Капучино'):('https://labirintdoors.ru/vhodnaya-dver-termolab-3-grafit-29-kapuchino',{}),
}
for p in products:
    info=exact_details.get(norm(p.get('name')))
    if info:
        p['sourceUrl']=info[0]
        p['manufacturerSpecs']=info[1]
        p['status']='Индивидуальная карточка производителя найдена; проверить дату цены и разрешение на фото перед публикацией'
        p['sourceType']='Официальная индивидуальная карточка производителя'
        if norm(p['name'])=='эволаб 29 белый рельеф софт':
            p['verificationNote']='На странице коллекции найдено 50 100 ₽, а в поисковом фрагменте индивидуальной карточки встречалась иная цена. Не публиковать до повторной проверки.'
            p['sourcePriceStatus']='Есть расхождение между страницей коллекции и индивидуальной карточкой'

# Set photo image only on exact matches; do not leave old concept photos attached to product data.
for p in products:
    image = p.get('image')
    if not (isinstance(image,str) and image.startswith('https://labirintdoors.ru/images/')):
        p['image']=None
        p['imageSourceUrl']=''
        p['imageStatus']='Фото конкретного варианта не загружено; не подменять случайным изображением'
    p.setdefault('sourcePriceStatus','Цена из исходного источника; проверить актуальность перед публикацией')
    p.setdefault('manufacturerSpecs',{})
    p.setdefault('verificationNote','')
    # ensure project never publishes records in this phase
    p['published']=False

# de-duplicate exact variant records preserving the product-list/price-list records where meaningful.
# Only remove duplicates introduced by the added listing set (same normalized name across live+site rows).
seen={}; dedup=[]
for p in products:
    k=norm(p.get('name'))
    if k in seen:
        old=seen[k]
        # prefer the row with an individual URL, exact image, or official current listing source.
        score=lambda x: (int(bool(x.get('image')))*3+int('индивидуальная' in x.get('sourceType','').lower())*2+int(bool(x.get('sourceUrl')))+int(str(x.get('id','')).startswith('LIVE-')))
        if score(p)>score(old):
            dedup[dedup.index(old)]=p; seen[k]=p
    else:
        seen[k]=p;dedup.append(p)
products=dedup
# If an item is the new official photo-matched option, ensure the displayed source price is from its official page.
for p in products:
    if norm(p['name']) == norm('Трендо 23 — Белый софт'):
        p['image']='https://labirintdoors.ru/images/006/078/310/6078310/990xnoinc/trendo-23-white.jpg'
        p['imageSourceUrl']=p['image']
        p['imageStatus']='Оригинальная фотография конкретной модели с официального домена; коммерческое использование проверить'
        p['sourcePrice']=45700; p['price']=markup(45700); p['sourceUrl']='https://labirintdoors.ru/vhodnaya-dver-trendo-23-white'
    if norm(p['name']) == norm('Эволаб 29 — Белый рельеф софт'):
        p['image']='https://labirintdoors.ru/images/010/365/068/10365068/990xnoinc/Labirint-evolab-29-white.jpg'
        p['imageSourceUrl']=p['image']
        p['imageStatus']='Оригинальная фотография конкретной модели с официального домена; коммерческое использование проверить'

json.dump(products,open(products_path,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('products total:',len(products))
print('collections:',sorted(set(p.get('collection','') for p in products if p.get('collection'))))
print('image count:',sum(bool(p.get('image')) for p in products))
print('items by sourceType:')
from collections import Counter
print(Counter(p.get('sourceType') for p in products))
