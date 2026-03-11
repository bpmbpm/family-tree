### Верcия 5
Добавлен treeview
Один код для двух режимов: github pages (иной статический web - server) и локальный (desktop)
### run github
- github pages https://bpmbpm.github.io/family-tree/ver5/index.html  

### run desktop
- скачать файлы, например, архивом по кнопке zip (вначале запустить run github). Распоковать и запустить index.html
"Ошибка загрузки: Failed to fetch" - не обращать внимание и нажать "Выбрать файл" и указать tree.xlsx
- для теста папок с фото использовать service_foto_desktop.html (не service_foto_github_v2.html)

### info
- Инструкция пользователя https://github.com/bpmbpm/family-tree/blob/main/ver3/doc/user_manual_v1.md
- Взаимосвязь полей Excel и папок проекта (v1) https://github.com/bpmbpm/family-tree/blob/main/design/relationship_between_fields_and_folders_v1.md
- Предлагаемые новые функции (v1) https://github.com/bpmbpm/family-tree/blob/main/design/prototype/new_v1.md
- Пример автозаполнения родословной известных персон https://github.com/bpmbpm/family-tree/issues/74
### service
#### 1 service_foto_folder
- .io: https://bpmbpm.github.io/family-tree/ver5/service_foto_github_v2.html решение см. https://github.com/bpmbpm/family-tree/pull/63
  - old https://bpmbpm.github.io/family-tree/ver2/service_foto_github.html
- https://bpmbpm.github.io/family-tree/ver5/service_foto_desktop.html

#### 2 service_minifoto_edit
- https://github.com/bpmbpm/family-tree/tree/main/services/minifoto см. https://github.com/bpmbpm/family-tree/pull/65
- .io: https://bpmbpm.github.io/family-tree/services/minifoto/minifoto_v1.html
#### 3 test tree
- https://github.com/bpmbpm/family-tree/blob/main/ver4/test_tree_v1.html см. https://github.com/bpmbpm/family-tree/issues/82
- .io: https://bpmbpm.github.io/family-tree/ver4/test_tree_v1.html
### related projects
- https://github.com/bpmbpm/rdf-grapher/tree/main/ver9d https://bpmbpm.github.io/rdf-grapher/ver9d/
- https://github.com/bpmbpm/graphviz-online/tree/main/ver1

### problem
- при скачивании по zip разархивировать в папку без пробелов
- ранее:
из - за того, что в dot в имени кластера можно только буквы, цифры и дефис (тире нельзя), то в именах семей заменил разделитель с - (дефис) на _   
см. https://github.com/bpmbpm/family-tree/blob/main/ver3/doc/issue_doc_v1.md   
в названии проектов github - наоборот - вместо нижнего подчеркивания указыватьтире (-)
