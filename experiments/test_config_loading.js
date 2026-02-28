// Node.js simulation of what happens when fetch fails in file:// mode
// In file:// mode, fetch('config.json') may return response with ok=false
// and status=0 (not throw) in some environments

// Simulating the exact code from index.html loadConfig()
async function simulateLoadConfig(fetchBehavior) {
    let config = null;
    
    // Simulate fetch behavior
    try {
        let response;
        if (fetchBehavior === 'throws') {
            throw new TypeError('Failed to fetch');
        } else if (fetchBehavior === 'ok_false') {
            response = { ok: false, status: 0 };
        } else if (fetchBehavior === 'ok_true') {
            response = { ok: true, status: 200, json: async () => ({
                nodeWidth: 1.1, nodeHeight: 1.9, 
                picDirType: 'relativeGraphvizOnline',
                picDirGraphvizOnline: 'https://bpmbpm.github.io/family-tree/ver1/pic'
            })};
        }
        if (response.ok) {
            config = await response.json();
        }
    } catch (e) {
        // fetch() blocked, try XHR fallback
    }
    
    // XHR fallback
    if (!config) {
        // Simulating XHR success with status=0 (file:// protocol)
        config = {
            nodeWidth: 1.1, nodeHeight: 1.9,
            picDirType: 'relativeGraphvizOnline',
            picDirGraphvizOnline: 'https://bpmbpm.github.io/family-tree/ver1/pic'
        };
    }
    
    // Apply config
    let PIC_DIR_TYPE = 'relative';
    let PIC_DIR_GRAPHVIZ_ONLINE = '';
    let NODE_WIDTH_IN = 2.0;
    let NODE_HEIGHT_IN = 1.83;
    
    if (!config) return { PIC_DIR_TYPE, PIC_DIR_GRAPHVIZ_ONLINE, NODE_WIDTH_IN, NODE_HEIGHT_IN };
    
    if (typeof config.nodeWidth === 'number' && config.nodeWidth > 0) NODE_WIDTH_IN = config.nodeWidth;
    if (typeof config.nodeHeight === 'number' && config.nodeHeight > 0) NODE_HEIGHT_IN = config.nodeHeight;
    if (typeof config.picDirType === 'string' && config.picDirType.trim()) {
        const t = config.picDirType.trim().toLowerCase();
        if (t === 'global' || t === 'relative' || t === 'relativegraphvizonline') PIC_DIR_TYPE = t;
    }
    if (typeof config.picDirGraphvizOnline === 'string' && config.picDirGraphvizOnline.trim()) {
        PIC_DIR_GRAPHVIZ_ONLINE = config.picDirGraphvizOnline.trim().replace(/\/+$/, '');
    }
    
    return { PIC_DIR_TYPE, PIC_DIR_GRAPHVIZ_ONLINE, NODE_WIDTH_IN, NODE_HEIGHT_IN };
}

async function main() {
    for (const behavior of ['throws', 'ok_false', 'ok_true']) {
        const result = await simulateLoadConfig(behavior);
        console.log(`fetch behavior: ${behavior}`);
        console.log('  PIC_DIR_TYPE:', result.PIC_DIR_TYPE);
        console.log('  NODE_WIDTH_IN:', result.NODE_WIDTH_IN);
        console.log('  NODE_HEIGHT_IN:', result.NODE_HEIGHT_IN);
        const bugPresent = result.PIC_DIR_TYPE !== 'relativegraphvizonline' || result.NODE_WIDTH_IN !== 1.1;
        console.log('  Bug present:', bugPresent);
        console.log();
    }
}

main();
