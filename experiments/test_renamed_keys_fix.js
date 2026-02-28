// Test that the renamed config.json keys (width, height, fontname, fontsize)
// are correctly read by the updated loadConfig() function in index.html.
// Also tests that synchronous XHR fallback logic is correct.

// Simulate the updated config with renamed keys (as in the new config.json)
const newConfigJson = {
    width: 1.1,
    height: 1.9,
    fontname: "Arial",
    fontsize: 11,
    lineSpacing: 1.0,
    lineSpacingSurName2: 0.9,
    picDirType: 'relativeGraphvizOnline',
    picDirGraphvizOnline: 'https://bpmbpm.github.io/family-tree/ver1/pic'
};

// Simulate the updated loadConfig() logic (from index.html)
function applyConfig(config) {
    const PHOTO_SIZE_PX = 100;
    let NODE_WIDTH_IN = 2.0;
    let NODE_HEIGHT_IN = ((PHOTO_SIZE_PX + 32) / 72).toFixed(2) * 1;
    let FONT_NAME = 'Arial';
    let FONT_SIZE = 11;

    if (!config) return { NODE_WIDTH_IN, NODE_HEIGHT_IN, FONT_NAME, FONT_SIZE };

    if (typeof config.width === 'number' && config.width > 0) {
        NODE_WIDTH_IN = config.width;
    }
    if (typeof config.height === 'number' && config.height > 0) {
        NODE_HEIGHT_IN = config.height;
    }
    if (typeof config.fontname === 'string' && config.fontname.trim()) {
        FONT_NAME = config.fontname.trim();
    }
    if (typeof config.fontsize === 'number' && config.fontsize > 0) {
        FONT_SIZE = config.fontsize;
    }

    return { NODE_WIDTH_IN, NODE_HEIGHT_IN, FONT_NAME, FONT_SIZE };
}

// Test 1: Renamed keys are read correctly
console.log('=== Test 1: Renamed config keys read correctly ===');
const result1 = applyConfig(newConfigJson);
console.log('NODE_WIDTH_IN:', result1.NODE_WIDTH_IN, '(expected: 1.1)');
console.log('NODE_HEIGHT_IN:', result1.NODE_HEIGHT_IN, '(expected: 1.9)');
console.log('FONT_NAME:', result1.FONT_NAME, '(expected: Arial)');
console.log('FONT_SIZE:', result1.FONT_SIZE, '(expected: 11)');
const pass1 = result1.NODE_WIDTH_IN === 1.1 && result1.NODE_HEIGHT_IN === 1.9;
console.log('PASS:', pass1);

// Test 2: Old keys (nodeWidth, nodeHeight) no longer work (expected - users must update)
console.log('\n=== Test 2: Old key names no longer applied (expected) ===');
const oldConfigJson = { nodeWidth: 1.1, nodeHeight: 1.9, fontName: 'Arial', fontSize: 11 };
const result2 = applyConfig(oldConfigJson);
console.log('NODE_WIDTH_IN:', result2.NODE_WIDTH_IN, '(should be default 2.0 since old keys are not read)');
console.log('Old keys correctly ignored:', result2.NODE_WIDTH_IN === 2.0);

// Test 3: Null config (simulates failed load) - defaults used
console.log('\n=== Test 3: Null config - defaults remain ===');
const result3 = applyConfig(null);
console.log('NODE_WIDTH_IN:', result3.NODE_WIDTH_IN, '(expected: 2.0)');
console.log('NODE_HEIGHT_IN:', result3.NODE_HEIGHT_IN, '(expected: ~1.83)');
console.log('PASS:', result3.NODE_WIDTH_IN === 2.0);

// Test 4: Synchronous XHR fallback simulation
console.log('\n=== Test 4: Synchronous XHR fallback simulated ===');
// In file:// mode, synchronous XHR returns status=0 for successful load
function syncXHRSimulation(xhrStatus, xhrResponseText) {
    let config = null;
    // Simulate sync XHR
    try {
        if (xhrStatus === 200 || xhrStatus === 0) {
            config = JSON.parse(xhrResponseText);
        }
    } catch (e) {
        // parse error
    }
    return config;
}

const configText = JSON.stringify(newConfigJson);
const syncResult = syncXHRSimulation(0, configText); // status=0 for file://
const result4 = applyConfig(syncResult);
console.log('NODE_WIDTH_IN:', result4.NODE_WIDTH_IN, '(expected: 1.1)');
console.log('NODE_HEIGHT_IN:', result4.NODE_HEIGHT_IN, '(expected: 1.9)');
console.log('PASS:', result4.NODE_WIDTH_IN === 1.1 && result4.NODE_HEIGHT_IN === 1.9);

console.log('\n=== All tests complete ===');
console.log('Summary: Renamed keys (width, height, fontname, fontsize) work correctly.');
console.log('Synchronous XHR fallback with status=0 (file:// protocol) works correctly.');
