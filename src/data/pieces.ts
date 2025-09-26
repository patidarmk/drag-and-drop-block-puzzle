export interface Piece {
  id: string;
  type: 'I' | 'L' | 'T' | 'S' | 'Z' | 'O' | 'bomb' | 'line-clear';
  positions: [number, number][]; // Relative x,y offsets from pivot
  color: string;
  rotation?: number; // For future rotations
}

export const generatePieces = (seed: string = Date.now().toString()): Piece[] => {
  // Pseudo-random selection based on seed (simple hash for daily challenges)
  const hash = (s: string) => s.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const h = hash(seed) % 100;

  const basePieces: Piece[] = [
    { id: 'i1', type: 'I', positions: [[0,0],[1,0],[2,0],[3,0]], color: '#00f0f0' },
    { id: 'l1', type: 'L', positions: [[0,0],[0,1],[0,2],[1,2]], color: '#ff8000' },
    { id: 't1', type: 'T', positions: [[0,0],[1,0],[2,0],[1,1]], color: '#8000ff' },
    { id: 's1', type: 'S', positions: [[0,1],[1,0],[1,1],[2,0]], color: '#00ff00' },
    { id: 'z1', type: 'Z', positions: [[0,0],[1,0],[1,1],[2,1]], color: '#ff0000' },
    { id: 'o1', type: 'O', positions: [[0,0],[1,0],[0,1],[1,1]], color: '#ffff00' },
  ];

  // Add specials occasionally (20% chance based on seed)
  const specials: Piece[] = [
    { id: 'bomb1', type: 'bomb', positions: [[0,0]] as [number, number][], color: '#ff00ff' },
    { id: 'line1', type: 'line-clear', positions: [[0,0]] as [number, number][], color: '#00ffff' },
  ];
  if (h % 5 === 0) basePieces.push(specials[0]);
  if (h % 7 === 0) basePieces.push(specials[1]);

  // Shuffle based on seed
  const shuffled = [...basePieces].sort(() => (hash(seed + Math.random()) % 2) - 1);
  return shuffled.slice(0, 3); // Tray has 3 pieces
};

export const getDailySeed = (): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Daily reset
  return now.toISOString().split('T')[0];
};