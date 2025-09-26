import React, { useState } from 'react';
import { GridCell, Piece, placePiece, isValidPlacement } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';
import { Square } from 'lucide-react';

interface GameBoardProps {
  grid: GridCell[][];
  tray: Piece[];
  onPlace: (piece: Piece, row: number, col: number) => void;
  gameOver: boolean;
}

const CELL_SIZE = 40; // px, tunable for responsiveness

const GameBoard: React.FC<GameBoardProps> = ({ grid, tray, onPlace, gameOver }) => {
  const [dragPiece, setDragPiece] = useState<Piece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.DragEvent, piece: Piece) => {
    setDragPiece(piece);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', piece.id); // For fallback
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    if (!dragPiece || gameOver) return;

    // Snap to nearest grid cell based on drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const snapRow = Math.max(0, Math.min(9, Math.round((e.clientY - rect.top) / CELL_SIZE)));
    const snapCol = Math.max(0, Math.min(9, Math.round((e.clientX - rect.left) / CELL_SIZE)));

    if (isValidPlacement(grid, dragPiece, snapRow, snapCol)) {
      onPlace(dragPiece, snapRow, snapCol);
    }
    // Else: piece returns to tray (no action needed, as it's not removed until valid place)
    setDragPiece(null);
  };

  const renderCell = (cell: GridCell, row: number, col: number) => (
    <div
      key={`${row}-${col}`}
      className={cn(
        'w-10 h-10 border border-gray-300 flex items-center justify-center',
        cell.color ? `bg-[${cell.color}]` : 'bg-white',
        gameOver && 'opacity-50'
      )}
      draggable={false}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, row, col)}
    >
      {cell.type === 'bomb' && <span className="text-xs">💣</span>}
      {cell.type === 'line-clear' && <span className="text-xs">✨</span>}
      {!cell.pieceId && <Square className="w-4 h-4 text-gray-300" />}
    </div>
  );

  return (
    <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg max-w-xs mx-auto">
      <div className="grid grid-cols-10 gap-0" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
        {grid.flatMap((row, r) => row.map((cell, c) => renderCell(cell, r, c)))}
      </div>
      {dragPiece && (
        <div
          className="absolute pointer-events-none opacity-70"
          style={{
            left: dragOffset.x,
            top: dragOffset.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Ghost preview of piece */}
          <div className={`p-1 rounded ${dragPiece.color} bg-[${dragPiece.color}]`}>
            {dragPiece.positions.map(([x, y], i) => (
              <div key={i} className="w-8 h-8 bg-white inline-block m-0.5" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;