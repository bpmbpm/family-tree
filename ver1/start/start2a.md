Вот обновлённый код `index.html`, который учитывает все замечания:

- Миниатюра фото слева (из папки `.pic/` или заглушка по умолчанию).
- Год рождения и смерти на отдельной строке под именем.
- Рамка синяя для мужчин, розовая для женщин.
- При нажатии «Открыть в mermaid.live» передаётся код без фото, но с цветовой дифференциацией (синий/розовый фон).

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Генеалогическое дерево (Mermaid) с фото</title>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background: #f0f2f5;
            color: #1e1e2f;
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
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        button:hover {
            background: #1e2b37;
        }
        button:disabled {
            background: #95a5a6;
            cursor: not-allowed;
        }
        #fileInput {
            display: none;
        }
        .status {
            padding: 10px 15px;
            background: #fff8e5;
            border-left: 5px solid #f1c40f;
            border-radius: 4px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        .mermaid-container {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            overflow-x: auto;
            min-height: 500px;
        }
        .mermaid-container svg {
            max-width: 100%;
            height: auto;
            margin: 0 auto;
            display: block;
        }
        footer {
            margin-top: 25px;
            text-align: center;
            color: #5d6d7e;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌳 Семейное древо с фото</h1>
        <div class="toolbar">
            <button id="loadBtn">📂 Загрузить tree.xlsx</button>
            <button id="manualBtn">📁 Выбрать файл</button>
            <button id="mermaidLiveBtn" disabled>🔗 Открыть в mermaid.live</button>
            <input type="file" id="fileInput" accept=".xlsx, .xls">
        </div>
        <div id="status" class="status">⏳ Ожидание загрузки файла...</div>
        <div id="mermaidContainer" class="mermaid-container">Дерево будет построено здесь...</div>
        <footer>Фото из папки .pic/ (idA.png). Для мужчин рамка синяя, для женщин — розовая.</footer>
    </div>
    <script>
        (function() {
            // ---- Глобальные переменные ----
            let people = [];                // массив объектов Person
            let rawMermaidCode = '';         // код без фото, только для экспорта
            const mermaidLiveBtn = document.getElementById('mermaidLiveBtn');
            const statusDiv = document.getElementById('status');
            const container = document.getElementById('mermaidContainer');
            const loadBtn = document.getElementById('loadBtn');
            const manualBtn = document.getElementById('manualBtn');
            const fileInput = document.getElementById('fileInput');

            // ---- Инициализация Mermaid (отключаем автостарт) ----
            mermaid.initialize({
                theme: 'base',
                themeVariables: {
                    'background': '#ffffff',
                    'primaryColor': '#f9f9f9',
                    'primaryBorderColor': '#333',
                    'primaryTextColor': '#1e1e2f',
                    'lineColor': '#5d6d7e',
                    'secondaryColor': '#f0f0f0',
                    'tertiaryColor': '#fff'
                },
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis',
                    padding: 20
                },
                securityLevel: 'loose',
                startOnLoad: false
            });

            // ---- Вспомогательные функции ----
            function showStatus(msg, isError = false) {
                statusDiv.textContent = msg;
                statusDiv.style.backgroundColor = isError ? '#fadbd8' : '#fff8e5';
                statusDiv.style.borderLeftColor = isError ? '#e74c3c' : '#f1c40f';
            }

            // Парсинг Excel
            function parseExcel(arrayBuffer) {
                try {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('person')) || workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                    if (rows.length < 2) throw new Error('Нет данных на листе person');

                    const dataRows = rows.slice(1).filter(row => row[1] && row[1].toString().trim() !== '');
                    const peopleList = dataRows.map(row => ({
                        idA: row[0] ? row[0].toString().trim() : '',
                        label: row[1] ? row[1].toString().trim() : '',
                        sex: row[2] ? row[2].toString().trim() : '',
                        newSurname: row[3] ? row[3].toString().trim() : '',
                        hasFather: row[4] ? row[4].toString().trim() : '',
                        hasMother: row[5] ? row[5].toString().trim() : '',
                        birth: row[6] ? row[6].toString().trim() : '',
                        death: row[7] ? row[7].toString().trim() : ''
                    })).filter(p => p.idA && p.label);

                    if (peopleList.length === 0) throw new Error('Нет записей с idA и label');
                    return peopleList;
                } catch (e) {
                    showStatus('Ошибка парсинга Excel: ' + e.message, true);
                    throw e;
                }
            }

            // Генерация кода Mermaid с цветовыми классами (male/female)
            function generateMermaidCode(people) {
                const nodes = [];
                const edges = [];
                const coupleSet = new Set();

                // Определения стилей для классов
                const classDefs = [
                    'classDef male fill:#a3c4f3,stroke:#2c3e50,stroke-width:2px;',
                    'classDef female fill:#fbb9c0,stroke:#a6344b,stroke-width:2px;',
                    'classDef unknown fill:#d5d8dc,stroke:#2c3e50,stroke-width:2px;'
                ];

                // Узлы с меткой (имя и годы в одной строке для совместимости с mermaid.live)
                people.forEach(p => {
                    const birthYear = p.birth || '?';
                    const deathYear = p.death || '?';
                    const label = `${p.label} (${birthYear}-${deathYear})`;
                    nodes.push(`${p.idA}["${label}"]`);
                });

                // Родительские связи и сбор супружеских пар
                people.forEach(p => {
                    if (p.hasFather && p.hasFather !== '') {
                        edges.push(`${p.hasFather} --> ${p.idA}`);
                    }
                    if (p.hasMother && p.hasMother !== '') {
                        edges.push(`${p.hasMother} --> ${p.idA}`);
                    }
                    if (p.hasFather && p.hasMother && p.hasFather !== '' && p.hasMother !== '') {
                        const coupleKey = p.hasFather < p.hasMother ? `${p.hasFather}|${p.hasMother}` : `${p.hasMother}|${p.hasFather}`;
                        coupleSet.add(coupleKey);
                    }
                });

                // Супружеские рёбра
                coupleSet.forEach(couple => {
                    const [a, b] = couple.split('|');
                    edges.push(`${a} --- ${b}`);
                });

                // Назначение классов по полу
                const classAssignments = people.map(p => {
                    let cls = 'unknown';
                    if (p.sex === 'М' || p.sex === 'M' || p.sex === 'Male' || p.sex === 'муж') cls = 'male';
                    else if (p.sex === 'Ж' || p.sex === 'F' || p.sex === 'Female' || p.sex === 'жен') cls = 'female';
                    return `class ${p.idA} ${cls};`;
                });

                return `graph TB\n  ${nodes.join('\n  ')}\n  ${edges.join('\n  ')}\n  ${classDefs.join('\n  ')}\n  ${classAssignments.join('\n  ')}`;
            }

            // Кастомизация узлов после рендера: добавляем фото и двустрочный текст
            async function customizeNodes() {
                const svg = document.querySelector('#mermaidContainer svg');
                if (!svg) {
                    console.warn('SVG не найден');
                    return;
                }

                // Для каждого человека ищем соответствующую группу узла
                for (const person of people) {
                    const expectedLabel = `${person.label} (${person.birth || '?'}-${person.death || '?'})`;
                    // Ищем группу, содержащую текстовый элемент с этой меткой
                    const groups = svg.querySelectorAll('g');
                    let targetGroup = null;
                    for (let g of groups) {
                        const textElem = g.querySelector('text');
                        if (textElem && textElem.textContent.includes(expectedLabel)) {
                            targetGroup = g;
                            break;
                        }
                    }
                    if (!targetGroup) {
                        console.warn(`Узел не найден для: ${person.label}`);
                        continue;
                    }

                    // Получаем прямоугольник (фон узла)
                    const rect = targetGroup.querySelector('rect');
                    if (!rect) continue;

                    const x = parseFloat(rect.getAttribute('x'));
                    const y = parseFloat(rect.getAttribute('y'));
                    const width = parseFloat(rect.getAttribute('width'));
                    const height = parseFloat(rect.getAttribute('height'));

                    // Удаляем оригинальные rect и все тексты внутри группы
                    targetGroup.querySelectorAll('rect, text').forEach(el => el.remove());

                    // Создаём foreignObject с HTML
                    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                    fo.setAttribute('x', x);
                    fo.setAttribute('y', y);
                    fo.setAttribute('width', width);
                    fo.setAttribute('height', height);

                    // Внутренний div с фото, именем и годами
                    const div = document.createElement('div');
                    div.style.cssText = `
                        display: flex;
                        align-items: center;
                        height: 100%;
                        width: 100%;
                        background-color: ${person.sex === 'М' ? '#a3c4f3' : (person.sex === 'Ж' ? '#fbb9c0' : '#d5d8dc')};
                        border: 2px solid ${person.sex === 'М' ? '#2c3e50' : '#a6344b'};
                        border-radius: 8px;
                        overflow: hidden;
                        box-sizing: border-box;
                        padding: 4px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    `;

                    // Левая часть: фото
                    const img = document.createElement('img');
                    img.style.cssText = `
                        width: 45px;
                        height: 45px;
                        object-fit: cover;
                        border-radius: 6px;
                        margin-right: 8px;
                        border: 1px solid #fff;
                        flex-shrink: 0;
                    `;
                    const photoPath = `.pic/${person.idA}.png`;
                    img.src = photoPath + '?t=' + Date.now(); // антикэш
                    img.onerror = function() {
                        this.onerror = null;
                        const defaultImg = person.sex === 'М' ? '.pic/defaultm.png' : '.pic/defaultf.png';
                        this.src = defaultImg + '?t=' + Date.now();
                    };
                    img.alt = person.label;

                    // Правая часть: имя и годы (столбик)
                    const textDiv = document.createElement('div');
                    textDiv.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        flex: 1;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #1e1e2f;
                        font-weight: 500;
                    `;

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = person.label;
                    nameSpan.style.fontWeight = 'bold';

                    const yearsSpan = document.createElement('span');
                    yearsSpan.textContent = `${person.birth || '?'} — ${person.death || '?'}`;
                    yearsSpan.style.fontSize = '11px';
                    yearsSpan.style.opacity = '0.8';

                    textDiv.appendChild(nameSpan);
                    textDiv.appendChild(yearsSpan);

                    div.appendChild(img);
                    div.appendChild(textDiv);
                    fo.appendChild(div);
                    targetGroup.appendChild(fo);
                }
            }

            // Основная функция построения дерева
            async function buildTree(peopleArray) {
                if (!peopleArray || peopleArray.length === 0) {
                    showStatus('Нет данных для отображения', true);
                    return;
                }
                people = peopleArray;
                rawMermaidCode = generateMermaidCode(people);  // код для экспорта (без кастомизации)
                mermaidLiveBtn.disabled = false;

                container.innerHTML = '';

                try {
                    // Рендерим чистую Mermaid диаграмму
                    const { svg } = await mermaid.render('mermaidChart', rawMermaidCode);
                    container.innerHTML = svg;

                    // Теперь заменяем узлы на кастомизированные с фото
                    await customizeNodes();

                    showStatus('✅ Дерево успешно построено');
                } catch (err) {
                    showStatus('Ошибка рендеринга Mermaid: ' + err.message, true);
                    console.error(err);
                }
            }

            // ---- Загрузка файла ----
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

            // ---- Обработчики ----
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
                fileInput.value = '';
            });

            mermaidLiveBtn.addEventListener('click', () => {
                if (!rawMermaidCode) return;
                try {
                    // Компрессия через pako и base64
                    const encoder = new TextEncoder();
                    const data = encoder.encode(rawMermaidCode);
                    const compressed = pako.deflate(data, { level: 9 });
                    let binary = '';
                    compressed.forEach(byte => binary += String.fromCharCode(byte));
                    const base64 = btoa(binary);
                    const url = `https://mermaid.live/edit#pako:${base64}`;
                    window.open(url, '_blank');
                } catch (err) {
                    alert('Ошибка сжатия: ' + err.message);
                }
            });

            // Автозагрузка при старте
            loadFromUrl('tree.xlsx');
        })();
    </script>
</body>
</html>
```

## Что изменилось

1. **Фото слева** – теперь каждый узел после рендера заменяется на `foreignObject` с `flex`-контейнером: слева `<img>` (из `.pic/idA.png` или заглушка), справа текст.
2. **Годы на отдельной строке** – внутри правого блока имя и годы расположены вертикально.
3. **Цвет рамки** – фон узла задаётся в зависимости от пола (синий/розовый/серый). В экспорте в mermaid.live используются классы `male`/`female` с соответствующими `fill`.
4. **Кнопка mermaid.live** – передаётся код без фото, но с цветовыми классами, поэтому в онлайн-редакторе увидят цветные прямоугольники (синие/розовые) с текстом в одну строку (так как mermaid не поддерживает сложный HTML в узлах).

## Требования

- Файл `tree.xlsx` должен лежать рядом с `index.html`.
- Папка `.pic` содержит фото с именами `{idA}.png` и заглушки `defaultm.png` / `defaultf.png`.
- Для пола используются обозначения: `М` или `M` – мужчина, `Ж` или `F` – женщина. Остальное – неизвестный пол (серая рамка).

Теперь дерево выглядит более похожим на классические генеалогические схемы с фото и цветовой дифференциацией.
