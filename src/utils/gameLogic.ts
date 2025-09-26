import { Piece, getDailySeed, generatePieces } from '@/data/pieces';
import confetti from 'canvas-confetti';

export type { Piece };

export const GRID_SIZE = 10;
const COMBO_MULTIPLIERS = { 1: 1, 2: 2, 3: 5 }; // Tunable: rows/cols cleared -> multiplier
const BASE_POINTS_PER_TILE = 10;
const SPEED_BONUS_THRESHOLD = 5000; // ms; tunable for faster placements

export interface GridCell { pieceId?: string; color?: string; type?: Piece['type']; }
export interface GameState {
  grid: GridCell[][];
  tray: Piece[];
  score: number;
  combo: number;
  moves: number;
  gameOver: boolean;
  isDaily: boolean;
  startTime?: number;
  placements: number[]; // Timestamps for speed bonus
}

export const initGame = (isDaily: boolean = false): GameState => {
  const seed = isDaily ? getDailySeed() : Date.now().toString();
  return {
    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({} as GridCell)),
    tray: generatePieces(seed),
    score: 0,
    combo: 0,
    moves: 0,
    gameOver: false,
    isDaily,
    placements: [],
  };
};

export const isValidPlacement = (grid: GridCell[][], piece: Piece, row: number, col: number): boolean => {
  for (const [dx, dy] of piece.positions) {
    const r = row + dy;
    const c = col + dx;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || grid[r][c]?.pieceId) {
      return false;
    }
  }
  return true;
};

export const placePiece = (state: GameState, piece: Piece, row: number, col: number, placementTime?: number): GameState => {
  if (!isValidPlacement(state.grid, piece, row, col)) {
    return { ...state, gameOver: checkGameOver(state) };
  }

  const placeTime = placementTime || Date.now();
  const newPlacements = [...state.placements];
  if (!state.startTime) {
    newPlacements.push(0); // Initialize
  } else {
    newPlacements.push(placeTime - state.startTime);
  }

  let newGrid = state.grid.map(rowArr => [...rowArr]);
  for (const [dx, dy] of piece.positions) {
    const r = row + dy;
    const c = col + dx;
    newGrid[r][c] = { pieceId: piece.id, color: piece.color, type: piece.type };
  }

  let newState: GameState = {
    ...state,
    grid: newGrid,
    tray: state.tray.filter(p => p.id !== piece.id),
    moves: state.moves + 1,
    placements: newPlacements,
  };

  // Handle specials (immutable)
  if (piece.type === 'bomb') {
    newState = { ...newState, grid: applyBomb(newState.grid, row, col) };
  } else if (piece.type === 'line-clear') {
    const clearType = row > GRID_SIZE / 2 ? 'row' : 'col';
    const index = clearType === 'row' ? row : col;
    newState = { ...newState, grid: applyLineClear(newState.grid, clearType, index) };
  }

  // Clear lines and score (immutable)
  const clearResult = clearLines(newState.grid);
  const totalCleared = clearResult.clearedRows + clearResult.clearedCols;
  const multiplier = COMBO_MULTIPLIERS[totalCleared] || 1;
  const speedBonus = newPlacements.length > 0 && newPlacements[newPlacements.length - 1] < SPEED_BONUS_THRESHOLD ? 50 : 0;
  const points = (totalCleared * 4 * BASE_POINTS_PER_TILE) * multiplier + speedBonus;

  newState = {
    ...newState,
    grid: clearResult.newGrid,
    score: newState.score + points,
    combo: totalCleared,
  };

  // Confetti for combos 3+
  if (totalCleared >= 3) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }

  // Respawn tray if empty
  if (newState.tray.length === 0) {
    newState = { ...newState, tray: generatePieces(newState.isDaily ? getDailySeed() : Date.now().toString()) };
  }

  newState.gameOver = checkGameOver(newState);
  return newState;
};

const applyBomb = (grid: GridCell[][], row: number, col: number): GridCell[][] => {
  return grid.map((rowArr, rIdx) => 
    rowArr.map((cell, cIdx) => {
      const dr = rIdx - row;
      const dc = cIdx - col;
      if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) {
        return {} as GridCell;
      }
      return cell;
    })
  );
};

const applyLineClear = (grid: GridCell[][], type: 'row' | 'col', index: number): GridCell[][] => {
  return grid.map((rowArr, rIdx) => 
    type === 'col' && rIdx === index 
      ? Array(GRID_SIZE).fill({} as GridCell)
      : rowArr.map((cell, cIdx) => 
          type === 'row' && cIdx === index ? ({} as GridCell) : cell
        )
  );
};

const clearLines = (grid: GridCell[][]): { clearedRows: number; clearedCols: number; newGrid: GridCell[][] } => {
  let clearedRows = 0;
  let clearedCols = 0;
  let newGrid = grid.map(row => [...row]);

  // Clear rows (shift down)
  for (let r = 0; r < newGrid.length; ) {
    if (newGrid[r].every(cell => cell.pieceId)) {
      newGrid.splice(r, 1);
      newGrid.push(Array(GRID_SIZE).fill({} as GridCell));
      clearedRows++;
    } else {
      r++;
    }
  }

  // Clear columns (no shift, just clear)
  for (let c = 0; c < GRID_SIZE; c++) {
    const colFull = newGrid.every(row => row[c].pieceId);
    if (colFull) {
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = {} as GridCell;
      }
      clearedCols++;
    }
  }

  return { clearedRows, clearedCols, newGrid };
};

const checkGameOver = (state: GameState): boolean => {
  return state.tray.every(piece => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (isValidPlacement(state.grid, piece, r, c)) return false;
      }
    }
    return true;
  });
};

// Persistence helpers (localStorage)
export const saveGameState = (state: GameState, key: string = 'combo-blocks-state') => {
  localStorage.setItem(key, JSON.stringify(state));
};

export const loadGameState = (isDaily?: boolean, key: string = 'combo-blocks-state'): GameState | null => {
  const saved = localStorage.getItem(key);
  if (saved) {
    const parsed = JSON.parse(saved) as GameState;
    if (isDaily !== undefined && parsed.isDaily !== isDaily) return null;
    return parsed;
  }
  return null;
};

// Leaderboard (top 10 scores)
export interface LeaderboardEntry { name: string; score: number; date: string; }
export const saveScore = (name: string, score: number) => {
  let lb: LeaderboardEntry[] = JSON.parse(localStorage.getItem('combo-blocks-lb') || '[]');
  lb.push({ name, score, date: new Date().toISOString() });
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem('combo-blocks-lb', JSON.stringify(lb.slice(0, 10)));
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  return JSON.parse(localStorage.getItem('combo-blocks-lb') || '[]');
};

// Daily seed for shareable challenges
export const generateShareableSeed = (score: number, combo: number) => {
  const seed = btoa(`${getDailySeed()}-${score}-${combo}`);
  return `https://yourapp.com/challenge?seed=${seed}`; // Placeholder URL
};