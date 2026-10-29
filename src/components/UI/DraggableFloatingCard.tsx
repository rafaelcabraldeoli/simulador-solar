import React, { useState } from 'react';
import { motion, useDragControls } from 'motion/react';
import { GripHorizontal, RotateCcw } from 'lucide-react';

interface DraggableFloatingCardProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  defaultPosition?: { x: number; y: number };
  dragHandleOnly?: boolean;
  dragTitle?: string;
  showResetButton?: boolean;
  onResetPosition?: () => void;
}

export const DraggableFloatingCard: React.FC<DraggableFloatingCardProps> = ({
  id,
  children,
  className = '',
  defaultPosition = { x: 0, y: 0 },
  dragHandleOnly = true,
  dragTitle,
  showResetButton = true,
  onResetPosition,
}) => {
  const dragControls = useDragControls();
  const [positionKey, setPositionKey] = useState(0);
  const [zIndex, setZIndex] = useState(40);
  const [isMoved, setIsMoved] = useState(false);

  const handleBringToFront = () => {
    setZIndex((prev) => Math.max(prev, (Date.now() % 1000) + 50));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPositionKey((prev) => prev + 1);
    setIsMoved(false);
    if (onResetPosition) onResetPosition();
  };

  return (
    <motion.div
      key={`${id}-${positionKey}`}
      id={id}
      drag
      dragControls={dragHandleOnly ? dragControls : undefined}
      dragListener={!dragHandleOnly}
      dragMomentum={false}
      dragElastic={0.05}
      initial={defaultPosition}
      onDragStart={() => {
        setIsMoved(true);
        handleBringToFront();
      }}
      onPointerDown={handleBringToFront}
      style={{ zIndex }}
      className={`pointer-events-auto select-none max-w-[calc(100vw-20px)] ${className}`}
    >
      {/* Visual top drag bar handle */}
      {dragHandleOnly && (
        <div
          onPointerDown={(e) => {
            dragControls.start(e);
            handleBringToFront();
          }}
          className="w-full flex items-center justify-between px-2.5 py-1 bg-slate-900/95 hover:bg-slate-800/95 border-b border-slate-800/90 rounded-t-2xl cursor-grab active:cursor-grabbing transition-colors text-slate-400 hover:text-slate-200 group shadow-sm touch-none"
          title="Clique e arraste para posicionar este quadro onde preferir na tela"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-cyan-300 transition-colors">
            <GripHorizontal className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 shrink-0" />
            <span className="truncate">{dragTitle || 'Mover Quadro Flutuante'}</span>
          </div>

          <div className="flex items-center gap-1">
            {showResetButton && isMoved && (
              <button
                type="button"
                onClick={handleReset}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-[10px] font-medium flex items-center gap-1 transition"
                title="Voltar para a posição padrão"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Resetar Posição</span>
              </button>
            )}
          </div>
        </div>
      )}

      {children}
    </motion.div>
  );
};

