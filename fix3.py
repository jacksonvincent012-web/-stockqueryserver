import re

with open('src/components/MultiStockGrid.tsx', 'r') as f:
    code = f.read()

# I want to replace `${className}">` with `"`
code = code.replace('${className}">', '">')
code = code.replace('${className}`}', '`}')

with open('src/components/MultiStockGrid.tsx', 'w') as f:
    f.write(code)
