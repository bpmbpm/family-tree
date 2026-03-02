// Experiment: verify that using a photo store instead of inline JSON fixes the onclick issue.
// Run with: node experiments/test_photo_store.js

// --- Simulate the bug (old code) ---
function buildOnclickOld(photo, fotoFamilyDir) {
    var safeIdA = photo.idA.replace(/'/g, "\\'");
    var safeFields = JSON.stringify(photo.descFields).replace(/'/g, "\\'");
    return "window.FOTO._openThumbPhoto('" + safeIdA + "', '" + safeFields + "', '" + fotoFamilyDir + "')";
}

// --- Simulate the fix (new code) ---
var _photoStore = {};
var _photoStoreCounter = 0;

function buildOnclickNew(photo, fotoFamilyDir) {
    var storeKey = 'p' + (++_photoStoreCounter);
    _photoStore[storeKey] = { idA: photo.idA, fields: photo.descFields, dir: fotoFamilyDir };
    return "window.FOTO._openThumbPhoto('" + storeKey + "')";
}

// Test data — fields with double-quotes (typical JSON values)
var photo = {
    idA: 'Ульянов-1879.jpg',
    descFields: {
        title_: 'Wedding "photo" 1879',
        location_: 'Moscow, "Russia"',
        date_: '1879',
        hyperLink_: 'https://example.com/photo?a=1&b=2'
    }
};

var fotoDir = 'foto_family';

// --- Test old code ---
var oldOnclick = buildOnclickOld(photo, fotoDir);
console.log('=== OLD onclick (embedded JSON) ===');
console.log(oldOnclick);
console.log('');

// Try to parse the JSON from the old onclick string (simulating what the browser would do)
var oldJsonMatch = oldOnclick.match(/_openThumbPhoto\('.*?',\s*'(.*?)',\s*'.*?'\)/s);
if (oldJsonMatch) {
    var jsonStr = oldJsonMatch[1];
    console.log('Extracted JSON string:', jsonStr);
    try {
        var parsed = JSON.parse(jsonStr);
        console.log('Parse SUCCESS:', JSON.stringify(parsed));
    } catch (e) {
        console.log('Parse FAILED (bug confirmed):', e.message);
    }
}

console.log('');

// --- Test new code ---
var newOnclick = buildOnclickNew(photo, fotoDir);
console.log('=== NEW onclick (store key) ===');
console.log(newOnclick);
console.log('');

// Retrieve data from store
var storeKeyMatch = newOnclick.match(/_openThumbPhoto\('(p\d+)'\)/);
if (storeKeyMatch) {
    var key = storeKeyMatch[1];
    var data = _photoStore[key];
    console.log('Retrieved data from store:', JSON.stringify(data));
    if (data && data.idA === photo.idA && JSON.stringify(data.fields) === JSON.stringify(photo.descFields)) {
        console.log('PASS: data retrieved correctly with all fields including double-quotes');
    } else {
        console.log('FAIL: data mismatch');
    }
}
