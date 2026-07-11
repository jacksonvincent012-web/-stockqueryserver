with open('src/components/StockView.tsx', 'r') as f:
    code = f.read()

# Add hideTrade prop
code = code.replace(
    "interface StockViewProps {\n  stock: IndexedStock;\n  liveData?: any;\n  theme?: 'light' | 'dark';\n}",
    "interface StockViewProps {\n  stock: IndexedStock;\n  liveData?: any;\n  theme?: 'light' | 'dark';\n  hideTrade?: boolean;\n}"
)

code = code.replace(
    "export default function StockView({ stock, liveData, theme = 'light' }: StockViewProps) {",
    "export default function StockView({ stock, liveData, theme = 'light', hideTrade = false }: StockViewProps) {"
)

code = code.replace(
    "<InstitutionalHeader\n        stock={stock}\n        liveData={liveData}\n        theme={theme}\n        timeframe={timeframe}\n        onTimeframeChange={setTimeframe}\n        viewMode={viewMode}\n        onViewModeChange={setViewMode}\n        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}\n        isSettingsOpen={isSettingsOpen}\n        onTradeClick={() => setViewMode('live')}\n      />",
    """<InstitutionalHeader
        stock={stock}
        liveData={liveData}
        theme={theme}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
        onTradeClick={() => setViewMode('live')}
        hideTrade={hideTrade}
      />"""
)

with open('src/components/StockView.tsx', 'w') as f:
    f.write(code)
