import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MadeWithApplaa } from '@/components/made-with-applaa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Trophy, Calendar, Settings } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center p-4 space-y-6">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg w-full">
        <div className="container mx-auto px-4 py-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Combo Blocks
          </h1>
          <p className="text-gray-600 mt-2">Drag, drop, and combo your way to victory!</p>
        </div>
      </header>

      <main className="space-y-4 w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 mr-2" /> Start Playing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/game' })} className="w-full mb-2">
              Play Game
            </Button>
            <Button onClick={() => navigate({ to: '/daily' })} variant="outline" className="w-full mb-2">
              <Calendar className="w-4 h-4 mr-2" /> Daily Challenge
            </Button>
            <Button onClick={() => navigate({ to: '/leaderboard' })} variant="outline" className="w-full">
              <Trophy className="w-4 h-4 mr-2" /> Leaderboard
            </Button>
          </CardContent>
        </Card>
        <Button onClick={() => navigate({ to: '/settings' })} variant="ghost" className="w-full">
          <Settings className="w-4 h-4 mr-2" /> Settings
        </Button>
      </main>

      <footer className="mt-auto">
        <MadeWithApplaa />
      </footer>
    </div>
  );
};

export default Index;