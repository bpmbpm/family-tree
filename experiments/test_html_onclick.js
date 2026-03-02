// Test what happens when the onclick string is embedded in HTML attributes
// The issue is that onclick attributes in HTML are parsed differently

// Simulate building the HTML like the old code did
function buildThumbHtmlOld(photo, fotoFamilyDir) {
    var src = fotoFamilyDir + '/' + photo.idA;
    var safeIdA = photo.idA.replace(/'/g, "\\'");
    var safeFields = JSON.stringify(photo.descFields).replace(/'/g, "\\'");
    return '<div class="fg-thumb" onclick="window.FOTO._openThumbPhoto(\'' + safeIdA + '\', \'' + safeFields + '\', \'' + fotoFamilyDir + '\')">' +
        '<img src="' + src + '"></div>';
}

var photo = {
    idA: 'Ульянов-1879.jpg',
    descFields: {
        title_: 'Wedding photo 1879',
        location_: 'Moscow',
        date_: '1879'
    }
};

var html = buildThumbHtmlOld(photo, 'foto_family');
console.log('=== Generated HTML (old code) ===');
console.log(html);
console.log('');

// The issue: JSON.stringify produces {"title_":"value"} with double quotes
// When embedded in onclick="..." attribute (also using double quotes),
// the double quotes from JSON break the HTML attribute!
//
// The actual HTML attribute value would be parsed as:
// onclick="window.FOTO._openThumbPhoto('Ульянов-1879.jpg', '{"title_":"Wedding photo 1879",...}', 'foto_family')"
//                                                               ^-- these double quotes END the onclick attribute!
//
// So the browser would see:
// onclick="window.FOTO._openThumbPhoto('Ульянов-1879.jpg', '{"  <-- attribute ends here!
// title_  <-- this becomes a separate HTML attribute name!

// Extract what the onclick attribute value would actually be in HTML
// Find the onclick="..." value by simulating the HTML parser
var onclickMatch = html.match(/onclick="([^"]*)"/);
if (onclickMatch) {
    console.log('onclick attribute value (what browser sees):');
    console.log(onclickMatch[1]);
    console.log('');
    console.log('NOTE: The JSON {"title_":...} has " which breaks the attribute!');
}

// Show that fields with double quotes cause an even worse problem
var photoWithQuotes = {
    idA: 'test.jpg',
    descFields: {
        title_: 'He said "hello"',
    }
};

var htmlWithQuotes = buildThumbHtmlOld(photoWithQuotes, 'foto_family');
console.log('=== HTML with field containing double quotes ===');
console.log(htmlWithQuotes);
console.log('');

var onclickMatchQ = htmlWithQuotes.match(/onclick="([^"]*)"/);
console.log('onclick attribute (truncated at first "):', onclickMatchQ ? onclickMatchQ[1] : 'PARSE FAILED');
