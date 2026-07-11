import React, { useState } from 'react';
import { ArrowDown, ArrowUp, DollarSign, Crosshair, BarChart, ShieldAlert } from 'lucide-react';

interface TradeWorkspaceProps {
  symbol: string;
  currentPrice?: string | number;
  theme?: 'light' | 'dark';
}

export default function TradeWorkspace({ symbol, currentPrice = 150.00, theme = 'light' }: TradeWorkspaceProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('10');
  const [limitPrice, setLimitPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<'Day' | 'GTC' | 'IOC'>('Day');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const numPrice = typeof currentPrice === 'string' ? parseFloat(currentPrice.replace(/[^0-9.-]+/g,"")) || 150.00 : currentPrice;
  const estimatedCost = parseFloat(quantity || '0') * (orderType === 'market' ? numPrice : (parseFloat(limitPrice) || numPrice));

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans mt-6`}>
      {/* Order Entry Panel */}
      <div className={`lg:col-span-1 rounded-2xl p-6 border shadow-sm ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
        <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          <Crosshair className="w-5 h-5 text-blue-500" />
          Order Entry
        </h3>

        <div className="flex bg-slate-900/10 dark:bg-slate-900 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setSide('buy')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${side === 'buy' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Buy
          </button>
          <button 
            onClick={() => setSide('sell')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${side === 'sell' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Sell
          </button>
        </div>

        <div className="flex bg-slate-900/10 dark:bg-slate-900 p-1 rounded-xl mb-6 text-xs font-bold uppercase tracking-wider">
           <button onClick={() => setOrderType('market')} className={`flex-1 py-1.5 rounded-lg transition-all ${orderType === 'market' ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-sm') : 'text-slate-500 dark:text-slate-400'}`}>Market</button>
           <button onClick={() => setOrderType('limit')} className={`flex-1 py-1.5 rounded-lg transition-all ${orderType === 'limit' ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-sm') : 'text-slate-500 dark:text-slate-400'}`}>Limit</button>
           <button onClick={() => setOrderType('stop')} className={`flex-1 py-1.5 rounded-lg transition-all ${orderType === 'stop' ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-sm') : 'text-slate-500 dark:text-slate-400'}`}>Stop</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Quantity (Shares)</label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`w-full p-3 rounded-xl border text-right font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
            />
          </div>
          
          {orderType !== 'market' && (
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Price (USD)</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>$</span>
                <input 
                  type="number" 
                  placeholder={numPrice.toFixed(2)}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className={`w-full p-3 pl-8 rounded-xl border text-right font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Take Profit</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>$</span>
                <input 
                  type="number" 
                  placeholder="Optional"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className={`w-full p-2.5 pl-6 rounded-lg border text-right font-mono text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Stop Loss</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>$</span>
                <input 
                  type="number" 
                  placeholder="Optional"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className={`w-full p-2.5 pl-6 rounded-lg border text-right font-mono text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Time in Force</label>
            <div className="flex bg-slate-900/10 dark:bg-slate-900 p-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <button onClick={() => setTimeInForce('Day')} className={`flex-1 py-1.5 rounded-md transition-all ${timeInForce === 'Day' ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-sm') : 'text-slate-500 dark:text-slate-400'}`}>Day</button>
              <button onClick={() => setTimeInForce('GTC')} className={`flex-1 py-1.5 rounded-md transition-all ${timeInForce === 'GTC' ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-sm') : 'text-slate-500 dark:text-slate-400'}`}>GTC</button>
              <button onClick={() => setTimeInForce('IOC')} className={`flex-1 py-1.5 rounded-md transition-all ${timeInForce === 'IOC' ? (theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-sm') : 'text-slate-500 dark:text-slate-400'}`}>IOC</button>
            </div>
          </div>

          <div className={`pt-4 border-t flex justify-between items-center ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
            <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Estimated Value</span>
            <span className={`text-xl font-black font-mono tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-sm shadow-xl transition-transform active:scale-[0.98] mt-4 ${side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'}`}>
            {side} {symbol}
          </button>
        </div>
      </div>

      {/* Order Book Depth */}
      <div className={`lg:col-span-2 rounded-2xl p-6 border shadow-sm flex flex-col ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`font-bold text-lg flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            <BarChart className="w-5 h-5 text-purple-500" />
            Market Depth (Order Book)
          </h3>
          <span className={`text-xs font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5`}>
            <ShieldAlert className="w-3.5 h-3.5" /> Simulated Data
          </span>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {/* Bids */}
          <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#0b0e14]'}`}>
            <div className={`grid grid-cols-3 p-3 text-[10px] font-bold uppercase tracking-wider border-b ${theme === 'light' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-slate-900/50 text-slate-400 border-slate-800'}`}>
              <div className="text-left">Size</div>
              <div className="text-right">Bid</div>
              <div className="text-right">Depth</div>
            </div>
            <div className="font-mono text-xs">
              {[...Array(8)].map((_, i) => {
                const price = (numPrice - (i * 0.15) - 0.05).toFixed(2);
                const size = Math.floor(Math.random() * 500) + 10;
                const depth = size + (i * 150);
                return (
                  <div key={`bid-${i}`} className={`grid grid-cols-3 p-2 border-b relative group cursor-pointer ${theme === 'light' ? 'border-slate-50 hover:bg-emerald-50' : 'border-slate-800/30 hover:bg-emerald-950/20'}`}>
                    <div className="absolute top-0 right-0 bottom-0 bg-emerald-500/10 dark:bg-emerald-500/5 transition-all" style={{ width: `${Math.min(depth / 20, 100)}%` }} />
                    <div className={`text-left relative z-10 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>{size}</div>
                    <div className="text-right font-bold text-emerald-500 relative z-10">{price}</div>
                    <div className={`text-right relative z-10 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{depth}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asks */}
          <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#0b0e14]'}`}>
            <div className={`grid grid-cols-3 p-3 text-[10px] font-bold uppercase tracking-wider border-b ${theme === 'light' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-slate-900/50 text-slate-400 border-slate-800'}`}>
              <div className="text-left">Ask</div>
              <div className="text-right">Size</div>
              <div className="text-right">Depth</div>
            </div>
            <div className="font-mono text-xs">
              {[...Array(8)].map((_, i) => {
                const price = (numPrice + (i * 0.15) + 0.05).toFixed(2);
                const size = Math.floor(Math.random() * 500) + 10;
                const depth = size + (i * 150);
                return (
                  <div key={`ask-${i}`} className={`grid grid-cols-3 p-2 border-b relative group cursor-pointer ${theme === 'light' ? 'border-slate-50 hover:bg-rose-50' : 'border-slate-800/30 hover:bg-rose-950/20'}`}>
                     <div className="absolute top-0 left-0 bottom-0 bg-rose-500/10 dark:bg-rose-500/5 transition-all" style={{ width: `${Math.min(depth / 20, 100)}%` }} />
                    <div className="text-left font-bold text-rose-500 relative z-10">{price}</div>
                    <div className={`text-right relative z-10 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>{size}</div>
                    <div className={`text-right relative z-10 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{depth}</div>
                  </div>
                );
              }).reverse()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
