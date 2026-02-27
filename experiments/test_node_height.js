// Experiment: what node heights make sense for text nodes?
// Graphviz: font size 11pt, DPI 72
// 1 point = 1/72 inch
// 11pt font = 11/72 = 0.153 inches per line

const FONT_SIZE = 11;
const FONT_SIZE_IN = FONT_SIZE / 72; // inches per line
const DPI = 72;

// For a node with 4 lines (surName2 + firstName + lastName\n etc + birth-death):
// lines: surName2, name (may have \n), birth-death
// Simplification: assume 4 lines for surName2 node, 3 lines for regular node

function calcNodeHeight(lines, lineSpacing, baseMarginV = 0.055) {
    // Height = lines * font_size_in * line_spacing + 2 * margin
    return lines * FONT_SIZE_IN * lineSpacing + 2 * baseMarginV;
}

console.log("Node height calculations:");
console.log("Font size:", FONT_SIZE, "pt =", FONT_SIZE_IN.toFixed(4), "inches");
console.log("");

// Regular node (3 lines): firstName\npatronymic, lastName, birth-death
console.log("Regular node (3 lines):");
for (const ls of [1.0, 0.8, 0.6]) {
    const h = calcNodeHeight(3, ls);
    console.log(`  lineSpacing=${ls}: height=${h.toFixed(3)} in = ${(h * DPI).toFixed(1)} px`);
}

console.log("");
// surName2 node (4 lines): surName2, firstName\npatronymic, lastName, birth-death
console.log("SurName2 node (4 lines):");
for (const ls of [1.0, 0.8, 0.6]) {
    const h = calcNodeHeight(4, ls);
    console.log(`  lineSpacing=${ls}: height=${h.toFixed(3)} in = ${(h * DPI).toFixed(1)} px`);
}

console.log("");
// Current margin approach
console.log("Current margin approach (both nodes same height):");
const baseMarginH = 0.11, baseMarginV = 0.055;
for (const spacing of [1.0, 0.8, 0.6]) {
    const margin = `${(baseMarginH * spacing).toFixed(3)},${(baseMarginV * spacing).toFixed(3)}`;
    console.log(`  spacing=${spacing}: margin=${margin}`);
}

console.log("");
// Proposed: use lineSpacingSurName2 to affect total height
console.log("Proposed: scale height based on lineSpacingSurName2");
console.log("  This would make nodes with surName2 visibly shorter when lineSpacingSurName2 < 1.0");
for (const ls of [1.0, 0.8, 0.6, 0.3]) {
    const h = calcNodeHeight(4, ls);
    const diff = calcNodeHeight(4, 1.0) - h;
    console.log(`  lineSpacingSurName2=${ls}: height=${h.toFixed(3)} in (${(h * DPI).toFixed(1)} px), saves ${(diff * DPI).toFixed(1)} px vs ls=1.0`);
}
