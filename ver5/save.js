// save.js — функции экспорта диаграммы в PDF, SVG, Drawio и создания ZIP-архива для desktop.
// Подключается через <script src="save.js"> в index.html.
//
// Экспортируемые функции (доступны глобально):
//   exportToPdf()         — выгружает диаграмму в PDF файл
//   exportToSvg()         — выгружает диаграмму в SVG файл
//   exportToDrawio()      — выгружает диаграмму в Drawio (XML) файл
//   openDrawioOnline()    — открывает диаграмму в diagrams.net онлайн
//   downloadZip()         — создаёт ZIP-архив (режим GitHub Pages): использует GitHub API
//                           для получения списка всех файлов в папках из fileZIP
//   downloadZipDesktop()  — создаёт ZIP-архив в локальном режиме (file://):
//                           пользователь выбирает папку проекта через диалог выбора директории

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
    // Экспорт в SVG
    // =====================================================================

    // --- Экспорт диаграммы в SVG ---
    // Сохраняет SVG диаграмму в файл. Все изображения встраиваются как base64 для автономности.
    window.exportToSvg = async function () {
        var svgEl = document.querySelector('#graphvizContainer svg');
        if (!svgEl) {
            alert('Диаграмма не загружена');
            return;
        }

        // Показать статус
        var statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = '⏳ Генерация SVG...';
            statusDiv.style.backgroundColor = '#fff8e5';
        }

        try {
            // Клонируем SVG чтобы не модифицировать оригинал
            var svgClone = svgEl.cloneNode(true);

            // Встраиваем все изображения как base64
            if (statusDiv) statusDiv.textContent = '⏳ Загрузка изображений...';
            await embedImagesInSvg(svgClone);

            // Добавляем XML namespace если отсутствует
            if (!svgClone.getAttribute('xmlns')) {
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
            if (!svgClone.getAttribute('xmlns:xlink')) {
                svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            }

            // Сериализуем SVG в строку
            var serializer = new XMLSerializer();
            var svgString = serializer.serializeToString(svgClone);

            // Добавляем XML декларацию
            svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

            // Создаём Blob и скачиваем
            var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'family-tree.svg';
            link.click();
            URL.revokeObjectURL(link.href);

            if (statusDiv) statusDiv.textContent = '✅ SVG скачан';

        } catch (e) {
            console.error('Ошибка экспорта в SVG:', e);
            alert('Ошибка экспорта: ' + e.message);
            if (statusDiv) statusDiv.textContent = '❌ Ошибка генерации SVG';
        }
    };

    // =====================================================================
    // Экспорт в Drawio (XML)
    // =====================================================================

    // --- Генерация Drawio XML из SVG ---
    // Преобразует SVG в формат mxGraphModel, используемый draw.io/diagrams.net
    function svgToDrawioXml(svgEl) {
        // Получаем размеры SVG
        var svgRect = svgEl.getBoundingClientRect();
        var width = parseFloat(svgEl.getAttribute('width')) || svgRect.width || 800;
        var height = parseFloat(svgEl.getAttribute('height')) || svgRect.height || 600;

        // Сериализуем SVG в строку
        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgEl);

        // Экранируем SVG для вставки в XML
        var escapedSvg = svgString
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        // Создаём Drawio XML структуру
        // Используем foreignObject для встраивания SVG целиком
        var drawioXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<mxfile host="app.diagrams.net" modified="' + new Date().toISOString() + '" agent="Family Tree Export" version="1.0">\n' +
            '  <diagram name="Family Tree" id="family-tree">\n' +
            '    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="' + Math.ceil(width) + '" pageHeight="' + Math.ceil(height) + '">\n' +
            '      <root>\n' +
            '        <mxCell id="0"/>\n' +
            '        <mxCell id="1" parent="0"/>\n' +
            '        <mxCell id="2" value="" style="shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;image=data:image/svg+xml,' + encodeURIComponent(svgString) + ';" vertex="1" parent="1">\n' +
            '          <mxGeometry x="0" y="0" width="' + Math.ceil(width) + '" height="' + Math.ceil(height) + '" as="geometry"/>\n' +
            '        </mxCell>\n' +
            '      </root>\n' +
            '    </mxGraphModel>\n' +
            '  </diagram>\n' +
            '</mxfile>';

        return drawioXml;
    }

    // --- Экспорт диаграммы в Drawio (XML) ---
    // Сохраняет диаграмму в формате .drawio (XML) для редактирования в diagrams.net
    window.exportToDrawio = async function () {
        var svgEl = document.querySelector('#graphvizContainer svg');
        if (!svgEl) {
            alert('Диаграмма не загружена');
            return;
        }

        // Показать статус
        var statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = '⏳ Генерация Drawio...';
            statusDiv.style.backgroundColor = '#fff8e5';
        }

        try {
            // Клонируем SVG чтобы не модифицировать оригинал
            var svgClone = svgEl.cloneNode(true);

            // Встраиваем все изображения как base64
            if (statusDiv) statusDiv.textContent = '⏳ Загрузка изображений...';
            await embedImagesInSvg(svgClone);

            // Добавляем XML namespace если отсутствует
            if (!svgClone.getAttribute('xmlns')) {
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
            if (!svgClone.getAttribute('xmlns:xlink')) {
                svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            }

            // Генерируем Drawio XML
            var drawioXml = svgToDrawioXml(svgClone);

            // Создаём Blob и скачиваем
            var blob = new Blob([drawioXml], { type: 'application/xml;charset=utf-8' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'family-tree.drawio';
            link.click();
            URL.revokeObjectURL(link.href);

            if (statusDiv) statusDiv.textContent = '✅ Drawio скачан';

        } catch (e) {
            console.error('Ошибка экспорта в Drawio:', e);
            alert('Ошибка экспорта: ' + e.message);
            if (statusDiv) statusDiv.textContent = '❌ Ошибка генерации Drawio';
        }
    };

    // =====================================================================
    // Открытие в Drawio Online
    // =====================================================================

    // --- Открыть диаграмму в diagrams.net онлайн ---
    // Открывает SVG в новом окне diagrams.net для редактирования
    window.openDrawioOnline = async function () {
        var svgEl = document.querySelector('#graphvizContainer svg');
        if (!svgEl) {
            alert('Диаграмма не загружена');
            return;
        }

        // Показать статус
        var statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = '⏳ Подготовка Drawio Online...';
            statusDiv.style.backgroundColor = '#fff8e5';
        }

        try {
            // Клонируем SVG чтобы не модифицировать оригинал
            var svgClone = svgEl.cloneNode(true);

            // Встраиваем все изображения как base64
            if (statusDiv) statusDiv.textContent = '⏳ Загрузка изображений...';
            await embedImagesInSvg(svgClone);

            // Добавляем XML namespace если отсутствует
            if (!svgClone.getAttribute('xmlns')) {
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
            if (!svgClone.getAttribute('xmlns:xlink')) {
                svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            }

            // Генерируем Drawio XML
            var drawioXml = svgToDrawioXml(svgClone);

            // Кодируем XML для передачи через URL
            // diagrams.net поддерживает передачу данных через параметр create с JSON
            var encodedData = encodeURIComponent(drawioXml);

            // Открываем diagrams.net с данными
            // Используем метод с localStorage для обхода ограничений на длину URL
            var drawioUrl = 'https://app.diagrams.net/';

            // Создаём скрытую форму для отправки данных через POST
            // Альтернативно: используем Blob URL
            // diagrams.net не поддерживает прямую передачу больших данных через URL,
            // поэтому создаём Blob URL и открываем редактор

            // Вариант 1: Если данные небольшие, используем URL hash
            if (encodedData.length < 32000) {
                // Используем специальный формат: #R + base64 encoded data
                var base64Data = btoa(unescape(encodeURIComponent(drawioXml)));
                window.open(drawioUrl + '?create={"type":"xml","data":"' + encodeURIComponent(base64Data) + '"}', '_blank');
            } else {
                // Вариант 2: Для больших данных — сначала скачиваем файл,
                // затем пользователь может импортировать его вручную
                alert('Диаграмма слишком большая для прямого открытия.\nФайл .drawio будет скачан. Откройте его в diagrams.net.');
                window.exportToDrawio();
                return;
            }

            if (statusDiv) statusDiv.textContent = '✅ Drawio Online открыт';

        } catch (e) {
            console.error('Ошибка открытия Drawio Online:', e);
            alert('Ошибка: ' + e.message);
            if (statusDiv) statusDiv.textContent = '❌ Ошибка открытия Drawio Online';
        }
    };

    // =====================================================================
    // Создание ZIP-архива
    // =====================================================================

    // --- Получить список файлов папки через GitHub API ---
    // Используется в zip-функции для получения всех файлов из любой папки
    // на GitHub Pages (аналогично service_foto_github_v2.html).
    // Возвращает массив имён файлов или null при ошибке.
    async function getGithubFolderFiles(githubRepo, githubBranch, folderPath) {
        var apiUrl = 'https://api.github.com/repos/' + githubRepo + '/contents/' + folderPath + '?ref=' + githubBranch;
        try {
            var response = await fetch(apiUrl, {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
            if (!response.ok) {
                console.warn('GitHub API вернул ' + response.status + ' для ' + folderPath);
                return null;
            }
            var items = await response.json();
            return items
                .filter(function(item) { return item.type === 'file'; })
                .map(function(item) { return item.name; });
        } catch (e) {
            console.warn('Ошибка GitHub API для папки ' + folderPath + ':', e);
            return null;
        }
    }

    // --- Определить параметры GitHub из URL страницы ---
    // Для GitHub Pages URL вида https://owner.github.io/repo/path/ возвращает
    // { githubRepo: 'owner/repo', githubBranch: 'main', githubBasePath: 'path' }.
    // Возвращает null если страница не на GitHub Pages или параметры не определены.
    function detectGithubParams() {
        // Сначала проверяем явные параметры в конфиге
        if (typeof CONFIG !== 'undefined' && CONFIG) {
            if (CONFIG.githubRepo) {
                return {
                    githubRepo: CONFIG.githubRepo,
                    githubBranch: CONFIG.githubBranch || 'main',
                    githubBasePath: CONFIG.githubBasePath || ''
                };
            }
        }
        // Пробуем определить из URL на GitHub Pages (owner.github.io/repo/...)
        var hostname = window.location.hostname;
        var pathname = window.location.pathname;
        if (hostname.endsWith('.github.io')) {
            var owner = hostname.replace('.github.io', '');
            var parts = pathname.replace(/^\//, '').split('/');
            if (parts.length >= 1 && parts[0]) {
                var repo = parts[0];
                var basePath = parts.slice(1).filter(function(p) { return p; }).join('/');
                // Убираем имя файла из пути (index.html)
                if (basePath && basePath.split('/').pop().indexOf('.') !== -1) {
                    basePath = basePath.split('/').slice(0, -1).join('/');
                }
                return {
                    githubRepo: owner + '/' + repo,
                    githubBranch: 'main',
                    githubBasePath: basePath
                };
            }
        }
        return null;
    }

    // --- Создать ZIP-архив для развёртывания на desktop ---
    // Архив содержит файлы и папки из константы fileZIP в config.js.
    // Для папок (кроме pic и foto_*) использует GitHub API для получения
    // полного списка файлов в папке (не требует list.md).
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

            // Получаем список файлов и папок из конфига (или используем набор по умолчанию)
            var fileZIP = (typeof CONFIG !== 'undefined' && CONFIG && Array.isArray(CONFIG.fileZIP))
                ? CONFIG.fileZIP
                : [
                    'index.html', 'styles.css', 'config.js', 'config.txt',
                    'foto.js', 'treeview.js', 'phototree.js', 'save.js',
                    'service_foto_desktop.html', 'service_foto_github_v2.html',
                    'test_tree_v1.html', 'tree.xlsx',
                    'pic', 'foto_person', 'foto_family', 'foto_group',
                    'foto_location', 'foto_item', 'foto_event', 'album'
                ];

            // Список имён папок фото (для определения какие папки нужно скачивать)
            var fotoDirNames = (typeof CONFIG !== 'undefined' && CONFIG && Array.isArray(CONFIG.foto_sheets))
                ? CONFIG.foto_sheets
                : ['foto_person', 'foto_family', 'foto_group', 'foto_location'];

            // Определяем параметры GitHub для листинга папок через API
            var githubParams = detectGithubParams();

            // Обрабатываем каждый элемент из fileZIP
            for (var i = 0; i < fileZIP.length; i++) {
                var entry = fileZIP[i];

                // Определяем: папка это или файл
                var isPicDir = (entry === getPicDir() || entry === 'pic');
                var isFotoDir = fotoDirNames.indexOf(entry) !== -1;
                var isDir = (entry.indexOf('.') === -1);

                if (isPicDir) {
                    // Папка с миниатюрами — список файлов из кэша/DOM
                    if (statusDiv) statusDiv.textContent = '⏳ Загрузка фотографий из ' + entry + '...';
                    var picDir = getPicDir();
                    var photoFilenames = getPhotoFilenames();
                    for (var j = 0; j < photoFilenames.length; j++) {
                        try {
                            var photoContent = await fetchFileContent(picDir + '/' + photoFilenames[j], true);
                            if (photoContent !== null) {
                                zip.file(picDir + '/' + photoFilenames[j], photoContent);
                            }
                        } catch (e) {
                            console.warn('Не удалось загрузить фото:', photoFilenames[j], e);
                        }
                    }
                } else if (isFotoDir) {
                    // Папка с фото (foto_person, foto_family и т.д.) — список из Excel
                    if (statusDiv) statusDiv.textContent = '⏳ Загрузка фотографий из ' + entry + '...';
                    var fotoFiles = getFotoFilenames(entry);
                    for (var k = 0; k < fotoFiles.length; k++) {
                        try {
                            var fotoContent = await fetchFileContent(entry + '/' + fotoFiles[k], true);
                            if (fotoContent !== null) {
                                zip.file(entry + '/' + fotoFiles[k], fotoContent);
                            }
                        } catch (e) {
                            console.warn('Не удалось загрузить файл из', entry, ':', fotoFiles[k], e);
                        }
                    }
                } else if (isDir) {
                    // Произвольная папка — используем GitHub API для получения списка файлов.
                    // Это позволяет копировать ВСЕ файлы из папки без необходимости list.md.
                    if (statusDiv) statusDiv.textContent = '⏳ Загрузка файлов из ' + entry + '...';
                    var dirFileNames = null;

                    if (githubParams) {
                        var folderApiPath = githubParams.githubBasePath
                            ? githubParams.githubBasePath + '/' + entry
                            : entry;
                        dirFileNames = await getGithubFolderFiles(
                            githubParams.githubRepo,
                            githubParams.githubBranch,
                            folderApiPath
                        );
                    }

                    if (dirFileNames !== null) {
                        // Успешно получили список файлов через GitHub API
                        for (var gi = 0; gi < dirFileNames.length; gi++) {
                            var gFile = dirFileNames[gi];
                            var isGFileBinary = isBinaryFilename(gFile);
                            try {
                                var gContent = await fetchFileContent(entry + '/' + gFile, isGFileBinary);
                                if (gContent !== null) {
                                    zip.file(entry + '/' + gFile, gContent);
                                }
                            } catch (e) {
                                console.warn('Не удалось загрузить файл из', entry, ':', gFile, e);
                            }
                        }
                    } else {
                        // GitHub API недоступен (десктоп или ошибка) — пробуем list.md как запасной вариант
                        console.warn('GitHub API недоступен для папки "' + entry + '", пробуем list.md');
                        try {
                            var listContent = await fetchFileContent(entry + '/list.md', false);
                            if (listContent !== null) {
                                zip.file(entry + '/list.md', listContent);
                                var dirFiles = listContent.split('\n')
                                    .map(function(line) { return line.trim(); })
                                    .filter(function(line) { return line.length > 0 && !line.startsWith('#'); });
                                for (var di = 0; di < dirFiles.length; di++) {
                                    var dirFile = dirFiles[di];
                                    try {
                                        var dirFileContent = await fetchFileContent(entry + '/' + dirFile, isBinaryFilename(dirFile));
                                        if (dirFileContent !== null) {
                                            zip.file(entry + '/' + dirFile, dirFileContent);
                                        }
                                    } catch (e) {
                                        console.warn('Не удалось загрузить файл из', entry, ':', dirFile, e);
                                    }
                                }
                            } else {
                                console.warn('Папка "' + entry + '" в fileZIP: GitHub API недоступен и list.md не найден. Используйте кнопку zipDesktop для архивирования в локальном режиме.');
                            }
                        } catch (e) {
                            console.warn('Не удалось прочитать list.md из папки:', entry, e);
                        }
                    }
                } else {
                    // Обычный файл
                    try {
                        var fileContent = await fetchFileContent(entry, isBinaryFilename(entry));
                        if (fileContent !== null) {
                            zip.file(entry, fileContent);
                        }
                    } catch (e) {
                        console.warn('Не удалось загрузить файл:', entry, e);
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

    // --- Создать ZIP-архив в режиме desktop (file://) ---
    // В desktop-режиме браузер не может автоматически получить список файлов папки,
    // поэтому пользователь выбирает папку проекта через диалог выбора директории.
    // Браузер передаёт все файлы из выбранной папки, из которых формируется ZIP.
    window.downloadZipDesktop = async function () {
        var statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = '⏳ Выберите папку проекта для создания архива...';
            statusDiv.style.backgroundColor = '#fff8e5';
        }

        // Создаём скрытый input для выбора директории
        var dirInput = document.createElement('input');
        dirInput.type = 'file';
        dirInput.webkitdirectory = true;
        dirInput.multiple = true;
        dirInput.style.display = 'none';
        document.body.appendChild(dirInput);

        dirInput.onchange = async function() {
            var files = Array.from(dirInput.files);
            if (document.body.contains(dirInput)) document.body.removeChild(dirInput);

            if (!files || files.length === 0) {
                if (statusDiv) statusDiv.textContent = '⚠️ Папка не выбрана';
                return;
            }

            if (statusDiv) {
                statusDiv.textContent = '⏳ Создание ZIP-архива из ' + files.length + ' файлов...';
                statusDiv.style.backgroundColor = '#fff8e5';
            }

            try {
                if (typeof JSZip === 'undefined') {
                    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
                }

                var zip = new JSZip();

                // Определяем корневую папку (первый компонент пути первого файла)
                var rootFolder = '';
                if (files[0].webkitRelativePath) {
                    rootFolder = files[0].webkitRelativePath.split('/')[0];
                }

                for (var fi = 0; fi < files.length; fi++) {
                    var file = files[fi];
                    var relativePath = file.webkitRelativePath || file.name;
                    // Убираем корневую папку из пути (чтобы в архиве был семейное-дерево/файл, а не папка/семейное-дерево/файл)
                    if (rootFolder && relativePath.startsWith(rootFolder + '/')) {
                        relativePath = relativePath.slice(rootFolder.length + 1);
                    }
                    if (!relativePath) continue;

                    try {
                        var arrayBuffer = await readFileAsArrayBuffer(file);
                        zip.file(relativePath, arrayBuffer);
                    } catch (e) {
                        console.warn('Не удалось добавить файл в архив:', relativePath, e);
                    }
                }

                if (statusDiv) statusDiv.textContent = '⏳ Генерация архива...';

                var blob = await zip.generateAsync({ type: 'blob' });
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'family-tree-desktop.zip';
                link.click();
                URL.revokeObjectURL(link.href);

                if (statusDiv) statusDiv.textContent = '✅ ZIP-архив скачан (' + files.length + ' файлов)';

            } catch (e) {
                console.error('Ошибка создания ZIP (desktop):', e);
                alert('Ошибка создания архива: ' + e.message);
                if (statusDiv) statusDiv.textContent = '❌ Ошибка создания ZIP';
            }
        };

        dirInput.oncancel = function() {
            if (document.body.contains(dirInput)) document.body.removeChild(dirInput);
            if (statusDiv) statusDiv.textContent = '⚠️ Выбор папки отменён';
        };

        dirInput.click();
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
            var keyMap = {
                'foto_person': 'fotoPersonRows',
                'foto_family': 'fotoFamilyRows',
                'foto_group': 'fotoGroupRows',
                'foto_location': 'fotoLocationRows',
                'foto_item': 'fotoItemRows',
                'foto_event': 'fotoEventRows'
            };
            var key = keyMap[dirName];
            if (key && window.SAVE_DATA[key]) {
                rows = window.SAVE_DATA[key];
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

    // --- Определить является ли файл бинарным по его имени ---
    function isBinaryFilename(filename) {
        var lower = filename.toLowerCase();
        return lower.endsWith('.xlsx') || lower.endsWith('.xls') ||
            lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
            lower.endsWith('.gif') || lower.endsWith('.pdf') || lower.endsWith('.zip') ||
            lower.endsWith('.ico') || lower.endsWith('.woff') || lower.endsWith('.woff2') ||
            lower.endsWith('.ttf') || lower.endsWith('.eot') || lower.endsWith('.webp') ||
            lower.endsWith('.mp4') || lower.endsWith('.mp3');
    }

    // --- Прочитать файл как ArrayBuffer (для zipDesktop) ---
    function readFileAsArrayBuffer(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) { resolve(e.target.result); };
            reader.onerror = function(e) { reject(e); };
            reader.readAsArrayBuffer(file);
        });
    }

})();
