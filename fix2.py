import re

with open('src/components/MultiStockGrid.tsx', 'r') as f:
    code = f.read()

# I will just replace ALL className={`w-11 ...`} or className={`w-11 ..."> with a clean version.

lines = code.split('\n')
for i in range(len(lines)):
    line = lines[i]
    if 'className={`w-11 h-11 rounded-xl' in line:
        # Extract the classes inside. They could be separated by ${className}
        # First strip className={` and `} or ">
        inner = line[line.find('className={`')+12:]
        if '`}>' in inner:
            inner = inner[:inner.find('`}>')]
        elif '">' in inner:
            inner = inner[:inner.find('">')]
        elif '`} ' in inner:
            inner = inner[:inner.find('`} ')]
        elif '`}' in inner:
            inner = inner[:inner.find('`}')]
        
        # Now remove any ${className} or similar
        inner = inner.replace('${className}', '')
        inner = inner.replace('${className}', '')
        inner = ' '.join(inner.split()) # clean extra spaces
        
        lines[i] = line[:line.find('className={`')] + f'className={{`w-11 h-11 rounded-xl {inner} ${{className}}`}}>'
        
with open('src/components/MultiStockGrid.tsx', 'w') as f:
    f.write('\n'.join(lines))
