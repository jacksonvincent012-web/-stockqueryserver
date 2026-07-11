import re
with open('src/components/MultiStockGrid.tsx', 'r') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if 'className={`' in lines[i] and '`}' not in lines[i]:
        # replace the trailing "> with `}>
        lines[i] = lines[i].replace('">', '`}>')

with open('src/components/MultiStockGrid.tsx', 'w') as f:
    f.writelines(lines)
