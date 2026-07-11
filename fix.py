import re

with open('src/components/MultiStockGrid.tsx', 'r') as f:
    code = f.read()

code = re.sub(r'className=\{`w-11 h-11 rounded-xl \$\{className\} (.*?) \$\{className\}`\}', r'className={`w-11 h-11 rounded-xl ${className} \1`}', code)
code = re.sub(r'className=\{`w-11 h-11 rounded-xl \$\{className\} (.*?)`\}', r'className={`w-11 h-11 rounded-xl ${className} \1`}', code)
code = re.sub(r'className=\{`w-11 h-11 rounded-xl \$\{className\} (.*?)"\>', r'className={`w-11 h-11 rounded-xl ${className} \1`}>', code)

with open('src/components/MultiStockGrid.tsx', 'w') as f:
    f.write(code)
