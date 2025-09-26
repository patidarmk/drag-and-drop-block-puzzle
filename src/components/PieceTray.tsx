import React from 'react';
import { Piece } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';

interface PieceTrayProps {
  tray: Piece[];
  onDragStart: (e: React.DragEvent, piece: Piece) => void;
}

const PieceTray: React.FC<PieceTrayProps> = ({ tray, onDragStart }) => {
  return (
    <div className="flex justify-center space-x-2 mt-4 p-2 bg-gray-200 rounded-lg">
      {tray.map((piece) => (
        <div
          key={piece.id}
          className={cn(
            'cursor-grab active:cursor-grabbing p-2 bg-white rounded shadow-md transition-transform hover:scale-105',
            'min-w-[80px] text-center'
          )}
          draggable
          onDragStart={(e) => onDragStart(e, piece)}
        >
          <div className={`inline-block p-1 rounded bg-[${piece.color}] mb-1`}>
            {piece.positions.map(([x, y], i) => (
              <div key={i} className="w-4 h-4 bg-white inline-block m-0" />
            ))}
          </div>
          <span className="text-xs capitalize">{piece.type}</span>
          {piece.type === 'bomb' && <span className="text-xs ml-1">💣</span>}
          {piece.type === 'line-clear' && <span className="text-xs ml-1">✨</span>}
        </div>
      ))}
      {tray.length === 0 && <p className="text-gray-500 text-sm">No pieces left!</p>}
    </div>
  );
};

export default PieceTray;