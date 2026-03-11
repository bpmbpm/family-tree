// phototree.js — Панель дерева Фото (PhotoTreeView) для семейного древа (ver4)
// Отображает иерархию фотографий по папкам: foto_person, foto_family, foto_group, foto_location.
// Каждая папка содержит элементы сгруппированные по suffix/suffix_, а затем список idA (имён файлов).

(function () {

    // =====================================================================
    // Состояние модуля
    // =====================================================================

    // Карта данных фотографий: имя листа -> массив записей
    // Поддерживает произвольный набор листов из константы foto_sheets
    var fotoDataMap = {};

    // =====================================================================
    // Построение дерева фото
    // =====================================================================

    // --- Построить карту: suffix -> [записи] для данного типа фото ---
    function buildSuffixMap(fotoRows, suffixField) {
        var suffixMap = {}; // suffix -> [row, ...]

        for (var i = 0; i < fotoRows.length; i++) {
            var row = fotoRows[i];
            var suffix = row[suffixField] || row['suffix'] || row['suffix_'] || 'без_суффикса';
            suffix = suffix.toString().trim();
            if (!suffix) suffix = 'без_суффикса';

            if (!suffixMap[suffix]) {
                suffixMap[suffix] = [];
            }
            suffixMap[suffix].push(row);
        }

        return suffixMap;
    }

    // --- Вычислить idA для записи (если не заполнен) ---
    function computeIdA(row, idField, suffixField) {
        if (row.idA && !row.idA.toString().startsWith('=')) {
            return row.idA.toString().trim();
        }
        // Вычисляем idA: id_* + '-' + suffix + '.' + extension
        var idVal = row[idField] || '';
        var suffix = row[suffixField] || row['suffix'] || row['suffix_'] || '';
        var ext = row['extension'] || 'jpg';
        if (idVal && suffix && ext) {
            return idVal.toString().trim() + '-' + suffix.toString().trim() + '.' + ext.toString().trim();
        }
        return idVal.toString().trim() || '(без имени)';
    }

    // --- Построить DOM-дерево для одной папки фото ---
    // fotoType: 'foto_person', 'foto_family', 'foto_group', 'foto_location'
    // fotoRows: массив записей
    // idField: поле идентификатора ('id_person', 'id_family', 'id_person', 'id_loc')
    // suffixField: поле суффикса ('suffix' или 'suffix_')
    function buildFotoFolderDom(fotoType, fotoRows, idField, suffixField) {
        var li = document.createElement('li');
        li.className = 'pt-item';

        var row = document.createElement('div');
        row.className = 'pt-row';
        row.setAttribute('data-folder', fotoType);

        // Иконка раскрытия
        var toggleIcon = document.createElement('span');
        toggleIcon.className = 'pt-toggle';
        toggleIcon.textContent = '▶';
        toggleIcon.title = 'Развернуть / свернуть';
        row.appendChild(toggleIcon);

        // Иконка папки
        var folderIcon = document.createElement('span');
        folderIcon.className = 'pt-folder-icon';
        folderIcon.textContent = '📁';
        row.appendChild(folderIcon);

        // Название папки
        var label = document.createElement('span');
        label.className = 'pt-label';
        label.textContent = fotoType;
        label.title = fotoType;
        row.appendChild(label);

        li.appendChild(row);

        // Дети: группировка по suffix
        var suffixMap = buildSuffixMap(fotoRows, suffixField);
        var suffixes = Object.keys(suffixMap).sort();

        var ul = document.createElement('ul');
        ul.className = 'pt-children pt-collapsed';

        for (var si = 0; si < suffixes.length; si++) {
            var suffix = suffixes[si];
            var suffixLi = buildSuffixFolderDom(suffix, suffixMap[suffix], fotoType, idField, suffixField);
            ul.appendChild(suffixLi);
        }

        li.appendChild(ul);

        // Обработчик раскрытия/сворачивания
        (function (icon, childList) {
            icon.addEventListener('click', function (event) {
                event.stopPropagation();
                ptToggleNode(icon, childList);
            });
        })(toggleIcon, ul);

        return li;
    }

    // --- Построить DOM для папки суффикса ---
    function buildSuffixFolderDom(suffix, rows, fotoType, idField, suffixField) {
        var li = document.createElement('li');
        li.className = 'pt-item';

        var row = document.createElement('div');
        row.className = 'pt-row';
        row.setAttribute('data-suffix', suffix);

        // Иконка раскрытия
        var toggleIcon = document.createElement('span');
        toggleIcon.className = 'pt-toggle';
        if (rows.length > 0) {
            toggleIcon.textContent = '▶';
            toggleIcon.title = 'Развернуть / свернуть';
        } else {
            toggleIcon.textContent = ' ';
            toggleIcon.className = 'pt-toggle pt-toggle-empty';
        }
        row.appendChild(toggleIcon);

        // Иконка папки суффикса
        var folderIcon = document.createElement('span');
        folderIcon.className = 'pt-folder-icon';
        folderIcon.textContent = '📂';
        row.appendChild(folderIcon);

        // Название суффикса
        var label = document.createElement('span');
        label.className = 'pt-label';
        label.textContent = suffix + ' (' + rows.length + ')';
        label.title = suffix;
        row.appendChild(label);

        li.appendChild(row);

        // Дети: список файлов
        if (rows.length > 0) {
            var ul = document.createElement('ul');
            ul.className = 'pt-children pt-collapsed';

            for (var i = 0; i < rows.length; i++) {
                var fileLi = buildFileDom(rows[i], fotoType, idField, suffixField);
                ul.appendChild(fileLi);
            }

            li.appendChild(ul);

            // Обработчик раскрытия/сворачивания
            (function (icon, childList) {
                icon.addEventListener('click', function (event) {
                    event.stopPropagation();
                    ptToggleNode(icon, childList);
                });
            })(toggleIcon, ul);
        }

        return li;
    }

    // --- Построить DOM для файла фото ---
    function buildFileDom(fotoRow, fotoType, idField, suffixField) {
        var li = document.createElement('li');
        li.className = 'pt-item';

        var row = document.createElement('div');
        row.className = 'pt-row';

        var idA = computeIdA(fotoRow, idField, suffixField);
        row.setAttribute('data-ida', idA);
        row.setAttribute('data-fototype', fotoType);

        // Пустая иконка (нет детей)
        var toggleIcon = document.createElement('span');
        toggleIcon.className = 'pt-toggle pt-toggle-empty';
        toggleIcon.textContent = ' ';
        row.appendChild(toggleIcon);

        // Иконка файла
        var fileIcon = document.createElement('span');
        fileIcon.className = 'pt-file-icon';
        fileIcon.textContent = '🖼️';
        row.appendChild(fileIcon);

        // Название файла
        var label = document.createElement('span');
        label.className = 'pt-label';
        // Отображаем краткое имя (idA или title_)
        var displayName = fotoRow['title_'] || idA;
        if (displayName.length > 30) {
            displayName = displayName.substring(0, 28) + '…';
        }
        label.textContent = displayName;
        label.title = idA;
        row.appendChild(label);

        li.appendChild(row);

        // Обработчик клика — открыть галерею для этого фото
        (function (fRow, ft, ida) {
            label.addEventListener('click', function (event) {
                event.stopPropagation();
                openPhotoGallery(ft, fRow, ida);
            });
        })(fotoRow, fotoType, idA);

        return li;
    }

    // --- Раскрыть/свернуть узел ---
    function ptToggleNode(icon, childList) {
        if (childList.classList.contains('pt-collapsed')) {
            childList.classList.remove('pt-collapsed');
            icon.textContent = '▼';
        } else {
            childList.classList.add('pt-collapsed');
            icon.textContent = '▶';
        }
    }

    // =====================================================================
    // Открытие галереи фото
    // =====================================================================

    // --- Открыть галерею для конкретного фото ---
    function openPhotoGallery(fotoType, fotoRow, idA) {
        // Используем универсальную функцию showSinglePhotoGallery из foto.js
        if (window.FOTO && window.FOTO.showSinglePhotoGallery) {
            window.FOTO.showSinglePhotoGallery(idA, [fotoRow], fotoType);
        } else {
            // Fallback: показать alert
            alert('Фото: ' + idA + '\nТип: ' + fotoType);
        }
    }

    // =====================================================================
    // Отображение и обновление дерева
    // =====================================================================

    // --- Определить поля идентификатора и суффикса для типа фото ---
    // Возвращает { idField, suffixField } по имени листа фото
    function getFotoFieldNames(fotoType) {
        if (fotoType === 'foto_family') return { idField: 'id_family', suffixField: 'suffix_' };
        if (fotoType === 'foto_location') return { idField: 'id_loc', suffixField: 'suffix' };
        // foto_person, foto_group, foto_item, foto_event и прочие — id_person и suffix
        return { idField: 'id_person', suffixField: 'suffix' };
    }

    // --- Отрисовать дерево фото в панели ---
    function renderPhotoTreeView() {
        var container = document.getElementById('pt-content');
        if (!container) return;
        container.innerHTML = '';

        // Получаем список листов фото из конфига (или используем стандартный набор)
        var fotoSheets = (window.CONFIG && Array.isArray(window.CONFIG.foto_sheets))
            ? window.CONFIG.foto_sheets
            : ['foto_person', 'foto_family', 'foto_group', 'foto_location'];

        var hasData = false;
        for (var si = 0; si < fotoSheets.length; si++) {
            var sheetName = fotoSheets[si];
            if (fotoDataMap[sheetName] && fotoDataMap[sheetName].length > 0) {
                hasData = true;
                break;
            }
        }

        if (!hasData) {
            container.innerHTML = '<div class="tv-empty">Загрузите данные</div>';
            return;
        }

        var ul = document.createElement('ul');
        ul.className = 'pt-root-list';

        // Добавляем папку для каждого листа из foto_sheets (если есть данные)
        for (var fi = 0; fi < fotoSheets.length; fi++) {
            var ft = fotoSheets[fi];
            var rows = fotoDataMap[ft] || [];
            if (rows.length > 0) {
                var fields = getFotoFieldNames(ft);
                var fLi = buildFotoFolderDom(ft, rows, fields.idField, fields.suffixField);
                ul.appendChild(fLi);
            }
        }

        container.appendChild(ul);
    }

    // =====================================================================
    // Кнопки управления
    // =====================================================================

    // --- Кнопка Home — свернуть дерево фото ---
    window.ptHome = function () {
        var allChildrenUl = document.querySelectorAll('#pt-content ul.pt-children');
        for (var i = 0; i < allChildrenUl.length; i++) {
            allChildrenUl[i].classList.add('pt-collapsed');
        }

        var allToggles = document.querySelectorAll('#pt-content .pt-toggle:not(.pt-toggle-empty)');
        for (var j = 0; j < allToggles.length; j++) {
            allToggles[j].textContent = '▶';
        }
    };

    // --- Кнопка «Раскрыть всё» ---
    window.ptExpandAll = function () {
        var allChildrenUl = document.querySelectorAll('#pt-content ul.pt-children');
        for (var i = 0; i < allChildrenUl.length; i++) {
            allChildrenUl[i].classList.remove('pt-collapsed');
        }

        var allToggles = document.querySelectorAll('#pt-content .pt-toggle:not(.pt-toggle-empty)');
        for (var j = 0; j < allToggles.length; j++) {
            allToggles[j].textContent = '▼';
        }
    };

    // =====================================================================
    // Инициализация: вызывается из index.html после загрузки данных
    // =====================================================================

    // --- Инициализировать phototree с данными фото ---
    // Принимает карту { имя_листа: массив_записей } или (для обратной совместимости)
    // отдельные аргументы: (fotoPersonRows, fotoFamilyRows, fotoGroupRows, fotoLocationRows)
    window.ptInit = function (firstArg, fotoFamilyRows, fotoGroupRows, fotoLocationRows) {
        if (firstArg && typeof firstArg === 'object' && !Array.isArray(firstArg)) {
            // Новый формат: карта листов
            fotoDataMap = firstArg;
        } else {
            // Старый формат: отдельные аргументы (для обратной совместимости)
            fotoDataMap = {};
            if (firstArg) fotoDataMap['foto_person'] = firstArg;
            if (fotoFamilyRows) fotoDataMap['foto_family'] = fotoFamilyRows;
            if (fotoGroupRows) fotoDataMap['foto_group'] = fotoGroupRows;
            if (fotoLocationRows) fotoDataMap['foto_location'] = fotoLocationRows;
        }

        renderPhotoTreeView();
    };

})();
