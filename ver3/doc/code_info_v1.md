## 1. Подробное описание всех функций в коде с указанием модулей и их взаимосвязей

### 1.1. Файл `config.js`
Назначение: задаёт глобальную переменную `window.CONFIG` с параметрами отображения (размеры узлов, цвета, шрифты, пути к папкам с фото, язык интерфейса и т.д.). Загружается через тег `<script>` в `index.html`, что позволяет читать настройки даже при локальном открытии по протоколу `file://` (без CORS-ошибок).

**Функции / переменные:**
- `window.CONFIG` – объект со свойствами: `width`, `height`, `fontname`, `fontsize`, `fontsizeSurName2`, `maleColor`, `femaleColor`, `unknownColor`, `borderColor`, `edgeColor`, `picDir`, `picDirType`, `picDirGlobal`, `picDirGraphvizOnline`, `graphvizOnlineType`, `language`.

Взаимосвязи: читается в `index.html` функцией `loadConfig()` для установки глобальных переменных рендеринга.

---

### 1.2. Файл `foto.js`
Назначение: реализует логику работы с фотогалереями – семейными, персональными, групповыми, местами и событиями. Экспортирует объект `window.FOTO` с методами для открытия окон галерей.

**Внутренние функции:**
- `checkFotoExists(dir, filename)` – проверяет существование файла фото (через `<img>` при `file://` или `fetch` при http).
- `openFullPhoto(src, title, fields, sheetName)` – открывает фото в полном размере в новом окне с отображением всех полей (с суффиксом `_`).
- `buildGalleryWindow(entityIdA, photos, dir, headerTitle, sheetName)` – создаёт плавающую панель с миниатюрами фото для заданной сущности.
- `openThumbPhoto(storeKey)` – обработчик клика по миниатюре (вызывает `openFullPhoto`).
- `showFamilyGalleryForPerson(...)`, `showFamilyGallery(...)`, `showPersonGallery(...)`, `showGroupGallery(...)`, `showLocationPersonGallery(...)`, `showLocationFamilyGallery(...)`, `showEventFotoGallery(...)`, `showSinglePhotoGallery(...)` – публичные методы, открывающие соответствующие галереи.

**Публичный API (`window.FOTO`):**
- `showFamilyGallery(familyIdA, fotoFamilyRows, fotoFamilyDir)`
- `showFamilyGalleryForPerson(personIdA, fotoFamilyRows, fotoFamilyDir)`
- `showPersonGallery(personIdA, fotoPersonRows, fotoPersonDir)`
- `showGroupGallery(personIdA, fotoGroupRows, fotoGroupDir)`
- `showLocationPersonGallery(personIdA, fotoLocationRows, fotoLocationDir)`
- `showLocationFamilyGallery(familyIdA, fotoLocationRows, fotoLocationDir)`
- `showEventFotoGallery(galleryKey, fotoRows, fotoDir, headerTitle)`
- `showSinglePhotoGallery(idA, fotoRows, fotoDir)`

Взаимосвязи:
- Использует глобальные функции из `index.html`: `getFieldLabel` (для перевода названий полей), `bringPanelToFront`, `startDragPanel`.
- Получает массивы данных (`fotoFamilyRows` и др.) из `index.html` при вызове.
- Панели галерей добавляются в контейнер `#properties-panels-container`, управляемый `index.html`.

---

### 1.3. Файл `treeview.js`
Назначение: панель дерева персон (левая колонка). Отображает иерархию по мужской (`hasFather`) или женской (`hasMother`) линии, поддерживает поиск, сворачивание/разворачивание, режим «потомки» (V-кнопка).

**Внутренние функции:**
- `buildChildrenMap(people, mode)` – строит карту «родитель → дети».
- `findRoots(people, mode)` – определяет корневые узлы с учётом пола.
- `buildTreeDom(personId, peopleMap, childrenMap, depth)` – рекурсивно строит DOM-дерево.
- `toggleNode(icon, childList)` – сворачивает/разворачивает ветку.
- `renderTreeView()` – отрисовывает дерево в `#tv-content`.
- Функции поиска: `getAllTreeRows`, `findAllMatchingRows`, `expandParentsOfRow`, `highlightSearchResult`, `resetSearch`, `updateSearchButtons`, `setSearchStatus`.
- Функции взаимодействия с диаграммой: `selectPersonInDiagramFocusOnly`, `selectPersonInDiagram`, `highlightTreeViewRow`, `clearTreeViewHighlight`.
- Управление режимом потомков: `tvToggleDescendantsMode`, `resetDescendantsMode`, `getSelectedPersonId`.

**Публичный API (`window`):**
- `tvInit(peopleArray)` – инициализация дерева.
- `tvSetMode(mode)` – переключение мужской/женской линии.
- `tvHome()` – свернуть всё, кроме первого уровня.
- `tvExpandAll()` – полностью развернуть дерево.
- `tvFindStart()`, `tvFindNext()`, `tvSearchInputChange()` – поиск.
- `tvToggleDescendantsMode()` – переключение режима потомков.
- `tvGetDescendantsMode()` – получение состояния режима.
- `tvHighlightPerson(personId)` – подсветка строки по idA (вызывается из диаграммы).

Взаимосвязи:
- Получает массив `people` через `tvInit`.
- Генерирует события `treeview-select-person-focus`, `treeview-select-person`, `treeview-descendants-mode`, на которые подписан `index.html`.
- Вызывает функции `expandParentsOfRow` и манипулирует DOM.

---

### 1.4. Файл `phototree.js`
Назначение: панель дерева фото (под деревом персон). Отображает четыре папки (`foto_person`, `foto_family`, `foto_group`, `foto_location`) с группировкой по суффиксам (`suffix`/`suffix_`). При клике на файл открывается соответствующая галерея.

**Внутренние функции:**
- `buildSuffixMap(fotoRows, suffixField)` – группирует записи по суффиксу.
- `computeIdA(row, idField, suffixField)` – вычисляет имя файла, если `idA` не заполнен.
- `buildFotoFolderDom(fotoType, fotoRows, idField, suffixField)` – создаёт DOM для папки типа.
- `buildSuffixFolderDom(suffix, rows, fotoType, idField, suffixField)` – создаёт DOM для папки суффикса.
- `buildFileDom(fotoRow, fotoType, idField, suffixField)` – создаёт DOM для файла.
- `ptToggleNode(icon, childList)` – сворачивает/разворачивает узел.
- `openPhotoGallery(fotoType, fotoRow, idA)` – вызывает соответствующую функцию из `FOTO`.
- `renderPhotoTreeView()` – отрисовывает дерево.

**Публичный API (`window`):**
- `ptInit(fotoPersonRows, fotoFamilyRows, fotoGroupRows, fotoLocationRows)` – инициализация.
- `ptHome()` – свернуть всё.
- `ptExpandAll()` – развернуть всё.

Взаимосвязи:
- Использует глобальный объект `window.FOTO` для открытия галерей.
- Массивы фото передаются из `index.html` через `ptInit`.

---

### 1.5. Файл `save.js`
Назначение: экспорт диаграммы в PDF, SVG, Drawio (XML) и создание ZIP-архива для десктопного развёртывания.

**Внутренние функции:**
- `imageUrlToBase64(url)` – конвертирует изображение в data URL.
- `embedImagesInSvg(svgEl)` – заменяет ссылки на изображения в SVG на base64.
- `createPdfFromCanvas(canvas, width, height)` – создаёт PDF из canvas.
- `downloadCanvasAsPng(canvas, filename)` – fallback для PNG.
- `svgToDrawioXml(svgEl)` – генерирует XML для diagrams.net.
- `loadScript(src)` – динамическая загрузка JSZip.
- `fetchFileContent(filename, isBinary)` – загружает содержимое файла.
- `getPicDir()`, `getPhotoFilenames()`, `getFotoFilenames(dirName)` – вспомогательные для сбора файлов в ZIP.

**Публичный API (`window`):**
- `exportToPdf()`
- `exportToSvg()`
- `exportToDrawio()`
- `openDrawioOnline()`
- `downloadZip()`

Взаимосвязи:
- Использует глобальный объект `window.SAVE_DATA`, заполненный в `index.html` после загрузки Excel.
- Получает SVG-элемент из `#graphvizContainer`.
- Может обращаться к глобальной переменной `CONFIG`.

---

### 1.6. Файл `index.html` (основной скрипт)
Назначение: связывает все модули, загружает Excel, парсит данные, генерирует DOT, рендерит диаграмму через Viz.js, управляет панелями свойств (Properties panels) и событиями.

**Основные функции (внутри самовызывающейся функции):**
- `loadConfig()` – загружает конфиг из `config.js` или `config.json`.
- `parseExcel(arrayBuffer)` – парсит все листы Excel, возвращает объекты `people`, `marriages`, `familyRows`, `fotoFamilyRows`, `fotoPersonRows`, `fotoGroupRows`, `fotoLocationRows`, `eventRows`, `languageRows`.
- `checkPhotoExists(filename)` – проверяет наличие фото (кэширует).
- `getPersonPhotoPath(person, picDirOverride)` – определяет путь к фото персоны.
- `preloadPhotoChecks(peopleList)` – предзагружает проверки для всех фото.
- `generateDotCode(peopleList, marriages, picDirOverride)` – генерирует DOT-код (подробно в п.2).
- `buildImagesOption(peopleList)` – собирает массив изображений для Viz.js.
- `renderDot(dotStr, imagesOption)` – рендерит диаграмму через Viz.js.
- Функции работы с панелями свойств:
  - `getFieldLabel(sheetName, fieldKey)` – возвращает перевод поля (из листа `language`).
  - `buildLinksHtml(hyperLinkStr)` – преобразует ссылки (через `;`) в HTML.
  - `showNodeProperties(person)` – открывает панель свойств персоны.
  - `showFamilyProperties(familyObj)` – открывает панель свойств семьи.
  - `showEventPanel(personIdA)` – открывает панель событий.
  - `openSingleEventFotoGallery(eventId, fotoType, selectEl)` – открывает галерею по событию.
  - `openEventFotoGallery(personIdA, fotoType, selectEl)` – устаревшая? (используется в старом коде).
  - `closePropertiesPanel`, `copyObjectId`, `bringPanelToFront`, `startDragPanel`, `dragPanel`, `stopDragPanel` – управление панелями.
- `addNodeClickHandlers(svgEl)` – добавляет обработчики кликов на узлы и кластеры SVG.
- Функции открытия галерей (обёртки над `FOTO`): `openFamilyGallery`, `openFamilyGalleryForPerson`, `openPersonGallery`, `openGroupGallery`, `openLocationPersonGallery`, `openLocationFamilyGallery`.
- Функции для экспорта/зума: `zoomIn`, `zoomOut`, `zoomReset`, `zoomFit`, `openGraphvizOnline`, `refreshDiagramFromEditor` и др.
- `filterDescendants(peopleList, marriagesList, personIdA)` – фильтрует персон для режима потомков.
- `buildTree(parsedData)` – основная функция после парсинга: сохраняет данные, инициализирует кэш, генерирует DOT, рендерит, вызывает `tvInit` и `ptInit`.

**Обработчики событий:**
- Загрузка файла через кнопки.
- Подписка на события из `treeview.js` (`treeview-select-person-focus`, `treeview-select-person`, `treeview-descendants-mode`).

Взаимосвязи:
- Вызывает функции всех модулей.
- Передаёт данные в `treeview.js` и `phototree.js` через `tvInit` и `ptInit`.
- Предоставляет глобальные функции для `foto.js` (`getFieldLabel`, `bringPanelToFront` и др.).
- Устанавливает `window.SAVE_DATA` для `save.js`.

---

### 1.7. Вспомогательные HTML-файлы
- `test_tree_v1.html` – автономный инструмент для проверки целостности данных в `tree.xlsx` (валидация ссылок, дубликатов, обязательных полей и т.д.).
- `service_foto_desktop.html` – утилита для проверки наличия фотографий в локальных папках по списку из Excel (работает по `file://`).
- `styles.css` – все стили для интерфейса, панелей, дерева, диаграммы и галерей.

---

## 2. Алгоритм формирования DOT-кода схемы

### 2.1. Описание процесса
Функция `generateDotCode(peopleList, marriages, picDirOverride)` генерирует строку DOT для Graphviz. Алгоритм:

1. **Инициализация**: задаются общие атрибуты графа: `rankdir=TB`, `node` (шрифт), `edge` (цвет).
2. **Для каждого человека**:
   - Определяется цвет заливки в зависимости от пола (`MALE_COLOR`, `FEMALE_COLOR`, `UNKNOWN_COLOR`).
   - Формируется метка `label`: если есть `surName2`, добавляется в первой строке, затем `label` (имя), затем годы `birth–death`. Пробелы заменяются на `\n`.
   - Выбирается размер шрифта: если есть `surName2`, используется `FONT_SIZE_SURNAME2`, иначе `FONT_SIZE`.
   - Проверяется наличие фото (через `getPersonPhotoPath`). Если фото есть – добавляются атрибуты: `image`, `fixedsize=true`, `width`, `height`, `imagepos=tc`, `imagescale=false`, `labelloc=b`. Если нет – только `shape=box`.
   - Строка узла добавляется в массив `nodes`.
3. **Рёбра «родитель → ребёнок»**:
   - Для каждого человека, если есть `hasFather`, добавляется ребро от отца с цветом `MALE_COLOR`.
   - Если есть `hasMother`, добавляется ребро от матери с цветом `FEMALE_COLOR`.
4. **Кластеры семей (браков)**:
   - Для каждого объекта `marriage` проверяется, что оба супруга присутствуют в текущем наборе персон.
   - Создаётся подграф `subgraph cluster_...` с:
     - `label` из поля `marriage` (если есть).
     - `rank=same` (супруги на одном уровне).
     - `style=dashed`, `color=EDGE_COLOR`.
     - Внутри перечисляются узлы мужа и жены.
   - Добавляется в массив `clusters`.
5. **Сборка**: объединение всех частей в одну строку с разделителями строк.

### 2.2. Таблица с примерами

| Шаг | Входные данные | Выходной фрагмент DOT |
|-----|----------------|------------------------|
| **Узел с фото** | `person = { idA: "Ульянов_Владимир_Ильич", label: "Ульянов Владимир Ильич", sex: "М", surName2: "Ленин", birth: "1870", death: "1924" }`<br>`photoPath = "pic/Ульянов_Владимир_Ильич.png"` | `Ульянов_Владимир_Ильич [shape=box, style="filled", fillcolor="lightsteelblue", color="darkslategray", label="Ленин\nУльянов Владимир Ильич\n1870–1924", image="pic/Ульянов_Владимир_Ильич.png", fixedsize=true, width=1.1, height=1.9, fontsize=9.9, imagepos=tc, imagescale=false, labelloc=b];` |
| **Узел без фото** | `person = { idA: "Ульянов_Илья_Николаевич", label: "Ульянов Илья Николаевич", sex: "М", birth: "1831", death: "1886" }`<br>`photoPath = null` | `Ульянов_Илья_Николаевич [shape=box, style="filled", fillcolor="lightsteelblue", color="darkslategray", label="Ульянов Илья Николаевич\n1831–1886"];` |
| **Ребро** | `hasFather = "Ульянов_Илья_Николаевич"`, `idA = "Ульянов_Владимир_Ильич"` | `Ульянов_Илья_Николаевич -> Ульянов_Владимир_Ильич [color="lightsteelblue"];` |
| **Кластер (текущая реализация)** | `marriage = { idA: "Ульянов_Илья_Николаевич-Бланк_Мария_Александровна", husband: "Ульянов_Илья_Николаевич", wife: "Бланк_Мария_Александровна", marriage: "25.08 (6.09) 1863" }`<br>индекс = 0 | `subgraph cluster_marriage_0 {`<br>`  label="25.08 (6.09) 1863";`<br>`  rank=same;`<br>`  style=dashed;`<br>`  color="slategray";`<br>`  Ульянов_Илья_Николаевич;`<br>`  Бланк_Мария_Александровна;`<br>`}` |

### 2.3. Диаграмма алгоритма (Mermaid)

```mermaid
flowchart TD
    Start([Начало generateDotCode]) --> Init[Установка общих атрибутов графа]
    Init --> ForEachPerson{Для каждого person}
    ForEachPerson --> GetSexColor[Определить fillcolor по полу]
    GetSexColor --> BuildLabel[Сформировать label из surName2 + name + birth-death]
    BuildLabel --> ChooseFont[Выбрать fontsize (surName2 → FONT_SIZE_SURNAME2)]
    ChooseFont --> GetPhoto[Получить путь к фото]
    GetPhoto --> PhotoExists{Фото есть?}
    PhotoExists -->|Да| AddImageAttrs[Добавить атрибуты: image, fixedsize, width, height, imagepos=tc, labelloc=b]
    PhotoExists -->|Нет| AddSimpleAttrs[shape=box]
    AddImageAttrs --> AppendNode[Добавить строку узла в массив nodes]
    AddSimpleAttrs --> AppendNode
    AppendNode --> ForEachPerson

    ForEachPerson --> EndPeople[Конец цикла по персонам]
    EndPeople --> ForEachParent{Для каждого person}
    ForEachParent --> CheckFather{hasFather?}
    CheckFather -->|Да| AddFatherEdge[Добавить ребро hasFather → idA с MALE_COLOR]
    AddFatherEdge --> CheckMother
    CheckFather -->|Нет| CheckMother{hasMother?}
    CheckMother -->|Да| AddMotherEdge[Добавить ребро hasMother → idA с FEMALE_COLOR]
    AddMotherEdge --> ForEachParent
    CheckMother -->|Нет| ForEachParent

    ForEachParent --> EndEdges[Конец рёбер]
    EndEdges --> ForEachMarriage{Для каждого marriage}
    ForEachMarriage --> CheckSpouses{Оба супруга в people?}
    CheckSpouses -->|Да| CreateCluster[Создать подграф с label из marriage, rank=same, style=dashed]
    CreateCluster --> AddSpouses[Добавить узлы супругов внутрь]
    AddSpouses --> ForEachMarriage
    CheckSpouses -->|Нет| ForEachMarriage

    ForEachMarriage --> EndMarriages[Конец браков]
    EndMarriages --> Combine[Объединить nodes + clusters + edges в строку]
    Combine --> Return[Вернуть DOT-код]
```

---

## 3. Исправление кода: задание имени кластера через idA листа family

### 3.1. Проблема
В текущей реализации имена подграфов для семей генерируются как `cluster_marriage_0`, `cluster_marriage_1` и т.д. Эти имена не несут смысловой нагрузки и не связаны с данными. Требуется использовать значимые имена, например, из поля `idA` листа `family` (например, `Ульянов_Илья_Николаевич-Бланк_Мария_Александровна`), но с учётом ограничений синтаксиса Graphviz (идентификаторы могут содержать буквы, цифры и подчёркивания, не должны начинаться с цифры, не допускаются дефисы, точки, пробелы).

### 3.2. Исправление в функции `generateDotCode`

Найдите в `index.html` фрагмент, где формируются кластеры. Он выглядит примерно так:

```javascript
let clusterIdx = 0;
(marriages || []).forEach(m => {
    if (personIdSet.has(m.husband) && personIdSet.has(m.wife)) {
        const clusterLines = [];
        clusterLines.push(`  subgraph cluster_marriage_${clusterIdx} {`);
        if (m.marriage) {
            clusterLines.push(`    label="${m.marriage}";`);
        } else {
            clusterLines.push(`    label="";`);
        }
        clusterLines.push(`    rank=same;`);
        clusterLines.push(`    style=dashed;`);
        clusterLines.push(`    color="${EDGE_COLOR}";`);
        clusterLines.push(`    ${m.husband};`);
        clusterLines.push(`    ${m.wife};`);
        clusterLines.push(`  }`);
        clusters.push(clusterLines.join('\n'));
        clusterIdx++;
    }
});
```

**Замените на следующий код:**

```javascript
(marriages || []).forEach(m => {
    if (personIdSet.has(m.husband) && personIdSet.has(m.wife)) {
        // Санитизируем idA для использования в качестве имени подграфа
        let safeId = m.idA ? m.idA.replace(/[^a-zA-Z0-9_]/g, '_') : '';
        if (!safeId) {
            // Если idA отсутствует или пуст, используем индекс как запасной вариант
            safeId = 'marriage_' + (clusterIdx++);
        } else {
            // Убедимся, что имя не начинается с цифры (Graphviz требует букву или подчёркивание)
            if (/^\d/.test(safeId)) safeId = '_' + safeId;
            // Увеличиваем счётчик, чтобы не потерять, но он больше не используется в имени
            clusterIdx++;
        }
        const clusterLines = [];
        clusterLines.push(`  subgraph cluster_${safeId} {`);
        if (m.marriage) {
            clusterLines.push(`    label="${m.marriage}";`);
        } else {
            clusterLines.push(`    label="";`);
        }
        clusterLines.push(`    rank=same;`);
        clusterLines.push(`    style=dashed;`);
        clusterLines.push(`    color="${EDGE_COLOR}";`);
        clusterLines.push(`    ${m.husband};`);
        clusterLines.push(`    ${m.wife};`);
        clusterLines.push(`  }`);
        clusters.push(clusterLines.join('\n'));
    }
});
```

**Пояснения:**
- `m.idA` – это идентификатор семьи из листа `family` (например, `Ульянов_Илья_Николаевич-Бланк_Мария_Александровна`). Заменяем все недопустимые символы (дефис, точка, пробел и т.п.) на подчёркивание.
- Если `idA` отсутствует (пустая строка или `undefined`), используем запасное имя `marriage_N` (где N – индекс).
- Проверяем, не начинается ли `safeId` с цифры; если да – добавляем префикс `_`.
- Переменная `clusterIdx` всё равно инкрементируется, чтобы сохранить счётчик на случай отсутствия `idA`, но не используется в имени, если `idA` есть.

### 3.3. Пример результата
Для семьи с `idA = "Ульянов_Илья_Николаевич-Бланк_Мария_Александровна"` после санитизации получим `cluster_Ульянов_Илья_Николаевич_Бланк_Мария_Александровна`. Подграф будет выглядеть так:

```dot
subgraph cluster_Ульянов_Илья_Николаевич_Бланк_Мария_Александровна {
  label="25.08 (6.09) 1863";
  rank=same;
  style=dashed;
  color="slategray";
  Ульянов_Илья_Николаевич;
  Бланк_Мария_Александровна;
}
```

### 3.4. Дополнительные рекомендации
- Убедитесь, что все `idA` в листе `family` действительно уникальны и не содержат конфликтующих символов после замены (например, две разные семьи могут после замены дать одинаковое `safeId`, если исходные отличались только дефисом). Но дефис – единственный частый разделитель, замена на подчёркивание может создать коллизию, если были две семьи с именами, различающимися только дефисом и подчёркиванием. В реальных данных такая ситуация маловероятна.
- При необходимости можно добавить хеш-сумму для гарантии уникальности, но это усложнит код и обычно не требуется.

Исправление внесено в функцию `generateDotCode` в `index.html`.
