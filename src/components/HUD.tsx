import React, { useState, useEffect } from 'react';
import { GameState } from '@/utils/gameLogic';
import { Trophy, Clock, Move } from 'lucide-react';

interface HUDProps {
  state: GameState;
  onShare: () => void;
  onRestart: () => void;
}

const HUD: React.FC<HUDProps> = ({ state, onShare, onRestart }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (state.startTime) {
      const interval = setInterval(() => {
        setTime(Date.now() - state.startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.startTime]);

  const formatTime = (ms: number) => new Date(ms).toISOString().substr(11, 8);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white/80 backdrop-blur rounded-lg shadow-md">
      <div className="flex justify-between w-full max-w-xs">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold">Score: {state.score}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold">Combo: {state.combo}x</span>
        </div>
      </div>
      <div className="flex justify-between w-full max-w-xs">
        <div className="flex items-center space-x-1">
          <Move className="w-4 h-4" />
          <span>Moves: {state.moves}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Time: {formatTime(time)}</span>
        </div>
      </div>
      {state.gameOver && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Game Over!</h2>
          <button onClick={onRestart} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Restart
          </button>
          <button onClick={onShare} className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Share Score
          </button>
        </div>
      )}
      {state.isDaily && <div className="text-sm text-blue-600">Daily Challenge</div>}
    </div>
  );
};

export default HUD;