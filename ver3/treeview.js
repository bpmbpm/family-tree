// treeview.js — Панель дерева (TreeView) для семейного древа (ver3)
// Отображает иерархию персон по мужской (hasFather) или женской (hasMother) линии.
// Поддерживает: переключение линии, поиск (Начать с начала / Найти следующего),
// сворачивание (Home), полное раскрытие, выделение персоны на диаграмме по клику.

(function () {

    // =====================================================================
    // Состояние модуля
    // =====================================================================

    // Режим отображения: 'male' — по hasFather, 'female' — по hasMother
    var currentMode = 'male';

    // Массив персон (ссылка на глобальный массив из index.html)
    var peopleData = [];

    // Состояние поиска
    var searchState = {
        searchTerm: '',
        results: [],         // массив найденных DOM-элементов
        currentIndex: -1,
        isSearchActive: false
    };

    // =====================================================================
    // Построение дерева
    // =====================================================================

    // --- Построить карту дочерних персон ---
    // Для каждой персоны собираем список детей (тех, у кого она указана как отец или мать)
    // mode: 'male' — строим по hasFather, 'female' — по hasMother
    function buildChildrenMap(people, mode) {
        var childrenMap = {}; // parentId -> [childId, ...]

        // Инициализируем карту для всех персон
        for (var i = 0; i < people.length; i++) {
            childrenMap[people[i].idA] = [];
        }

        for (var j = 0; j < people.length; j++) {
            var person = people[j];
            var parentId = (mode === 'female') ? person.hasMother : person.hasFather;
            if (parentId && childrenMap[parentId] !== undefined) {
                childrenMap[parentId].push(person.idA);
            }
        }

        return childrenMap;
    }

    // --- Найти корневые узлы дерева ---
    // Корень — персона нужного пола, у которой нет родителя в текущем режиме
    // (hasFather или hasMother) или чей родитель не присутствует в массиве people.
    // В режиме 'male' корнями могут быть только мужчины (sex === 'М' или 'M').
    // В режиме 'female' корнями могут быть только женщины (sex === 'Ж' или 'F').
    // Корни сортируются по году рождения (поле birth) по возрастанию — старший первым.
    function findRoots(people, mode) {
        var idSet = {};
        for (var i = 0; i < people.length; i++) {
            idSet[people[i].idA] = true;
        }

        var roots = [];
        for (var j = 0; j < people.length; j++) {
            var person = people[j];
            var parentId = (mode === 'female') ? person.hasMother : person.hasFather;
            // Корень: нет поля-родителя или родитель не присутствует в данных
            if (!parentId || !idSet[parentId]) {
                // Фильтр по полу: мужская линия — только мужчины, женская — только женщины
                var sex = person.sex ? person.sex.trim() : '';
                var isMale = (sex === 'М' || sex === 'M');
                var isFemale = (sex === 'Ж' || sex === 'F');
                if (mode === 'male' && !isMale) continue;
                if (mode === 'female' && !isFemale) continue;
                roots.push(person.idA);
            }
        }

        // Сортируем корни по году рождения (по возрастанию, старший — первым).
        // Персоны без указанного года рождения помещаются в конец.
        var peopleMap = {};
        for (var k = 0; k < people.length; k++) {
            peopleMap[people[k].idA] = people[k];
        }
        roots.sort(function (aId, bId) {
            var aBirth = peopleMap[aId] ? parseInt(peopleMap[aId].birth, 10) : NaN;
            var bBirth = peopleMap[bId] ? parseInt(peopleMap[bId].birth, 10) : NaN;
            var aValid = !isNaN(aBirth);
            var bValid = !isNaN(bBirth);
            if (aValid && bValid) return aBirth - bBirth;
            if (aValid) return -1; // b без года — b в конец
            if (bValid) return 1;  // a без года — a в конец
            return 0;
        });

        return roots;
    }

    // --- Построить DOM-дерево рекурсивно ---
    // Возвращает <ul> элемент с вложенными <li> для каждой персоны
    function buildTreeDom(personId, peopleMap, childrenMap, depth) {
        var person = peopleMap[personId];
        if (!person) return null;

        var li = document.createElement('li');
        li.className = 'tv-item';

        // Контейнер строки (иконка раскрытия + метка)
        var row = document.createElement('div');
        row.className = 'tv-row';
        row.setAttribute('data-id', personId);

        var children = childrenMap[personId] || [];

        // Иконка раскрытия/сворачивания (▶/▼), только если есть дети
        var toggleIcon = document.createElement('span');
        toggleIcon.className = 'tv-toggle';
        if (children.length > 0) {
            toggleIcon.textContent = '▶';
            toggleIcon.title = 'Развернуть / свернуть';
        } else {
            toggleIcon.textContent = ' ';
            toggleIcon.className = 'tv-toggle tv-toggle-empty';
        }
        row.appendChild(toggleIcon);

        // Метка персоны (label_)
        var label = document.createElement('span');
        label.className = 'tv-label';
        label.textContent = person.label || personId;
        label.title = personId;
        row.appendChild(label);

        li.appendChild(row);

        // Рекурсивно добавляем детей в <ul>
        if (children.length > 0) {
            var ul = document.createElement('ul');
            ul.className = 'tv-children tv-collapsed'; // по умолчанию свёрнуто (кроме первого уровня)

            for (var i = 0; i < children.length; i++) {
                var childLi = buildTreeDom(children[i], peopleMap, childrenMap, depth + 1);
                if (childLi) ul.appendChild(childLi);
            }
            li.appendChild(ul);

            // Обработчик раскрытия/сворачивания по клику на иконку
            (function (icon, childList) {
                icon.addEventListener('click', function (event) {
                    event.stopPropagation();
                    toggleNode(icon, childList);
                });
            })(toggleIcon, ul);
        }

        // Обработчик клика на метку — выделить персону на диаграмме
        (function (pid) {
            label.addEventListener('click', function (event) {
                event.stopPropagation();
                selectPersonInDiagram(pid);
                highlightTreeViewRow(row);
            });
        })(personId);

        return li;
    }

    // --- Раскрыть/свернуть узел ---
    function toggleNode(icon, childList) {
        if (childList.classList.contains('tv-collapsed')) {
            childList.classList.remove('tv-collapsed');
            icon.textContent = '▼';
        } else {
            childList.classList.add('tv-collapsed');
            icon.textContent = '▶';
        }
    }

    // =====================================================================
    // Отображение и обновление дерева
    // =====================================================================

    // --- Отрисовать дерево в панели treeview ---
    function renderTreeView() {
        var container = document.getElementById('tv-content');
        if (!container) return;
        container.innerHTML = '';

        if (peopleData.length === 0) {
            container.innerHTML = '<div class="tv-empty">Загрузите данные</div>';
            return;
        }

        // Строим карты
        var peopleMap = {};
        for (var i = 0; i < peopleData.length; i++) {
            peopleMap[peopleData[i].idA] = peopleData[i];
        }
        var childrenMap = buildChildrenMap(peopleData, currentMode);
        var roots = findRoots(peopleData, currentMode);

        if (roots.length === 0) {
            container.innerHTML = '<div class="tv-empty">Нет корневых персон</div>';
            return;
        }

        var ul = document.createElement('ul');
        ul.className = 'tv-root-list';

        for (var j = 0; j < roots.length; j++) {
            var li = buildTreeDom(roots[j], peopleMap, childrenMap, 0);
            if (li) {
                ul.appendChild(li);
                // Первый уровень: раскрываем корни
                var childUl = li.querySelector('ul.tv-children');
                var toggleIcon = li.querySelector('.tv-toggle');
                if (childUl && toggleIcon) {
                    childUl.classList.remove('tv-collapsed');
                    toggleIcon.textContent = '▼';
                }
            }
        }

        container.appendChild(ul);

        // Сбросить состояние поиска при перестройке дерева
        resetSearch();
    }

    // =====================================================================
    // Переключение режима (мужская / женская линия)
    // =====================================================================

    window.tvSetMode = function (mode) {
        currentMode = mode;

        // Обновить активность кнопок
        var btnMale = document.getElementById('tv-btn-male');
        var btnFemale = document.getElementById('tv-btn-female');
        if (btnMale) btnMale.classList.toggle('tv-btn-active', mode === 'male');
        if (btnFemale) btnFemale.classList.toggle('tv-btn-active', mode === 'female');

        renderTreeView();
    };

    // =====================================================================
    // Кнопка Home — свернуть дерево в исходное состояние
    // =====================================================================

    window.tvHome = function () {
        // Сворачиваем все ветки кроме первого уровня
        var allChildrenUl = document.querySelectorAll('#tv-content ul.tv-children');
        for (var i = 0; i < allChildrenUl.length; i++) {
            allChildrenUl[i].classList.add('tv-collapsed');
        }

        // Обновляем иконки всех узлов с детьми
        var allToggles = document.querySelectorAll('#tv-content .tv-toggle:not(.tv-toggle-empty)');
        for (var j = 0; j < allToggles.length; j++) {
            allToggles[j].textContent = '▶';
        }

        // Раскрываем только первый уровень (прямые дети корней)
        var rootList = document.querySelector('#tv-content ul.tv-root-list');
        if (!rootList) return;

        var rootItems = rootList.childNodes;
        for (var k = 0; k < rootItems.length; k++) {
            var rootLi = rootItems[k];
            if (rootLi.nodeType !== 1) continue;
            var childUl = rootLi.querySelector('ul.tv-children');
            var icon = rootLi.querySelector('.tv-toggle');
            if (childUl && icon) {
                childUl.classList.remove('tv-collapsed');
                icon.textContent = '▼';
            }
        }

        // Сбросить поиск
        resetSearch();
        clearTreeViewHighlight();
    };

    // =====================================================================
    // Кнопка «Раскрыть всё»
    // =====================================================================

    window.tvExpandAll = function () {
        var allChildrenUl = document.querySelectorAll('#tv-content ul.tv-children');
        for (var i = 0; i < allChildrenUl.length; i++) {
            allChildrenUl[i].classList.remove('tv-collapsed');
        }

        var allToggles = document.querySelectorAll('#tv-content .tv-toggle:not(.tv-toggle-empty)');
        for (var j = 0; j < allToggles.length; j++) {
            allToggles[j].textContent = '▼';
        }
    };

    // =====================================================================
    // Поиск в дереве
    // =====================================================================

    // --- Собрать все видимые (и невидимые) строки дерева для поиска ---
    function getAllTreeRows() {
        return document.querySelectorAll('#tv-content .tv-row');
    }

    // --- Найти все строки, совпадающие с поисковым термином ---
    function findAllMatchingRows(term) {
        var rows = getAllTreeRows();
        var matches = [];
        var lowerTerm = term.toLowerCase();
        for (var i = 0; i < rows.length; i++) {
            var labelEl = rows[i].querySelector('.tv-label');
            if (labelEl && labelEl.textContent.toLowerCase().indexOf(lowerTerm) !== -1) {
                matches.push(rows[i]);
            }
        }
        return matches;
    }

    // --- Раскрыть всех предков данной строки, чтобы она стала видимой ---
    function expandParentsOfRow(row) {
        var node = row.parentElement; // li.tv-item
        while (node && node !== document.getElementById('tv-content')) {
            if (node.tagName === 'UL' && node.classList.contains('tv-children')) {
                node.classList.remove('tv-collapsed');
                // Обновить иконку родительского li
                var parentLi = node.parentElement;
                if (parentLi) {
                    var icon = parentLi.querySelector(':scope > .tv-row > .tv-toggle');
                    if (icon && icon.textContent !== '▼') {
                        icon.textContent = '▼';
                    }
                }
            }
            node = node.parentElement;
        }
    }

    // --- Подсветить найденную строку и прокрутить к ней ---
    function highlightSearchResult(row) {
        // Снять предыдущую подсветку поиска
        var prev = document.querySelector('#tv-content .tv-row.tv-search-highlight');
        if (prev) prev.classList.remove('tv-search-highlight');

        if (!row) return;

        // Раскрыть родителей
        expandParentsOfRow(row);

        // Подсветить строку
        row.classList.add('tv-search-highlight');

        // Прокрутить к строке
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // --- Очистить подсветку поиска ---
    function clearSearchHighlight() {
        var highlighted = document.querySelectorAll('#tv-content .tv-row.tv-search-highlight');
        for (var i = 0; i < highlighted.length; i++) {
            highlighted[i].classList.remove('tv-search-highlight');
        }
    }

    // --- Сбросить состояние поиска ---
    function resetSearch() {
        searchState.searchTerm = '';
        searchState.results = [];
        searchState.currentIndex = -1;
        searchState.isSearchActive = false;
        clearSearchHighlight();

        // Очистить поле ввода и обновить кнопки
        var input = document.getElementById('tv-search-input');
        if (input) input.value = '';
        updateSearchButtons(false);
        setSearchStatus('');
    }

    // --- Обновить состояние кнопок поиска ---
    function updateSearchButtons(hasText) {
        var btnStart = document.getElementById('tv-btn-find-start');
        var btnNext = document.getElementById('tv-btn-find-next');
        if (btnStart) btnStart.disabled = !hasText;
        if (btnNext) btnNext.disabled = !hasText;
    }

    // --- Установить статус поиска ---
    function setSearchStatus(msg) {
        var status = document.getElementById('tv-search-status');
        if (status) status.textContent = msg;
    }

    // --- Начать поиск с начала ---
    window.tvFindStart = function () {
        var input = document.getElementById('tv-search-input');
        if (!input) return;
        var term = input.value.trim();
        if (!term) {
            clearSearchHighlight();
            setSearchStatus('');
            return;
        }

        searchState.searchTerm = term;
        searchState.results = findAllMatchingRows(term);
        searchState.currentIndex = -1;
        searchState.isSearchActive = true;

        if (searchState.results.length === 0) {
            setSearchStatus('Не найдено');
            clearSearchHighlight();
            return;
        }

        // Перейти к первому результату
        searchState.currentIndex = 0;
        highlightSearchResult(searchState.results[0]);
        setSearchStatus((searchState.currentIndex + 1) + ' / ' + searchState.results.length);
    };

    // --- Найти следующий результат ---
    window.tvFindNext = function () {
        var input = document.getElementById('tv-search-input');
        if (!input) return;
        var term = input.value.trim();
        if (!term) return;

        // Если поисковый термин изменился — перезапустить поиск
        if (term !== searchState.searchTerm || !searchState.isSearchActive) {
            window.tvFindStart();
            return;
        }

        if (searchState.results.length === 0) {
            setSearchStatus('Не найдено');
            return;
        }

        // Переход к следующему (с переходом к началу при достижении конца)
        searchState.currentIndex = (searchState.currentIndex + 1) % searchState.results.length;
        highlightSearchResult(searchState.results[searchState.currentIndex]);
        setSearchStatus((searchState.currentIndex + 1) + ' / ' + searchState.results.length);
    };

    // --- Обработчик изменения поля ввода поиска ---
    window.tvSearchInputChange = function () {
        var input = document.getElementById('tv-search-input');
        if (!input) return;
        var hasText = input.value.trim().length > 0;
        updateSearchButtons(hasText);
        if (!hasText) {
            clearSearchHighlight();
            setSearchStatus('');
            searchState.isSearchActive = false;
        }
    };

    // =====================================================================
    // Взаимодействие с диаграммой
    // =====================================================================

    // --- Текущая подсвеченная строка treeview (по клику) ---
    var currentHighlightedRow = null;

    // --- Снять подсветку текущей строки treeview ---
    function clearTreeViewHighlight() {
        if (currentHighlightedRow) {
            currentHighlightedRow.classList.remove('tv-row-selected');
            currentHighlightedRow = null;
        }
    }

    // --- Подсветить строку в treeview (по клику на строку) ---
    function highlightTreeViewRow(row) {
        clearTreeViewHighlight();
        row.classList.add('tv-row-selected');
        currentHighlightedRow = row;
    }

    // --- Выделить персону на диаграмме (SVG) по её idA ---
    function selectPersonInDiagram(personId) {
        var svgEl = document.querySelector('#graphvizContainer svg');
        if (!svgEl) return;

        // Снять выделение с предыдущего узла
        var prevSelected = svgEl.querySelector('g.node.selected');
        if (prevSelected) prevSelected.classList.remove('selected');

        // Найти узел по атрибуту <title> (Graphviz ставит title = nodeId)
        var nodes = svgEl.querySelectorAll('g.node');
        for (var i = 0; i < nodes.length; i++) {
            var titleEl = nodes[i].querySelector('title');
            if (titleEl && titleEl.textContent.trim() === personId) {
                nodes[i].classList.add('selected');
                // Прокрутить диаграмму к выбранному узлу
                nodes[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                break;
            }
        }

        // Также синхронизируем window.selectedNodeElement если он объявлен в index.html
        // (index.html хранит его в локальном скоупе — используем событие custom event)
        document.dispatchEvent(new CustomEvent('treeview-select-person', { detail: { personId: personId } }));
    }

    // --- Выделить строку treeview при клике на узел диаграммы ---
    // Вызывается из index.html когда пользователь кликает на узел в SVG
    window.tvHighlightPerson = function (personId) {
        var rows = document.querySelectorAll('#tv-content .tv-row');
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].getAttribute('data-id') === personId) {
                // Раскрыть родителей, прокрутить к строке
                expandParentsOfRow(rows[i]);
                rows[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                highlightTreeViewRow(rows[i]);
                return;
            }
        }
    };

    // =====================================================================
    // Инициализация: вызывается из index.html после загрузки данных
    // =====================================================================

    // --- Инициализировать treeview с массивом персон ---
    // peopleArray — массив объектов персон с полями idA, label, hasFather, hasMother
    window.tvInit = function (peopleArray) {
        peopleData = peopleArray || [];
        currentMode = 'male'; // по умолчанию мужская линия

        // Установить активность кнопок режима
        var btnMale = document.getElementById('tv-btn-male');
        var btnFemale = document.getElementById('tv-btn-female');
        if (btnMale) btnMale.classList.add('tv-btn-active');
        if (btnFemale) btnFemale.classList.remove('tv-btn-active');

        renderTreeView();
    };

})();
