with open('src/components/user/WatchlistsView.tsx', 'r') as f:
    code = f.read()

# Make all card borders blue, and title text blue
code = code.replace(
    "isLight \n                  ? 'bg-white border-blue-200/80 shadow-sm' \n                  : 'bg-[#0b0e14] border-blue-900/30'",
    "isLight \n                  ? 'bg-white border-blue-600 shadow-sm border-2' \n                  : 'bg-[#0b0e14] border-blue-500 border-2'"
)

# Update title color to blue instead of cat.iconColor
code = code.replace(
    "<h3 className={`font-bold text-sm mb-1 ${cat.iconColor}`}>",
    "<h3 className={`font-bold text-base mb-1 ${isLight ? 'text-blue-600' : 'text-blue-500'}`}>"
)

# Make top companies borders match exactly
code = code.replace(
    "isLight \n                          ? 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50' \n                          : 'bg-[#0b0e14] border-blue-900/50 text-blue-400 hover:bg-blue-900/20'",
    "isLight \n                          ? 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50' \n                          : 'bg-[#0b0e14] border-blue-800 text-blue-400 hover:bg-blue-900/20'"
)

with open('src/components/user/WatchlistsView.tsx', 'w') as f:
    f.write(code)
