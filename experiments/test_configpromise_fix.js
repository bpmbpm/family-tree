// Test that the configPromise approach ensures config is loaded before buildTree
// Simulates the fixed code flow

// Simulate the scenario: user selects a file BEFORE config loading completes

async function simulateFix() {
    let NODE_WIDTH_IN = 2.0;
    let NODE_HEIGHT_IN = 1.83;
    
    // Simulate loadConfig that takes 500ms (slow network / XHR fallback)
    async function loadConfig() {
        await new Promise(resolve => setTimeout(resolve, 500));
        NODE_WIDTH_IN = 1.1;
        NODE_HEIGHT_IN = 1.9;
        console.log('Config loaded: width=', NODE_WIDTH_IN, 'height=', NODE_HEIGHT_IN);
    }
    
    // Simulate buildTree
    async function buildTree() {
        console.log('Building tree with: width=', NODE_WIDTH_IN, 'height=', NODE_HEIGHT_IN);
        const correct = NODE_WIDTH_IN === 1.1 && NODE_HEIGHT_IN === 1.9;
        console.log('Using config values:', correct ? 'YES ✓' : 'NO ✗ (BUG!)');
        return correct;
    }
    
    // THE FIX: store configPromise
    const configPromise = loadConfig();
    
    // Simulate user selecting file immediately (before config loads)
    // With the fix: loadFromFile awaits configPromise
    async function loadFromFile_FIXED() {
        await configPromise; // FIXED: wait for config
        return await buildTree();
    }
    
    // Simulate old code without fix
    async function loadFromFile_BROKEN() {
        // OLD CODE: no await configPromise
        return await buildTree();
    }
    
    console.log('=== Testing BROKEN (old code) ===');
    // Reset
    NODE_WIDTH_IN = 2.0; NODE_HEIGHT_IN = 1.83;
    const brokenConfig = loadConfig();
    // User immediately selects file (no await)
    const brokenResult = await loadFromFile_BROKEN();
    
    console.log('\n=== Testing FIXED (new code) ===');
    // Reset  
    NODE_WIDTH_IN = 2.0; NODE_HEIGHT_IN = 1.83;
    const fixedConfigPromise = loadConfig();
    
    // Simulate user selecting file almost immediately (10ms after page load)
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // User selects file - with fix, it waits for config
    async function fileSelected() {
        await fixedConfigPromise; // This is the key fix
        return await buildTree();
    }
    const fixedResult = await fileSelected();
    
    console.log('\n=== Summary ===');
    console.log('Old code (no fix):', brokenResult ? 'PASS' : 'FAIL (uses defaults)');
    console.log('New code (with fix):', fixedResult ? 'PASS' : 'FAIL');
}

simulateFix().catch(console.error);
