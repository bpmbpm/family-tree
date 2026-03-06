// Test script to verify validation logic for tree.xlsx
// Run with: node experiments/test_validation_logic.js

const XLSX = require('xlsx');
const path = require('path');

// Load tree.xlsx
const workbook = XLSX.readFile(path.join(__dirname, '../ver3/tree.xlsx'));

console.log('=== Testing validation logic ===\n');
console.log('Sheets:', workbook.SheetNames);

// Helper function to get cell value
function getCellString(cell) {
    if (cell == null) return '';
    if (typeof cell === 'object') {
        if (cell.w !== undefined) return String(cell.w);
        if (cell.v !== undefined) return String(cell.v);
        return '';
    }
    return String(cell);
}

// Get sheet data
function getSheetData(sheetName) {
    if (!workbook.SheetNames.includes(sheetName)) {
        return { exists: false, headers: [], rows: [] };
    }
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    if (rawRows.length < 1) {
        return { exists: true, headers: [], rows: [] };
    }
    const headers = rawRows[0].map(h => getCellString(h).trim());
    const rows = [];
    for (let i = 1; i < rawRows.length; i++) {
        const row = {};
        let hasData = false;
        for (let j = 0; j < headers.length; j++) {
            const val = getCellString(rawRows[i] ? rawRows[i][j] : '');
            row[headers[j]] = val;
            if (val) hasData = true;
        }
        if (hasData) rows.push({ row: i + 1, data: row });
    }
    return { exists: true, headers, rows };
}

// Test person sheet
const personSheet = getSheetData('person');
console.log(`\n=== Person sheet ===`);
console.log(`Rows: ${personSheet.rows.length}`);
console.log(`Headers: ${personSheet.headers.join(', ')}`);

// Build person idA set
const personIdASet = new Set();
let emptyIdACount = 0;
for (const row of personSheet.rows) {
    const idA = row.data['idA'];
    if (idA && !idA.startsWith('=')) {
        personIdASet.add(idA);
    } else {
        emptyIdACount++;
        console.log(`  Row ${row.row}: idA is empty or formula: "${idA}"`);
    }
}
console.log(`Valid idA values: ${personIdASet.size}`);
console.log(`Empty/formula idA: ${emptyIdACount}`);

// Test family sheet
const familySheet = getSheetData('family');
console.log(`\n=== Family sheet ===`);
console.log(`Rows: ${familySheet.rows.length}`);

// Build family idA set and check references
const familyIdASet = new Set();
let husbandErrors = 0;
let wifeErrors = 0;
for (const row of familySheet.rows) {
    let idA = row.data['idA'];
    const husband = row.data['husband'];
    const wife = row.data['wife'];

    // Handle formula-based idA
    if (!idA || idA.startsWith('=')) {
        if (husband && wife) {
            idA = `${husband}-${wife}`;
        }
    }
    if (idA && !idA.startsWith('=')) {
        familyIdASet.add(idA);
    }

    // Check husband reference
    if (husband && !personIdASet.has(husband)) {
        console.log(`  Row ${row.row}: husband "${husband}" not found in person.idA`);
        husbandErrors++;
    }

    // Check wife reference
    if (wife && !personIdASet.has(wife)) {
        console.log(`  Row ${row.row}: wife "${wife}" not found in person.idA`);
        wifeErrors++;
    }
}
console.log(`Valid family idA values: ${familyIdASet.size}`);
console.log(`Husband reference errors: ${husbandErrors}`);
console.log(`Wife reference errors: ${wifeErrors}`);

// Test foto_family sheet
const fotoFamilySheet = getSheetData('foto_family');
console.log(`\n=== foto_family sheet ===`);
console.log(`Rows: ${fotoFamilySheet.rows.length}`);

// Check id_family references
let idFamilyErrors = 0;
for (const row of fotoFamilySheet.rows) {
    const idFamily = row.data['id_family'];
    if (idFamily && !familyIdASet.has(idFamily)) {
        console.log(`  Row ${row.row}: id_family "${idFamily}" not found in family.idA`);
        idFamilyErrors++;
    }
}
console.log(`id_family reference errors: ${idFamilyErrors}`);

// Check id_personAll references
function parseMultipleIds(value) {
    if (!value) return [];
    return String(value)
        .split(/\s*;\s*/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

let idPersonAllErrors = 0;
for (const row of fotoFamilySheet.rows) {
    const idPersonAll = row.data['id_personAll'];
    const ids = parseMultipleIds(idPersonAll);
    for (const id of ids) {
        if (!personIdASet.has(id)) {
            console.log(`  Row ${row.row}: id_personAll contains "${id}" not found in person.idA`);
            idPersonAllErrors++;
        }
    }
}
console.log(`id_personAll reference errors: ${idPersonAllErrors}`);

// Test foto_location sheet
const fotoLocationSheet = getSheetData('foto_location');
console.log(`\n=== foto_location sheet ===`);
console.log(`Rows: ${fotoLocationSheet.rows.length}`);

// Check id_familyAll references
let idFamilyAllErrors = 0;
for (const row of fotoLocationSheet.rows) {
    const idFamilyAll = row.data['id_familyAll'];
    const ids = parseMultipleIds(idFamilyAll);
    for (const id of ids) {
        if (!familyIdASet.has(id)) {
            console.log(`  Row ${row.row}: id_familyAll contains "${id}" not found in family.idA`);
            idFamilyAllErrors++;
        }
    }
}
console.log(`id_familyAll reference errors: ${idFamilyAllErrors}`);

console.log('\n=== Test completed ===');
console.log('Actual idA values in person:');
personIdASet.forEach(id => console.log(`  - ${id}`));
console.log('\nActual idA values in family:');
familyIdASet.forEach(id => console.log(`  - ${id}`));
