# Поля Excel и имена листов, используемые в коде (field_excel_v1)

В этом документе перечислены все поля Excel и имена листов, на которые явно ссылается код.
**Эти названия менять нельзя** — они жёстко прошиты в логике парсинга и обработки данных.

Файл Excel: `tree.xlsx`

---

## Листы Excel (Sheet Names)

| Имя листа | Где используется | Описание |
|-----------|-----------------|----------|
| `person` | `index.html` → `parseExcel()` | Поиск по `name.toLowerCase().includes('person')` — лист может называться `person`, `Person`, `persons` и т.п. Содержит персоны. |
| `family` | `index.html` → `parseExcel()` | Поиск по точному совпадению `name.toLowerCase() === 'family'`. Содержит семьи (пары). |
| `foto_person` | `index.html` → `parseExcel()`, `foto.js`, `phototree.js`, `save.js` | Лист с фотографиями персон. Начинается на `foto_` → попадает в динамический список фото-листов. |
| `foto_family` | `index.html` → `parseExcel()`, `foto.js`, `phototree.js`, `save.js` | Лист с семейными фотографиями. |
| `foto_group` | `index.html` → `parseExcel()`, `foto.js`, `phototree.js`, `save.js` | Лист с групповыми фотографиями. |
| `foto_location` | `index.html` → `parseExcel()`, `foto.js`, `phototree.js`, `save.js` | Лист с фотографиями мест/локаций. |
| `foto_item` | `index.html` → `parseExcel()`, `phototree.js`, `save.js` | Лист с фотографиями вещей/предметов. |
| `foto_event` | `index.html` → `parseExcel()`, `phototree.js`, `save.js` | Лист с фотографиями событий. |
| `event` | `index.html` → `parseExcel()` | Лист с событиями персон. |

> **Примечание:** Листы, начинающиеся с `foto_`, обрабатываются динамически на основе параметра `foto_sheets` из `config.js`. Добавление нового листа `foto_<name>` и включение его в `foto_sheets` автоматически включает его в дерево фото и обработку.

---

## Лист `person`

| Поле | Как ищется в коде | Модуль / функция | Описание |
|------|-------------------|-----------------|----------|
| `idA` | `headerRow.indexOf('ida')` (регистр сравнивается в lowercase) | `index.html` → `parseExcel()` | Уникальный идентификатор персоны. Используется как имя файла портрета в `pic/<idA>.png`. Если поле пустое или начинается с `=`, вычисляется автоматически как `label.replace(/ /g, '_')`. |
| `label` / `label_` | `headerRow.findIndex(h => h === 'label' \|\| h === 'label_')` | `index.html` → `parseExcel()` | Отображаемое имя в узле дерева. **Оба варианта — `label` и `label_` — принимаются одинаково.** |
| `sex` | `headerRow.indexOf('sex')` | `index.html` → `parseExcel()`, `treeview.js` → `findRoots()` | Пол персоны. Допустимые значения: `М` или `M` (мужской), `Ж` или `F` (женский). Определяет цвет узла и корневые узлы в мужской/женской линии дерева. |
| `surName2` / `surName2_` | `headerRow.findIndex(h => h === 'surname2' \|\| h === 'surname2_')` | `index.html` → `parseExcel()` | Второй вариант фамилии (например, девичья). **Оба варианта — `surName2` и `surName2_` — принимаются одинаково.** |
| `hasFather` | `headerRow.indexOf('hasfather')` | `index.html` → `parseExcel()`, `treeview.js` → `buildChildrenMap()`, `findRoots()` | `idA` отца. Создаёт ребро в дереве. Используется в режиме мужской линии (♂). |
| `hasMother` | `headerRow.indexOf('hasmother')` | `index.html` → `parseExcel()`, `treeview.js` → `buildChildrenMap()`, `findRoots()` | `idA` матери. Создаёт ребро в дереве. Используется в режиме женской линии (♀). |
| `birth` | `headerRow.findIndex(h => h === 'birth' && !h.includes('full'))` | `index.html` → `parseExcel()`, `treeview.js` → `findRoots()` | Год рождения (краткий). Используется для сортировки корней дерева и отображения в метке узла. |
| `death` | `headerRow.findIndex(h => h === 'death' && !h.includes('full'))` | `index.html` → `parseExcel()` | Год смерти (краткий). Отображается в метке узла. |
| `*_` (поля с суффиксом `_`) | `colName.endsWith('_')` | `index.html` → `parseExcel()` | Все поля, заканчивающиеся на `_`, собираются в `extraFields` и отображаются в панели свойств персоны. Примеры: `birthFull_`, `deathFull_`, `hyperLink_`. |

---

## Лист `family`

| Поле | Как ищется в коде | Модуль / функция | Описание |
|------|-------------------|-----------------|----------|
| `idA` | `famHeader.indexOf('ida')` | `index.html` → `parseExcel()` | Уникальный идентификатор семьи. Если поле пустое или начинается с `=`, вычисляется автоматически как `husband + '__' + wife`. |
| `husband` | `famHeader.indexOf('husband')` | `index.html` → `parseExcel()` | `idA` мужа (ссылка на `person.idA`). |
| `wife` | `famHeader.indexOf('wife')` | `index.html` → `parseExcel()` | `idA` жены (ссылка на `person.idA`). |
| `marriage` / `marriage_` | `famHeader.findIndex(h => h === 'marriage' \|\| h === 'marriage_')` | `index.html` → `parseExcel()` | Дата свадьбы. **Оба варианта — `marriage` и `marriage_` — принимаются одинаково.** Отображается в метке кластера семьи и панели свойств. |
| `*_` (поля с суффиксом `_`) | `colName.endsWith('_')` | `index.html` → `parseExcel()` | Все поля с `_` собираются в `extraFields` и отображаются в панели свойств семьи. Примеры: `locationM_`, `label_`, `hyperLink_`. |

---

## Листы `foto_*` (foto_person, foto_family, foto_group, foto_location, foto_item, foto_event)

Все фото-листы парсятся единообразно. Ниже — поля, на которые ссылается код.

### Общие поля для всех `foto_*` листов

| Поле | Где используется | Описание |
|------|-----------------|----------|
| `idA` | `index.html` → `parseExcel()`, `foto.js`, `phototree.js` → `computeIdA()`, `save.js` → `getFotoFilenames()` | Имя файла фото в соответствующей папке (например `foto_person/<idA>`). Если пустое или начинается с `=`, вычисляется как `id_* + '-' + suffix + '.' + extension`. |
| `title_` | `foto.js` → `buildGalleryWindow()`, `phototree.js` → `buildFileDom()` | Заголовок фото. Отображается под миниатюрой в дереве фото и в окне галереи. |
| `*_` (поля с суффиксом `_`) | `foto.js` → `showFamilyGallery()`, `showPersonGallery()`, `showGroupGallery()`, `showLocationPersonGallery()`, `showLocationFamilyGallery()`, `showEventFotoGallery()` | Все поля, заканчивающиеся на `_`, собираются в `descFields` и отображаются в окне полноэкранного просмотра фото. Стандартные поля: `title_`, `location_`, `date_`, `person_label_`, `hyperLink_`, `suffix_`. |

### Специфические поля по листам

| Лист | Поле | Как ищется в коде | Модуль / функция | Описание |
|------|------|-------------------|-----------------|----------|
| `foto_person` | `id_person` | прямой доступ: `row.id_person` | `foto.js` → `showPersonGallery()` | `idA` персоны (ссылка на `person.idA`). Используется для фильтрации фото по персоне. |
| `foto_person` | `suffix` | `phototree.js` → `getFotoFieldNames()`: `suffixField: 'suffix'` | `phototree.js` → `buildSuffixMap()`, `computeIdA()` | Суффикс для группировки в дереве фото и вычисления `idA`. |
| `foto_family` | `id_family` | прямой доступ: `row.id_family` | `foto.js` → `showFamilyGallery()` | `idA` семьи (ссылка на `family.idA`). |
| `foto_family` | `id_personAll` | прямой доступ: `row.id_personAll` | `foto.js` → `showFamilyGalleryForPerson()` | Перечень `idA` персон через `;` (пробелы вокруг `;` допустимы). |
| `foto_family` | `suffix_` | `phototree.js` → `getFotoFieldNames()`: `suffixField: 'suffix_'` | `phototree.js` → `buildSuffixMap()`, `computeIdA()` | Суффикс с символом `_` — специфично для `foto_family`. |
| `foto_group` | `id_personAll` | прямой доступ: `row.id_personAll` | `foto.js` → `showGroupGallery()` | Перечень `idA` персон через `;` (пробелы вокруг `;` допустимы). |
| `foto_group` | `suffix` | `phototree.js` → `getFotoFieldNames()`: `suffixField: 'suffix'` | `phototree.js` → `buildSuffixMap()`, `computeIdA()` | Суффикс. |
| `foto_location` | `id_personAll` | прямой доступ: `row.id_personAll` | `foto.js` → `showLocationPersonGallery()` | Перечень `idA` персон через `;`. |
| `foto_location` | `id_familyAll` | прямой доступ: `row.id_familyAll` | `foto.js` → `showLocationFamilyGallery()` | Перечень `idA` семей через `;`. |
| `foto_location` | `id_loc` | `phototree.js` → `getFotoFieldNames()`: `idField: 'id_loc'` | `phototree.js` → `buildFotoFolderDom()` | Идентификатор локации. |
| `foto_location` | `suffix` | `phototree.js` → `getFotoFieldNames()`: `suffixField: 'suffix'` | `phototree.js` → `buildSuffixMap()`, `computeIdA()` | Суффикс. |
| `foto_item` | `id_person` | (аналог foto_person) | `phototree.js` → `getFotoFieldNames()` | `idA` персоны (ссылка на `person.idA`). |
| `foto_item` | `suffix` | `phototree.js` → `getFotoFieldNames()` | `phototree.js` | Суффикс. |
| `foto_event` | `id_person` | (аналог foto_person) | `phototree.js` → `getFotoFieldNames()` | `idA` персоны. |
| `foto_event` | `suffix` | `phototree.js` → `getFotoFieldNames()` | `phototree.js` | Суффикс. |

---

## Лист `event`

| Поле | Где используется | Описание |
|------|-----------------|----------|
| `id_event` | `index.html` → `parseExcel()` | Уникальный идентификатор события. |
| `id_personAll` | `index.html` → обработка событий | Перечень `idA` персон через `;`, которым относится событие. |
| `foto_person` | `index.html` → обработка событий | `idA` фото из листа `foto_person`, привязанного к событию. |
| `foto_family` | `index.html` → обработка событий | `idA` фото из листа `foto_family`. |
| `foto_group` | `index.html` → обработка событий | `idA` фото из листа `foto_group`. |
| `foto_location` | `index.html` → обработка событий | `idA` фото из листа `foto_location`. |
| `*_` (поля с суффиксом `_`) | `foto.js` → `showEventFotoGallery()` | Все поля с `_` отображаются в окне галереи событий. |

---

## Вспомогательные поля (вычисляемые / необязательные)

| Поле | Лист | Где используется | Описание |
|------|------|-----------------|----------|
| `extension` | `foto_*` | `phototree.js` → `computeIdA()` | Расширение файла фото (например `jpg`, `png`). Используется при вычислении `idA` если оно не заполнено. |

---

## Особенности обработки полей с `_` (нижним подчёркиванием)

### 1. Поля с `_` как суффикс — «отображаемые» поля

Поля, заканчивающиеся на `_`, имеют особый статус в коде: они автоматически собираются в объект описания и отображаются пользователю.

- **`index.html` → `parseExcel()`** для листов `person` и `family`: все колонки с именем, оканчивающимся на `_`, собираются в `extraFields` и выводятся в панели свойств.
- **`foto.js`** для всех фото-листов: все поля с суффиксом `_` из строки собираются в `descFields` и выводятся в окне полноэкранного просмотра фото.
- **Итого:** добавить новое отображаемое поле в любой лист можно, просто назвав его с `_` в конце — оно автоматически попадёт в UI без изменения кода.

### 2. Пары полей с `_` и без `_` — взаимозаменяемые

В некоторых местах код принимает **оба варианта поля** — с суффиксом `_` и без него — как эквивалентные:

| Поля | Лист | Где обрабатывается | Примечание |
|------|------|--------------------|------------|
| `label` / `label_` | `person` | `index.html` → `parseExcel()`: `h === 'label' \|\| h === 'label_'` | Оба варианта ищутся при поиске индекса колонки. Поведение идентично. |
| `surName2` / `surName2_` | `person` | `index.html` → `parseExcel()`: `h === 'surname2' \|\| h === 'surname2_'` | Оба варианта принимаются. |
| `marriage` / `marriage_` | `family` | `index.html` → `parseExcel()`: `h === 'marriage' \|\| h === 'marriage_'` | Оба варианта принимаются. |
| `suffix` / `suffix_` | все `foto_*` | `phototree.js` → `buildSuffixMap()`: `row[suffixField] \|\| row['suffix'] \|\| row['suffix_']` | При группировке по суффиксу код проверяет сначала основное поле (`suffixField`), затем `suffix`, затем `suffix_`. Таким образом, и `suffix`, и `suffix_` работают в любом фото-листе. |

> **Важно для `foto_family`:** в `phototree.js` → `getFotoFieldNames()` для `foto_family` задан `suffixField: 'suffix_'`, тогда как для остальных листов — `suffixField: 'suffix'`. Однако благодаря fallback-логике `buildSuffixMap()` (`row['suffix'] || row['suffix_']`) оба варианта работают в любом листе.

### 3. Поля `id_personAll` — многозначные ссылки

Поля `id_personAll` (в листах `foto_family`, `foto_group`, `foto_location`, `event`) содержат перечень `idA` через `;`. Код корректно обрабатывает **пробелы вокруг разделителя** — `.split(';').map(s => s.trim())`.

### 4. Нечувствительность имён листов к регистру

- Лист `person` ищется как `name.toLowerCase().includes('person')` — подходят `Person`, `persons`, `Persons` и т.п.
- Лист `family` ищется как `name.toLowerCase() === 'family'` — точное совпадение в нижнем регистре.
- Фото-листы ищутся по точному совпадению с именами из конфига (`foto_sheets`).

---

## Итоговая таблица: все поля, запрещённые к изменению

| Поле | Лист | Причина фиксации |
|------|------|-----------------|
| `idA` | все листы | Первичный ключ, используется как имя файла и ссылка во всех модулях |
| `label` / `label_` | `person` | Отображаемое имя персоны в дереве |
| `sex` | `person` | Определяет цвет узла и режим линии дерева |
| `surName2` / `surName2_` | `person` | Второй вариант фамилии |
| `hasFather` | `person` | Ссылка на отца — строит структуру дерева |
| `hasMother` | `person` | Ссылка на мать — строит структуру дерева |
| `birth` | `person` | Год рождения для метки и сортировки |
| `death` | `person` | Год смерти для метки |
| `husband` | `family` | Ссылка на мужа |
| `wife` | `family` | Ссылка на жену |
| `marriage` / `marriage_` | `family` | Дата свадьбы |
| `id_person` | `foto_person`, `foto_item`, `foto_event` | Привязка фото к персоне |
| `id_family` | `foto_family` | Привязка фото к семье |
| `id_personAll` | `foto_family`, `foto_group`, `foto_location`, `event` | Привязка к нескольким персонам |
| `id_familyAll` | `foto_location` | Привязка к нескольким семьям |
| `id_loc` | `foto_location` | Идентификатор локации (для phototree) |
| `suffix` / `suffix_` | все `foto_*` | Суффикс для группировки и вычисления `idA` |
| `extension` | все `foto_*` | Расширение файла для вычисления `idA` |
| `title_` | все `foto_*` | Заголовок, отображается в дереве фото |
| `id_event` | `event` | Уникальный идентификатор события |
| `foto_person` | `event` | Ссылка на фото из `foto_person` |
| `foto_family` | `event` | Ссылка на фото из `foto_family` |
| `foto_group` | `event` | Ссылка на фото из `foto_group` |
| `foto_location` | `event` | Ссылка на фото из `foto_location` |
