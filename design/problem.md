## problem
### 1 GraphvizOnlin  
dreampuf.github.io/GraphvizOnline не понимает  
`image=  `  
УЖАС, см.  https://github.com/bpmbpm/family-tree/blob/main/ver1/readme.md#graphvizonline  
Нужно поискать другой или сделать свой.

### 2 CORS
Старая проблема CORS (хотя были времена, когда ее не было и было "счастье").  
Понятно, что для чтения локального файла tree.xlsx нужно подтверждение, однако нужно было считывать еще и config.json  
Решение предложил в https://github.com/bpmbpm/family-tree/pull/36  - явно как сделать (переименовать в config.js, т.е. замаскироваить под js модуль)
Однако до этого в 10 issue наш Claude не понял решения проблемы.  
Какие еще есть решения?  Поместить config во внутрь модуля js с кодом - не рассматриваем.
