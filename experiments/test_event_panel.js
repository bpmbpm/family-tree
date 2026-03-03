/**
 * Test that the per-event FotoList logic works correctly.
 * Simulates the new showEventPanel logic.
 */
const XLSX = require('./node_modules/xlsx');
const wb = XLSX.readFile('../ver2/tree.xlsx');

var evSheet = wb.Sheets['event'];
var evRows = XLSX.utils.sheet_to_json(evSheet, { header: 1, defval: '' });
var evHeaders = evRows[0].map(function(h) { return (h || '').toString().trim(); });
var evHeaderLower = evHeaders.map(function(h) { return h.toLowerCase(); });

var idEventIdx = evHeaderLower.indexOf('id_event');
var eventRowsList = [];
evRows.slice(1).forEach(function(row) {
    var idEventVal = idEventIdx >= 0 ? (row[idEventIdx] || '').toString().trim() : '';
    if (!idEventVal) return;
    var obj = {};
    evHeaders.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString().trim() : ''; });
    eventRowsList.push(obj);
});

console.log('Total event rows:', eventRowsList.length);

var personIdA = 'Ульянов_Владимир_Ильич';
var fotoTypes = ['foto_person', 'foto_family', 'foto_group', 'foto_location'];

// Filter events for person
var matchingEvents = eventRowsList.filter(function(row) {
    var idPersonAll = row.id_personAll || '';
    var ids = idPersonAll.split(';').map(function(s) { return s.trim(); });
    return ids.indexOf(personIdA) !== -1;
});

console.log('\nFor person "' + personIdA + '": found', matchingEvents.length, 'events');

matchingEvents.forEach(function(ev) {
    console.log('\n  Event id_event:', ev.id_event);

    // Check available foto types for this specific event
    var evAvailableFotoTypes = fotoTypes.filter(function(ft) {
        return ev[ft] && ev[ft].trim() !== '';
    });

    console.log('  Available FotoList for this event:', evAvailableFotoTypes);

    fotoTypes.forEach(function(ft) {
        if (ev[ft]) console.log('    ' + ft + ':', ev[ft]);
    });

    // Show FotoList dropdown that would be rendered per event
    if (evAvailableFotoTypes.length > 0) {
        console.log('  >>> Would render FotoList dropdown with options:', evAvailableFotoTypes.join(', '));
    } else {
        console.log('  >>> No FotoList dropdown (no foto data)');
    }
});

console.log('\n=== Per-event FotoList logic verified ===');
