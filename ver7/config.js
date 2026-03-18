// config.js — параметры семейного дерева (аналог config.json, но в формате JS).
// Загружается через <script src="config.js"> в index.html, что позволяет
// читать настройки через file:// без ошибок CORS.
//
// Переменная window.CONFIG доступна глобально и читается в loadConfig() из index.html.
// Если этот файл отсутствует, используются значения по умолчанию из index.html.
//
// Параметры для кнопки zip (необязательны при использовании на GitHub Pages):
//   githubRepo      — репозиторий GitHub в формате "owner/repo" (например, "bpmbpm/family-tree")
//   githubBranch    — ветка (по умолчанию "main")
//   githubBasePath  — путь к папке проекта в репозитории (например, "ver5")
// Если githubRepo не задан, параметры определяются автоматически из URL GitHub Pages.
// Кнопка zipDesktop работает в локальном режиме (file://) — пользователь выбирает папку.

window.CONFIG = {
    "githubRepo": "bpmbpm/family-tree",
    "githubBranch": "main",
    "githubBasePath": "ver7",
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
    "picDirGraphvizOnline": "https://bpmbpm.github.io/family-tree/ver7/pic",
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
        "md_person",
        "md_location",
        "album"
    ]
};
