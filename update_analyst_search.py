import re

with open('src/pages/analyst/views/SearchView.tsx', 'r') as f:
    code = f.read()

# 1. Remove state for selectedSector and sortBy
code = re.sub(r"  const \[selectedSector, setSelectedSector\] = useState\('All'\);\n", "", code)
code = re.sub(r"  const \[sortBy, setSortBy\] = useState<'symbol' \| 'name' \| 'marketCap'>\('symbol'\);\n", "", code)

# 2. Update filteredStocks logic to only rely on query
new_filtered_stocks = """  // Filter stocks instantly based on query only
  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];
    
    return INDEXED_STOCKS.filter(stock => {
      return stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
             stock.name.toLowerCase().includes(query.toLowerCase());
    }).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [query]);"""

code = re.sub(r"  // Filter and sort stocks instantly.*?  }, \[query, selectedSector, sortBy\]\);", new_filtered_stocks, code, flags=re.DOTALL)


# 3. Remove Sector Filters & Sort Controls
# They are between {/* Sector Filters & Sort Controls */} and {/* Results Count Banner */}
code = re.sub(r"        \{/\* Sector Filters & Sort Controls \*/\}.*?\{/\* Results Count Banner \*/\}", "{/* Results Count Banner */}", code, flags=re.DOTALL)

# 4. Remove Results Count Banner
# It's between {/* Results Count Banner */} and {/* Grid of Results */}
code = re.sub(r"      \{/\* Results Count Banner \*/\}.*?\{/\* Grid of Results \*/\}", "{/* Grid of Results */}", code, flags=re.DOTALL)

# 5. Fix empty states (use !query.trim() instead of !query.trim() && selectedSector === 'All')
code = code.replace("(!query.trim() && selectedSector === 'All')", "(!query.trim())")
code = code.replace("onClick={() => { setQuery(''); setSelectedSector('All'); }}", "onClick={() => setQuery('')}")

# 6. Remove Filter from lucide-react import
code = code.replace("Search, Filter, Star", "Search, Star")
# 7. Remove SECTORS from search import
code = code.replace("INDEXED_STOCKS, SECTORS", "INDEXED_STOCKS")

with open('src/pages/analyst/views/SearchView.tsx', 'w') as f:
    f.write(code)
