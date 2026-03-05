// save.js — функции экспорта диаграммы в PDF и создания ZIP-архива для desktop.
// Подключается через <script src="save.js"> в index.html.
//
// Экспортируемые функции (доступны глобально):
//   exportToPdf()   — выгружает диаграмму в PDF файл
//   downloadZip()   — создаёт ZIP-архив с файлами для развёртывания на desktop

(function () {

    // =====================================================================
    // Экспорт в PDF
    // =====================================================================

    // --- Экспорт диаграммы в PDF ---
    // Конвертирует SVG диаграмму в PDF с помощью библиотеки jsPDF (загружается динамически).
    // Альтернативно можно использовать SVG-to-Canvas подход.
    window.exportToPdf = async function () {
        var svgEl = document.querySelector('#graphvizContainer svg');
        if (!svgEl) {
            alert('Диаграмма не загружена');
            return;
        }

        // Показать статус
        var statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = '⏳ Генерация PDF...';
            statusDiv.style.backgroundColor = '#fff8e5';
        }

        try {
            // Получаем размеры SVG
            var svgRect = svgEl.getBoundingClientRect();
            var width = svgEl.getAttribute('width') || svgRect.width;
            var height = svgEl.getAttribute('height') || svgRect.height;

            // Парсим размеры (могут быть в pt, px или просто числа)
            width = parseFloat(width) || svgRect.width || 800;
            height = parseFloat(height) || svgRect.height || 600;

            // Сериализуем SVG в строку
            var serializer = new XMLSerializer();
            var svgString = serializer.serializeToString(svgEl);

            // Конвертируем SVG в data URL
            var svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            var svgUrl = URL.createObjectURL(svgBlob);

            // Создаём canvas для рендеринга SVG
            var canvas = document.createElement('canvas');
            var scale = 2; // Увеличиваем для лучшего качества
            canvas.width = width * scale;
            canvas.height = height * scale;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Загружаем SVG как изображение
            var img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(svgUrl);

                // Загружаем jsPDF динамически если не загружен
                if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
                    var script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    script.onload = function () {
                        createPdfFromCanvas(canvas, width, height);
                    };
                    script.onerror = function () {
                        // Если jsPDF недоступен, скачиваем как PNG
                        downloadCanvasAsPng(canvas, 'family-tree.png');
                    };
                    document.head.appendChild(script);
                } else {
                    createPdfFromCanvas(canvas, width, height);
                }
            };
            img.onerror = function () {
                URL.revokeObjectURL(svgUrl);
                alert('Ошибка загрузки SVG для конвертации');
                if (statusDiv) statusDiv.textContent = '❌ Ошибка генерации PDF';
            };
            img.src = svgUrl;

        } catch (e) {
            console.error('Ошибка экспорта в PDF:', e);
            alert('Ошибка экспорта: ' + e.message);
            if (statusDiv) statusDiv.textContent = '❌ Ошибка генерации PDF';
        }
    };

    // --- Создать PDF из canvas ---
    function createPdfFromCanvas(canvas, width, height) {
        var statusDiv = document.getElementById('status');
        try {
            var jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
            if (!jsPDF) {
                downloadCanvasAsPng(canvas, 'family-tree.png');
                return;
            }

            // Определяем ориентацию
            var orientation = width > height ? 'l' : 'p';
            var pdf = new jsPDF({
                orientation: orientation,
                unit: 'pt',
                format: [width, height]
            });

            // Добавляем изображение canvas в PDF
            var imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);

            // Скачиваем PDF
            pdf.save('family-tree.pdf');

            if (statusDiv) statusDiv.textContent = '✅ PDF скачан';
        } catch (e) {
            console.error('Ошибка создания PDF:', e);
            // Fallback: скачиваем как PNG
            downloadCanvasAsPng(canvas, 'family-tree.png');
        }
    }

    // --- Скачать canvas как PNG (fallback) ---
    function downloadCanvasAsPng(canvas, filename) {
        var statusDiv = document.getElementById('status');
        try {
            var link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (statusDiv) statusDiv.textContent = '✅ PNG скачан (PDF недоступен)';
        } catch (e) {
            console.error('Ошибка скачивания PNG:', e);
            if (statusDiv) statusDiv.textContent = '❌ Ошибка скачивания';
        }
    }

    // =====================================================================
    // Создание ZIP-архива
    // =====================================================================

    // --- Создать ZIP-архив для развёртывания на desktop ---
    // Архив содержит:
    //   - index.html (текущий)
    //   - styles.css
    //   - config.js (если существует)
    //   - foto.js, treeview.js, phototree.js, save.js
    //   - tree.xlsx
    //   - папка pic/ с фотографиями
    window.downloadZip = async function () {
        var statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = '⏳ Создание ZIP-архива...';
            statusDiv.style.backgroundColor = '#fff8e5';
        }

        try {
            // Загружаем JSZip динамически если не загружен
            if (typeof JSZip === 'undefined') {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
            }

            var zip = new JSZip();

            // Список файлов для включения в архив
            var files = [
                'index.html',
                'styles.css',
                'config.js',
                'foto.js',
                'treeview.js',
                'phototree.js',
                'save.js',
                'tree.xlsx'
            ];

            // Добавляем основные файлы
            for (var i = 0; i < files.length; i++) {
                var filename = files[i];
                try {
                    var content = await fetchFileContent(filename);
                    if (content !== null) {
                        zip.file(filename, content);
                    }
                } catch (e) {
                    console.warn('Не удалось загрузить файл:', filename, e);
                }
            }

            // Добавляем папку pic/ с фотографиями
            // Пытаемся найти фотографии через кэш или список из DOM
            var picDir = getPicDir();
            var photoFilenames = getPhotoFilenames();
            if (photoFilenames.length > 0) {
                for (var j = 0; j < photoFilenames.length; j++) {
                    var photoFile = photoFilenames[j];
                    try {
                        var photoContent = await fetchFileContent(picDir + '/' + photoFile, true);
                        if (photoContent !== null) {
                            zip.file(picDir + '/' + photoFile, photoContent);
                        }
                    } catch (e) {
                        console.warn('Не удалось загрузить фото:', photoFile, e);
                    }
                }
            }

            // Добавляем папки с фото других типов
            var fotoDirs = ['foto_family', 'foto_person', 'foto_group', 'foto_location'];
            for (var d = 0; d < fotoDirs.length; d++) {
                var dir = fotoDirs[d];
                var fotoFiles = getFotoFilenames(dir);
                for (var k = 0; k < fotoFiles.length; k++) {
                    try {
                        var fotoContent = await fetchFileContent(dir + '/' + fotoFiles[k], true);
                        if (fotoContent !== null) {
                            zip.file(dir + '/' + fotoFiles[k], fotoContent);
                        }
                    } catch (e) {
                        console.warn('Не удалось загрузить файл из', dir, ':', fotoFiles[k], e);
                    }
                }
            }

            // Генерируем ZIP и скачиваем
            var blob = await zip.generateAsync({ type: 'blob' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'family-tree-desktop.zip';
            link.click();
            URL.revokeObjectURL(link.href);

            if (statusDiv) statusDiv.textContent = '✅ ZIP-архив скачан';

        } catch (e) {
            console.error('Ошибка создания ZIP:', e);
            alert('Ошибка создания архива: ' + e.message);
            if (statusDiv) statusDiv.textContent = '❌ Ошибка создания ZIP';
        }
    };

    // --- Загрузить скрипт динамически ---
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // --- Загрузить содержимое файла ---
    function fetchFileContent(filename, isBinary) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', filename, true);
            if (isBinary) {
                xhr.responseType = 'arraybuffer';
            }
            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 0) {
                    resolve(isBinary ? xhr.response : xhr.responseText);
                } else {
                    resolve(null);
                }
            };
            xhr.onerror = function () {
                resolve(null);
            };
            xhr.send();
        });
    }

    // --- Получить директорию с фото ---
    function getPicDir() {
        // Попытаться получить из глобальной конфигурации
        if (typeof CONFIG !== 'undefined' && CONFIG.picDir) {
            return CONFIG.picDir;
        }
        return 'pic';
    }

    // --- Получить список файлов фото из кэша или DOM ---
    function getPhotoFilenames() {
        var filenames = [];

        // Попробовать получить из photoExistsCache (если доступен)
        if (typeof photoExistsCache !== 'undefined') {
            for (var key in photoExistsCache) {
                if (photoExistsCache[key]) {
                    filenames.push(key);
                }
            }
        }

        // Если кэш пуст, попробовать получить из DOM (панель фото)
        if (filenames.length === 0) {
            var photoItems = document.querySelectorAll('#photosGrid .photo-item img');
            photoItems.forEach(function (img) {
                var src = img.getAttribute('src');
                if (src) {
                    var parts = src.split('/');
                    filenames.push(parts[parts.length - 1]);
                }
            });
        }

        // Добавить дефолтные фото
        if (filenames.indexOf('dafaultm.png') === -1) filenames.push('dafaultm.png');
        if (filenames.indexOf('dafaultf.png') === -1) filenames.push('dafaultf.png');

        return filenames;
    }

    // --- Получить список файлов фото из определённой папки ---
    // Пытаемся получить из глобальных массивов fotoPersonRows, fotoFamilyRows и т.д.
    function getFotoFilenames(dirName) {
        var filenames = [];
        var rows = null;

        // Определяем какой массив использовать
        if (dirName === 'foto_person' && typeof fotoPersonRows !== 'undefined') {
            rows = fotoPersonRows;
        } else if (dirName === 'foto_family' && typeof fotoFamilyRows !== 'undefined') {
            rows = fotoFamilyRows;
        } else if (dirName === 'foto_group' && typeof fotoGroupRows !== 'undefined') {
            rows = fotoGroupRows;
        } else if (dirName === 'foto_location' && typeof fotoLocationRows !== 'undefined') {
            rows = fotoLocationRows;
        }

        if (rows && Array.isArray(rows)) {
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].idA) {
                    filenames.push(rows[i].idA);
                }
            }
        }

        return filenames;
    }

})();
