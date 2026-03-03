const XLSX = require('./node_modules/xlsx');
const wb = XLSX.readFile('../ver2/tree.xlsx');

// Check foto_person
const fpSheet = wb.Sheets['foto_person'];
const fpRows = XLSX.utils.sheet_to_json(fpSheet, { header: 1, defval: '' });
const fpHeaders = fpRows[0].map(function(h) { return (h || '').toString().trim(); });

console.log('foto_person headers:', fpHeaders);
fpRows.slice(1).forEach(function(row) {
  var obj = {};
  fpHeaders.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
  var idA = obj.idA;
  var idPerson = obj.id_person;
  var suffix = obj.suffix;
  var extension = obj.extension;
  console.log('  id_person:', idPerson, 'idA:', JSON.stringify(idA), 'suffix:', suffix, 'extension:', extension);
  // What should idA be?
  var computedIdA = idPerson + '-' + suffix + '.' + extension;
  console.log('  Computed idA:', computedIdA);
});

// Check foto_family
var ffSheet = wb.Sheets['foto_family'];
var ffRows = XLSX.utils.sheet_to_json(ffSheet, { header: 1, defval: '' });
var ffHeaders = ffRows[0].map(function(h) { return (h || '').toString().trim(); });
console.log('\nfoto_family headers:', ffHeaders);
ffRows.slice(1).forEach(function(row) {
  var obj = {};
  ffHeaders.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
  var suffix = obj.suffix_ || obj.suffix;
  var computedIdA = obj.id_family + '-' + suffix + '.' + obj.extension;
  console.log('  id_family:', obj.id_family, 'idA:', JSON.stringify(obj.idA), 'suffix_:', suffix, 'ext:', obj.extension, 'computed:', computedIdA);
});

// Check foto_group
var fgSheet = wb.Sheets['foto_group'];
var fgRows = XLSX.utils.sheet_to_json(fgSheet, { header: 1, defval: '' });
var fgHeaders = fgRows[0].map(function(h) { return (h || '').toString().trim(); });
console.log('\nfoto_group headers:', fgHeaders);
fgRows.slice(1).forEach(function(row) {
  var obj = {};
  fgHeaders.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
  var suffix = obj.suffix_ || obj.suffix;
  var computedIdA = obj.id_person + '-' + suffix + '.' + obj.extension;
  console.log('  id_person:', obj.id_person, 'idA:', JSON.stringify(obj.idA), 'suffix_:', suffix, 'ext:', obj.extension, 'computed:', computedIdA);
});

// Check foto_location
var flSheet = wb.Sheets['foto_location'];
var flRows = XLSX.utils.sheet_to_json(flSheet, { header: 1, defval: '' });
var flHeaders = flRows[0].map(function(h) { return (h || '').toString().trim(); });
console.log('\nfoto_location headers:', flHeaders);
flRows.slice(1).forEach(function(row) {
  var obj = {};
  flHeaders.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
  var suffix = obj.suffix || obj.suffix_;
  var computedIdA = obj.id_loc + '-' + suffix + '.' + obj.extension;
  console.log('  id_loc:', obj.id_loc, 'idA:', JSON.stringify(obj.idA), 'suffix:', suffix, 'ext:', obj.extension, 'computed:', computedIdA);
});
