// foto.js — логика работы с фотогалереями семей, персон и групп.
// Подключается через <script src="foto.js"> в index.html.
// Работает как по протоколу file://, так и через HTTP/HTTPS (GitHub Pages).
//
// Экспортируемые функции (доступны через объект window.FOTO):
//   FOTO.showFamilyGallery(familyIdA, fotoFamilyRows, fotoFamilyDir)
//     — открывает окно галереи фотографий для указанной семьи.
//   FOTO.showFamilyGalleryForPerson(personIdA, fotoFamilyRows, fotoFamilyDir)
//     — открывает окно галереи семейных фотографий, в которых присутствует персона.
//     Поле id_personAll содержит перечень idA через ';' (пробелы вокруг ';' допустимы).
//   FOTO.showPersonGallery(personIdA, fotoPersonRows, fotoPersonDir)
//     — открывает окно галереи фотографий для указанной персоны.
//   FOTO.showGroupGallery(personIdA, fotoGroupRows, fotoGroupDir)
//     — открывает окно галереи групповых фотографий, в которых присутствует персона.
//     Поле id_personAll содержит перечень idA через ';' (пробелы вокруг ';' допустимы).
//   FOTO.showLocationPersonGallery(personIdA, fotoLocationRows, fotoLocationDir)
//     — открывает окно галереи фотографий мест для указанной персоны.
//     Поле id_personAll содержит перечень idA через ';' (пробелы вокруг ';' допустимы).
//   FOTO.showLocationFamilyGallery(familyIdA, fotoLocationRows, fotoLocationDir)
//     — открывает окно галереи фотографий мест для указанной семьи.
//     Поле id_familyAll содержит перечень idA через ';' (пробелы вокруг ';' допустимы).
//   FOTO.showEventFotoGallery(galleryKey, fotoRows, fotoDir, headerTitle)
//     — открывает окно галереи фотографий для выбранного типа из панели событий.
//     fotoRows — массив объектов { idA, ...поля с суффиксом _ }, собранных из строк листа event.
//
// Поля foto_family/foto_person/foto_group/foto_location, отображаемые в окне галереи (суффикс _):
//   title_, location_, date_, person_label_, hyperLink_, suffix_
//
// Структура файла:
//   1. checkFotoExists(dir, filename)      — проверка существования файла (img/fetch)
//   2. openFullPhoto(src, title, fields, sheetName) — открытие фото в новом окне с описанием
//   3. buildGalleryWindow(entityIdA, photos, dir, headerTitle, sheetName) — построение окна галереи
//   4. showFamilyGalleryForPerson(...)     — точка входа: семейные фото по персоне (id_personAll)
//   5. showFamilyGallery(...)              — точка входа для семьи
//   6. showPersonGallery(...)              — точка входа для персоны
//   7. showGroupGallery(...)               — точка входа для групповых фото
//   8. showLocationPersonGallery(...)      — точка входа для фото мест (по персоне)
//   9. showLocationFamilyGallery(...)      — точка входа для фото мест (по семье)
//  10. showEventFotoGallery(...)           — точка входа для фото из событий

(function () {

    // --- Проверка существования файла фото ---
    // В режиме file:// используется <img>-элемент (fetch заблокирован браузером).
    // По HTTP/HTTPS используется fetch с методом HEAD.
    function checkFotoExists(dir, filename) {
        var filePath = dir + '/' + filename;
        var isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            return new Promise(function (resolve) {
                var img = new Image();
                img.onload = function () { resolve(true); };
                img.onerror = function () { resolve(false); };
                img.src = filePath;
            });
        }
        return fetch(filePath, { method: 'HEAD' })
            .then(function (resp) { return resp.ok; })
            .catch(function () { return false; });
    }

    // --- Открыть фото в полный размер в новом окне ---
    // src — путь к изображению
    // title — заголовок окна (idA фото)
    // fields — объект с полями с суффиксом _ для отображения описания
    // sheetName — (необязательно) имя листа Excel для перевода названий полей через getFieldLabel
    function openFullPhoto(src, title, fields, sheetName) {
        var newWin = window.open('', '_blank', 'width=900,height=700,resizable=yes,scrollbars=yes');
        if (!newWin) return;

        var fieldRows = '';
        var fieldNames = Object.keys(fields);
        for (var i = 0; i < fieldNames.length; i++) {
            var key = fieldNames[i];
            var val = fields[key];
            if (val === null || val === undefined || val === '') continue;
            // Используем getFieldLabel из index.html (если доступна), иначе — убрать суффикс _
            var label;
            if (sheetName && typeof window.getFieldLabel === 'function') {
                label = window.getFieldLabel(sheetName, key);
            } else {
                label = key.replace(/_$/, '');
            }
            var valHtml = String(val);
            // Если значение похоже на URL — делаем ссылку
            if (String(val).match(/^https?:\/\//)) {
                valHtml = '<a href="' + val + '" target="_blank" rel="noopener noreferrer">' + val + '</a>';
            }
            fieldRows += '<tr><td class="fd-label">' + label + '</td><td class="fd-value">' + valHtml + '</td></tr>';
        }

        var html = '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">' +
            '<title>' + (title || 'Фото') + '</title>' +
            '<style>' +
            'body { margin: 0; background: #222; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: Arial, sans-serif; }' +
            '.photo-title { color: #fff; padding: 12px 20px; font-size: 16px; font-weight: bold; width: 100%; box-sizing: border-box; background: #1a1a1a; text-align: center; }' +
            '.photo-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; }' +
            'img { max-width: 95vw; max-height: 70vh; border: 2px solid #555; border-radius: 4px; }' +
            '.photo-desc { background: #2a2a2a; color: #ddd; width: 100%; padding: 16px 24px; box-sizing: border-box; }' +
            'table { border-collapse: collapse; width: 100%; font-size: 13px; }' +
            '.fd-label { color: #aaa; padding: 3px 12px 3px 0; white-space: nowrap; vertical-align: top; }' +
            '.fd-value { color: #eee; padding: 3px 0; }' +
            '.fd-value a { color: #7cb9ff; }' +
            '</style></head><body>' +
            '<div class="photo-title">' + (title || '') + '</div>' +
            '<div class="photo-wrap"><img src="' + src + '" alt="' + (title || '') + '"></div>' +
            (fieldRows ? '<div class="photo-desc"><table>' + fieldRows + '</table></div>' : '') +
            '</body></html>';

        newWin.document.write(html);
        newWin.document.close();
    }

    // Хранилище данных фото для передачи через onclick без встраивания JSON в HTML-атрибуты
    var _photoStore = {};
    var _photoStoreCounter = 0;

    // --- Построить и показать окно галереи ---
    // entityIdA — idA сущности (семьи или персоны)
    // photos — массив записей foto_family/foto_person для данной сущности (уже отфильтрованный)
    // dir — относительный путь к папке фото (например 'foto_family' или 'foto_person')
    // headerTitle — заголовок окна (например 'foto_family' или 'foto_person')
    // sheetName — (необязательно) имя листа Excel для перевода названий полей в описании фото
    function buildGalleryWindow(entityIdA, photos, dir, headerTitle, sheetName) {
        // Удалить предыдущее окно галереи для этой сущности, если оно уже открыто
        var existingId = 'foto-gallery-' + entityIdA.replace(/[^a-zA-Z0-9_-]/g, '_');
        var existingWin = document.getElementById(existingId);
        if (existingWin) {
            existingWin.remove();
        }

        var container = document.getElementById('properties-panels-container');
        if (!container) return;

        var galleryId = existingId;

        // Положение окна
        var rightOffset = 60;
        var topOffset = 150;

        // Строим миниатюры
        var thumbsHtml = '';
        if (photos.length === 0) {
            thumbsHtml = '<div class="fg-empty">Фотографии не найдены</div>';
        } else {
            for (var i = 0; i < photos.length; i++) {
                var photo = photos[i];
                var src = dir + '/' + photo.idA;
                // Сохраняем данные фото в хранилище, чтобы не встраивать JSON в HTML-атрибут onclick
                var storeKey = 'p' + (++_photoStoreCounter);
                _photoStore[storeKey] = { idA: photo.idA, fields: photo.descFields, dir: dir, sheetName: sheetName };
                thumbsHtml +=
                    '<div class="fg-thumb" onclick="window.FOTO._openThumbPhoto(\'' + storeKey + '\')">' +
                    '<img src="' + src + '" alt="' + photo.idA + '" title="' + photo.idA + '">' +
                    '<div class="fg-thumb-label">' + (photo.descFields.title_ || photo.idA) + '</div>' +
                    '</div>';
            }
        }

        // Экранируем entityIdA для кнопки копирования
        var escapedEntityIdA = entityIdA.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        var panelHtml =
            '<div class="properties-panel visible fg-panel" id="' + galleryId + '" style="right: ' + rightOffset + 'px; top: ' + topOffset + 'px; min-width: 340px; max-width: 520px;">' +
            '<div class="properties-header" onmousedown="window.startDragPanel(event, \'' + galleryId + '\')">' +
            '<div class="properties-header-content">' +
            '<div class="properties-header-title">' + (headerTitle || 'foto') + '</div>' +
            '<div class="fg-family-id">' + entityIdA + '</div>' +
            '<button class="properties-copy-btn" onclick="event.stopPropagation(); window.copyObjectId(\'' + escapedEntityIdA + '\', this)">Копировать</button>' +
            '</div>' +
            '<button class="properties-close-btn" onclick="document.getElementById(\'' + galleryId + '\').remove()">&times;</button>' +
            '</div>' +
            '<div class="properties-content">' +
            '<div class="fg-thumbs-grid">' + thumbsHtml + '</div>' +
            '</div>' +
            '</div>';

        container.insertAdjacentHTML('beforeend', panelHtml);

        // Поднять панель наверх (через существующую функцию bringPanelToFront)
        var newPanel = document.getElementById(galleryId);
        if (newPanel && typeof window.bringPanelToFront === 'function') {
            window.bringPanelToFront(newPanel);
        }
    }

    // --- Вспомогательная функция для клика по миниатюре ---
    // Вызывается из onclick в HTML строке галереи.
    // storeKey — ключ в _photoStore с данными фото (idA, fields, dir, sheetName)
    function openThumbPhoto(storeKey) {
        var data = _photoStore[storeKey];
        if (!data) return;
        var src = data.dir + '/' + data.idA;
        openFullPhoto(src, data.idA, data.fields, data.sheetName);
    }

    // --- Основная точка входа: открыть галерею foto_family для персоны ---
    // personIdA — idA персоны (из листа person)
    // fotoFamilyRows — все строки листа foto_family (массив объектов, ключи — имена колонок)
    // fotoFamilyDir — путь к папке с фото (например 'foto_family')
    // Фото попадает в галерею, если personIdA встречается в поле id_personAll,
    // где перечень idA разделён ';' (пробелы вокруг разделителя допустимы).
    function showFamilyGalleryForPerson(personIdA, fotoFamilyRows, fotoFamilyDir) {
        if (!fotoFamilyDir) fotoFamilyDir = 'foto_family';

        // Отфильтровать строки, в которых personIdA присутствует в id_personAll
        var matchingRows = [];
        for (var i = 0; i < fotoFamilyRows.length; i++) {
            var row = fotoFamilyRows[i];
            if (!row.idA) continue;
            var idPersonAll = row.id_personAll || '';
            // Разбиваем по ';', убираем пробелы вокруг каждого элемента
            var ids = idPersonAll.split(';').map(function(s) { return s.trim(); });
            if (ids.indexOf(personIdA) !== -1) {
                matchingRows.push(row);
            }
        }

        // Подготовить данные для фото: отдельно хранить поля с суффиксом _
        var photos = [];
        for (var j = 0; j < matchingRows.length; j++) {
            var r = matchingRows[j];
            var descFields = {};
            var keys = Object.keys(r);
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (key.endsWith('_') && r[key] !== null && r[key] !== undefined && r[key] !== '') {
                    descFields[key] = r[key];
                }
            }
            photos.push({ idA: r.idA, descFields: descFields });
        }

        buildGalleryWindow(personIdA, photos, fotoFamilyDir, 'foto_family', 'foto_family');
    }

    // --- Основная точка входа: открыть галерею семьи ---
    // familyIdA — idA семьи
    // fotoFamilyRows — все строки листа foto_family (массив объектов, ключи — имена колонок)
    // fotoFamilyDir — путь к папке с фото (например 'foto_family')
    function showFamilyGallery(familyIdA, fotoFamilyRows, fotoFamilyDir) {
        if (!fotoFamilyDir) fotoFamilyDir = 'foto_family';

        // Отфильтровать строки по id_family == familyIdA
        var matchingRows = [];
        for (var i = 0; i < fotoFamilyRows.length; i++) {
            var row = fotoFamilyRows[i];
            if (row.id_family === familyIdA && row.idA) {
                matchingRows.push(row);
            }
        }

        // Подготовить данные для фото: отдельно хранить поля с суффиксом _
        var photos = [];
        for (var j = 0; j < matchingRows.length; j++) {
            var r = matchingRows[j];
            var descFields = {};
            var keys = Object.keys(r);
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (key.endsWith('_') && r[key] !== null && r[key] !== undefined && r[key] !== '') {
                    descFields[key] = r[key];
                }
            }
            photos.push({ idA: r.idA, descFields: descFields });
        }

        buildGalleryWindow(familyIdA, photos, fotoFamilyDir, 'foto_family', 'foto_family');
    }

    // --- Основная точка входа: открыть галерею персоны ---
    // personIdA — idA персоны
    // fotoPersonRows — все строки листа foto_person (массив объектов, ключи — имена колонок)
    // fotoPersonDir — путь к папке с фото (например 'foto_person')
    function showPersonGallery(personIdA, fotoPersonRows, fotoPersonDir) {
        if (!fotoPersonDir) fotoPersonDir = 'foto_person';

        // Отфильтровать строки по id_person == personIdA
        var matchingRows = [];
        for (var i = 0; i < fotoPersonRows.length; i++) {
            var row = fotoPersonRows[i];
            if (row.id_person === personIdA && row.idA) {
                matchingRows.push(row);
            }
        }

        // Подготовить данные для фото: отдельно хранить поля с суффиксом _
        var photos = [];
        for (var j = 0; j < matchingRows.length; j++) {
            var r = matchingRows[j];
            var descFields = {};
            var keys = Object.keys(r);
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (key.endsWith('_') && r[key] !== null && r[key] !== undefined && r[key] !== '') {
                    descFields[key] = r[key];
                }
            }
            photos.push({ idA: r.idA, descFields: descFields });
        }

        buildGalleryWindow(personIdA, photos, fotoPersonDir, 'foto_person', 'foto_person');
    }

    // --- Основная точка входа: открыть галерею групповых фото для персоны ---
    // personIdA — idA персоны (из листа person)
    // fotoGroupRows — все строки листа foto_group (массив объектов, ключи — имена колонок)
    // fotoGroupDir — путь к папке с фото (например 'foto_group')
    // Фото попадает в галерею, если personIdA встречается в поле id_personAll,
    // где перечень idA разделён ';' (пробелы вокруг разделителя допустимы).
    function showGroupGallery(personIdA, fotoGroupRows, fotoGroupDir) {
        if (!fotoGroupDir) fotoGroupDir = 'foto_group';

        // Отфильтровать строки, в которых personIdA присутствует в id_personAll
        var matchingRows = [];
        for (var i = 0; i < fotoGroupRows.length; i++) {
            var row = fotoGroupRows[i];
            if (!row.idA) continue;
            var idPersonAll = row.id_personAll || '';
            // Разбиваем по ';', убираем пробелы вокруг каждого элемента
            var ids = idPersonAll.split(';').map(function(s) { return s.trim(); });
            if (ids.indexOf(personIdA) !== -1) {
                matchingRows.push(row);
            }
        }

        // Подготовить данные для фото: отдельно хранить поля с суффиксом _
        var photos = [];
        for (var j = 0; j < matchingRows.length; j++) {
            var r = matchingRows[j];
            var descFields = {};
            var keys = Object.keys(r);
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (key.endsWith('_') && r[key] !== null && r[key] !== undefined && r[key] !== '') {
                    descFields[key] = r[key];
                }
            }
            photos.push({ idA: r.idA, descFields: descFields });
        }

        buildGalleryWindow(personIdA, photos, fotoGroupDir, 'foto_group', 'foto_group');
    }

    // --- Основная точка входа: открыть галерею фото мест для персоны ---
    // personIdA — idA персоны (из листа person)
    // fotoLocationRows — все строки листа foto_location (массив объектов, ключи — имена колонок)
    // fotoLocationDir — путь к папке с фото (например 'foto_location')
    // Фото попадает в галерею, если personIdA встречается в поле id_personAll,
    // где перечень idA разделён ';' (пробелы вокруг разделителя допустимы).
    function showLocationPersonGallery(personIdA, fotoLocationRows, fotoLocationDir) {
        if (!fotoLocationDir) fotoLocationDir = 'foto_location';

        // Отфильтровать строки, в которых personIdA присутствует в id_personAll
        var matchingRows = [];
        for (var i = 0; i < fotoLocationRows.length; i++) {
            var row = fotoLocationRows[i];
            if (!row.idA) continue;
            var idPersonAll = row.id_personAll || '';
            // Разбиваем по ';', убираем пробелы вокруг каждого элемента
            var ids = idPersonAll.split(';').map(function(s) { return s.trim(); });
            if (ids.indexOf(personIdA) !== -1) {
                matchingRows.push(row);
            }
        }

        // Подготовить данные для фото: отдельно хранить поля с суффиксом _
        var photos = [];
        for (var j = 0; j < matchingRows.length; j++) {
            var r = matchingRows[j];
            var descFields = {};
            var keys = Object.keys(r);
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (key.endsWith('_') && r[key] !== null && r[key] !== undefined && r[key] !== '') {
                    descFields[key] = r[key];
                }
            }
            photos.push({ idA: r.idA, descFields: descFields });
        }

        buildGalleryWindow(personIdA, photos, fotoLocationDir, 'foto_location', 'foto_location');
    }

    // --- Основная точка входа: открыть галерею фото мест для семьи ---
    // familyIdA — idA семьи (из листа family)
    // fotoLocationRows — все строки листа foto_location (массив объектов, ключи — имена колонок)
    // fotoLocationDir — путь к папке с фото (например 'foto_location')
    // Фото попадает в галерею, если familyIdA встречается в поле id_familyAll,
    // где перечень idA разделён ';' (пробелы вокруг разделителя допустимы).
    function showLocationFamilyGallery(familyIdA, fotoLocationRows, fotoLocationDir) {
        if (!fotoLocationDir) fotoLocationDir = 'foto_location';

        // Отфильтровать строки, в которых familyIdA присутствует в id_familyAll
        var matchingRows = [];
        for (var i = 0; i < fotoLocationRows.length; i++) {
            var row = fotoLocationRows[i];
            if (!row.idA) continue;
            var idFamilyAll = row.id_familyAll || '';
            // Разбиваем по ';', убираем пробелы вокруг каждого элемента
            var ids = idFamilyAll.split(';').map(function(s) { return s.trim(); });
            if (ids.indexOf(familyIdA) !== -1) {
                matchingRows.push(row);
            }
        }

        // Подготовить данные для фото: отдельно хранить поля с суффиксом _
        var photos = [];
        for (var j = 0; j < matchingRows.length; j++) {
            var r = matchingRows[j];
            var descFields = {};
            var keys = Object.keys(r);
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (key.endsWith('_') && r[key] !== null && r[key] !== undefined && r[key] !== '') {
                    descFields[key] = r[key];
                }
            }
            photos.push({ idA: r.idA, descFields: descFields });
        }

        buildGalleryWindow(familyIdA, photos, fotoLocationDir, 'foto_location', 'foto_location');
    }

    // --- Основная точка входа: открыть галерею фото из событий ---
    // galleryKey — ключ окна галереи (например personIdA + '_' + fotoType)
    // fotoRows — массив объектов { idA, ...поля с суффиксом _ } собранных из строк листа event
    // fotoDir — папка с фото (например 'foto_person', 'foto_group')
    // headerTitle — заголовок окна галереи (например 'foto_person')
    function showEventFotoGallery(galleryKey, fotoRows, fotoDir, headerTitle) {
        if (!fotoDir) fotoDir = 'foto_person';

        // Подготовить данные для галереи: поля с суффиксом _ из каждой строки
        var photos = [];
        for (var j = 0; j < fotoRows.length; j++) {
            var r = fotoRows[j];
            var descFields = {};
            var keys = Object.keys(r);
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (key.endsWith('_') && r[key] !== null && r[key] !== undefined && r[key] !== '') {
                    descFields[key] = r[key];
                }
            }
            photos.push({ idA: r.idA, descFields: descFields });
        }

        buildGalleryWindow(galleryKey, photos, fotoDir, headerTitle || 'foto', fotoDir);
    }

    // --- Публичное API ---
    window.FOTO = {
        showFamilyGallery: showFamilyGallery,
        showFamilyGalleryForPerson: showFamilyGalleryForPerson,
        showPersonGallery: showPersonGallery,
        showGroupGallery: showGroupGallery,
        showLocationPersonGallery: showLocationPersonGallery,
        showLocationFamilyGallery: showLocationFamilyGallery,
        showEventFotoGallery: showEventFotoGallery,
        // _openThumbPhoto используется из onclick строк галереи
        _openThumbPhoto: openThumbPhoto
    };

})();
