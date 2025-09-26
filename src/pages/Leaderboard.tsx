import React from 'react';
import { getLeaderboard, LeaderboardEntry } from '@/utils/gameLogic';
import { MadeWithApplaa } from '@/components/made-with-applaa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const lb: LeaderboardEntry[] = getLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate({ to: '/game' })} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Top Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {lb.length === 0 ? (
              <p className="text-center text-gray-500">No scores yet. Play to compete!</p>
            ) : (
              <ul className="space-y-2">
                {lb.map((entry, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{entry.name}</span>
                    <span className="font-bold">{entry.score} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto">
        <MadeWithApplaa />
      </footer>
    </div>
  );
};

export default Leaderboard;