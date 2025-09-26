import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import GameBoard from '@/components/GameBoard';
import PieceTray from '@/components/PieceTray';
import HUD from '@/components/HUD';
import TutorialOverlay from '@/components/TutorialOverlay';
import { GameState, Piece, initGame, placePiece, saveGameState, loadGameState, saveScore, generateShareableSeed } from '@/utils/gameLogic';
import { MadeWithApplaa } from '@/components/made-with-applaa';
import { Share2, Settings, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<GameState>(initGame(false));
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDaily, setIsDaily] = useState(false);
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setState(saved);
      setIsDaily(saved.isDaily);
    } else {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    saveGameState(state);
    if (state.gameOver && !isDaily) { // Save score only for non-daily
      const name = prompt('Enter your name for leaderboard:') || 'Anonymous';
      saveScore(name, state.score);
    }
  }, [state.gameOver, state.score, isDaily]);

  const handleDragStart = (e: React.DragEvent, piece: Piece) => {
    setDraggedPieceId(piece.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', piece.id);
  };

  const handlePlace = (piece: Piece, row: number, col: number) => {
    if (!state.startTime) {
      setState(prev => ({ ...prev, startTime: Date.now() }));
    }
    setState(prev => {
      const newState = placePiece(prev, piece, row, col, Date.now());
      setDraggedPieceId(null); // Clear drag after placement
      return newState;
    });
  };

  const handleRestart = () => {
    setState(initGame(isDaily));
    setDraggedPieceId(null);
    setShowTutorial(false);
  };

  const handleDaily = () => {
    setIsDaily(true);
    const dailyState = initGame(true);
    setState(dailyState);
    setDraggedPieceId(null);
  };

  const handleShare = async () => {
    const seed = generateShareableSeed(state.score, state.combo);
    const text = `I scored ${state.score} with a ${state.combo}x combo in Combo Blocks! Challenge: ${seed}`;
    if (navigator.share) {
      await navigator.share({ title: 'Combo Blocks Score', text, url: seed });
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const draggedPiece = draggedPieceId ? (state.tray.find(p => p.id === draggedPieceId) ?? null) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Combo Blocks
          </h1>
          <nav className="flex space-x-4">
            <Button variant="ghost" onClick={() => navigate({ to: '/leaderboard' })}>
              <Trophy className="w-4 h-4 mr-1" /> Leaderboard
            </Button>
            <Button variant="ghost" onClick={handleDaily}>
              Daily Challenge
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: '/settings' })}>
              <Settings className="w-4 h-4 mr-1" /> Settings
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Drag & Drop to Play!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <GameBoard 
              grid={state.grid} 
              tray={state.tray} 
              draggedPiece={draggedPiece} 
              onPlace={handlePlace} 
              gameOver={state.gameOver} 
            />
            <PieceTray tray={state.tray} onDragStart={handleDragStart} />
            <HUD state={state} onShare={handleShare} onRestart={handleRestart} />
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto">
        <MadeWithApplaa />
      </footer>

      {showTutorial && <TutorialOverlay onDismiss={() => setShowTutorial(false)} />}
    </div>
  );
};

export default Game;