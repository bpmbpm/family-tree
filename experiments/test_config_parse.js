// Simulate what loadConfig does
const config = {
    nodeWidth: 1.1,
    nodeHeight: 1.9,
    picDirType: 'relativeGraphvizOnline',
    picDirGlobal: '',
    picDirGraphvizOnline: 'https://bpmbpm.github.io/family-tree/ver1/pic'
};

let PIC_DIR_TYPE = 'relative';
let PIC_DIR_GRAPHVIZ_ONLINE = '';
let NODE_WIDTH_IN = 2.0;
let NODE_HEIGHT_IN = 1.83;

// Simulate loadConfig() logic
if (typeof config.nodeWidth === 'number' && config.nodeWidth > 0) NODE_WIDTH_IN = config.nodeWidth;
if (typeof config.nodeHeight === 'number' && config.nodeHeight > 0) NODE_HEIGHT_IN = config.nodeHeight;

if (typeof config.picDirType === 'string' && config.picDirType.trim()) {
    const t = config.picDirType.trim().toLowerCase();
    if (t === 'global' || t === 'relative' || t === 'relativegraphvizonline') PIC_DIR_TYPE = t;
}
if (typeof config.picDirGraphvizOnline === 'string' && config.picDirGraphvizOnline.trim()) {
    PIC_DIR_GRAPHVIZ_ONLINE = config.picDirGraphvizOnline.trim().replace(/\/+$/, '');
}

console.log('PIC_DIR_TYPE:', JSON.stringify(PIC_DIR_TYPE));
console.log('PIC_DIR_GRAPHVIZ_ONLINE:', JSON.stringify(PIC_DIR_GRAPHVIZ_ONLINE));
console.log('NODE_WIDTH_IN:', NODE_WIDTH_IN);
console.log('NODE_HEIGHT_IN:', NODE_HEIGHT_IN);

// Check the condition in buildTree
console.log('\nbuildTree condition:');
const cond1 = PIC_DIR_TYPE === 'relativegraphvizonline';
const cond2 = PIC_DIR_GRAPHVIZ_ONLINE.length > 0;
console.log('PIC_DIR_TYPE === relativegraphvizonline:', cond1);
console.log('PIC_DIR_GRAPHVIZ_ONLINE truthy:', cond2);
console.log('Both conditions satisfied:', cond1 && cond2);

if (cond1 && cond2) {
    console.log('\nResult: Would generate GraphvizOnline DOT with:', PIC_DIR_GRAPHVIZ_ONLINE);
} else {
    console.log('\nResult: Would use dotCode directly (Bug present!)');
}
