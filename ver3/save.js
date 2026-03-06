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

    // --- Конвертировать изображение по URL в base64 data URL ---
    // Загружает изображение через <img> элемент, рендерит в canvas, возвращает data URL.
    // Работает как для http:// URL, так и для относительных путей (pic/xxx.png).
    function imageUrlToBase64(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            // Разрешаем кросс-доменную загрузку если изображение находится на другом домене
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                try {
                    var canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    // Определяем тип изображения по расширению
                    var mimeType = 'image/png';
                    if (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')) {
                        mimeType = 'image/jpeg';
                    }
                    var dataUrl = canvas.toDataURL(mimeType);
                    resolve(dataUrl);
                } catch (e) {
                    // Ошибка canvas (например, tainted canvas из-за CORS)
                    console.warn('Не удалось конвертировать изображение в base64:', url, e);
                    resolve(null);
                }
            };
            img.onerror = function () {
                console.warn('Не удалось загрузить изображение для base64:', url);
                resolve(null);
            };
            img.src = url;
        });
    }

    // --- Встроить все изображения в SVG как base64 ---
    // Находит все <image> элементы в SVG, конвертирует их href в base64 data URL.
    // Это необходимо для корректного рендеринга SVG в canvas при экспорте в PDF.
    async function embedImagesInSvg(svgEl) {
        var imageElements = svgEl.querySelectorAll('image');
        var promises = [];

        imageElements.forEach(function (imgEl) {
            // Получаем URL изображения (может быть в href или xlink:href)
            var href = imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href');
            if (!href || href.startsWith('data:')) {
                // Уже data URL или нет href — пропускаем
                return;
            }

            var promise = imageUrlToBase64(href).then(function (dataUrl) {
                if (dataUrl) {
                    // Заменяем href на base64 data URL
                    if (imgEl.hasAttribute('xlink:href')) {
                        imgEl.setAttribute('xlink:href', dataUrl);
                    }
                    if (imgEl.hasAttribute('href')) {
                        imgEl.setAttribute('href', dataUrl);
                    }
                }
            });
            promises.push(promise);
        });

        await Promise.all(promises);
    }

    // --- Экспорт диаграммы в PDF ---
    // Конвертирует SVG диаграмму в PDF с помощью библиотеки jsPDF (загружается динамически).
    // Перед конвертацией все изображения в SVG преобразуются в base64 для корректного рендеринга.
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

            // Клонируем SVG чтобы не модифицировать оригинал
            var svgClone = svgEl.cloneNode(true);

            // Встраиваем все изображения как base64
            if (statusDiv) statusDiv.textContent = '⏳ Загрузка изображений...';
            await embedImagesInSvg(svgClone);

            // Сериализуем SVG в строку
            var serializer = new XMLSerializer();
            var svgString = serializer.serializeToString(svgClone);

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

            if (statusDiv) statusDiv.textContent = '⏳ Генерация PDF...';

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
    //   - service_foto_desktop.html
    //   - папка pic/ с фотографиями
    //   - папки foto_family/, foto_person/, foto_group/, foto_location/ с фотографиями
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

            // Список текстовых файлов для включения в архив
            var textFiles = [
                'index.html',
                'styles.css',
                'config.js',
                'foto.js',
                'treeview.js',
                'phototree.js',
                'save.js',
                'service_foto_desktop.html',
                'test_tree_v1.html'
            ];

            // Список бинарных файлов
            var binaryFiles = [
                'tree.xlsx'
            ];

            // Добавляем текстовые файлы
            for (var i = 0; i < textFiles.length; i++) {
                var filename = textFiles[i];
                try {
                    var content = await fetchFileContent(filename, false);
                    if (content !== null) {
                        zip.file(filename, content);
                    }
                } catch (e) {
                    console.warn('Не удалось загрузить файл:', filename, e);
                }
            }

            // Добавляем бинарные файлы (xlsx)
            for (var b = 0; b < binaryFiles.length; b++) {
                var binaryFilename = binaryFiles[b];
                try {
                    var binaryContent = await fetchFileContent(binaryFilename, true);
                    if (binaryContent !== null) {
                        zip.file(binaryFilename, binaryContent);
                    }
                } catch (e) {
                    console.warn('Не удалось загрузить бинарный файл:', binaryFilename, e);
                }
            }

            if (statusDiv) statusDiv.textContent = '⏳ Загрузка фотографий...';

            // Добавляем папку pic/ с фотографиями
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
            // Используем глобальный объект window.SAVE_DATA для получения списка фото
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

            if (statusDiv) statusDiv.textContent = '⏳ Генерация архива...';

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

        // Попробовать получить из глобального объекта SAVE_DATA
        if (typeof window.SAVE_DATA !== 'undefined' && window.SAVE_DATA.photoFilenames) {
            return window.SAVE_DATA.photoFilenames.slice();
        }

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

        // Также попробовать получить из SVG диаграммы
        if (filenames.length === 0) {
            var svgImages = document.querySelectorAll('#graphvizContainer svg image');
            svgImages.forEach(function (img) {
                var href = img.getAttribute('href') || img.getAttribute('xlink:href');
                if (href && !href.startsWith('data:') && !href.startsWith('http')) {
                    var parts = href.split('/');
                    var name = parts[parts.length - 1];
                    if (filenames.indexOf(name) === -1) {
                        filenames.push(name);
                    }
                }
            });
        }

        // Добавить дефолтные фото
        if (filenames.indexOf('dafaultm.png') === -1) filenames.push('dafaultm.png');
        if (filenames.indexOf('dafaultf.png') === -1) filenames.push('dafaultf.png');

        return filenames;
    }

    // --- Получить список файлов фото из определённой папки ---
    // Использует глобальный объект window.SAVE_DATA для получения данных из index.html
    function getFotoFilenames(dirName) {
        var filenames = [];
        var rows = null;

        // Сначала пробуем получить из глобального объекта SAVE_DATA
        if (typeof window.SAVE_DATA !== 'undefined') {
            if (dirName === 'foto_person' && window.SAVE_DATA.fotoPersonRows) {
                rows = window.SAVE_DATA.fotoPersonRows;
            } else if (dirName === 'foto_family' && window.SAVE_DATA.fotoFamilyRows) {
                rows = window.SAVE_DATA.fotoFamilyRows;
            } else if (dirName === 'foto_group' && window.SAVE_DATA.fotoGroupRows) {
                rows = window.SAVE_DATA.fotoGroupRows;
            } else if (dirName === 'foto_location' && window.SAVE_DATA.fotoLocationRows) {
                rows = window.SAVE_DATA.fotoLocationRows;
            }
        }

        // Если SAVE_DATA недоступен, пробуем получить из глобальных переменных (для обратной совместимости)
        if (!rows) {
            if (dirName === 'foto_person' && typeof fotoPersonRows !== 'undefined') {
                rows = fotoPersonRows;
            } else if (dirName === 'foto_family' && typeof fotoFamilyRows !== 'undefined') {
                rows = fotoFamilyRows;
            } else if (dirName === 'foto_group' && typeof fotoGroupRows !== 'undefined') {
                rows = fotoGroupRows;
            } else if (dirName === 'foto_location' && typeof fotoLocationRows !== 'undefined') {
                rows = fotoLocationRows;
            }
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
