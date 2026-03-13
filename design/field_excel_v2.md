# Поля Excel и имена листов, используемые в коде (field_excel_v2)

В этом документе перечислены все поля Excel и имена листов, на которые явно ссылается код.
Файл Excel: `tree.xlsx`

> **Версия v2:** добавлено описание правила суффикса `_` для служебных полей —
> суффикс `_` влияет только на отображение в UI и не нарушает логику обработки данных.

---

## Правило суффикса `_` (ключевое)

Суффикс `_` в конце имени поля имеет двойную роль:

| Категория | Правило | Пример |
|-----------|---------|--------|
| **Отображаемые поля** | Поля с `_` → автоматически выводятся в UI (панель свойств, окно фото) | `birthFull_`, `hyperLink_`, `title_` |
| **Служебные поля** | Поля без `_` → используются для логики (связи, фильтрация, вычисления) | `idA`, `id_person`, `hasFather` |

### Важный принцип (ver6+)

Добавление `_` к служебному полю **не должно** нарушать логику обработки данных.
Код принимает **оба варианта** (с `_` и без) для всех служебных полей:

| Поле | Принимаемые варианты |
|------|---------------------|
| `idA` | `idA` или `idA_` |
| `label` | `label` или `label_` |
| `sex` | `sex` или `sex_` |
| `surName2` | `surName2` или `surName2_` |
| `hasFather` | `hasFather` или `hasFather_` |
| `hasMother` | `hasMother` или `hasMother_` |
| `birth` | `birth` или `birth_` (без `full`) |
| `death` | `death` или `death_` (без `full`) |
| `husband` | `husband` или `husband_` |
| `wife` | `wife` или `wife_` |
| `marriage` | `marriage` или `marriage_` |
| `suffix` | `suffix` или `suffix_` |
| `id_person` | `id_person` или `id_person_` |
| `id_personAll` | `id_personAll` или `id_personAll_` |
| `extension` | `extension` или `extension_` |

---

## Листы Excel (Sheet Names)

| Имя листа | Где используется | Описание |
|-----------|-----------------|----------|
| `person` | `index.html` → `parseExcel()` | Поиск по `name.toLowerCase().includes('person')`. Содержит персоны. |
| `family` | `index.html` → `parseExcel()` | Точное совпадение `name.toLowerCase() === 'family'`. Содержит семьи. |
| `foto_person` | `index.html`, `foto.js`, `phototree.js`, `save.js` | Фотографии персон. |
| `foto_family` | `index.html`, `foto.js`, `phototree.js`, `save.js` | Семейные фотографии. |
| `foto_group` | `index.html`, `foto.js`, `phototree.js`, `save.js` | Групповые фотографии. |
| `foto_location` | `index.html`, `foto.js`, `phototree.js`, `save.js` | Фотографии мест. |
| `foto_item` | `index.html`, `phototree.js`, `save.js` | Фотографии вещей/предметов. |
| `foto_event` | `index.html`, `phototree.js`, `save.js` | Фотографии событий. |
| `event` | `index.html` | События персон. |

---

## Лист `person`

| Поле | Принимаемые варианты | Описание |
|------|---------------------|----------|
| `idA` | `idA` или `idA_` | Уникальный идентификатор персоны. Имя файла портрета `pic/<idA>.png`. |
| `label` | `label` или `label_` | Отображаемое имя в узле дерева. |
| `sex` | `sex` или `sex_` | Пол: `М`/`M` или `Ж`/`F`. Определяет цвет узла. |
| `surName2` | `surName2` или `surName2_` | Второй вариант фамилии. |
| `hasFather` | `hasFather` или `hasFather_` | `idA` отца — строит ребро в дереве. |
| `hasMother` | `hasMother` или `hasMother_` | `idA` матери — строит ребро в дереве. |
| `birth` | `birth` или `birth_` | Год рождения (краткий). |
| `death` | `death` или `death_` | Год смерти (краткий). |
| `*_` (поля с суффиксом `_`) | — | Все поля с `_` → в `extraFields` → UI-панель свойств. Примеры: `birthFull_`, `hyperLink_`. |

---

## Лист `family`

| Поле | Принимаемые варианты | Описание |
|------|---------------------|----------|
| `idA` | `idA` или `idA_` | Уникальный идентификатор семьи. |
| `husband` | `husband` или `husband_` | `idA` мужа. |
| `wife` | `wife` или `wife_` | `idA` жены. |
| `marriage` | `marriage` или `marriage_` | Дата свадьбы. |
| `*_` (поля с суффиксом `_`) | — | Все поля с `_` → `extraFields` → UI-панель. Примеры: `locationM_`, `hyperLink_`. |

---

## Листы `foto_*`

### Общие поля для всех `foto_*` листов

| Поле | Принимаемые варианты | Описание |
|------|---------------------|----------|
| `idA` | `idA` или `idA_` | Имя файла фото. Если пустое — вычисляется как `id_* + '-' + suffix + '.' + extension`. |
| `suffix` | `suffix` или `suffix_` | Суффикс для группировки и вычисления `idA`. |
| `extension` | `extension` или `extension_` | Расширение файла (jpg, png и т.п.). |
| `title_` | — | Заголовок фото (всегда с `_` — только отображение). |
| `*_` (поля с суффиксом `_`) | — | Все поля с `_` → `descFields` → окно полноэкранного просмотра. |

### Специфические поля по листам

| Лист | Поле | Принимаемые варианты | Описание |
|------|------|---------------------|----------|
| `foto_person` | `id_person` | `id_person` или `id_person_` | `idA` персоны. |
| `foto_family` | `id_family` | `id_family` или `id_family_` | `idA` семьи. |
| `foto_family` | `id_personAll` | `id_personAll` или `id_personAll_` | Список `idA` персон через `;`. |
| `foto_group` | `id_personAll` | `id_personAll` или `id_personAll_` | Список `idA` персон через `;`. |
| `foto_location` | `id_personAll` | `id_personAll` или `id_personAll_` | Список `idA` персон через `;`. |
| `foto_location` | `id_familyAll` | `id_familyAll` или `id_familyAll_` | Список `idA` семей через `;`. |
| `foto_location` | `id_loc` | `id_loc` или `id_loc_` | Идентификатор локации. |
| `foto_item` | `id_person` | `id_person` или `id_person_` | `idA` персоны. |
| `foto_item` | `id_personAll` | `id_personAll` или `id_personAll_` | Список `idA` через `;` (фильтр строк). |
| `foto_event` | `id_person` | `id_person` или `id_person_` | `idA` персоны. |
| `foto_event` | `id_personAll` | `id_personAll` или `id_personAll_` | Список `idA` через `;` (фильтр строк). |

---

## Лист `event`

| Поле | Описание |
|------|----------|
| `id_event` | Уникальный идентификатор события. |
| `id_personAll` | Перечень `idA` персон через `;`. |
| `foto_person` | `idA` фото из листа `foto_person`. |
| `foto_family` | `idA` фото из листа `foto_family`. |
| `foto_group` | `idA` фото из листа `foto_group`. |
| `foto_location` | `idA` фото из листа `foto_location`. |
| `*_` поля | Произвольные отображаемые поля (заголовок, описание и т.п.). |

---

## Отображение `hyperLink_` (ver6+)

Поле `hyperLink_` отображается в двух местах:

| Место | Поведение |
|-------|-----------|
| Панель «Основные свойства» person/family | `buildLinksHtml()` в `index.html`: показывает домен второго уровня, поддерживает несколько ссылок через `;` |
| Окно полноэкранного просмотра фото (`openFullPhoto`) | `buildLinksHtml()` в `foto.js`: аналогично — домен второго уровня, поддержка `;` |

Формат: `https://example.com/path;https://other.org/page` → отображается как `example.com other.org`.

---

## Итоговая таблица: все поля с двойной поддержкой (`поле` и `поле_`)

| Поле | Лист | Логическая роль |
|------|------|----------------|
| `idA` / `idA_` | все листы | Первичный ключ / имя файла |
| `label` / `label_` | `person` | Отображаемое имя |
| `sex` / `sex_` | `person` | Пол |
| `surName2` / `surName2_` | `person` | Второй вариант фамилии |
| `hasFather` / `hasFather_` | `person` | Ссылка на отца |
| `hasMother` / `hasMother_` | `person` | Ссылка на мать |
| `birth` / `birth_` | `person` | Год рождения |
| `death` / `death_` | `person` | Год смерти |
| `husband` / `husband_` | `family` | Ссылка на мужа |
| `wife` / `wife_` | `family` | Ссылка на жену |
| `marriage` / `marriage_` | `family` | Дата свадьбы |
| `suffix` / `suffix_` | все `foto_*` | Суффикс для `idA` |
| `extension` / `extension_` | все `foto_*` | Расширение файла |
| `id_person` / `id_person_` | `foto_person`, `foto_item`, `foto_event` | Привязка к персоне |
| `id_personAll` / `id_personAll_` | `foto_family`, `foto_group`, `foto_location`, `foto_item`, `foto_event` | Привязка к списку персон |
| `id_family` / `id_family_` | `foto_family` | Привязка к семье |
| `id_familyAll` / `id_familyAll_` | `foto_location` | Привязка к списку семей |
| `id_loc` / `id_loc_` | `foto_location` | Идентификатор локации |
