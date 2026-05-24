# Обучающий контент (файлы, не БД)

Тексты подсказок, уроки, иллюстрации хранятся здесь — в репозитории, версионируются вместе с кодом.
В БД (этап 3) остаётся только прогресс: очки, уровень, пройденные уроки.

## Структура

```
learn/
  README.md
  spec-hints/          # Подсказки у характеристик (этап 1)
    common.json        # Общие для всех категорий
    smartphones.json   # Переопределения и доп. ключи для категории
    laptops.json
    headphones.json
  assets/              # SVG/PNG для подсказок и уроков (опционально)
  lessons/             # Этап 3: уроки по категориям (позже)
```

## Формат записи подсказки (`spec-hints/*.json`)

Ключ верхнего уровня — `specKey` (как в `ProductSpec.specKey` / `product.specs`).

```json
{
  "ram_size": {
    "title": "Оперативная память (ОЗУ)",
    "importance": "high",
    "what": "Кратко: что это за параметр.",
    "why": "На что влияет при использовании.",
    "howToRead": "Как интерпретировать число в спецификации.",
    "ranges": [
      { "label": "Минимум", "text": "4–6 ГБ — для лёгких задач." },
      { "label": "Комфорт", "text": "8–12 ГБ — для большинства сценариев." }
    ],
    "tips": ["Дополнительный совет."],
    "image": "assets/ram.svg",
    "relatedKeys": ["storage_capacity"]
  }
}
```

- `importance`: `high` | `medium` | `low` — для бейджа в UI.
- `image`: путь относительно папки `learn/` (отдаётся статикой `/learn/...`).
- При слиянии: `common.json` + `{category}.json` (категория перекрывает общие ключи).
- `label-map.json` — сопоставление русских подписей в БД (`Экран`, `Память`) со стандартными `specKey` (`screen_size`, `storage_capacity`).

## Файлы категорий (`spec-hints/{category}.json`)

Покрыты все slug из каталога: `smartphones`, `laptops`, `headphones`, `tv`, `monitors`, `tablets`, `cameras`, `smartwatches`, `ebooks`, `drones`, `cpus`, `graphics_cards`, `motherboards`, `ram`, `storage`, `drivers`, `external_drives`, `gaming`, `networking`, `keyboards`, `mouses`, `cases`, `power_units`, `microphones`, `webcams`, `power_banks`, `portable_speakers`, `fitness_trackers`, `wearables`, `smart_home`, `accessories`, `pc_components`, `audio`, `other`, плюс общий `common.json`.

## API

- `GET /api/learn/spec-hints/:category` — объединённые подсказки для категории.
- `GET /api/learn/product-lessons/:category` — слайды мини-лекции для карточки товара (этап 2).
- Статика: `GET /learn/assets/...` — картинки и прочие файлы.

## Мини-лекции на карточке товара (этап 2)

Папка `learn/product-lessons/`:

- `{category}.json` — слайды лекции для категории (5+ слайдов для топ-категорий).
- `_default.json` — универсальная лекция, если нет файла категории. Плейсхолдер `{categoryName}`.

Формат слайда:

```json
{
  "title": "Заголовок",
  "lead": "Краткий тезис",
  "paragraphs": ["Абзац 1", "Абзац 2"],
  "importance": [
    { "label": "ОЗУ", "specKeys": ["ram_size"], "level": "high", "weight": 90 }
  ],
  "highlightSpecs": ["ram_size", "cpu_model"],
  "image": "assets/lessons/smartphone-priorities.svg",
  "tips": ["Совет"]
}
```

Ползунок «Режим обучения» на `product.html` сохраняет состояние в `localStorage` (`techNozoneLearnMode`).
