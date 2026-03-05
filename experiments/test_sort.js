// Test: verify that findRoots sorts by birth year correctly (oldest first)

// Sample data from tree.xlsx (female mode scenario)
var people = [
    { idA: 'Бланк_Мария_Александровна', label: 'Бланк Мария Александровна', hasMother: '', hasFather: '', birth: '1835' },
    { idA: 'Ульянов_Владимир_Ильич', label: 'Ульянов Владимир Ильич', hasMother: 'Бланк_Мария_Александровна', hasFather: 'Ульянов_Илья_Николаевич', birth: '1870' },
    { idA: 'Ульянов_Илья_Николаевич', label: 'Ульянов Илья Николаевич', hasMother: 'Смирнова_Анна_Алексеевна', hasFather: 'Ульянин_Николай_Васильевич', birth: '1831' },
    { idA: 'Ульянин_Николай_Васильевич', label: 'Ульянин Николай Васильевич', hasMother: '', hasFather: '', birth: '1768' },
    { idA: 'Смирнова_Анна_Алексеевна', label: 'Смирнова Анна Алексеевна', hasMother: '', hasFather: '', birth: '1788' },
];

function findRoots(people, mode) {
    var idSet = {};
    for (var i = 0; i < people.length; i++) {
        idSet[people[i].idA] = true;
    }

    var roots = [];
    for (var j = 0; j < people.length; j++) {
        var person = people[j];
        var parentId = (mode === 'female') ? person.hasMother : person.hasFather;
        if (!parentId || !idSet[parentId]) {
            roots.push(person.idA);
        }
    }

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
        if (aValid) return -1;
        if (bValid) return 1;
        return 0;
    });

    return roots;
}

console.log('=== Female mode (hasMother) ===');
var femaleRoots = findRoots(people, 'female');
console.log('Root order:', femaleRoots);
var femaleRootsWithBirth = femaleRoots.map(id => {
    var p = people.find(p => p.idA === id);
    return id + ' (birth: ' + (p ? p.birth : '?') + ')';
});
console.log('With births:', femaleRootsWithBirth);
var firstFemale = femaleRoots[0];
var expectedFirst = 'Смирнова_Анна_Алексеевна';
console.log('First root:', firstFemale);
console.log('Expected:', expectedFirst);
console.log('PASS:', firstFemale === expectedFirst ? '✓ Смирнова_Анна_Алексеевна is first (oldest, born 1788)' : '✗ FAIL');

console.log('\n=== Male mode (hasFather) ===');
var maleRoots = findRoots(people, 'male');
console.log('Root order:', maleRoots);
var maleRootsWithBirth = maleRoots.map(id => {
    var p = people.find(p => p.idA === id);
    return id + ' (birth: ' + (p ? p.birth : '?') + ')';
});
console.log('With births:', maleRootsWithBirth);
var firstMale = maleRoots[0];
console.log('First root:', firstMale);
console.log('Expected: Ульянин_Николай_Васильевич (born 1768)');
console.log('PASS:', firstMale === 'Ульянин_Николай_Васильевич' ? '✓ Oldest person is first' : '✗ FAIL');

console.log('\n=== Test with missing birth years ===');
var peopleWithMissing = [
    { idA: 'Person_C', label: 'Person C', hasMother: '', hasFather: '', birth: '' },
    { idA: 'Person_B', label: 'Person B', hasMother: '', hasFather: '', birth: '1900' },
    { idA: 'Person_A', label: 'Person A', hasMother: '', hasFather: '', birth: '1850' },
];
var roots = findRoots(peopleWithMissing, 'male');
console.log('Roots with missing birth:', roots);
console.log('Expected order: Person_A (1850), Person_B (1900), Person_C (no birth)');
console.log('PASS:', roots[0] === 'Person_A' && roots[1] === 'Person_B' && roots[2] === 'Person_C' ? '✓ Correct order' : '✗ FAIL');
