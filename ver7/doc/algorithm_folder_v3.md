# Алгоритм работы с папками и кнопками панели инструментов (algorithm_folder_v3)

В этом документе объясняется:
1. **Почему для папки `pic/` не нужен `list.md`**, а для папок `album/`, `md_person/`, `md_location/` — нужен.
2. **Алгоритм `showAlbumGallery()`** — как отображаются Альбомы.
3. **Специфика обработки файлов по типам папок** (pic, foto_*, album, md_person, md_location).
4. **Алгоритм кнопок** «Загрузить tree.xlsx», «Выбрать файл», «Открыть файл», «Открыть Род» в режимах GitHub Pages и desktop (file://).
5. **Зачем нужна кнопка «Загрузить tree.xlsx»**.

---

## 1. Папки и их типы

В проекте используются папки нескольких типов, каждая из которых обрабатывается по-своему:

| Папка | Тип | Источник списка файлов | list.md нужен? |
|-------|-----|------------------------|---------------|
| `pic/` | Портреты персон | Excel (поле `idA` листа `person`) | ❌ |
| `foto_person/`, `foto_family/` и т.д. | Фотоархивы | Excel (листы `foto_*`) | ❌ |
| `album/` | Галерея альбомов | `list.md` / GitHub API | ✅ |
| `md_person/` | Markdown-карточки персон | `list.md` / GitHub API | ✅ |
| `md_location/` | Markdown-карточки мест | `list.md` / GitHub API | ✅ |

---

## 2. Папка `pic/` — портреты персон

### Что хранится в `pic/`

Папка `pic/` содержит портреты персон в формате `<idA>.png`, где `idA` — идентификатор персоны из Excel-листа `person`.

```
pic/dafaultm.png          ← заглушка для мужчин
pic/dafaultf.png          ← заглушка для женщин
pic/Обозов_Михаил_Никититич.png
pic/Кононов_Николай_Спиридонович.png
```

### Почему `list.md` НЕ нужен для `pic/`

Список файлов `pic/` **заранее известен**: он вычисляется из данных Excel (лист `person`, поле `idA`).

```
parseExcel(arrayBuffer)
  └─► из листа "person" для каждой записи:
        personObj.idA = row[colIdx.idA]  ← например "Обозов_Михаил_Никититич"

preloadPhotoChecks(peopleList)
  └─► для каждой персоны проверяет наличие файла "<idA>.png":
        checkPhotoExists("Обозов_Михаил_Никититич.png")
          ├─► file:// → создаёт <img> и слушает onload/onerror
          └─► http(s)  → fetch("<picDir>/<файл>", { method: 'HEAD' })
        результат сохраняется в: photoExistsCache["Обозов_Михаил_Никититич.png"] = true/false
```

Итого: **`pic/` не требует `list.md`**, потому что:
- имена файлов однозначно выводятся из `idA` персон Excel-листа,
- наличие каждого файла проверяется через `HEAD`-запрос или `<img>` при загрузке данных.

### `pic/` в ZIP-архиве

При создании ZIP-архива (кнопка «Zip») список файлов `pic/` берётся из `photoExistsCache` или DOM (`#photosGrid .photo-item img`).

---

## 3. Папки `foto_person`, `foto_family` и т.д. — фотоархивы

### Что хранится в `foto_*`

Папки `foto_person`, `foto_family`, `foto_group`, `foto_location`, `foto_item`, `foto_event` хранят произвольные фотографии, организованные по суффиксам.

### Почему `list.md` НЕ нужен для `foto_*`

Имена файлов вычисляются из строк Excel-листов с теми же именами:

```
parseExcel(arrayBuffer)
  └─► для каждого листа foto_* читаются строки:
        fotoPersonRows   ← лист "foto_person"
        fotoFamilyRows   ← лист "foto_family"
        fotoGroupRows    ← лист "foto_group"
        fotoLocationRows ← лист "foto_location"
        fotoItemRows     ← лист "foto_item"
        fotoEventRows    ← лист "foto_event"
```

Имя файла вычисляется функцией `computeIdA(row)`:

```javascript
// phototree.js
function computeIdA(row, idField, suffixField) {
    if (row.idA && !row.idA.toString().startsWith('=')) {
        return row.idA.toString().trim();      // поле idA заполнено
    }
    const idVal  = row[idField]     || '';     // id_person / id_family / id_loc
    const suffix = row[suffixField] || row['suffix'] || row['suffix_'] || '';
    const ext    = row['extension'] || 'jpg';
    return `${idVal}-${suffix}.${ext}`;        // вычисляем
}
```

### `foto_*` в ZIP-архиве

Список файлов для ZIP берётся из `window.SAVE_DATA` (данные Excel-листов `foto_*`).

---

## 4. Папки `album/`, `md_person/`, `md_location/` — произвольное содержимое

### Что хранится в этих папках

```
album/Кононов-Обозов.JPG
album/album1.md
album/Test1.pdf
album/Test1.docx
album/list.md     ← индексный файл со списком содержимого

md_person/Кононов_Андрей_Николаевич.md
md_person/list.md ← индексный файл

md_location/Луки-Елпатьево.md
md_location/list.md ← индексный файл
```

### Почему `list.md` НУЖЕН для этих папок

В отличие от `pic/` и `foto_*`, содержимое этих папок **не связано с Excel-листами**: имена файлов произвольны и не известны заранее.

Браузер **не может читать список файлов в папке** ни через `file://`, ни через `http://`. Поэтому нужен явный индекс — файл `list.md`, где каждая строка — имя файла в папке.

### Формат `list.md`

```
Кононовы-Обозовы.JPG
album1.md
Test1.pdf
Test1.docx
```

Каждая непустая строка (не начинающаяся с `#`) — имя файла в этой же папке.

### Алгоритм `showAlbumGallery()` — два источника файлов

```
showAlbumGallery()
  │
  ├─► Шаг 1: fetch("album/list.md")
  │     ├─► Успешно → разбить по строкам → fileNames[]
  │     └─► Ошибка или пустой список → перейти к Шагу 2
  │
  └─► Шаг 2: GitHub API (только если protocol !== 'file:')
        URL: https://api.github.com/repos/<owner>/<repo>/contents/<path>/album?ref=main
        ├─► Успешно → из JSON-ответа взять имена файлов (type==="file", исключить list.md)
        └─► Ошибка → показать "Файлы не найдены в папке album/"
```

### Когда каждый источник работает

| Среда | `list.md` | GitHub API |
|-------|-----------|------------|
| `file://` (desktop) | ✅ Работает | ❌ Недоступно |
| HTTP-сервер (не GitHub) | ✅ Работает | ❌ Не применимо |
| GitHub Pages | ✅ Работает (приоритет) | ✅ Запасной вариант |

### Почему ZIP из GitHub Pages должен содержать `list.md`

При скачивании ZIP с GitHub Pages кнопкой «Zip» код использует GitHub API для получения списка файлов в `album/`, `md_person/`, `md_location/`. Если `list.md` **не включить** в ZIP, то при открытии на desktop (`file://`):

1. `fetch('album/list.md')` → файл не найден в ZIP → ошибка
2. GitHub API → недоступен на `file://` → ошибка
3. Результат: **«Файлы не найдены в папке album/»**

**Исправление:** при создании ZIP через GitHub API дополнительно загружается и включается `list.md` для каждой такой папки. Это гарантирует работу кнопки «Открыть файл \ Альбомы» в desktop-режиме.

---

## 5. Алгоритмы кнопок панели инструментов

### 5.1 Кнопка «📂 Загрузить tree.xlsx»

**Назначение:** автоматически загрузить файл `tree.xlsx` из той же папки, что и `index.html`.

**Алгоритм:**

```
Клик → loadFromUrl('tree.xlsx')
  │
  ├─► GitHub Pages: fetch('tree.xlsx')
  │     URL: https://<owner>.github.io/<repo>/<path>/tree.xlsx
  │     ✅ Работает — браузер скачивает файл с сервера
  │
  └─► Desktop (file://): fetch('tree.xlsx')
        ✅ Работает — браузер читает файл из той же папки
        ⚠️ Требует наличия tree.xlsx рядом с index.html

После загрузки:
  loadSheetJS() → parseExcel(arrayBuffer) → buildDiagram() → renderSvg()
```

**Зачем нужна эта кнопка** (см. раздел 5.5).

**Режим GitHub Pages:**
- При загрузке страницы `configPromise.then(...)` автоматически вызывает `loadFromUrl('tree.xlsx')`.
- Кнопка позволяет перезагрузить файл вручную (например, после обновления данных).

**Режим Desktop:**
- Автозагрузка работает только если `tree.xlsx` находится **в той же папке** что и `index.html`.
- Если файл не найден — появится сообщение об ошибке, и нужно использовать «Выбрать файл».

---

### 5.2 Кнопка «📁 Выбрать файл»

**Назначение:** открыть диалог выбора файла и загрузить произвольный `.xlsx` / `.xls` файл.

**Алгоритм:**

```
Клик → fileInput.click()  (скрытый <input type="file" accept=".xlsx,.xls">)
  │
  └─► Пользователь выбирает файл
        fileInput.change → loadFromFile(file)
          │
          ├─► FileReader.readAsArrayBuffer(file)
          └─► reader.onload → parseExcel(arrayBuffer) → buildDiagram() → renderSvg()
```

**Особенности:**
- Работает в обоих режимах (GitHub Pages и Desktop).
- Файл считывается локально через `FileReader` — без сетевых запросов.
- Позволяет загрузить любой Excel-файл семейного дерева, не только `tree.xlsx`.

---

### 5.3 Кнопка «📂 Открыть файл ▾»

**Назначение:** выпадающее меню для открытия вспомогательных разделов:
- 🖼️ **Лица персон (pic)** — галерея портретов из папки `pic/`
- 📷 **Альбомы (album)** — галерея файлов из папки `album/`

#### Подпункт «Лица персон (pic)»

```
Клик → openFileMenuSelect('pic') → togglePersonPhotos()
  │
  └─► Открывает панель «Фото персон»
        Источник: photoExistsCache (заполняется при загрузке Excel)
        Режим GitHub Pages: HEAD-запросы для проверки существования файлов
        Режим Desktop: <img>.onload / onerror для проверки существования
```

#### Подпункт «Альбомы (album)»

```
Клик → openFileMenuSelect('album') → showAlbumGallery()
  │
  ├─► Шаг 1: fetch('album/list.md')
  │     ├─► Успех → список файлов из list.md
  │     └─► Ошибка → Шаг 2
  │
  └─► Шаг 2: GitHub API (только если protocol !== 'file:')
        ├─► Успех → список файлов из API (без list.md)
        └─► Ошибка → «Файлы не найдены в папке album/»

Отображение галереи:
  для каждого файла из списка:
    ├─► изображение (.jpg, .png и т.д.) → <img src="album/имя">
    ├─► PDF → иконка 📄 + ссылка
    ├─► Word → иконка 📝 + ссылка
    ├─► Excel → иконка 📊 + ссылка
    └─► Markdown → иконка 📋 + ссылка
```

**Режим GitHub Pages:**
- `list.md` читается в приоритете.
- Если `list.md` пуст или недоступен — GitHub API как запасной вариант.

**Режим Desktop (file://):**
- Работает **только через `list.md`** (GitHub API недоступен).
- `list.md` должен присутствовать в папке `album/`.
- В ZIP-архиве (созданном кнопкой «Zip») `list.md` **включается явно** для обеспечения работы на Desktop.

---

### 5.4 Кнопка «🌿 Открыть Род ▾»

**Назначение:** выпадающее меню для фильтрации дерева по заранее определённым «Родам» (ветвям семьи).

**Алгоритм:**

```
Загрузка Excel → parseExcel()
  └─► читает лист "preSet":
        каждая строка: { preSet: "ключ", description: "Название ветви" }
        → preSetList[]

Заполнение меню:
  rodMenu.innerHTML = '<Все ветви>' + preSetList.map(ps => <пункт меню>)

Клик на пункт → selectPreSet(preSetKey)
  │
  ├─► preSetKey === null → показать всех персон (filteredPeople = people)
  │
  └─► preSetKey задан → фильтровать:
        filteredPeople = people.filter(p => p.preSet && p.preSet.includes(preSetKey))
        buildDiagram(filteredPeople) → renderSvg()
```

**Режим GitHub Pages:**
- Работает полностью — меню заполняется при загрузке `tree.xlsx`.
- Пункт «🌐 Все ветви» всегда присутствует.

**Режим Desktop:**
- Работает идентично — данные из `tree.xlsx` (загруженного через `loadFromUrl` или `loadFromFile`).

**Лист `preSet` в Excel:**
- Необязателен. Если лист отсутствует, меню содержит только «Все ветви».
- Колонки: `preSet` (ключ), `description` (текст пункта меню).
- Персоны фильтруются по полю `preSet` в листе `person`.

---

## 6. Зачем нужна кнопка «Загрузить tree.xlsx»

**Основная причина:** обеспечить работу приложения в обоих режимах без ручных действий пользователя.

### Режим GitHub Pages

На GitHub Pages файл `tree.xlsx` хранится в том же репозитории и доступен по URL:
```
https://<owner>.github.io/<repo>/<path>/tree.xlsx
```

Кнопка «Загрузить tree.xlsx» (и автозагрузка при старте) позволяет:
- **Открыть семейное дерево без дополнительных действий** — пользователь видит дерево сразу при переходе на страницу.
- **Перезагрузить данные** — если `tree.xlsx` обновился на GitHub, кнопка позволяет обновить отображение без перезагрузки страницы.

### Режим Desktop (file://)

На десктопе `tree.xlsx` лежит рядом с `index.html` в папке проекта. Кнопка позволяет:
- **Открыть данные одним кликом** без диалога выбора файла — удобно при регулярной работе с фиксированным расположением файла.
- **Автоматическая загрузка при старте** — если `tree.xlsx` есть рядом с `index.html`, дерево строится сразу.

### Почему не обойтись только кнопкой «Выбрать файл»

| Критерий | «Загрузить tree.xlsx» | «Выбрать файл» |
|----------|-----------------------|----------------|
| Действий пользователя | 1 клик (или 0 при автозагрузке) | 2+ действия (клик + выбор файла) |
| Автозагрузка при открытии | ✅ Да | ❌ Нет |
| Имя файла | Фиксировано (`tree.xlsx`) | Любое `.xlsx`/`.xls` |
| Подходит для | Стандартный сценарий | Альтернативные файлы, тестирование |

---

## 7. Создание ZIP-архива для Desktop

### Кнопка «Zip» (GitHub Pages → Desktop)

```
downloadZip()
  │
  ├─► Для каждого файла/папки из CONFIG.fileZIP:
  │     │
  │     ├─► Файл (index.html, config.js, tree.xlsx и т.д.)
  │     │     └─► fetchFileContent(entry) → zip.file(entry, content)
  │     │
  │     ├─► pic/ — портреты
  │     │     └─► список из photoExistsCache / DOM
  │     │         → загружаем каждый файл → zip.file(...)
  │     │
  │     ├─► foto_*/  — фотоархивы
  │     │     └─► список из SAVE_DATA (данные Excel)
  │     │         → загружаем каждый файл → zip.file(...)
  │     │
  │     └─► album/, md_person/, md_location/ (произвольные папки)
  │           ├─► GitHub API доступен:
  │           │     ├─► Явно загружаем list.md → zip.file(entry + '/list.md', ...)
  │           │     └─► Для каждого файла из API → zip.file(...)
  │           └─► GitHub API недоступен (fallback):
  │                 ├─► fetch(entry + '/list.md') → zip.file(entry + '/list.md', ...)
  │                 └─► Для каждой строки list.md → zip.file(...)
  │
  └─► zip.generateAsync({type: 'blob'}) → скачать 'family-tree-desktop.zip'
```

**Ключевое отличие от версии до исправления:** `list.md` теперь **явно включается** в ZIP даже когда список файлов получен через GitHub API. Это обеспечивает работу кнопки «Открыть файл \ Альбомы» после распаковки на Desktop.

### Кнопка «Zip Desktop» (Desktop → Desktop)

```
downloadZipDesktop()
  │
  └─► Диалог выбора папки проекта (webkitdirectory)
        │
        └─► Пользователь выбирает папку
              → все файлы из выбранной папки → zip.file(...)
              → скачать 'family-tree-desktop.zip'
```

Используется когда нужно создать архив **локально** на Desktop, без доступа к GitHub API.

---

## 8. Сравнительная таблица: все типы папок

| Критерий | `pic/` | `foto_*/` | `album/` | `md_person/`, `md_location/` |
|----------|--------|-----------|---------|-------------------------------|
| Именование файлов | `<idA>.png` | Вычисляется из Excel | Произвольное | Произвольное |
| Источник имён | Excel (лист `person`) | Excel (листы `foto_*`) | `list.md` / GitHub API | `list.md` / GitHub API |
| Нужен `list.md` | ❌ | ❌ | ✅ | ✅ |
| В ZIP: источник списка | `photoExistsCache` | `SAVE_DATA` | GitHub API + `list.md` | GitHub API + `list.md` |
| `list.md` включается в ZIP | — | — | ✅ (явно) | ✅ (явно) |

---

## 9. Итог

- **`pic/`**: список из Excel + `photoExistsCache`. `list.md` не нужен.
- **`foto_*/`**: список из Excel-листов `foto_*`. `list.md` не нужен.
- **`album/`, `md_person/`, `md_location/`**: список из `list.md` (приоритет) или GitHub API (запасной). `list.md` **нужен** и должен присутствовать в ZIP-архиве для работы на Desktop.
- **«Загрузить tree.xlsx»**: автозагрузка фиксированного файла — удобно для стандартного сценария и автоматического старта.
- **«Выбрать файл»**: загрузка любого Excel-файла через диалог — для нестандартных сценариев.
- **«Открыть файл»**: просмотр портретов (`pic/`) и альбомов (`album/`) без перезагрузки страницы.
- **«Открыть Род»**: фильтрация дерева по пресетам из листа `preSet` — позволяет сосредоточиться на конкретной ветви семьи.
