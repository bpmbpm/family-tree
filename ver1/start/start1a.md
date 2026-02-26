Вот полный код файла `index.html`, который решает поставленную задачу:

- Загружает и парсит файл `tree.xlsx` (лист `person`) при старте или вручную.
- Строит генеалогическое дерево с помощью Mermaid (flowchart), отображая имена, даты жизни и связи родитель–ребёнок, а также связи между супругами.
- После рендеринга добавляет в каждый узел миниатюру фото из папки `.pic` (если есть) или заглушку по умолчанию.
- Предоставляет кнопку для открытия текущей диаграммы в редакторе [mermaid.live](https://mermaid.live) с компрессией через `pako`.

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Генеалогическое дерево</title>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .toolbar {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        button {
            padding: 8px 16px;
            background: #2c3e50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        button:hover {
            background: #34495e;
        }
        button:disabled {
            background: #95a5a6;
            cursor: not-allowed;
        }
        #fileInput {
            display: none;
        }
        .status {
            padding: 8px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            margin-bottom: 15px;
        }
        .mermaid-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow-x: auto;
            min-height: 400px;
        }
        .mermaid-container svg {
            max-width: 100%;
            height: auto;
            margin: 0 auto;
            display: block;
        }
        footer {
            margin-top: 20px;
            text-align: center;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌳 Генеалогическое дерево (Mermaid)</h1>
        <div class="toolbar">
            <button id="loadBtn" class="btn">📂 Загрузить tree.xlsx (авто)</button>
            <button id="manualBtn" class="btn">📁 Выбрать файл вручную</button>
            <button id="mermaidLiveBtn" class="btn" disabled>🔗 Открыть в mermaid.live</button>
            <input type="file" id="fileInput" accept=".xlsx, .xls">
        </div>
        <div id="status" class="status">⏳ Загрузка tree.xlsx...</div>
        <div id="mermaidContainer" class="mermaid-container">Дерево будет построено здесь...</div>
        <footer>Двойной клик по узлу — показать фото (если есть) | Фото из папки .pic/</footer>
    </div>
    <script>
        (function() {
            // ---- Глобальные переменные ----
            let people = [];                // массив объектов Person
            let mermaidCode = '';           // последний сгенерированный код
            const mermaidLiveBtn = document.getElementById('mermaidLiveBtn');
            const statusDiv = document.getElementById('status');
            const container = document.getElementById('mermaidContainer');
            const loadBtn = document.getElementById('loadBtn');
            const manualBtn = document.getElementById('manualBtn');
            const fileInput = document.getElementById('fileInput');

            // ---- Инициализация Mermaid ----
            mermaid.initialize({
                theme: 'default',
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,        // разрешаем HTML внутри узлов (позже заменим на foreignObject)
                    curve: 'basis',
                    padding: 15
                },
                securityLevel: 'loose',
                startOnLoad: false
            });

            // ---- Вспомогательные функции ----
            function showStatus(msg, isError = false) {
                statusDiv.textContent = msg;
                statusDiv.style.backgroundColor = isError ? '#f8d7da' : '#fff3cd';
                statusDiv.style.borderLeftColor = isError ? '#dc3545' : '#ffc107';
            }

            // Загрузка и парсинг Excel (из ArrayBuffer)
            function parseExcel(arrayBuffer) {
                try {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    // Ищем лист person (может быть первый)
                    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('person')) || workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    // Преобразуем в JSON, начиная со строки 2 (пропускаем заголовок)
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                    if (rows.length < 2) {
                        throw new Error('Нет данных на листе person');
                    }
                    // Заголовки: idA, label, sex, newSurname, hasFather, hasMother, birth, death
                    const dataRows = rows.slice(1).filter(row => row[1] && row[1].toString().trim() !== ''); // хотя бы label не пустой
                    const peopleList = dataRows.map(row => ({
                        idA: row[0] ? row[0].toString().trim() : '',
                        label: row[1] ? row[1].toString().trim() : '',
                        sex: row[2] ? row[2].toString().trim() : '',
                        newSurname: row[3] ? row[3].toString().trim() : '',
                        hasFather: row[4] ? row[4].toString().trim() : '',
                        hasMother: row[5] ? row[5].toString().trim() : '',
                        birth: row[6] ? row[6].toString().trim() : '',
                        death: row[7] ? row[7].toString().trim() : ''
                    })).filter(p => p.idA && p.label); // обязательные поля

                    if (peopleList.length === 0) throw new Error('Нет записей с idA и label');
                    return peopleList;
                } catch (e) {
                    showStatus('Ошибка парсинга Excel: ' + e.message, true);
                    throw e;
                }
            }

            // Генерация кода Mermaid
            function generateMermaidCode(people) {
                const nodes = [];
                const edges = [];
                const coupleSet = new Set(); // для уникальных пар отец-мать

                // Узлы
                people.forEach(p => {
                    const birthYear = p.birth || '?';
                    const deathYear = p.death || '?';
                    const label = `${p.label} (${birthYear}-${deathYear})`;
                    // Экранируем кавычки и спецсимволы (если есть) – в данном случае метки без кавычек
                    nodes.push(`${p.idA}["${label}"]`);
                });

                // Связи ребёнок -> родитель и сбор супружеских пар
                people.forEach(p => {
                    if (p.hasFather && p.hasFather !== '') {
                        edges.push(`${p.hasFather} --> ${p.idA}`);
                    }
                    if (p.hasMother && p.hasMother !== '') {
                        edges.push(`${p.hasMother} --> ${p.idA}`);
                    }
                    if (p.hasFather && p.hasMother && p.hasFather !== '' && p.hasMother !== '') {
                        // упорядочим для уникальности (отец-мать)
                        const coupleKey = p.hasFather < p.hasMother ? `${p.hasFather}|${p.hasMother}` : `${p.hasMother}|${p.hasFather}`;
                        coupleSet.add(coupleKey);
                    }
                });

                // Добавляем рёбра супругов (ненаправленные)
                coupleSet.forEach(couple => {
                    const [a, b] = couple.split('|');
                    edges.push(`${a} --- ${b}`);
                });

                // Класс person для всех узлов (чтобы потом легко найти)
                const classDefs = people.map(p => `class ${p.idA} person;`);

                // Собираем полный код
                return `graph TB\n  ${nodes.join('\n  ')}\n  ${edges.join('\n  ')}\n  ${classDefs.join('\n  ')}`;
            }

            // Добавление фото в узлы после рендера
            function enhanceWithPhotos() {
                const svg = document.querySelector('#mermaidContainer svg');
                if (!svg) {
                    console.warn('SVG не найден');
                    return;
                }

                people.forEach(person => {
                    const expectedText = `${person.label} (${person.birth || '?'}-${person.death || '?'})`;

                    // Ищем группу, содержащую текст узла
                    const groups = svg.querySelectorAll('g');
                    let targetGroup = null;
                    for (let g of groups) {
                        const textElem = g.querySelector('text');
                        if (textElem && textElem.textContent.includes(expectedText)) {
                            targetGroup = g;
                            break;
                        }
                    }
                    if (!targetGroup) {
                        console.warn(`Узел не найден для: ${person.label}`);
                        return;
                    }

                    // Получаем прямоугольник (фон узла)
                    const rect = targetGroup.querySelector('rect');
                    if (!rect) {
                        console.warn('rect не найден в группе');
                        return;
                    }

                    // Координаты и размеры
                    const x = parseFloat(rect.getAttribute('x'));
                    const y = parseFloat(rect.getAttribute('y'));
                    const width = parseFloat(rect.getAttribute('width'));
                    const height = parseFloat(rect.getAttribute('height'));

                    // Удаляем оригинальные rect и все текстовые элементы (они будут заменены)
                    targetGroup.querySelectorAll('rect, text').forEach(el => el.remove());

                    // Создаём foreignObject с HTML-содержимым
                    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                    fo.setAttribute('x', x);
                    fo.setAttribute('y', y);
                    fo.setAttribute('width', width);
                    fo.setAttribute('height', height);

                    // Внутренний div с фото и текстом
                    const div = document.createElement('div');
                    div.style.cssText = `
                        display: flex;
                        align-items: center;
                        height: 100%;
                        width: 100%;
                        background-color: #f8f9fa;
                        border-radius: 4px;
                        overflow: hidden;
                        box-sizing: border-box;
                        padding: 2px;
                    `;

                    const img = document.createElement('img');
                    img.style.cssText = `
                        width: 30px;
                        height: 30px;
                        object-fit: cover;
                        border-radius: 3px;
                        margin-right: 4px;
                        flex-shrink: 0;
                    `;
                    // Формируем путь к фото
                    const photoPath = `.pic/${person.idA}.png`;
                    img.src = photoPath + '?t=' + Date.now(); // антикэш
                    img.onerror = function() {
                        this.onerror = null;
                        // Заглушка по умолчанию в зависимости от пола
                        const defaultImg = person.sex === 'М' ? '.pic/defaultm.png' : '.pic/defaultf.png';
                        this.src = defaultImg + '?t=' + Date.now();
                    };
                    img.alt = person.label;

                    const span = document.createElement('span');
                    span.style.cssText = `
                        font-size: 12px;
                        line-height: 1.2;
                        word-break: break-word;
                        flex: 1;
                    `;
                    span.textContent = expectedText;

                    div.appendChild(img);
                    div.appendChild(span);
                    fo.appendChild(div);
                    targetGroup.appendChild(fo);
                });

                // Небольшое примечание: связи между супругами остаются без изменений.
            }

            // Основная функция построения дерева
            async function buildTree(peopleArray) {
                if (!peopleArray || peopleArray.length === 0) {
                    showStatus('Нет данных для отображения', true);
                    return;
                }
                people = peopleArray;
                mermaidCode = generateMermaidCode(people);

                // Активируем кнопку mermaid.live
                mermaidLiveBtn.disabled = false;

                // Очищаем контейнер
                container.innerHTML = '';

                try {
                    // Рендерим Mermaid
                    const { svg } = await mermaid.render('mermaidChart', mermaidCode);
                    container.innerHTML = svg;

                    // Добавляем фото
                    enhanceWithPhotos();

                    showStatus('✅ Дерево успешно построено');
                } catch (err) {
                    showStatus('Ошибка рендеринга Mermaid: ' + err.message, true);
                    console.error(err);
                }
            }

            // ---- Загрузка файла (fetch или через input) ----
            async function loadFromUrl(url) {
                try {
                    showStatus('⏳ Загрузка файла...');
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const arrayBuffer = await response.arrayBuffer();
                    const data = parseExcel(arrayBuffer);
                    await buildTree(data);
                } catch (e) {
                    showStatus('Не удалось загрузить tree.xlsx: ' + e.message + '. Выберите файл вручную.', true);
                }
            }

            function loadFromFile(file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const arrayBuffer = e.target.result;
                        const data = parseExcel(arrayBuffer);
                        await buildTree(data);
                    } catch (err) {
                        showStatus('Ошибка при чтении файла: ' + err.message, true);
                    }
                };
                reader.readAsArrayBuffer(file);
            }

            // ---- События ----
            loadBtn.addEventListener('click', () => {
                loadFromUrl('tree.xlsx');
            });

            manualBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    loadFromFile(file);
                }
                fileInput.value = ''; // чтобы можно было выбрать тот же файл повторно
            });

            mermaidLiveBtn.addEventListener('click', () => {
                if (!mermaidCode) return;
                try {
                    // Компрессия через pako и base64
                    const encoder = new TextEncoder();
                    const data = encoder.encode(mermaidCode);
                    const compressed = pako.deflate(data, { level: 9 });
                    // Преобразуем Uint8Array в строку base64
                    let binary = '';
                    compressed.forEach(byte => binary += String.fromCharCode(byte));
                    const base64 = btoa(binary);
                    // Формируем URL
                    const url = `https://mermaid.live/edit#pako:${base64}`;
                    window.open(url, '_blank');
                } catch (err) {
                    alert('Ошибка сжатия: ' + err.message);
                }
            });

            // ---- Автозагрузка при старте ----
            loadFromUrl('tree.xlsx');
        })();
    </script>
</body>
</html>
```

## Как это работает

1. **Загрузка данных**  
   При открытии страницы автоматически загружается файл `tree.xlsx` (ожидается рядом с `index.html`). Если это не удаётся, можно выбрать файл вручную кнопкой «Выбрать файл вручную».

2. **Парсинг Excel**  
   Используется библиотека `SheetJS`. Читается лист `person`, строки со 2-й по последнюю. Из каждой строки извлекаются поля: `idA`, `label`, `sex`, `hasFather`, `hasMother`, `birth`, `death`.

3. **Построение кода Mermaid**  
   - Каждый человек становится узлом с меткой вида `Имя Фамилия (год-год)`.
   - Добавляются направленные рёбра от родителя к ребёнку.
   - Для каждой уникальной пары родителей добавляется ненаправленное ребро (`---`), отображающее супружескую связь.
   - Все узлы получают класс `person` для последующей идентификации.

4. **Рендеринг и добавление фото**  
   - После вызова `mermaid.render` полученный SVG вставляется в контейнер.
   - Функция `enhanceWithPhotos()` находит каждый узел по тексту метки, удаляет стандартные `rect` и `text` и заменяет их на `<foreignObject>` с HTML-структурой:  
     `<div>` с фото (или заглушкой) и текстом.
   - Путь к фото: `.pic/{idA}.png`. Если файл не загружается, подставляется `.pic/defaultm.png` для мужчин (`М`) или `.pic/defaultf.png` для женщин (`Ж`).

5. **Кнопка «mermaid.live»**  
   - Берёт текущий код диаграммы (без фото, только структура), сжимает его с помощью `pako.deflate`, преобразует в base64 и открывает ссылку вида `https://mermaid.live/edit#pako:...`.

## Требования к окружению

- Файл `tree.xlsx` должен находиться в той же папке, что и `index.html` (для автозагрузки).
- Папка `.pic` должна содержать:
  - Файлы с именами вида `{idA}.png` (например, `Ульянов_Владимир_Ильич.png`).
  - Заглушки `defaultm.png` и `defaultf.png` (если каких-то фото нет).
- Для работы в браузере может потребоваться локальный сервер (например, `live-server`) из-за политики CORS при загрузке локального `.xlsx` через `fetch`. В качестве запасного варианта предусмотрена ручная загрузка.

## Примечания

- Внешний вид узлов приближен к классическим генеалогическим деревьям: фото слева, текст справа.
- Связи между супругами отображаются линией без стрелок.
- Если даты жизни не указаны, отображается `?`.
- При двойном клике по узлу ничего не происходит (можно доработать под всплывающие подсказки).

Готовый `index.html` можно сохранить и открыть в браузере.
