// Test whether the issue is that config.json fails to load in file:// protocol
// In that case, the defaults would be used:
// PIC_DIR_TYPE = 'relative' (NOT 'relativegraphvizonline')
// This means the check at buildTree line 973 would FAIL:
// if (PIC_DIR_TYPE === 'relativegraphvizonline' && PIC_DIR_GRAPHVIZ_ONLINE)
// And dotCodeForGraphvizOnline = dotCode (with relative pic dir)

let PIC_DIR_TYPE = 'relative';  // DEFAULT when config fails to load
let PIC_DIR_GRAPHVIZ_ONLINE = '';  // DEFAULT

let NODE_WIDTH_IN = 2.0;  // DEFAULT
let NODE_HEIGHT_IN = 1.83;  // DEFAULT

console.log("If config.json fails to load in file:// protocol:");
console.log('PIC_DIR_TYPE:', JSON.stringify(PIC_DIR_TYPE));
console.log('NODE_WIDTH_IN:', NODE_WIDTH_IN);
console.log('NODE_HEIGHT_IN:', NODE_HEIGHT_IN);

const cond1 = PIC_DIR_TYPE === 'relativegraphvizonline';
const cond2 = PIC_DIR_GRAPHVIZ_ONLINE.length > 0;
console.log('\nbuildTree condition would fail:', !(cond1 && cond2));
console.log('=> dotCodeForGraphvizOnline = dotCode (with relative paths)');
console.log('=> width=2, height=1.83 used instead of 1.1 and 1.9');
console.log('\n=> This explains BOTH bugs!');

// Check which browsers block file:// fetch
console.log('\nPossible cause: In Chrome/Edge, fetch() from file:// protocol is blocked');
console.log('XHR fallback: Also blocked in Chrome for file:// cross-origin, but same-origin may work');
console.log('When both fail silently, config stays as defaults');
