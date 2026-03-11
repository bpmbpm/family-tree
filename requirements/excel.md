## lists
### person list
- hyperLink содержит перечень URL, которые открываются из окна Основные свойства person.  
Разделитеь ; и пробел перед ним (иначе ; будет восприниматься частью адреса)  
При этом в Основные свойства person отображается адрес домена второго порядка.

Карточки (свойства объектов). Типы объектов:
- Person (персона, лист person) 
  - Основные свойства person
  - Все свойства person
 
Family (семейная пара, лист family) 
- Кластер пара
  - Основные свойства family
  - Все свойства family

### foto folders
- foto
  - foto_person по id 
  - foto_family по id, потом можно указать в одной ячейке всех персон (или делать отдельные строки? для каждой персоны для конкретной фото). Правило: фото попадает в семью с максимальным предком, если на ней два равноправных предка, то храним в foto_group.  
  - foto_group для каждой персоны своя строка. В качестве id - наиболее главный персонаж. Далее каждая строка по персонажу.
 
- foto location места, местоположения, объекты, животные и т.п. привязка к событиям

### link
Абсолючные на md:
- `https://github.com/bpmbpm/family-tree/blob/main/ver5/md_person/` - markdown
- `https://bpmbpm.github.io/family-tree/ver5/md_person/` - txt 

Относительные на md: 
- если задать /md_person/ххх, то подставится:  
https://bpmbpm.github.io/md_person/%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%B8%D0%BD_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9_%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%B8%D1%87.md
- нужно через ./ т.е.: https://bpmbpm.github.io/family-tree/ver5/md_person/%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%B8%D0%BD_%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9_%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%B8%D1%87.md но будет также txt
  
Вывод - нужен встроенный viewer markdown?
