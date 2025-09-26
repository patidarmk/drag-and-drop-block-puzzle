import React from 'react';
import { GridCell, Piece, isValidPlacement, GRID_SIZE } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';
import { Square } from 'lucide-react';

interface GameBoardProps {
  grid: GridCell[][];
  tray: Piece[];
  draggedPiece: Piece | null;
  onPlace: (piece: Piece, row: number, col: number) => void;
  gameOver: boolean;
}

const CELL_SIZE = 40; // px, tunable for responsiveness

const GameBoard: React.FC<GameBoardProps> = ({ grid, tray, draggedPiece, onPlace, gameOver }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (gameOver) return;

    const pieceId = e.dataTransfer.getData('text/plain');
    const piece = tray.find(p => p.id === pieceId);
    if (!piece) return;

    // Snap to nearest grid cell based on drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const snapRow = Math.max(0, Math.min(GRID_SIZE - 1, Math.round((e.clientY - rect.top) / CELL_SIZE)));
    const snapCol = Math.max(0, Math.min(GRID_SIZE - 1, Math.round((e.clientX - rect.left) / CELL_SIZE)));

    if (isValidPlacement(grid, piece, snapRow, snapCol)) {
      onPlace(piece, snapRow, snapCol);
    }
    // Else: piece returns to tray (no action needed)
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
      onDrop={handleDrop}
    >
      {cell.type === 'bomb' && <span className="text-xs">💣</span>}
      {cell.type === 'line-clear' && <span className="text-xs">✨</span>}
      {!cell.pieceId && <Square className="w-4 h-4 text-gray-300" />}
    </div>
  );

  return (
    <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg max-w-xs mx-auto">
      <div 
        className="grid grid-cols-10 gap-0" 
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {grid.flatMap((row, r) => row.map((cell, c) => renderCell(cell, r, c)))}
      </div>
      {draggedPiece && (
        <div
          className="absolute pointer-events-none opacity-70 z-10"
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Simple ghost preview - position based on mouse, but for now centered; enhance with mouse coords if needed */}
          <div className={`p-2 rounded bg-[${draggedPiece.color}] flex flex-wrap w-16 h-16 items-center justify-center`}>
            {draggedPiece.positions.map(([x, y], i) => (
              <div key={i} className="w-4 h-4 bg-white m-0.5" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;