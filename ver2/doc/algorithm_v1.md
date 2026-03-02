# Алгоритм работы приложения (ver2)

## Обзор

Браузерное приложение для отображения семейного дерева. Данные хранятся в `tree.xlsx`.
Визуализация выполняется через Graphviz (библиотека viz.js). Код на JavaScript без стрелочных функций, комментарии на русском.

---

## Модули

| Файл | Назначение |
|------|-----------|
| `index.html` | Основная логика: загрузка Excel, генерация DOT-кода, рендеринг SVG, панели свойств |
| `foto.js` | Логика галерей фотографий (`foto_family/`, `foto_person/`, `foto_group/`) |
| `config.js` | Параметры конфигурации (цвета, размеры, пути к фото) |
| `styles.css` | Стили интерфейса |

---

## Листы Excel и поля кода

### Лист `person`

| Поле Excel | Используется в | Назначение |
|------------|---------------|------------|
| `idA` | `parseExcel`, `generateDotCode`, `showNodeProperties` | Уникальный идентификатор персоны (имя_файла.png) |
| `label_` | `parseExcel`, `generateDotCode` | Отображаемое имя в узле дерева |
| `sex` | `parseExcel`, `generateDotCode` | Пол (М/Ж): определяет цвет рамки узла |
| `surName2_` | `parseExcel`, `generateDotCode` | Второй вариант фамилии (девичья и т.п.) |
| `hasFather` | `parseExcel`, `generateDotCode` | idA отца (создаёт ребро в дереве) |
| `hasMother` | `parseExcel`, `generateDotCode` | idA матери (создаёт ребро в дереве) |
| `birth` | `parseExcel`, `generateDotCode` | Год рождения (краткий, для метки узла) |
| `birthFull_` | `parseExcel → extraFields` | Полная дата рождения (показывается в панели свойств) |
| `death` | `parseExcel`, `generateDotCode` | Год смерти (краткий, для метки узла) |
| `deathFull_` | `parseExcel → extraFields` | Полная дата смерти (показывается в панели свойств) |
| `hyperLink_` | `parseExcel → extraFields`, `showNodeProperties` | Ссылки (разделяются `;`), показываются как кликабельные |

Все поля с суффиксом `_` автоматически попадают в `extraFields` и отображаются в панели «Основные свойства person».

### Лист `family`

| Поле Excel | Используется в | Назначение |
|------------|---------------|------------|
| `idA` | `parseExcel`, `showFamilyProperties`, `openFamilyGallery` | Уникальный идентификатор семьи |
| `husband` | `parseExcel`, `generateDotCode` | idA мужа |
| `wife` | `parseExcel`, `generateDotCode` | idA жены |
| `marriage_` | `parseExcel`, `generateDotCode` | Дата свадьбы (метка кластера в дереве + extraFields) |
| `locationM_` | `parseExcel → extraFields` | Место свадьбы (отображается в панели свойств) |
| `label_` | `parseExcel → extraFields` | Произвольная метка семьи |
| `hyperLink_` | `parseExcel → extraFields`, `showFamilyProperties` | Ссылки |

Все поля с суффиксом `_` автоматически попадают в `extraFields` и отображаются в панели «Основные свойства family».

### Лист `foto_family`

| Поле Excel | Используется в | Назначение |
|------------|---------------|------------|
| `id_family` | `FOTO.showFamilyGallery` | idA семьи (связь с листом `family`) |
| `idA` | `FOTO.showFamilyGallery`, `FOTO._openThumbPhoto` | Имя файла фото (с расширением, например `...-1879.jpg`) |
| `title_` | `FOTO._openThumbPhoto` | Заголовок фото (показывается под миниатюрой и в полноэкранном окне) |
| `location_` | `FOTO._openThumbPhoto` | Место съёмки |
| `date_` | `FOTO._openThumbPhoto` | Дата съёмки |
| `person_label_` | `FOTO._openThumbPhoto` | Подпись людей на фото |
| `hyperLink_` | `FOTO._openThumbPhoto` | Ссылки |
| `suffix_` | хранится в `extraFields` | Порядковый суффикс фото |

### Лист `foto_group`

| Поле Excel | Используется в | Назначение |
|------------|---------------|------------|
| `id_personAll` | `FOTO.showGroupGallery` | Перечень idA персон через `;` (пробелы вокруг `;` допустимы). Фото попадает в галерею каждой из перечисленных персон. |
| `idA` | `FOTO.showGroupGallery`, `FOTO._openThumbPhoto` | Имя файла фото (с расширением, например `...-1918.jpg`) |
| `title_` | `FOTO._openThumbPhoto` | Заголовок фото (показывается под миниатюрой и в полноэкранном окне) |
| `location_` | `FOTO._openThumbPhoto` | Место съёмки |
| `date_` | `FOTO._openThumbPhoto` | Дата съёмки |
| `person_label_` | `FOTO._openThumbPhoto` | Подпись людей на фото |
| `hyperLink_` | `FOTO._openThumbPhoto` | Ссылки |
| `suffix_` | хранится в `extraFields` | Порядковый суффикс фото |

---

## Работа на GitHub Pages (HTTP/HTTPS) и локально (file://)

### Загрузка файла `tree.xlsx`
- **GitHub Pages (HTTP)**: `fetch('tree.xlsx')` — стандартный HTTP-запрос.
- **Локально (file://)**: `fetch()` заблокирован браузером. Используется `XMLHttpRequest` с `xhr.open('GET', 'tree.xlsx', false)` (синхронный) как запасной вариант.

### Проверка существования файлов фото (`pic/`, `foto_family/`)
- **GitHub Pages (HTTP)**: используется `fetch(filePath, { method: 'HEAD' })`.
- **Локально (file://)**: `fetch()` заблокирован. Используется `<img>` элемент — `img.onload` / `img.onerror`.

### Конфигурация `config.js` vs `config.json`
- `config.js` загружается через `<script src="config.js">` — работает на file:// без CORS.
- `config.json` (если используется) загружается через `fetch()` — только для HTTP.

### Файлы фотографий для дерева (`pic/`)
- Режим `picDirType = "relative"`: путь относительный (`pic/имя.png`), работает везде.
- Режим `picDirType = "global"`: абсолютный путь, используется для Graphviz рендеринга с полными путями.
- Режим `picDirType = "relativeGraphvizOnline"`: для локального рендеринга используется `pic/`, для GraphvizOnline — `picDirGraphvizOnline` (абсолютный URL GitHub Pages).

### Галереи `foto_family`, `foto_person`, `foto_group`
- Пути к фото всегда относительные: `foto_family/<idA>`, `foto_person/<idA>`, `foto_group/<idA>`.
- Проверка существования — через `<img>` (file://) или `fetch HEAD` (HTTP).
- Открытие полноэкранного фото — `window.open()` с HTML-документом.
- Все три режима (relative, relativeGraphvizOnline, global) работают корректно в desktop (file://) режиме.

---

## Алгоритм основного потока

1. **Загрузка конфига** (`loadConfig`) — читает `config.js` (глобальная переменная `window.CONFIG`), затем опционально `config.json`.
2. **Загрузка Excel** (`loadFromUrl` / `loadFromFile`) — `fetch` или `FileReader`.
3. **Парсинг Excel** (`parseExcel`):
   - Лист `person`: строит массив `people[]` с полями и `extraFields` (поля с `_`).
   - Лист `family`: строит массив `marriages[]` с полями и `extraFields`.
   - Лист `foto_family`: строит массив `fotoFamilyRows[]`.
   - Лист `foto_person`: строит массив `fotoPersonRows[]`.
   - Лист `foto_group`: строит массив `fotoGroupRows[]`.
4. **Проверка фото** (`preloadPhotoChecks`) — кешируются результаты в `photoExistsCache`.
5. **Генерация DOT-кода** (`generateDotCode`) — строит текст в формате Graphviz DOT.
6. **Рендеринг SVG** (`renderDot`) — вызывает viz.js, вставляет SVG в DOM.
7. **Обработчики кликов** (`addNodeClickHandlers`):
   - `g.node` → `showNodeProperties(person)` — панель «Основные свойства person».
   - `g.cluster` → `showFamilyProperties(family)` — панель «Основные свойства family».
8. **Клик по кнопке `foto_family`** → `openFamilyGallery(idA)` → `FOTO.showFamilyGallery(...)` — галерея миниатюр.
9. **Клик по кнопке `foto_person`** → `openPersonGallery(idA)` → `FOTO.showPersonGallery(...)` — галерея миниатюр.
10. **Клик по кнопке `foto_group`** → `openGroupGallery(idA)` → `FOTO.showGroupGallery(...)` — галерея групповых фото, отфильтрованных по `id_personAll`.
11. **Клик по миниатюре** → `FOTO._openThumbPhoto(...)` — полноэкранное фото в новом окне.

---

## Динамическое отображение полей (`_`-суффикс)

Поля, имя которых заканчивается на `_`, считаются «отображаемыми»:
- При парсинге Excel они автоматически помещаются в `extraFields` объекта.
- При построении панели свойств перебираются ключи `extraFields` и выводятся строки.
- Имя поля без суффикса `_` используется как метка строки.
- Добавление нового поля `_` в Excel не требует изменения кода.

---

## Добавление новых фотографий

### foto_family
1. Добавить строку в лист `foto_family` с заполненными полями `id_family`, `idA`, и `_`-полями.
2. Поместить файл фото в папку `foto_family/` с именем, соответствующим `idA`.
3. Всё остальное работает автоматически.

### foto_group
1. Добавить строку в лист `foto_group` с заполненным полем `id_personAll` (перечень idA через `;`), `idA`, и `_`-полями.
2. Поместить файл фото в папку `foto_group/` с именем, соответствующим `idA`.
3. Кнопка `foto_group` в панели «Основные свойства person» откроет галерею со всеми фото, в которых персона присутствует в `id_personAll`.
