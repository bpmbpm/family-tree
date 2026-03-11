// Experiment: test the list.md parsing logic used in the fix for issue #98
// This simulates the parsing of list.md content to verify the logic is correct.

function parseListMd(listContent) {
    return listContent.split('\n')
        .map(function(line) { return line.trim(); })
        .filter(function(line) { return line.length > 0 && !line.startsWith('#'); });
}

// Test 1: Simple file list
var test1 = "Ульянин_Николай_Васильевич.md\nУльянин_Николай_Васильевич.pdf\nУльянов_Владимир_Ильич.md\n";
var result1 = parseListMd(test1);
console.log("Test 1 (simple list):", result1);
console.assert(result1.length === 3, "Expected 3 files");
console.assert(result1[0] === "Ульянин_Николай_Васильевич.md", "First file should be .md");
console.assert(result1[1] === "Ульянин_Николай_Васильевич.pdf", "Second file should be .pdf");

// Test 2: With comments and empty lines
var test2 = "# This is a comment\n\nfile1.md\n# Another comment\nfile2.pdf\n\nfile3.txt\n";
var result2 = parseListMd(test2);
console.log("Test 2 (with comments):", result2);
console.assert(result2.length === 3, "Expected 3 files after filtering comments and empty lines");
console.assert(result2[0] === "file1.md");
console.assert(result2[1] === "file2.pdf");
console.assert(result2[2] === "file3.txt");

// Test 3: Empty list.md
var test3 = "";
var result3 = parseListMd(test3);
console.log("Test 3 (empty):", result3);
console.assert(result3.length === 0, "Empty list should return empty array");

// Test 4: Entries like the existing foto folder list.md (just headers/empty)
var test4 = "## list\n";
var result4 = parseListMd(test4);
console.log("Test 4 (##list only):", result4);
// "## list" starts with '#' so should be filtered out
console.assert(result4.length === 0, "Should filter out lines starting with #");

// Test 5: Test binary file detection
function isDirFileBinary(filename) {
    return filename.endsWith('.xlsx') || filename.endsWith('.xls') ||
        filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg') ||
        filename.endsWith('.gif') || filename.endsWith('.pdf');
}
console.assert(isDirFileBinary("photo.png") === true, "PNG should be binary");
console.assert(isDirFileBinary("photo.jpg") === true, "JPG should be binary");
console.assert(isDirFileBinary("file.pdf") === true, "PDF should be binary");
console.assert(isDirFileBinary("document.md") === false, "MD should be text");
console.assert(isDirFileBinary("document.txt") === false, "TXT should be text");
console.log("Test 5 (binary detection): all passed");

// Test 6: Folder detection (no extension)
function isFolder(entry) {
    return entry.indexOf('.') === -1;
}
console.assert(isFolder("md_person") === true, "md_person should be folder");
console.assert(isFolder("foto_person") === true, "foto_person should be folder");
console.assert(isFolder("index.html") === false, "index.html should not be folder");
console.assert(isFolder("tree.xlsx") === false, "tree.xlsx should not be folder");
console.log("Test 6 (folder detection): all passed");

console.log("\nAll tests passed!");
