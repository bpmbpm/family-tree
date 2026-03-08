### XLSX is not defined
При запуске https://bpmbpm.github.io/family-tree/ver4/index.html в некоторых случаях (особенно с браузера телефона) получаю сообщение:  
Ошибка загрузки: файл XLSX is not defined  
Хотя он присутствует в папке. Укажи причины и предложи решение. Код приложен.

## Причины ошибки "XLSX is not defined"

1. **Асинхронность загрузки скрипта**  
   Библиотека SheetJS загружается через `<script src="...">` в `<head>`. Хотя это синхронная загрузка (без `async`/`defer`), в условиях медленной сети или нестабильного соединения (особенно на мобильных устройствах) скрипт может не успеть загрузиться к моменту вызова `parseExcel`. Функция `loadFromUrl` вызывается сразу после загрузки конфига, не дожидаясь полной загрузки SheetJS.

2. **Блокировка CDN**  
   Некоторые мобильные операторы или корпоративные сети могут блокировать доступ к определённым CDN (cdn.sheetjs.com). В этом случае скрипт не загружается, и `XLSX` остаётся `undefined`.

3. **Отсутствие fallback**  
   В коде нет проверки наличия `XLSX` перед вызовом `XLSX.read`. Если переменная не определена, возникает ошибка.

## Решение

Необходимо явно дождаться загрузки библиотеки SheetJS перед парсингом Excel. Рекомендуется использовать динамическую загрузку с Promise и добавить fallback на локальную копию (если есть).

### Исправленный фрагмент `index.html`

Добавьте функцию `loadSheetJS` и измените инициализацию:

```javascript
// --- Динамическая загрузка SheetJS ---
function loadSheetJS() {
    return new Promise((resolve, reject) => {
        if (typeof XLSX !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = () => {
            // Fallback на локальный файл, если CDN недоступен
            console.warn('Не удалось загрузить SheetJS с CDN, пробуем локальный xlsx.full.min.js');
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'xlsx.full.min.js'; // предположим, файл лежит рядом
            fallbackScript.onload = resolve;
            fallbackScript.onerror = reject;
            document.head.appendChild(fallbackScript);
        };
        document.head.appendChild(script);
    });
}
```

Затем замените блок в конце самовызывающейся функции:

```javascript
// Load config first, then start loading tree data.
const configPromise = loadConfig();
configPromise.then(async () => {
    try {
        await loadSheetJS(); // гарантируем загрузку SheetJS
        loadFromUrl('tree.xlsx');
    } catch (e) {
        showStatus('Ошибка загрузки библиотеки XLSX. Проверьте подключение к интернету.', true);
        console.error(e);
    }
});
```

### Полный исправленный код конца `index.html`

```javascript
            // --- Load config first, then start loading tree data. ---
            const configPromise = loadConfig();
            configPromise.then(async () => {
                try {
                    await loadSheetJS(); // гарантируем загрузку SheetJS
                    loadFromUrl('tree.xlsx');
                } catch (e) {
                    showStatus('Ошибка загрузки библиотеки XLSX. Проверьте подключение к интернету.', true);
                    console.error(e);
                }
            });
        })();
    </script>
</body>
</html>
```

### Дополнительные рекомендации

1. **Локальная копия**  
   Если вы ожидаете частые проблемы с CDN, скачайте файл `xlsx.full.min.js` и положите его в ту же папку, что и `index.html`. Тогда fallback сработает без интернета.

2. **Проверка в `loadFromUrl` и `loadFromFile`**  
   Можно также добавить проверку внутри этих функций, но лучше централизованно дождаться загрузки перед любым вызовом.

3. **Обработка ошибок**  
   В случае неудачной загрузки показывается понятное сообщение пользователю.

После внесения этих изменений ошибка "XLSX is not defined" должна исчезнуть даже на медленных или нестабильных соединениях.
