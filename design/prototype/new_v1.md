# Предлагаемые новые функции (v1)

В этом документе перечислены функции, характерные для классических программ семейного дерева, которые отсутствуют в текущей версии проекта и которые можно добавить.

Ссылки на реальные прототипы и существующие реализации приведены для каждой функции.

---

## 1. Поиск и фильтрация по имени

**Описание:** Поле быстрого поиска по имени персоны. При вводе текста дерево фильтруется или подсвечиваются соответствующие узлы.

**Есть в классических программах:** MyHeritage, Ancestry, Geneanet, Gramps.

**Прототипы:**
- [genealogy (MGeurts)](https://github.com/MGeurts/genealogy/) — поиск реализован через фильтрацию в таблице ([демо](https://genealogy.kreaweb.be/))
- [react-family-tree](https://github.com/SanichKotikov/react-family-tree) — [демо](https://sanichkotikov.github.io/react-family-tree-example/) с центрированием на выбранной персоне
- [balkan.app FamilyTree](https://balkan.app/OrgChartJS-Demos/FamilyTree) — встроенный поиск с подсветкой совпадений

---

## 2. Экспорт в PDF / печать

**Описание:** Сохранение дерева в виде PDF-документа или изображения (PNG, SVG). Позволяет пользователям распечатать дерево или поделиться им.

**Есть в классических программах:** FamilyTreeMaker, MacFamilyTree, Legacy Family Tree.

**Прототипы:**
- [balkan.app FamilyTree](https://balkan.app/OrgChartJS-Demos/FamilyTree) — поддерживает экспорт в PDF, PNG, SVG через встроенное API ([документация](https://balkan.app/FamilyTreeJS/Docs/Api))
- [Gramps](https://gramps-project.org/) — экспорт в PDF, SVG, PNG ([исходный код](https://github.com/gramps-project/gramps))

---

## 3. Временная шкала (Timeline)

**Описание:** Интерактивная хронологическая ось с событиями (рождения, свадьбы, смерти) всех персон или выбранной ветви.

**Есть в классических программах:** Ancestry, Geneanet, MacFamilyTree.

**Прототипы:**
- [genealogy (MGeurts)](https://github.com/MGeurts/genealogy/) — отдельная страница «Timeline» на основе dates из таблицы ([демо](https://genealogy.kreaweb.be/))
- [vis-timeline](https://github.com/visjs/vis-timeline) — open-source библиотека временных шкал, используется во многих genealogy-проектах ([демо](https://visjs.github.io/vis-timeline/examples/timeline/))
- [TimelineJS](https://github.com/NUKnightLab/TimelineJS3) — известная библиотека для временных шкал с медиа ([демо](https://timeline.knightlab.com/))

---

## 4. Карта мест (Geographic Map)

**Описание:** Показ мест рождения, смерти, венчания и проживания персон на интерактивной карте. Каждое место — кликабельная точка, показывающая связанных людей.

**Есть в классических программах:** Geneanet, Gramps, MyHeritage.

**Прототипы:**
- [genealogy (MGeurts)](https://genealogy.kreaweb.be/) — карта мест с привязкой к событиям из БД
- [Gramps](https://gramps-project.org/) — полная поддержка геолокаций для всех событий ([исходный код](https://github.com/gramps-project/gramps))
- [Leaflet.js](https://github.com/Leaflet/Leaflet) — основная open-source библиотека для интерактивных карт, используется в genealogy-проектах ([демо](https://leafletjs.com/examples/quick-start/))

---

## 5. Карточка персоны (Person Profile)

**Описание:** Расширенная карточка с историей жизни, всеми событиями, фотографиями, ссылками и хронологией для отдельной персоны. Открывается в отдельной вкладке или боковой панели.

**Есть в классических программах:** Ancestry, MyHeritage, Geneanet.

**Прототипы:**
- [genealogy (MGeurts)](https://github.com/MGeurts/genealogy/) — страница `/persons/{id}` с полным профилем ([демо](https://genealogy.kreaweb.be/))
- [family-tree (yoosername)](https://github.com/yoosername/family-tree) — показывает полные данные персоны
- [Gramps Web](https://www.grampsweb.org/) — веб-интерфейс с детальными карточками персон ([исходный код](https://github.com/gramps-project/gramps-web))

---

## 6. Родственные связи между персонами (Relationship Path)

**Описание:** Нахождение кратчайшего пути родства между двумя выбранными персонами (например: «Иван является правнуком Петра через...»).

**Есть в классических программах:** Ancestry, MyHeritage, Gramps.

**Прототипы:**
- [balkan.app FamilyTree](https://balkan.app/OrgChartJS-Demos/FamilyTree) — функция `path()` для построения цепочки между двумя узлами ([документация](https://balkan.app/FamilyTreeJS/Docs/Api))
- [react-family-tree](https://github.com/SanichKotikov/react-family-tree) — поддерживает расчёт путей через данные связей ([демо](https://sanichkotikov.github.io/react-family-tree-example/))

---

## 7. Статистика и аналитика

**Описание:** Автоматическое вычисление статистики: средний возраст, наиболее распространённые имена, распределение по годам рождения, количество поколений, крупнейшие ветви.

**Есть в классических программах:** Gramps, MacFamilyTree, FamilyTreeMaker.

**Прототипы:**
- [Gramps](https://gramps-project.org/) — встроенные отчёты со статистикой ([документация](https://gramps-project.org/wiki/index.php/Gramps_5.1_Wiki_Manual_-_Reports))
- [genealogy (MGeurts)](https://genealogy.kreaweb.be/) — страница со статистическими показателями

---

## 8. Импорт/экспорт GEDCOM

**Описание:** Поддержка стандартного формата GEDCOM для обмена данными семейного дерева с другими программами (Ancestry, MyHeritage, FamilyTreeMaker).

**Есть в классических программах:** Практически во всех.

**Прототипы:**
- [gedcomx-js](https://github.com/rootsdev/gedcomx-js) — JavaScript-библиотека для работы с GEDCOM X ([npm](https://www.npmjs.com/package/gedcomx-js))
- [parse-gedcom](https://github.com/nicktindall/gedcom-parser) — парсер GEDCOM на JavaScript
- [Gramps](https://github.com/gramps-project/gramps) — эталонная реализация импорта/экспорта GEDCOM

---

## 9. Многоязычный интерфейс (расширение)

**Описание:** Добавление новых языков в существующую систему `language`-листа Excel. Поддержка переключения языка на лету без перезагрузки страницы.

**В текущей реализации:** Уже есть база (`ru`, `en`, `name`). Нужно добавить UI-переключатель и поддержку большего числа языков.

**Прототипы:**
- [genealogy (MGeurts)](https://github.com/MGeurts/genealogy/) — поддержка нескольких языков через Laravel/Filament ([демо](https://genealogy.kreaweb.be/))
- [i18next](https://github.com/i18next/i18next) — популярная open-source библиотека интернационализации для JS ([документация](https://www.i18next.com/))

---

## 10. Совместное редактирование и комментарии

**Описание:** Возможность для нескольких пользователей оставлять комментарии к персонам и событиям, предлагать правки через pull request или форму обратной связи.

**Есть в классических программах:** MyHeritage, Geni, WikiTree.

**Прототипы:**
- [WikiTree](https://www.wikitree.com/) — открытое совместное редактирование ([GitHub Actions для интеграции](https://github.com/wikitree))
- [Geni](https://www.geni.com/) — world family tree с совместным редактированием
- [Gramps Web](https://www.grampsweb.org/) — REST API + роли пользователей ([исходный код](https://github.com/gramps-project/gramps-web))

---

## Сравнительная таблица

| Функция | Текущий проект | MyHeritage | Ancestry | Gramps | genealogy (MGeurts) | balkan.app |
|---------|---------------|-----------|---------|--------|---------------------|-----------|
| Поиск по имени | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Экспорт PDF/PNG | — | ✓ | ✓ | ✓ | — | ✓ |
| Временная шкала | — | ✓ | ✓ | ✓ | ✓ | — |
| Карта мест | — | ✓ | ✓ | ✓ | ✓ | — |
| Карточка персоны | частично | ✓ | ✓ | ✓ | ✓ | ✓ |
| Путь родства | — | ✓ | ✓ | ✓ | — | ✓ |
| Статистика | — | ✓ | ✓ | ✓ | ✓ | — |
| GEDCOM | — | ✓ | ✓ | ✓ | ✓ | — |
| Многоязычность | частично (ru/en) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Совместное редактирование | — | ✓ | ✓ | частично | — | — |
