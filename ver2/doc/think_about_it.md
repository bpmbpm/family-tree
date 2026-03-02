## think about it

1 см. https://github.com/bpmbpm/family-tree/pull/40
## Технические детали

- **SVG pointer-events fix**: белый фоновый `polygon` Graphviz (`#graph0`) перехватывал клики. Установлен `pointer-events: none` через JS после рендеринга SVG.
- **Парсинг `_`-полей**: при чтении Excel автоматически собираются все колонки с суффиксом `_` в `extraFields` — без хардкода имён полей.
- **Клик по кластеру**: используется индекс кластера из `cluster_marriage_N` для поиска объекта `marriages[N]`.

2 папки с фото зашиты в коде, но можно их добавить в config.js по аналогии с pic. Или считывать как название листа в excel.

