import re

with open('src/components/CompareStocksView.tsx', 'r') as f:
    code = f.read()

# 1. Add onSelectStock to props
code = code.replace(
    "interface CompareStocksViewProps {\n  theme: 'light' | 'dark';\n}",
    "interface CompareStocksViewProps {\n  theme: 'light' | 'dark';\n  onSelectStock?: (symbol: string) => void;\n}"
)

# 2. Modify component definition
code = code.replace(
    "export default function CompareStocksView({ theme }: CompareStocksViewProps) {",
    "export default function CompareStocksView({ theme, onSelectStock }: CompareStocksViewProps) {"
)

# 3. Remove global QUICK_ADD_SYMBOLS
code = re.sub(r"const QUICK_ADD_SYMBOLS = \[.*?\];\n", "", code)

# 4. Remove searchQuery state
code = re.sub(r"  const \[searchQuery, setSearchQuery\] = useState\(''\);\n", "", code)

# 5. Remove Search Header section
search_header_regex = r"\{\/\* Search Header \*\/.*?\{\/\* Compare Stocks Controller \*\/\}"
code = re.sub(search_header_regex, "{/* Compare Stocks Controller */}", code, flags=re.DOTALL)

# 6. Add quickAddSymbols useMemo
quick_add_memo = """
  const quickAddSymbols = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === activeCategory);
    if (!cat) return [];
    const sectorMatches = INDEXED_STOCKS.filter(s => cat.sectors.some(sec => s.sector.includes(sec)));
    return sectorMatches.slice(0, 10).map(s => s.symbol);
  }, [activeCategory]);
"""
code = code.replace(
    "const selectedStocks = useMemo(() => {",
    quick_add_memo + "\n  const selectedStocks = useMemo(() => {"
)

# 7. Update QUICK_ADD_SYMBOLS usage
code = code.replace("QUICK_ADD_SYMBOLS.map(", "quickAddSymbols.map(")

# 8. Add X button to card top right
# We find: <div className="flex justify-between items-start mb-6">
# Which contains the StockLogo and name on the left, and TrendingUp/Down on the right.
# We'll put an X button next to the TrendingUp/Down badge.
trending_badge = r"(<div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border \$\{.*?\}\`\}>\n                  \{isUp \? <TrendingUp className=\"w-3 h-3\" \/> : <TrendingDown className=\"w-3 h-3\" \/>\}\n                  \{formatPercent\(changePct\)\}\n                <\/div>)"

close_btn = """
                <button 
                  onClick={() => handleRemoveStock(stock.symbol)}
                  className={`p-1.5 rounded-lg transition-colors ml-2 ${isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-rose-500' : 'hover:bg-slate-800 text-slate-500 hover:text-rose-400'}`}
                  title="Remove stock"
                >
                  <X className="w-4 h-4" />
                </button>
"""
code = re.sub(trending_badge, r"<div className=\"flex items-center\">\n                  \1" + close_btn + "\n                </div>", code, flags=re.DOTALL)


# 9. Hook up "View Details"
view_details = r"<button className={`text-xs font-bold flex items-center gap-1 \$\{isLight \? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'\}\`\}>\n                  View Details <ArrowRight className=\"w-3.5 h-3.5\" \/>\n                <\/button>"
view_details_replacement = """<button onClick={() => onSelectStock?.(stock.symbol)} className={`text-xs font-bold flex items-center gap-1 ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </button>"""
code = re.sub(view_details, view_details_replacement, code)

with open('src/components/CompareStocksView.tsx', 'w') as f:
    f.write(code)
