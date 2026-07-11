import React, { useState } from 'react';
import { 
  MousePointer, TrendingUp, GitCommit, Square, Type, 
  ArrowUpRight, PenTool, Ruler, ZoomIn, Smile, 
  Magnet, Lock, Eye, EyeOff, Trash2, Layers, 
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DrawingToolsRailProps {
  theme: 'light' | 'dark';
  activeTool: string;
  onSelectTool: (tool: string) => void;
  magnetActive: boolean;
  onToggleMagnet: () => void;
  lockActive: boolean;
  onToggleLock: () => void;
  hideDrawings: boolean;
  onToggleHide: () => void;
  drawingCount: number;
  onClearDrawings: () => void;
}

export default function DrawingToolsRail({ 
  theme, activeTool, onSelectTool, 
  magnetActive, onToggleMagnet,
  lockActive, onToggleLock,
  hideDrawings, onToggleHide,
  drawingCount, onClearDrawings
}: DrawingToolsRailProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isLight = theme === 'light';

  const tools = [
    { id: 'cursor', label: 'Crosshair / Select', icon: MousePointer },
    { id: 'trendline', label: 'Trend Line', icon: TrendingUp },
    { id: 'fibonacci', label: 'Fibonacci Retracement', icon: GitCommit },
    { id: 'rectangle', label: 'Rectangle / Zone', icon: Square },
    { id: 'text', label: 'Text Note', icon: Type },
    { id: 'arrow', label: 'Directional Arrow', icon: ArrowUpRight },
    { id: 'brush', label: 'Freehand Brush', icon: PenTool },
    { id: 'measure', label: 'Measure / Ruler', icon: Ruler },
    { id: 'zoom', label: 'Box Zoom', icon: ZoomIn },
    { id: 'icons', label: 'Market Markers', icon: Smile },
  ];

  const handleToolClick = (toolId: string) => {
    onSelectTool(toolId);
  };

  const handleClear = () => {
    onClearDrawings();
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className={`absolute left-10 top-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
      isLight ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-100 border border-slate-700'
    }`}>
      {text}
    </div>
  );

  return (
    <div className="relative flex shrink-0 z-20">
      <motion.div
        animate={{ width: isCollapsed ? 32 : 46 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`flex flex-col items-center py-2.5 border-r transition-colors ${
          isLight 
            ? 'bg-slate-50/90 border-slate-200/80 text-slate-700' 
            : 'bg-[#0b0e14]/90 border-slate-800 text-slate-300'
        }`}
      >
        {/* Collapse Toggle Button */}
        <div className="relative group w-full flex justify-center mb-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <Tooltip text={isCollapsed ? 'Expand Drawing Tools' : 'Collapse Toolbar'} />
        </div>

        {!isCollapsed && (
          <div className="w-full px-1.5 flex flex-col items-center gap-1 overflow-y-visible max-h-[440px] no-scrollbar">
            {/* Drawing Tools List */}
            {tools.map((t) => {
              const Icon = t.icon;
              const isActive = activeTool === t.id;
              return (
                <div key={t.id} className="relative group w-full flex justify-center">
                  <button
                    onClick={() => handleToolClick(t.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : isLight
                        ? 'hover:bg-slate-200/70 text-slate-600'
                        : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                  <Tooltip text={t.label} />
                </div>
              );
            })}

            <div className={`w-5 h-px my-1.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

            {/* Utility Toggles */}
            <div className="relative group w-full flex justify-center">
              <button
                onClick={onToggleMagnet}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  magnetActive
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    : isLight
                    ? 'hover:bg-slate-200/70 text-slate-500'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Magnet className="w-4 h-4" />
              </button>
              <Tooltip text="Magnet Mode (Snap to OHLC)" />
            </div>

            <div className="relative group w-full flex justify-center">
              <button
                onClick={onToggleLock}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  lockActive
                    ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30'
                    : isLight
                    ? 'hover:bg-slate-200/70 text-slate-500'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Lock className="w-4 h-4" />
              </button>
              <Tooltip text="Lock All Drawing Lines" />
            </div>

            <div className="relative group w-full flex justify-center">
              <button
                onClick={onToggleHide}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  hideDrawings
                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                    : isLight
                    ? 'hover:bg-slate-200/70 text-slate-500'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {hideDrawings ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <Tooltip text={hideDrawings ? "Show Drawings" : "Hide Drawings"} />
            </div>

            <div className="relative group w-full flex justify-center">
              <button
                onClick={handleClear}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all relative ${
                  isLight ? 'hover:bg-rose-50 text-slate-500 hover:text-rose-600' : 'hover:bg-rose-950/30 text-slate-400 hover:text-rose-400'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {drawingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {drawingCount}
                  </span>
                )}
              </button>
              <Tooltip text={`Remove All Drawings (${drawingCount})`} />
            </div>

            <div className="relative group w-full flex justify-center">
              <button
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isLight ? 'hover:bg-slate-200/70 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <Tooltip text="Drawing Layers & Templates" />
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-2 py-2 w-full">
            <div className="relative group w-full flex justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-blue-500"
              >
                <MousePointer className="w-3.5 h-3.5" />
              </button>
              <Tooltip text="Active: Crosshair" />
            </div>
            {drawingCount > 0 && (
              <span className="w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {drawingCount}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
