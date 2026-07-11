import React, { useState, useRef, PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'motion/react';

export interface Drawing {
  id: string;
  tool: string;
  points: { x: number; y: number }[];
  color: string;
  text?: string;
  completed: boolean;
}

interface ChartDrawingOverlayProps {
  activeTool: string;
  theme: 'light' | 'dark';
  lockActive: boolean;
  hideDrawings: boolean;
  drawings: Drawing[];
  onDrawingsChange: (drawings: Drawing[]) => void;
  width: number;
  height: number;
}

export default function ChartDrawingOverlay({
  activeTool,
  theme,
  lockActive,
  hideDrawings,
  drawings,
  onDrawingsChange,
  width,
  height
}: ChartDrawingOverlayProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [inputPos, setInputPos] = useState<{ x: number, y: number } | null>(null);
  const [inputText, setInputText] = useState('');
  
  const drawColor = theme === 'light' ? '#2563eb' : '#3b82f6';

  const getMousePos = (e: ReactPointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (lockActive || activeTool === 'cursor' || hideDrawings) return;
    
    // Check if clicking inside the input itself to avoid re-triggering text placement
    if (e.target instanceof HTMLInputElement) return;

    // e.target could be our SVG or rect, safe to capture pointer
    (e.target as Element).setPointerCapture?.(e.pointerId);
    
    const pos = getMousePos(e);
    
    if (activeTool === 'text') {
      if (inputPos) {
        // save text
        if (inputText.trim()) {
           const newDrawing: Drawing = {
             id: Date.now().toString(),
             tool: 'text',
             points: [inputPos],
             color: drawColor,
             text: inputText,
             completed: true
           };
           onDrawingsChange([...drawings, newDrawing]);
        }
        setInputPos(null);
        setInputText('');
      } else {
        setInputPos(pos);
      }
      return;
    }

    if (activeTool === 'icons') {
      const newDrawing: Drawing = {
         id: Date.now().toString(),
         tool: 'icons',
         points: [pos],
         color: drawColor,
         completed: true
      };
      onDrawingsChange([...drawings, newDrawing]);
      return;
    }

    setIsDrawing(true);
    setCurrentDrawing({
      id: Date.now().toString(),
      tool: activeTool,
      points: [pos, pos], // Start and end point
      color: drawColor,
      completed: false
    });
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!isDrawing || !currentDrawing || lockActive) return;
    
    const pos = getMousePos(e);
    
    if (currentDrawing.tool === 'brush') {
      setCurrentDrawing(prev => {
        if (!prev) return prev;
        return { ...prev, points: [...prev.points, pos] };
      });
    } else {
      setCurrentDrawing(prev => {
        if (!prev) return prev;
        const newPoints = [...prev.points];
        newPoints[1] = pos;
        return { ...prev, points: newPoints };
      });
    }
  };

  const handlePointerUp = (e: ReactPointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (!isDrawing || !currentDrawing) return;
    setIsDrawing(false);
    
    onDrawingsChange([...drawings, { ...currentDrawing, completed: true }]);
    setCurrentDrawing(null);
  };

  // Prevent right click context menu during drawing
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDrawing) e.preventDefault();
  };

  const renderDrawing = (d: Drawing) => {
    if (!d.points.length) return null;
    
    const p1 = d.points[0];
    const p2 = d.points[d.points.length - 1];

    switch (d.tool) {
      case 'trendline':
      case 'measure':
        return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={d.color} strokeWidth={2} />;
      case 'arrow':
        return (
          <g>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={d.color} strokeWidth={2} />
            <polygon 
              points="0,-5 10,0 0,5" 
              fill={d.color} 
              transform={`translate(${p2.x},${p2.y}) rotate(${Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI})`} 
            />
          </g>
        );
      case 'rectangle':
      case 'zoom':
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);
        return (
          <rect 
            x={x} y={y} width={w} height={h} 
            fill={d.tool === 'zoom' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'} 
            stroke={d.color} 
            strokeWidth={1.5}
            strokeDasharray={d.tool === 'zoom' ? '4 4' : '0'} 
          />
        );
      case 'fibonacci':
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const minX = Math.min(p1.x, p2.x) - 40;
        const maxX = Math.max(p1.x, p2.x) + 40;
        const hF = p2.y - p1.y;
        return (
          <g>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={d.color} strokeWidth={1} strokeDasharray="4 4" />
            {levels.map((lvl) => {
              const ly = p1.y + hF * lvl;
              return (
                <g key={lvl}>
                  <line x1={minX} y1={ly} x2={maxX} y2={ly} stroke={d.color} strokeWidth={1} opacity={0.6} />
                  <text x={maxX + 5} y={ly + 4} fontSize={10} fill={d.color} opacity={0.8}>{lvl}</text>
                </g>
              );
            })}
          </g>
        );
      case 'brush':
        const pathData = d.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        return <path d={pathData} fill="none" stroke={d.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
      case 'text':
        return <text x={p1.x} y={p1.y} fill={d.color} fontSize={14} fontWeight="bold">{d.text}</text>;
      case 'icons':
        return <text x={p1.x - 10} y={p1.y + 5} fontSize={20}>🤑</text>;
      default:
        return null;
    }
  };

  const isInteractive = activeTool !== 'cursor' && !lockActive;

  return (
    <div 
      className="absolute inset-0 z-30" 
      style={{ 
        pointerEvents: isInteractive ? 'auto' : 'none',
        touchAction: 'none' 
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="w-full h-full cursor-crosshair"
      >
        <rect width="100%" height="100%" fill="transparent" />
        {!hideDrawings && drawings.map(d => (
          <g key={d.id}>{renderDrawing(d)}</g>
        ))}
        {!hideDrawings && currentDrawing && renderDrawing(currentDrawing)}
      </svg>
      
      {inputPos && activeTool === 'text' && (
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
             if (e.key === 'Enter' && inputText.trim()) {
                const newDrawing: Drawing = {
                  id: Date.now().toString(),
                  tool: 'text',
                  points: [inputPos],
                  color: drawColor,
                  text: inputText,
                  completed: true
                };
                onDrawingsChange([...drawings, newDrawing]);
                setInputPos(null);
                setInputText('');
             }
          }}
          autoFocus
          className={`absolute z-40 px-2 py-1 text-sm font-bold border-2 rounded outline-none shadow-md ${
             theme === 'light' ? 'bg-white border-blue-500 text-slate-800' : 'bg-slate-800 border-blue-500 text-slate-100'
          }`}
          style={{ left: inputPos.x, top: inputPos.y }}
        />
      )}
    </div>
  );
}
