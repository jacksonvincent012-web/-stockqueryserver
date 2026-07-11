import re

with open('src/pages/analyst/views/SearchView.tsx', 'r') as f:
    code = f.read()

# Remove Results Count Banner
# It's between {/* Results Count Banner */} and {/* Grid of Results */}
code = re.sub(r"\{/\* Results Count Banner \*/\}.*?\{/\* Grid of Results \*/\}", "{/* Grid of Results */}", code, flags=re.DOTALL)

with open('src/pages/analyst/views/SearchView.tsx', 'w') as f:
    f.write(code)
