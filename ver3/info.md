## config
### path
config.js
```
"picDirGraphvizOnline":
```
### service_foto_github
Учитывать настройку путей в service_foto_github_v2.html см. https://github.com/bpmbpm/family-tree/pull/67

Настройки в формате JSON (укажите список листов и параметры GitHub-репозитория):
```
    <textarea id="configJson" rows="10">
{
    "excelFile": "tree.xlsx",
    "sheets": ["foto_person", "foto_family", "foto_group", "foto_location"],
    "githubRepo": "bpmbpm/family-tree",
    "githubBranch": "main",
    "githubBasePath": "ver3"
}
```
