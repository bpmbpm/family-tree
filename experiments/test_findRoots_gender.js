// experiments/test_findRoots_gender.js
// Tests findRoots gender filtering fix for issue #72.
//
// Issue: In male mode, female persons with no hasFather appear as root nodes.
//        In female mode, male persons with no hasMother appear as root nodes.
// Fix:   findRoots now filters by sex — male mode only returns men, female mode only women.
//
// Run with: node experiments/test_findRoots_gender.js

'use strict';

// ---- Paste of the fixed findRoots function (from ver3/treeview.js) ----
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

// ---- Test data (mirrors tree.xlsx person sheet) ----
var people = [
    { idA: 'Ульянов_Владимир_Ильич',     sex: 'М', hasFather: 'Ульянов_Илья_Николаевич',    hasMother: 'Бланк_Мария_Александровна', birth: '1870' },
    { idA: 'Ульянов_Илья_Николаевич',     sex: 'М', hasFather: 'Ульянин_Николай_Васильевич', hasMother: 'Смирнова_Анна_Алексеевна',  birth: '1831' },
    { idA: 'Бланк_Мария_Александровна',   sex: 'Ж', hasFather: '',                            hasMother: '',                           birth: '1835' },
    { idA: 'Ульянин_Николай_Васильевич',  sex: 'M', hasFather: '',                            hasMother: '',                           birth: '1768' },
    { idA: 'Смирнова_Анна_Алексеевна',    sex: 'Ж', hasFather: '',                            hasMother: '',                           birth: '1788' },
];

// ---- Tests ----
var passed = 0;
var failed = 0;

function assert(description, condition) {
    if (condition) {
        console.log('  PASS: ' + description);
        passed++;
    } else {
        console.error('  FAIL: ' + description);
        failed++;
    }
}

function assertArrayEquals(description, actual, expected) {
    var ok = actual.length === expected.length && expected.every(function(v, i) { return v === actual[i]; });
    if (ok) {
        console.log('  PASS: ' + description + ' => [' + actual.join(', ') + ']');
        passed++;
    } else {
        console.error('  FAIL: ' + description);
        console.error('    Expected: [' + expected.join(', ') + ']');
        console.error('    Actual:   [' + actual.join(', ') + ']');
        failed++;
    }
}

console.log('\n=== Test: male mode roots ===');
var maleRoots = findRoots(people, 'male');
console.log('  male roots: [' + maleRoots.join(', ') + ']');
// Only Ульянин_Николай_Васильевич (born 1768, М) should be the root in male mode.
// Бланк_Мария_Александровна (Ж) has no hasFather but should NOT appear (wrong gender).
assertArrayEquals(
    'Male mode root = only Ульянин_Николай_Васильевич',
    maleRoots,
    ['Ульянин_Николай_Васильевич']
);
assert('Female Бланк_Мария_Александровна not in male roots', maleRoots.indexOf('Бланк_Мария_Александровна') === -1);
assert('Female Смирнова_Анна_Алексеевна not in male roots', maleRoots.indexOf('Смирнова_Анна_Алексеевна') === -1);

console.log('\n=== Test: female mode roots ===');
var femaleRoots = findRoots(people, 'female');
console.log('  female roots: [' + femaleRoots.join(', ') + ']');
// Смирнова_Анна_Алексеевна (born 1788, Ж) and Бланк_Мария_Александровна (born 1835, Ж)
// should be roots in female mode, sorted by birth year (oldest first).
assertArrayEquals(
    'Female mode roots = Смирнова_Анна_Алексеевна (1788) then Бланк_Мария_Александровна (1835)',
    femaleRoots,
    ['Смирнова_Анна_Алексеевна', 'Бланк_Мария_Александровна']
);
assert('Male Ульянин_Николай_Васильевич not in female roots', femaleRoots.indexOf('Ульянин_Николай_Васильевич') === -1);

console.log('\n=== Test: sorting (oldest first) ===');
// Female roots should be sorted oldest first: Смирнова (1788) before Бланк (1835)
assert('Смирнова_Анна_Алексеевна (1788) before Бланк_Мария_Александровна (1835)',
    femaleRoots[0] === 'Смирнова_Анна_Алексеевна' && femaleRoots[1] === 'Бланк_Мария_Александровна');

console.log('\n=== Test: person without birth year goes to end ===');
var peopleWithUnknown = people.concat([
    { idA: 'Неизвестная_Жена', sex: 'Ж', hasFather: '', hasMother: '', birth: '' }
]);
var femaleRootsWithUnknown = findRoots(peopleWithUnknown, 'female');
console.log('  female roots with unknown: [' + femaleRootsWithUnknown.join(', ') + ']');
assert('Person without birth year is last', femaleRootsWithUnknown[femaleRootsWithUnknown.length - 1] === 'Неизвестная_Жена');

console.log('\n=== Summary ===');
console.log('Passed: ' + passed + '  Failed: ' + failed);
if (failed > 0) {
    process.exit(1);
}
