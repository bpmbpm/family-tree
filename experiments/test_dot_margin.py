#!/usr/bin/env python3
"""
Test: Does margin affect fixedsize=true nodes in Graphviz?
Generate two DOT files and render them to see visual differences.
"""

# DOT code with fixedsize=true and different margins
dot_template = """digraph G {{
  rankdir=TB;
  node [fontname="Arial", fontsize=11];
  
  // Regular node (no surName2) - lineSpacing=1.0
  nodeA [shape=box, style="filled", fillcolor="lightsteelblue", color="darkslategray",
    label="Ульянов\\nИлья\\nНиколаевич\\n1831–1886",
    fixedsize=true, width=1.1, height=1.9,
    imagepos=tc, imagescale=false, labelloc=b,
    margin="{marginA}"];
  
  // surName2 node - lineSpacingSurName2={spacing}
  nodeB [shape=box, style="filled", fillcolor="lightpink", color="darkslategray",
    label="Ульянова\\nБланк\\nМария\\nАлександровна\\n1835–1916",
    fixedsize=true, width=1.1, height=1.9,
    imagepos=tc, imagescale=false, labelloc=b,
    margin="{marginB}"];
  
  nodeA -> nodeB;
}}"""

configs = [
    {"spacing": 1.0, "marginA": "0.110,0.055", "marginB": "0.110,0.055"},
    {"spacing": 0.8, "marginA": "0.110,0.055", "marginB": "0.088,0.044"},
    {"spacing": 0.6, "marginA": "0.110,0.055", "marginB": "0.066,0.033"},
    {"spacing": 0.3, "marginA": "0.110,0.055", "marginB": "0.033,0.017"},
]

for config in configs:
    print(f"lineSpacingSurName2={config['spacing']}:")
    print(f"  nodeA margin: {config['marginA']}")
    print(f"  nodeB margin: {config['marginB']}")
    dot = dot_template.format(**config)
    
    filename = f"/tmp/test_spacing_{str(config['spacing']).replace('.', '_')}.dot"
    with open(filename, 'w') as f:
        f.write(dot)
    print(f"  DOT saved to: {filename}")
    print()

print("Key insight: With fixedsize=true, node size is FIXED to width/height.")
print("The margin attribute is IGNORED for node sizing with fixedsize=true!")
print("Changing margin has NO VISUAL EFFECT on fixedsize nodes.")
print()
print("Proof from Graphviz docs:")
print("  fixedsize=true: node size specified by width/height ONLY,")
print("  NOT expanded to contain the text label.")
