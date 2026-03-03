## problem
https://github.com/bpmbpm/family-tree/pull/59  
Основная причина: SheetJS не обрабатывает формулы Excel. idAСтолбец во всех листах с фотографиями ( foto_person, foto_family, foto_group, foto_location) заполняется формулой из Excel (например, =id_person&"-"&suffix&"."&extension), но SheetJS считывает её как пустую строку. В результате фильтр галереи row.idAвсегда давал ложное значение, поэтому фотографии не находились.

Странно =- ведь ранее работало
