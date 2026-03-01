### Верcия 2
Добавлен просмотр фото
### run
- https://bpmbpm.github.io/family-tree/ver2/index.html

### dot
- https://graphviz.org/docs/attrs/image/
- [Как вывести многострочный текст в ноде Graphviz](https://ru.stackoverflow.com/questions/1130998/%D0%9A%D0%B0%D0%BA-%D0%B2%D1%8B%D0%B2%D0%B5%D1%81%D1%82%D0%B8-%D0%BC%D0%BD%D0%BE%D0%B3%D0%BE%D1%81%D1%82%D1%80%D0%BE%D1%87%D0%BD%D1%8B%D0%B9-%D1%82%D0%B5%D0%BA%D1%81%D1%82-%D0%B2-%D0%BD%D0%BE%D0%B4%D0%B5-graphviz)
- В Graphviz нет единого прямого атрибута "line-height", но межстрочный интервал (расстояние между строками текста) регулируется автоматически на основе размера шрифта (fontsize) и типа используемого шрифта. Для управления отступами внутри узлов используются атрибуты margin или height/width.  
Атрибут margin (внутри узла): Используется для отступа текста от границ узла, что косвенно меняет восприятие пространства.
`node [shape=box, margin="0.2,0.1"]; // 0.2 - отступ по горизонтали, 0.1 - по вертикали` См. https://github.com/bpmbpm/family-tree/pull/24
#### graphviz family tree
- https://graphviz.org/Gallery/directed/kennedyanc.html
- https://stackoverflow.com/questions/71571613/implement-family-tree-visualization-in-graphviz

### also
- https://bpmbpm.github.io/family-tree/ver1/test_pic1.html

### config
Настройки хранятся в `config.js` (рекомендуется) или `config.json`.

`config.js` загружается через `<script src="config.js">` и работает при открытии по `file://` без ошибок CORS.
Он экспортирует глобальную переменную `const CONFIG = { ... }` с теми же ключами, что и `config.json`.

`config.json` поддерживается как запасной вариант при работе через HTTP/HTTPS.

### doc
Чтобы использовать режим relativeGraphvizOnline (отображение мини-фотографий на https://dreampuf.github.io/GraphvizOnline/ ):
```
  "picDirType": "relativeGraphvizOnline",
  "picDirGraphvizOnline": "https://bpmbpm.github.io/family-tree/ver1/pic"
```

"picDirType":
```
"relative" — HTTP-server, no GraphvizOnline photo support
"relativeGraphvizOnline" — HTTP-server with absolute URLs for GraphvizOnline DOT code
"global" — local file:// mode with absolute path
```
###  GraphvizOnline
Проблему с GraphvizOnline см. https://github.com/bpmbpm/family-tree/pull/30  
Причина: dreampuf.github.io/GraphvizOnline запускает Graphviz, скомпилированный в WebAssembly (WASM) прямо в браузере. Атрибут image= в Graphviz предназначен для чтения файлов с файловой системы, а не для загрузки по HTTP. WASM-версия Graphviz имеет виртуальную файловую систему и не может загружать изображения по URL.


