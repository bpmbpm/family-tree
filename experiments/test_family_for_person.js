/**
 * Test that showFamilyGalleryForPerson would work correctly.
 * Simulates the filtering by id_personAll for foto_family sheet.
 */
const XLSX = require('./node_modules/xlsx');
const wb = XLSX.readFile('../ver2/tree.xlsx');

var ffSheet = wb.Sheets['foto_family'];
var ffRows = XLSX.utils.sheet_to_json(ffSheet, { header: 1, defval: '' });
var ffHeaders = ffRows[0].map(function(h) { return (h || '').toString().trim(); });
var ffHeaderLower = ffHeaders.map(function(h) { return h.toLowerCase(); });

var idFamilyIdx = ffHeaderLower.indexOf('id_family');
var suffixIdx = ffHeaderLower.findIndex(function(h) { return h === 'suffix' || h === 'suffix_'; });
var extIdx = ffHeaderLower.indexOf('extension');

var fotoFamilyRowsList = [];
ffRows.slice(1).forEach(function(row) {
    var idFamilyVal = idFamilyIdx >= 0 ? (row[idFamilyIdx] || '').toString().trim() : '';
    if (!idFamilyVal) return;
    var obj = {};
    ffHeaders.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
    if (!obj.idA) {
        var suffix = suffixIdx >= 0 ? row[suffixIdx].toString().trim() : '';
        var ext = extIdx >= 0 ? row[extIdx].toString().trim() : '';
        if (suffix && ext) obj.idA = obj.id_family + '-' + suffix + '.' + ext;
    }
    fotoFamilyRowsList.push(obj);
});

console.log('Total foto_family rows:', fotoFamilyRowsList.length);
fotoFamilyRowsList.forEach(function(r) {
    console.log('  idA:', r.idA, 'id_family:', r.id_family, 'id_personAll:', r.id_personAll);
});

// Now simulate showFamilyGalleryForPerson for Ульянов_Владимир_Ильич
var personIdA = 'Ульянов_Владимир_Ильич';
var matchingRows = fotoFamilyRowsList.filter(function(row) {
    if (!row.idA) return false;
    var idPersonAll = row.id_personAll || '';
    var ids = idPersonAll.split(';').map(function(s) { return s.trim(); });
    return ids.indexOf(personIdA) !== -1;
});

console.log('\nFor person "' + personIdA + '": found', matchingRows.length, 'family photos');
matchingRows.forEach(function(r) {
    console.log('  idA:', r.idA);
});

if (matchingRows.length > 0) {
    console.log('>>> showFamilyGalleryForPerson would work! ✓');
} else {
    console.log('>>> No family photos found for person.');
}
