Замечания
```
Пояснения:

m.idA – это идентификатор семьи из листа family (например, Ульянов_Илья_Николаевич-Бланк_Мария_Александровна). Заменяем все недопустимые символы (дефис, точка, пробел и т.п.) на подчёркивание.

Если idA отсутствует (пустая строка или undefined), используем запасное имя marriage_N (где N – индекс).
```
m.idA – это идентификатор семьи из листа family - считаем, что верный и уникальный и всегда присутствует (иначе сообщение об ошибке). Не нужно никаких замен, оставляем его именно таким - как он считан из листа family из поля idA. 
Приведи полный код модуля для замены "файл на файл".


## Полная исправленная функция `generateDotCode` (для замены в `index.html`)

```javascript
// --- Generate DOT code using native image= attribute ---
// Each node is portrait-oriented: photo at top, text label at bottom.
// Uses fixedsize=true with width/height so Graphviz reserves exact space.
// imagepos=tc places photo at top-center; labelloc=b places text at bottom.
// No <<TABLE>> labels — readable plain DOT code only.
// Spaces in label names are replaced with \n for better layout.
// Optional picDirOverride: if provided, use this directory for image paths in DOT code
// (used in relativeGraphvizOnline mode to generate DOT code for GraphvizOnline with absolute URLs).
async function generateDotCode(peopleList, marriages, picDirOverride) {
    const nodes = [];
    const edges = [];
    const clusters = [];
    // Set of all person idA values for membership check
    const personIdSet = new Set(peopleList.map(p => p.idA));

    for (const p of peopleList) {
        const birthYear = p.birth || '?';
        const deathYear = p.death || '?';

        let fillcolor = UNKNOWN_COLOR;
        if (p.sex === 'М' || p.sex === 'M') fillcolor = MALE_COLOR;
        else if (p.sex === 'Ж' || p.sex === 'F') fillcolor = FEMALE_COLOR;

        const nodeId = p.idA;
        // Build label: start with surName2 if present, then the full name, then years
        let labelName = p.label.replace(/ /g, '\\n');
        if (p.surName2) {
            labelName = p.surName2.replace(/ /g, '\\n') + '\\n' + labelName;
        }
        const labelText = `${labelName}\\n${birthYear}–${deathYear}`;

        // For surName2 nodes, use FONT_SIZE_SURNAME2 to produce compact text layout.
        // The margin attribute alone has no effect on fixedsize=true nodes, so fontsize is used
        // to reflect the fontsizeSurName2 config: smaller value → more compact text.
        const nodeFontSize = p.surName2 ? FONT_SIZE_SURNAME2 : FONT_SIZE;
        const fontSizeAttr = nodeFontSize !== FONT_SIZE ? `, fontsize=${nodeFontSize}` : '';

        const photoPath = await getPersonPhotoPath(p, picDirOverride);
        if (photoPath) {
            // Portrait node: photo at top-center at its registered size, text at bottom.
            // fixedsize=true locks the node to exactly width×height so layout is consistent.
            // imagescale=false keeps photo at registered PHOTO_SIZE_PX so it doesn't
            // stretch over the text area; labelloc=b places text at bottom inside node.
            nodes.push(`  ${nodeId} [shape=box, style="filled", fillcolor="${fillcolor}", color="${BORDER_COLOR}",`);
            nodes.push(`    label="${labelText}", image="${photoPath}",`);
            nodes.push(`    fixedsize=true, width=${NODE_WIDTH_IN}, height=${NODE_HEIGHT_IN}${fontSizeAttr},`);
            nodes.push(`    imagepos=tc, imagescale=false, labelloc=b];`);
        } else {
            nodes.push(`  ${nodeId} [shape=box, style="filled", fillcolor="${fillcolor}", color="${BORDER_COLOR}", label="${labelText}"${fontSizeAttr}];`);
        }
    }

    // Parent relationships — стрелки от родителя к ребёнку окрашены цветом родителя
    // От отца — цветом фона мужчины (MALE_COLOR), от матери — цветом фона женщины (FEMALE_COLOR)
    peopleList.forEach(p => {
        const childId = p.idA;
        if (p.hasFather) edges.push(`  ${p.hasFather} -> ${childId} [color="${MALE_COLOR}"];`);
        if (p.hasMother) edges.push(`  ${p.hasMother} -> ${childId} [color="${FEMALE_COLOR}"];`);
    });

    // Marriage clusters from family sheet
    // Only include couples where both husband and wife are in the current graph
    (marriages || []).forEach(m => {
        if (personIdSet.has(m.husband) && personIdSet.has(m.wife)) {
            // Use the family idA as the subgraph name (enclosed in quotes for safety)
            const clusterName = m.idA ? m.idA : 'unknown_family';
            const clusterLines = [];
            clusterLines.push(`  subgraph "cluster_${clusterName}" {`);
            if (m.marriage) {
                clusterLines.push(`    label="${m.marriage}";`);
            } else {
                clusterLines.push(`    label="";`);
            }
            clusterLines.push(`    rank=same;`);
            clusterLines.push(`    style=dashed;`);
            clusterLines.push(`    color="${EDGE_COLOR}";`);
            clusterLines.push(`    ${m.husband};`);
            clusterLines.push(`    ${m.wife};`);
            clusterLines.push(`  }`);
            clusters.push(clusterLines.join('\n'));
        }
    });

    const clusterSection = clusters.length > 0 ? '\n' + clusters.join('\n') + '\n' : '';
    return `digraph G {\n  rankdir=TB;\n  node [fontname="${FONT_NAME}", fontsize=${FONT_SIZE}];\n  edge [color="${EDGE_COLOR}"];\n\n${nodes.join('\n')}\n${clusterSection}\n${edges.join('\n')}\n}`;
}
```

### Что изменено:
- Убран счётчик `clusterIdx`.
- Имя подграфа формируется как `"cluster_" + m.idA` (если `idA` присутствует, иначе `'unknown_family'`).
- Всё имя подграфа заключено в двойные кавычки, что позволяет использовать любые символы (дефисы, пробелы, точки) без необходимости их замены.
- Комментарии обновлены, чтобы отразить использование исходного `idA`.

### Как использовать:
Замените существующую функцию `generateDotCode` в файле `index.html` на приведённый выше код.  
Убедитесь, что все переменные (`UNKNOWN_COLOR`, `MALE_COLOR`, `FEMALE_COLOR`, `BORDER_COLOR`, `EDGE_COLOR`, `FONT_NAME`, `FONT_SIZE`, `FONT_SIZE_SURNAME2`, `NODE_WIDTH_IN`, `NODE_HEIGHT_IN`, а также функция `getPersonPhotoPath`) доступны в области видимости (они определены выше в том же скрипте).

### Problem graph name 
Мы должны предоставить исправленный полный код index.html, в котором в функции generateDotCode имя кластера задаётся как cluster_ + m.idA без кавычек и без замены символов, считая что idA содержит только допустимые символы (буквы, цифры, подчёркивание, дефис).  
Дефис допустим в именах узлов и подграфов Graphviz? В спецификации Graphviz идентификаторы могут содержать буквы, цифры, подчёркивание и, возможно, дефис? На самом деле дефис не допускается в идентификаторах без кавычек. Согласно документации Graphviz, идентификатор может состоять из букв, цифр, знака подчёркивания, и может начинаться с буквы или подчёркивания. Дефис не разрешён.
