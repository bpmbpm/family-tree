## problem
### 1 GraphvizOnlin  
dreampuf.github.io/GraphvizOnline не понимает  
`image=  `  
УЖАС, см.  https://github.com/bpmbpm/family-tree/blob/main/ver1/readme.md#graphvizonline  
Нужно поискать другой или сделать свой.

### GraphvizOnline vs foto
https://github.com/bpmbpm/family-tree/pull/30

3. Анализ проблем с фото в GraphvizOnline 🔍
Провёл детальное исследование проблемы. Вывод: это ограничение самого сервиса GraphvizOnline , не нашего кода.

Что происходит:

Ульянов_Илья_Николаевич [..., image="https://bpmbpm.github.io/family-tree/ver1/pic/Ульянов_Илья_Николаевич.png", ...]
Даже с абсолютным URL-адресом фото не отображается на dreampuf.github.io/GraphvizOnline.

Причина: dreampuf.github.io/GraphvizOnline запускает Graphviz, скомпилированный в WebAssembly (WASM) прямо в браузере. Атрибут image=в Graphviz предназначен для чтения файлов с файловой системы , а не для загрузки по HTTP. WASM-версия Graphviz имеет виртуальную файловую систему и не может загружать изображения по URL.


### 2 CORS
Старая проблема CORS (хотя были времена, когда ее не было и было "счастье").  
Понятно, что для чтения локального файла tree.xlsx нужно подтверждение, однако нужно было считывать еще и config.json  
Решение предложил в https://github.com/bpmbpm/family-tree/pull/36  - явно как сделать (переименовать в config.js, т.е. замаскироваить под js модуль)
Однако до этого в 10 issue наш Claude не понял решения проблемы.  
Какие еще есть решения?  Поместить config во внутрь модуля js с кодом - не рассматриваем.
