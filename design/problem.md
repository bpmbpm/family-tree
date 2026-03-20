## problem
### 1 GraphvizOnlin vs foto 
dreampuf.github.io/GraphvizOnline не понимает  
`image=  `  
УЖАС, см.  https://github.com/bpmbpm/family-tree/blob/main/ver1/readme.md#graphvizonline  
Нужно поискать другой или сделать свой.

### pull 30
https://github.com/bpmbpm/family-tree/pull/30

3. Анализ проблем с фото в GraphvizOnline 🔍
Провёл детальное исследование проблемы. Вывод: это ограничение самого сервиса GraphvizOnline , не нашего кода.

Что происходит:
```
Ульянов_Илья_Николаевич [..., image="https://bpmbpm.github.io/family-tree/ver1/pic/Ульянов_Илья_Николаевич.png", ...]
```
Даже с абсолютным URL-адресом фото не отображается на dreampuf.github.io/GraphvizOnline.

Причина: dreampuf.github.io/GraphvizOnline запускает Graphviz, скомпилированный в WebAssembly (WASM) прямо в браузере. Атрибут image=в Graphviz предназначен для чтения файлов с файловой системы , а не для загрузки по HTTP. WASM-версия Graphviz имеет виртуальную файловую систему и не может загружать изображения по URL.


### 2 CORS
Старая проблема CORS (хотя были времена, когда ее не было и было "счастье").  
Понятно, что для чтения локального файла tree.xlsx нужно подтверждение, однако нужно было считывать еще и config.json  
Решение предложил в https://github.com/bpmbpm/family-tree/pull/36  - явно как сделать (переименовать в config.js, т.е. замаскироваить под js модуль)
Однако до этого в 10 issue наш Claude не понял решения проблемы.  
Какие еще есть решения?  Поместить config во внутрь модуля js с кодом - не рассматриваем.

### 3 не забыть
1. Проблема пока не обрабатываются на листе event два последних поля. В Foto-list окна "События Person" иная обработка - хоорошо бы унифицировать.
2. В family нет Foto-list
3. https://github.com/bpmbpm/family-tree/blob/main/design/relationship_between_fields_and_folders_v1.md#2-addition
4. При распаковке файла zip папка не должна содержать пробелы

### иначе
- https://github.com/bpmbpm/family-tree/pull/99 требует заполнения файла list.md. Кнопка zip работает только в gitHub: с помощью API GitHub для перечисления содержимого папок. https://github.com/bpmbpm/family-tree/pull/101
```
githubBasePath: "ver4"
```
файл ver5/service_foto_github_v2.html  
всегда нужно отслеживать

При смене папки проекта (для работы online режима):  
- для кнопки zip:  
    "githubBasePath": "ver5",
  - плюс аналогично для service_foto_github_v2.html
- для online:  
      "picDirGraphvizOnline": "https://bpmbpm.github.io/family-tree/ver5/pic",     
см. https://github.com/bpmbpm/family-tree/pull/107    

### 4 info_excel
Вопросы ведения инфо в excel
1. Проблема валидации, например, можно через Проверка данных или VBA (расширение файла изменится), можно внешние. Например, лишний пробел в авто поле давт на конце _
2. Смена id персоны. Например, стало известно отчество и нужно сделать замену id (без отчества) на всех листах и также в именах файлов, включая фото и md (pdf). см. https://github.com/bpmbpm/family-tree/blob/main/introduction/excel_info_v1.md#verify 

### 5 foto folder
алгоритм определения - в какую папку foto_fam vs foto_group
### 6 md
Алгоритм с md файлами - как относительные пути через ./ например, 
`./md_person/Ульянин_Николай_Васильевич.md ; ./md_person/Ульянин_Николай_Васильевич.pdf` см. https://github.com/bpmbpm/family-tree/blob/main/ver5/tree.xlsx

### album
https://github.com/bpmbpm/family-tree/pull/123 не решена (открытие файлов в album в версии desktop), т.е.  
Файлы не найдены в папке album/  
https://github.com/bpmbpm/family-tree/blob/main/experiments/list.md#album-file 
