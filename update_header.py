with open('src/components/InstitutionalHeader.tsx', 'r') as f:
    code = f.read()

# Add hideTrade to props
code = code.replace(
    "  onTradeClick?: () => void;\n}",
    "  onTradeClick?: () => void;\n  hideTrade?: boolean;\n}"
)

code = code.replace(
    "  onTradeClick\n}: InstitutionalHeaderProps) {",
    "  onTradeClick,\n  hideTrade\n}: InstitutionalHeaderProps) {"
)

# Hide Trade button
trade_button = """              <button
                onClick={onTradeClick}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98]"
              >
                <DollarSign className="w-4 h-4 -mr-1" />
                <span>Trade</span>
              </button>"""

code = code.replace(trade_button, """              {!hideTrade && (
                <button
                  onClick={onTradeClick}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98]"
                >
                  <DollarSign className="w-4 h-4 -mr-1" />
                  <span>Trade</span>
                </button>
              )}""")

# Hide live market toggle
view_mode_buttons = """        <div className={`p-1 rounded-xl flex items-center gap-1 ${isLight ? 'bg-slate-100' : 'bg-[#0b0e14]'}`}>          <button             onClick={() => onViewModeChange('live')}            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${              viewMode === 'live'                 ? (isLight ? 'bg-white text-emerald-600 shadow-sm' : 'bg-slate-800 text-emerald-400 shadow-lg')                : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-500 hover:text-white')            }`}          >            <span className={`w-2 h-2 rounded-full ${viewMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>            LIVE MARKET          </button>          <button             onClick={() => onViewModeChange('historical')}            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${              viewMode === 'historical'                 ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-lg')                : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-500 hover:text-white')            }`}          >            <Calendar className="w-4 h-4" />            HISTORICAL DATA          </button>        </div>"""

code = code.replace(view_mode_buttons, """        <div className={`p-1 rounded-xl flex items-center gap-1 ${isLight ? 'bg-slate-100' : 'bg-[#0b0e14]'}`}>
          {!hideTrade && (
            <button 
              onClick={() => onViewModeChange('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'live' 
                  ? (isLight ? 'bg-white text-emerald-600 shadow-sm' : 'bg-slate-800 text-emerald-400 shadow-lg')
                  : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-500 hover:text-white')
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${viewMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              LIVE MARKET
            </button>
          )}
          <button 
            onClick={() => onViewModeChange('historical')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'historical' || hideTrade
                ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-lg')
                : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-500 hover:text-white')
            }`}
          >
            <Calendar className="w-4 h-4" />
            HISTORICAL DATA
          </button>
        </div>""")

with open('src/components/InstitutionalHeader.tsx', 'w') as f:
    f.write(code)
