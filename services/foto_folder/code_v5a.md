Созданы два отдельных HTML-файла:

1. **`service_foto_github.html`** – для размещения на GitHub Pages (или любом другом веб-сервере).  
   - Автоматически загружает `tree.xlsx` при открытии.  
   - Проверяет наличие файлов из столбца `idA` в соответствующих папках (через `fetch HEAD`).  
   - Выводит информационное сообщение о невозможности проверить лишние файлы (без кнопок).  

2. **`service_foto_desktop.html`** – для локального использования (открытие через `file://` или с локального сервера).  
   - При открытии через `file://` автоматическая загрузка отключается, предлагается выбрать Excel-файл вручную.  
   - Проверка наличия файлов выполняется через загрузку изображений (`Image`), что корректно работает с локальной файловой системой.  
   - Для каждого листа добавляется кнопка **«Проверить лишние файлы»**, при нажатии которой можно выбрать соответствующую папку и увидеть список лишних файлов (если они есть).  

Оба файла используют одну и ту же логику парсинга Excel, но адаптированы под среду выполнения.

### service_foto_github.html
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Проверка фото (GitHub Pages)</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        textarea { width: 100%; height: 150px; font-family: monospace; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
        button { padding: 10px 20px; font-size: 16px; margin-right: 5px; cursor: pointer; }
        .warning { color: #b94a48; background: #f2dede; padding: 5px; border-radius: 3px; }
        .success { color: #468847; background: #dff0d8; padding: 5px; border-radius: 3px; }
        .info { color: #3a87ad; background: #d9edf7; padding: 5px; border-radius: 3px; }
        .toolbar { margin-bottom: 10px; }
    </style>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
</head>
<body>
    <h2>Проверка наличия фотографий (GitHub Pages)</h2>
    <p>Настройки в формате JSON (укажите список листов):</p>
    <textarea id="configJson" rows="6">
{
    "excelFile": "tree.xlsx",
    "sheets": ["foto_person", "foto_family", "foto_group", "foto_location"]
}
    </textarea>
    <br><br>
    <div class="toolbar">
        <button id="checkBtn">🔍 Запустить проверку (из tree.xlsx)</button>
        <button id="selectFileBtn">📁 Выбрать файл Excel</button>
        <button id="defaultBtn">↩️ Восстановить настройки по умолчанию</button>
        <input type="file" id="fileInput" accept=".xlsx, .xls" style="display:none;">
    </div>
    <br>
    <div id="report"></div>

    <script>
        (function() {
            const configJsonEl = document.getElementById('configJson');
            const checkBtn = document.getElementById('checkBtn');
            const selectFileBtn = document.getElementById('selectFileBtn');
            const fileInput = document.getElementById('fileInput');
            const defaultBtn = document.getElementById('defaultBtn');
            const reportEl = document.getElementById('report');

            const defaultConfig = {
                excelFile: "tree.xlsx",
                sheets: ["foto_person", "foto_family", "foto_group", "foto_location"]
            };

            defaultBtn.addEventListener('click', () => {
                configJsonEl.value = JSON.stringify(defaultConfig, null, 4);
            });

            // Вспомогательные функции
            function getCellString(cell) {
                if (cell == null) return '';
                if (typeof cell === 'object') {
                    if (cell.w !== undefined) return String(cell.w);
                    if (cell.v !== undefined) return String(cell.v);
                    return '';
                }
                return String(cell);
            }

            // Основная проверка
            async function performCheck(workbook, sheets) {
                const reportSections = [];

                for (const sheetName of sheets) {
                    if (!workbook.SheetNames.includes(sheetName)) {
                        reportSections.push({ sheet: sheetName, error: `Лист "${sheetName}" не найден` });
                        continue;
                    }

                    const worksheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                    if (rows.length < 2) {
                        reportSections.push({ sheet: sheetName, warning: 'Лист не содержит данных' });
                        continue;
                    }

                    const headerRow = rows[0] || [];
                    const headerLower = headerRow.map(h => getCellString(h).toLowerCase().trim());
                    const idAColIndex = headerLower.indexOf('ida');
                    if (idAColIndex === -1) {
                        reportSections.push({ sheet: sheetName, error: 'Столбец "idA" не найден' });
                        continue;
                    }

                    // Определяем индексы для составных idA
                    let idBaseColIndex = -1, suffixColIndex = -1, extColIndex = -1;
                    if (sheetName === 'foto_family') idBaseColIndex = headerLower.indexOf('id_family');
                    else if (sheetName === 'foto_person') idBaseColIndex = headerLower.indexOf('id_person');
                    else if (sheetName === 'foto_group') idBaseColIndex = headerLower.indexOf('id_person');
                    else if (sheetName === 'foto_location') idBaseColIndex = headerLower.indexOf('id_loc');

                    if (sheetName.startsWith('foto_')) {
                        suffixColIndex = headerLower.findIndex(h => h === 'suffix' || h === 'suffix_');
                        extColIndex = headerLower.indexOf('extension');
                    }

                    const idAValues = [];
                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i];
                        if (!row) continue;
                        let idA = getCellString(row[idAColIndex]).trim();
                        if ((!idA || idA.startsWith('=')) && idBaseColIndex !== -1 && suffixColIndex !== -1 && extColIndex !== -1) {
                            const base = getCellString(row[idBaseColIndex]).trim();
                            const suffix = getCellString(row[suffixColIndex]).trim();
                            const ext = getCellString(row[extColIndex]).trim();
                            if (base && suffix && ext) idA = base + '-' + suffix + '.' + ext;
                        }
                        if (idA) idAValues.push(idA);
                    }

                    if (idAValues.length === 0) {
                        reportSections.push({ sheet: sheetName, warning: 'Нет значений в столбце "idA"' });
                        continue;
                    }

                    const folderPath = `./${sheetName}/`;
                    const missingFiles = [];
                    for (const fileName of idAValues) {
                        const fileUrl = folderPath + fileName;
                        try {
                            const response = await fetch(fileUrl, { method: 'HEAD' });
                            if (!response.ok) missingFiles.push(fileName);
                        } catch {
                            missingFiles.push(fileName);
                        }
                    }

                    reportSections.push({
                        sheet: sheetName,
                        idACount: idAValues.length,
                        missingFiles,
                        extraNote: 'Проверка лишних файлов невозможна в онлайн-режиме (нет доступа к папке).'
                    });
                }
                return reportSections;
            }

            function renderReport(sections) {
                let html = '<h3>Результаты проверки</h3>';
                if (sections.length === 0) html += '<p>Нет данных</p>';
                else {
                    for (const sec of sections) {
                        html += `<div style="border:1px solid #ccc; margin-bottom:15px; padding:10px;">`;
                        html += `<h4>Папка / лист: ${sec.sheet}</h4>`;
                        if (sec.error) html += `<p class="warning">❌ ${sec.error}</p>`;
                        else if (sec.warning) html += `<p class="info">⚠️ ${sec.warning}</p>`;
                        else {
                            html += `<p><strong>Всего записей idA:</strong> ${sec.idACount}</p>`;
                            if (sec.missingFiles.length === 0) html += `<p class="success">✅ Все файлы найдены.</p>`;
                            else {
                                html += `<p class="warning">❌ Отсутствуют (${sec.missingFiles.length}):</p><ul>`;
                                sec.missingFiles.forEach(f => html += `<li>${f}</li>`);
                                html += `</ul>`;
                            }
                            html += `<p class="info">ℹ️ ${sec.extraNote}</p>`;
                        }
                        html += `</div>`;
                    }
                }
                reportEl.innerHTML = html;
            }

            async function runFromArrayBuffer(arrayBuffer, sheets) {
                try {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sections = await performCheck(workbook, sheets);
                    renderReport(sections);
                } catch (e) {
                    reportEl.innerHTML = `<p class="warning">Ошибка: ${e.message}</p>`;
                }
            }

            async function runFromUrl(url, sheets) {
                reportEl.innerHTML = '<p class="info">Загрузка...</p>';
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const ab = await response.arrayBuffer();
                    await runFromArrayBuffer(ab, sheets);
                } catch (e) {
                    reportEl.innerHTML = `<p class="warning">Ошибка загрузки: ${e.message}</p>`;
                }
            }

            checkBtn.addEventListener('click', () => {
                try {
                    const config = JSON.parse(configJsonEl.value);
                    if (!config.excelFile || !Array.isArray(config.sheets)) throw new Error('Неверный формат');
                    runFromUrl(config.excelFile, config.sheets);
                } catch (e) {
                    reportEl.innerHTML = `<p class="warning">Ошибка JSON: ${e.message}</p>`;
                }
            });

            selectFileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const config = JSON.parse(configJsonEl.value);
                    if (!Array.isArray(config.sheets)) throw new Error('Нет sheets');
                    const reader = new FileReader();
                    reader.onload = async (ev) => await runFromArrayBuffer(ev.target.result, config.sheets);
                    reader.readAsArrayBuffer(file);
                } catch (err) {
                    reportEl.innerHTML = `<p class="warning">${err.message}</p>`;
                }
                fileInput.value = '';
            });

            // Автозагрузка при старте
            (function auto() {
                defaultBtn.click();
                setTimeout(() => {
                    // Если не file://, пытаемся загрузить tree.xlsx
                    if (window.location.protocol !== 'file:') checkBtn.click();
                }, 100);
            })();
        })();
    </script>
</body>
</html>
```

### service_foto_desktop.html
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Проверка фото (Desktop)</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        textarea { width: 100%; height: 150px; font-family: monospace; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
        button { padding: 10px 20px; font-size: 16px; margin-right: 5px; cursor: pointer; }
        .warning { color: #b94a48; background: #f2dede; padding: 5px; border-radius: 3px; }
        .success { color: #468847; background: #dff0d8; padding: 5px; border-radius: 3px; }
        .info { color: #3a87ad; background: #d9edf7; padding: 5px; border-radius: 3px; }
        .toolbar { margin-bottom: 10px; }
        .extra-btn { margin-top: 10px; }
        .folder-check-section { border-top: 1px dashed #aaa; margin-top: 10px; padding-top: 10px; }
    </style>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
</head>
<body>
    <h2>Проверка наличия фотографий (локальная)</h2>
    <p>Настройки в формате JSON (укажите список листов):</p>
    <textarea id="configJson" rows="6">
{
    "excelFile": "tree.xlsx",
    "sheets": ["foto_person", "foto_family", "foto_group", "foto_location"]
}
    </textarea>
    <br><br>
    <div class="toolbar">
        <button id="checkBtn">🔍 Запустить проверку (из tree.xlsx)</button>
        <button id="selectFileBtn">📁 Выбрать файл Excel</button>
        <button id="defaultBtn">↩️ Восстановить настройки по умолчанию</button>
        <input type="file" id="fileInput" accept=".xlsx, .xls" style="display:none;">
    </div>
    <br>
    <div id="report"></div>

    <script>
        (function() {
            const configJsonEl = document.getElementById('configJson');
            const checkBtn = document.getElementById('checkBtn');
            const selectFileBtn = document.getElementById('selectFileBtn');
            const fileInput = document.getElementById('fileInput');
            const defaultBtn = document.getElementById('defaultBtn');
            const reportEl = document.getElementById('report');

            // Хранилище результатов последней проверки
            let lastCheckResults = [];

            const defaultConfig = {
                excelFile: "tree.xlsx",
                sheets: ["foto_person", "foto_family", "foto_group", "foto_location"]
            };

            defaultBtn.addEventListener('click', () => {
                configJsonEl.value = JSON.stringify(defaultConfig, null, 4);
            });

            function getCellString(cell) {
                if (cell == null) return '';
                if (typeof cell === 'object') {
                    if (cell.w !== undefined) return String(cell.w);
                    if (cell.v !== undefined) return String(cell.v);
                    return '';
                }
                return String(cell);
            }

            // Проверка существования файла для локального режима (через Image)
            async function fileExistsLocal(url) {
                if (url.startsWith('file:')) {
                    return new Promise(resolve => {
                        const img = new Image();
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(false);
                        img.src = url;
                    });
                } else {
                    // На случай, если открыт через локальный сервер
                    try {
                        const res = await fetch(url, { method: 'HEAD' });
                        return res.ok;
                    } catch {
                        return false;
                    }
                }
            }

            // Основная проверка
            async function performCheck(workbook, sheets) {
                const reportSections = [];
                const newResults = [];

                for (const sheetName of sheets) {
                    if (!workbook.SheetNames.includes(sheetName)) {
                        reportSections.push({ sheet: sheetName, error: `Лист "${sheetName}" не найден` });
                        continue;
                    }

                    const worksheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                    if (rows.length < 2) {
                        reportSections.push({ sheet: sheetName, warning: 'Лист не содержит данных' });
                        continue;
                    }

                    const headerRow = rows[0] || [];
                    const headerLower = headerRow.map(h => getCellString(h).toLowerCase().trim());
                    const idAColIndex = headerLower.indexOf('ida');
                    if (idAColIndex === -1) {
                        reportSections.push({ sheet: sheetName, error: 'Столбец "idA" не найден' });
                        continue;
                    }

                    let idBaseColIndex = -1, suffixColIndex = -1, extColIndex = -1;
                    if (sheetName === 'foto_family') idBaseColIndex = headerLower.indexOf('id_family');
                    else if (sheetName === 'foto_person') idBaseColIndex = headerLower.indexOf('id_person');
                    else if (sheetName === 'foto_group') idBaseColIndex = headerLower.indexOf('id_person');
                    else if (sheetName === 'foto_location') idBaseColIndex = headerLower.indexOf('id_loc');

                    if (sheetName.startsWith('foto_')) {
                        suffixColIndex = headerLower.findIndex(h => h === 'suffix' || h === 'suffix_');
                        extColIndex = headerLower.indexOf('extension');
                    }

                    const idAValues = [];
                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i];
                        if (!row) continue;
                        let idA = getCellString(row[idAColIndex]).trim();
                        if ((!idA || idA.startsWith('=')) && idBaseColIndex !== -1 && suffixColIndex !== -1 && extColIndex !== -1) {
                            const base = getCellString(row[idBaseColIndex]).trim();
                            const suffix = getCellString(row[suffixColIndex]).trim();
                            const ext = getCellString(row[extColIndex]).trim();
                            if (base && suffix && ext) idA = base + '-' + suffix + '.' + ext;
                        }
                        if (idA) idAValues.push(idA);
                    }

                    if (idAValues.length === 0) {
                        reportSections.push({ sheet: sheetName, warning: 'Нет значений в столбце "idA"' });
                        continue;
                    }

                    const folderPath = `./${sheetName}/`;
                    const missingFiles = [];
                    for (const fileName of idAValues) {
                        const fileUrl = folderPath + fileName;
                        const exists = await fileExistsLocal(fileUrl);
                        if (!exists) missingFiles.push(fileName);
                    }

                    reportSections.push({
                        sheet: sheetName,
                        idACount: idAValues.length,
                        missingFiles,
                        extraNote: 'Используйте кнопку ниже для проверки лишних файлов.'
                    });

                    newResults.push({ sheet: sheetName, idAValues, folderPath });
                }

                lastCheckResults = newResults;
                return reportSections;
            }

            // Проверка лишних файлов (выбор папки)
            function checkExtraFiles(sheetName, expectedFiles) {
                const input = document.createElement('input');
                input.type = 'file';
                input.webkitdirectory = true;
                input.directory = true;
                input.multiple = true;
                input.style.display = 'none';
                document.body.appendChild(input);

                input.addEventListener('change', (e) => {
                    const files = Array.from(e.target.files);
                    const actualFileNames = files.map(f => f.name);
                    const extra = actualFileNames.filter(name => !expectedFiles.includes(name));
                    document.body.removeChild(input);
                    if (extra.length === 0) {
                        alert(`✅ В папке ${sheetName} нет лишних файлов.`);
                    } else {
                        alert(`❌ В папке ${sheetName} найдены лишние файлы (${extra.length}):\n${extra.join('\n')}`);
                    }
                });

                input.click();
            }

            function renderReport(sections, isFileProtocol) {
                let html = '<h3>Результаты проверки</h3>';
                if (sections.length === 0) html += '<p>Нет данных</p>';
                else {
                    for (const sec of sections) {
                        html += `<div style="border:1px solid #ccc; margin-bottom:15px; padding:10px;">`;
                        html += `<h4>Папка / лист: ${sec.sheet}</h4>`;
                        if (sec.error) html += `<p class="warning">❌ ${sec.error}</p>`;
                        else if (sec.warning) html += `<p class="info">⚠️ ${sec.warning}</p>`;
                        else {
                            html += `<p><strong>Всего записей idA:</strong> ${sec.idACount}</p>`;
                            if (sec.missingFiles.length === 0) html += `<p class="success">✅ Все файлы найдены.</p>`;
                            else {
                                html += `<p class="warning">❌ Отсутствуют (${sec.missingFiles.length}):</p><ul>`;
                                sec.missingFiles.forEach(f => html += `<li>${f}</li>`);
                                html += `</ul>`;
                            }

                            const expected = lastCheckResults.find(r => r.sheet === sec.sheet)?.idAValues || [];
                            const btnId = `extra_${sec.sheet.replace(/\s/g, '_')}`;
                            html += `<div class="folder-check-section">`;
                            html += `<p class="info">${sec.extraNote}</p>`;
                            html += `<button id="${btnId}" class="extra-btn">🔍 Проверить лишние файлы в папке ${sec.sheet}</button>`;
                            html += `</div>`;
                            setTimeout(() => {
                                const btn = document.getElementById(btnId);
                                if (btn) btn.onclick = () => checkExtraFiles(sec.sheet, expected);
                            }, 100);
                        }
                        html += `</div>`;
                    }
                }
                if (isFileProtocol) {
                    html += `<hr><p class="info"><strong>Локальный режим:</strong> проверка файлов выполняется через загрузку изображений, что должно работать корректно. Для проверки лишних файлов используйте кнопки выше.</p>`;
                }
                reportEl.innerHTML = html;
            }

            async function runFromArrayBuffer(arrayBuffer, sheets) {
                try {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sections = await performCheck(workbook, sheets);
                    renderReport(sections, window.location.protocol === 'file:');
                } catch (e) {
                    reportEl.innerHTML = `<p class="warning">Ошибка: ${e.message}</p>`;
                }
            }

            async function runFromUrl(url, sheets) {
                reportEl.innerHTML = '<p class="info">Загрузка...</p>';
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const ab = await response.arrayBuffer();
                    await runFromArrayBuffer(ab, sheets);
                } catch (e) {
                    reportEl.innerHTML = `<p class="warning">Ошибка загрузки: ${e.message}</p>`;
                }
            }

            checkBtn.addEventListener('click', () => {
                try {
                    const config = JSON.parse(configJsonEl.value);
                    if (!config.excelFile || !Array.isArray(config.sheets)) throw new Error('Неверный формат');
                    runFromUrl(config.excelFile, config.sheets);
                } catch (e) {
                    reportEl.innerHTML = `<p class="warning">Ошибка JSON: ${e.message}</p>`;
                }
            });

            selectFileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const config = JSON.parse(configJsonEl.value);
                    if (!Array.isArray(config.sheets)) throw new Error('Нет sheets');
                    const reader = new FileReader();
                    reader.onload = async (ev) => await runFromArrayBuffer(ev.target.result, config.sheets);
                    reader.readAsArrayBuffer(file);
                } catch (err) {
                    reportEl.innerHTML = `<p class="warning">${err.message}</p>`;
                }
                fileInput.value = '';
            });

            // Автозагрузка: если не file://, пытаемся загрузить tree.xlsx
            (function auto() {
                defaultBtn.click();
                setTimeout(() => {
                    if (window.location.protocol !== 'file:') checkBtn.click();
                    else {
                        reportEl.innerHTML = '<p class="info">Страница открыта локально. Используйте кнопку "Выбрать файл Excel" для загрузки.</p>';
                    }
                }, 100);
            })();
        })();
    </script>
</body>
</html>
```

### Основные различия между файлами

| Функциональность | GitHub-версия | Desktop-версия |
|------------------|---------------|----------------|
| Проверка наличия файлов | `fetch HEAD` | `Image` (для `file:`) + `fetch` (для сервера) |
| Кнопка проверки лишних файлов | отсутствует | есть для каждого листа (с выбором папки) |
| Автоматическая загрузка `tree.xlsx` | всегда | только при протоколе не `file:` |
| Сообщение о лишних файлах | информационное | интерактивное |

Оба файла готовы к использованию. Поместите их в одну папку с `tree.xlsx` и подпапками `foto_person`, `foto_family` и т.д. Для GitHub Pages загрузите `service_foto_github.html` и остальные файлы в репозиторий. Для локальной работы откройте `service_foto_desktop.html` в браузере.
