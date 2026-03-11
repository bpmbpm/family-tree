// config.js — параметры семейного дерева (аналог config.json, но в формате JS).
// Загружается через <script src="config.js"> в index.html, что позволяет
// читать настройки через file:// без ошибок CORS.
//
// Переменная window.CONFIG доступна глобально и читается в loadConfig() из index.html.
// Если этот файл отсутствует, используются значения по умолчанию из index.html.

window.CONFIG = {
    "width": 1.1,
    "height": 1.9,
    "fontname": "Arial",
    "fontsize": 11,
    "fontsizeSurName2": 9.9,
    "maleColor": "lightsteelblue",
    "femaleColor": "lightpink",
    "unknownColor": "lightgrey",
    "borderColor": "darkslategray",
    "edgeColor": "slategray",
    "picDir": "pic",
    "picDirType": "relativeGraphvizOnline",
    "picDirGlobal": "",
    "picDirGraphvizOnline": "https://bpmbpm.github.io/family-tree/ver4/pic",
    "graphvizOnlineType": "https://bpmbpm.github.io/graphviz-online/ver1/index.html",
    "language": "ru",
    "foto_sheets": ["foto_person", "foto_family", "foto_group", "foto_location", "foto_item", "foto_event"],
    "fileZIP": [
        "index.html",
        "styles.css",
        "config.js",
        "config.txt",
        "foto.js",
        "treeview.js",
        "phototree.js",
        "save.js",
        "service_foto_desktop.html",
        "service_foto_github_v2.html",
        "test_tree_v1.html",
        "tree.xlsx",
        "pic",
        "foto_person",
        "foto_family",
        "foto_group",
        "foto_location",
        "foto_item",
        "foto_event",
        "album"
    ]
};
