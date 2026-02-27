// Test: what are the margin values for different lineSpacingSurName2 values?

const baseMarginH = 0.11;
const baseMarginV = 0.055;

function calcMargin(spacing) {
    return `margin="${(baseMarginH * spacing).toFixed(3)},${(baseMarginV * spacing).toFixed(3)}"`;
}

console.log("Testing margin values for lineSpacingSurName2:");
console.log("  lineSpacing=1.0 (no surName2):", calcMargin(1.0));
console.log("  lineSpacingSurName2=0.8:", calcMargin(0.8));
console.log("  lineSpacingSurName2=0.6:", calcMargin(0.6));
console.log("  lineSpacingSurName2=0.3:", calcMargin(0.3));
console.log("");
console.log("Difference between 1.0 and 0.8:");
console.log("  H diff:", ((1.0 - 0.8) * baseMarginH).toFixed(4), "inches =", ((1.0 - 0.8) * baseMarginH * 72).toFixed(2), "pixels");
console.log("  V diff:", ((1.0 - 0.8) * baseMarginV).toFixed(4), "inches =", ((1.0 - 0.8) * baseMarginV * 72).toFixed(2), "pixels");
console.log("");
console.log("Difference between 0.8 and 0.6:");
console.log("  H diff:", ((0.8 - 0.6) * baseMarginH).toFixed(4), "inches =", ((0.8 - 0.6) * baseMarginH * 72).toFixed(2), "pixels");
console.log("  V diff:", ((0.8 - 0.6) * baseMarginV).toFixed(4), "inches =", ((0.8 - 0.6) * baseMarginV * 72).toFixed(2), "pixels");
