import re

with open('src/components/MultiStockGrid.tsx', 'r') as f:
    code = f.read()

code = code.replace('className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans `}>', 'className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">')
code = code.replace('className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans `}>', 'className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans">')
code = code.replace('className="text-lg font-bold text-slate-900 dark:text-white leading-none font-sans `}>', 'className="text-lg font-bold text-slate-900 dark:text-white leading-none font-sans">')
code = code.replace('className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-5 font-sans `}>', 'className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-5 font-sans">')
code = code.replace('className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 font-sans `}>', 'className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 font-sans">')

# also fix the w-11 h-11 ones
code = re.sub(r'className=\{`w-11 h-11 rounded-xl w-11 h-11 rounded-xl ([^`]*?)`\>', r'className={`w-11 h-11 rounded-xl \1`}>', code)

with open('src/components/MultiStockGrid.tsx', 'w') as f:
    f.write(code)
