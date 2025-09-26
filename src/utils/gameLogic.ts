import { Piece, getDailySeed, generatePieces } from '@/data/pieces';
import confetti from 'canvas-confetti';

const GRID_SIZE = 10;
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
    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({})),
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
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || grid[r][c].pieceId) {
      return false;
    }
  }
  return true;
};

export const placePiece = (state: GameState, piece: Piece, row: number, col: number, placementTime?: number): GameState {
  if (!isValidPlacement(state.grid, piece, row, col)) return { ...state, gameOver: checkGameOver(state) };

  const newGrid = state.grid.map(rowArr => [...rowArr]);
  const placeTime = placementTime || Date.now();
  state.placements.push(placeTime - (state.startTime || placeTime));

  for (const [dx, dy] of piece.positions) {
    const r = row + dy;
    const c = col + dx;
    newGrid[r][c] = { pieceId: piece.id, color: piece.color, type: piece.type };
  }

  let newState = {
    ...state,
    grid: newGrid,
    tray: state.tray.filter(p => p.id !== piece.id),
    moves: state.moves + 1,
  };

  // Handle specials
  if (piece.type === 'bomb') {
    newState = applyBomb(newGrid, row, col);
  } else if (piece.type === 'line-clear') {
    newState = applyLineClear(newGrid, row > GRID_SIZE / 2 ? 'row' : 'col', row % GRID_SIZE); // Simple: clear row or col based on drop pos
  }

  // Clear lines and score
  const { clearedRows, clearedCols } = clearLines(newState.grid);
  const totalCleared = clearedRows + clearedCols;
  const multiplier = COMBO_MULTIPLIERS[totalCleared] || 1;
  const speedBonus = state.placements.length > 0 && state.placements[state.placements.length - 1] < SPEED_BONUS_THRESHOLD ? 50 : 0;
  const points = (totalCleared * 4 * BASE_POINTS_PER_TILE) * multiplier + speedBonus; // Approx 4 tiles per piece

  newState = {
    ...newState,
    score: newState.score + points,
    combo: totalCleared,
    grid: newState.grid, // Updated from clears
  };

  // Confetti for combos 3+
  if (totalCleared >= 3) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }

  // Respawn tray if empty
  if (newState.tray.length === 0) {
    newState.tray = generatePieces(newState.isDaily ? getDailySeed() : Date.now().toString());
  }

  newState.gameOver = checkGameOver(newState);
  return newState;
};

const applyBomb = (grid: GridCell[][], row: number, col: number): GridCell[][] => {
  const newGrid = grid.map(r => [...r]);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = Math.max(0, Math.min(GRID_SIZE - 1, row + dr));
      const c = Math.max(0, Math.min(GRID_SIZE - 1, col + dc));
      newGrid[r][c] = {};
    }
  }
  return newGrid;
};

const applyLineClear = (grid: GridCell[][], type: 'row' | 'col', index: number): GridCell[][] => {
  const newGrid = grid.map(r => [...r]);
  if (type === 'row') {
    newGrid[index] = Array(GRID_SIZE).fill({});
  } else {
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i][index] = {};
    }
  }
  return newGrid;
};

const clearLines = (grid: GridCell[][]): { clearedRows: number; clearedCols: number } => {
  let clearedRows = 0;
  let clearedCols = 0;

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every(cell => cell.pieceId)) {
      grid.splice(r, 1);
      grid.push(Array(GRID_SIZE).fill({}));
      clearedRows++;
      r--; // Re-check shifted row
    }
  }

  // Check cols (simplified; shift down)
  for (let c = 0; c < GRID_SIZE; c++) {
    const colFull = grid.every(row => row[c].pieceId);
    if (colFull) {
      for (let r = 0; r < GRID_SIZE; r++) {
        grid[r][c] = {};
      }
      clearedCols++;
    }
  }

  return { clearedRows, clearedCols };
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
    const parsed = JSON.parse(saved);
    if (isDaily && parsed.isDaily !== isDaily) return null; // Daily invalid if not matching
    return parsed;
  }
  return null;
};

// Leaderboard (top 10 scores)
export interface LeaderboardEntry { name: string; score: number; date: string; }
export const saveScore = (name: string, score: number) => {
  const lb: LeaderboardEntry[] = JSON.parse(localStorage.getItem('combo-blocks-lb') || '[]');
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