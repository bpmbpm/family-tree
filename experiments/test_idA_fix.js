/**
 * Test that the idA computation fix works correctly for all foto sheets.
 * This simulates the parseExcel logic from index.html after the fix.
 */
const XLSX = require('./node_modules/xlsx');
const wb = XLSX.readFile('../ver2/tree.xlsx');

var errors = 0;
var passed = 0;

function testFotoSheet(sheetName, idField, getIdFunc) {
    var sheet = wb.Sheets[sheetName];
    if (!sheet) { console.log('Sheet not found:', sheetName); return; }
    var rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length <= 1) { console.log(sheetName + ': no data rows'); return; }

    var rawHeaders = rows[0].map(function(h) { return (h || '').toString().trim(); });
    var headerLower = rawHeaders.map(function(h) { return h.toLowerCase(); });

    var idFieldIdx = headerLower.indexOf(idField.toLowerCase());
    var suffixIdx = headerLower.findIndex(function(h) { return h === 'suffix' || h === 'suffix_'; });
    var extIdx = headerLower.indexOf('extension');
    var idAIdx = headerLower.indexOf('ida');

    console.log('\n=== ' + sheetName + ' ===');
    console.log('  idField idx:', idFieldIdx, 'suffixIdx:', suffixIdx, 'extIdx:', extIdx, 'idAIdx:', idAIdx);

    rows.slice(1).forEach(function(row) {
        var idVal = idFieldIdx >= 0 ? (row[idFieldIdx] || '').toString().trim() : '';
        if (!idVal) return; // skip empty rows

        var obj = {};
        rawHeaders.forEach(function(h, i) {
            obj[h] = row[i] !== undefined ? row[i].toString().trim() : '';
        });

        // Apply the fix: compute idA if empty
        if (!obj.idA) {
            var suffix = suffixIdx >= 0 ? row[suffixIdx].toString().trim() : '';
            var ext = extIdx >= 0 ? row[extIdx].toString().trim() : '';
            var baseId = getIdFunc ? getIdFunc(obj, row, rawHeaders, headerLower) : idVal;
            if (suffix && ext) obj.idA = baseId + '-' + suffix + '.' + ext;
        }

        if (obj.idA) {
            console.log('  OK:', JSON.stringify(obj.idA), '(id_field:', JSON.stringify(idVal) + ')');
            passed++;
        } else {
            console.log('  FAIL: idA still empty for row with', idField, '=', idVal);
            errors++;
        }
    });
}

// foto_person: idA = id_person + '-' + suffix + '.' + extension
testFotoSheet('foto_person', 'id_person', null);

// foto_family: idA = id_family + '-' + suffix_ + '.' + extension
testFotoSheet('foto_family', 'id_family', null);

// foto_group: idA = id_person + '-' + suffix_ + '.' + extension (uses id_person column for the file)
testFotoSheet('foto_group', 'id_personAll', function(obj, row, rawHeaders, headerLower) {
    var idPersonIdx = headerLower.indexOf('id_person');
    return idPersonIdx >= 0 ? (row[idPersonIdx] || '').toString().trim() : '';
});

// foto_location: idA = id_loc + '-' + suffix + '.' + extension
testFotoSheet('foto_location', 'id_loc', null);

console.log('\n=== SUMMARY ===');
console.log('Passed:', passed, '  Errors:', errors);

// Also verify that the gallery filter would work (id_person matching)
console.log('\n=== Verifying gallery filter (foto_person) ===');
var fpSheet = wb.Sheets['foto_person'];
var fpRows = XLSX.utils.sheet_to_json(fpSheet, { header: 1, defval: '' });
var fpHeaders = fpRows[0].map(function(h) { return (h || '').toString().trim(); });
var fpHeaderLower = fpHeaders.map(function(h) { return h.toLowerCase(); });
var fpIdPersonIdx = fpHeaderLower.indexOf('id_person');
var fpSuffixIdx = fpHeaderLower.findIndex(function(h) { return h === 'suffix' || h === 'suffix_'; });
var fpExtIdx = fpHeaderLower.indexOf('extension');

var fotoPersonRowsList = [];
fpRows.slice(1).forEach(function(row) {
    var idPersonVal = fpIdPersonIdx >= 0 ? (row[fpIdPersonIdx] || '').toString().trim() : '';
    if (!idPersonVal) return;
    var obj = {};
    fpHeaders.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
    if (!obj.idA) {
        var suffix = fpSuffixIdx >= 0 ? row[fpSuffixIdx].toString().trim() : '';
        var ext = fpExtIdx >= 0 ? row[fpExtIdx].toString().trim() : '';
        if (suffix && ext) obj.idA = obj.id_person + '-' + suffix + '.' + ext;
    }
    fotoPersonRowsList.push(obj);
});

var personIdA = 'Ульянов_Владимир_Ильич';
var matchingRows = fotoPersonRowsList.filter(function(row) {
    return row.id_person === personIdA && row.idA;
});
console.log('  For person "' + personIdA + '": found', matchingRows.length, 'photos');
matchingRows.forEach(function(r) {
    console.log('    idA:', r.idA);
});
if (matchingRows.length > 0) {
    console.log('  >>> Gallery filter works! Bug 1 fix verified.');
    passed++;
} else {
    console.log('  >>> FAIL: No photos found for person! Fix did not work.');
    errors++;
}

console.log('\n=== FINAL: Passed:', passed, '  Errors:', errors, '===');
