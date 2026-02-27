// Test: using font size as the base for margin calculation
const FONT_SIZE = 11;
const FONT_SIZE_IN = FONT_SIZE / 72;
const DPI = 72;

console.log("Font size in inches:", FONT_SIZE_IN.toFixed(4));
console.log("");

// Use font size as basis for margin
console.log("Margin based on font size:");
for (const spacing of [1.0, 0.8, 0.6, 0.4]) {
    const marginH = FONT_SIZE_IN * spacing;
    const marginV = FONT_SIZE_IN * spacing * 0.5;
    console.log(`  spacing=${spacing}: margin="${marginH.toFixed(3)},${marginV.toFixed(3)}" (${(marginV*DPI).toFixed(1)}px vertical)`);
}
console.log("");
console.log("Pixel differences (vertical):");
const diffs = [[1.0, 0.8], [0.8, 0.6], [0.6, 0.4]];
diffs.forEach(([a, b]) => {
    const diff = (a - b) * FONT_SIZE_IN * 0.5 * DPI;
    console.log(`  ${a} -> ${b}: ${diff.toFixed(1)} pixels`);
});

console.log("");
// Using just lineSpacingSurName2 directly as margin value
console.log("Using lineSpacingSurName2 directly as margin in inches (vertical):");
for (const spacing of [1.0, 0.8, 0.6, 0.4]) {
    console.log(`  spacing=${spacing}: vertical margin=${spacing.toFixed(3)}" = ${(spacing*DPI).toFixed(0)}px`);
}
