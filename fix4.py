import re

with open('src/components/MultiStockGrid.tsx', 'r') as f:
    code = f.read()

# Fix className="... `}> to className="...">
code = re.sub(r'className="([^"]*) `\}>', r'className="\1">', code)
code = re.sub(r'className="([^"]*)`\>', r'className="\1">', code)

with open('src/components/MultiStockGrid.tsx', 'w') as f:
    f.write(code)
