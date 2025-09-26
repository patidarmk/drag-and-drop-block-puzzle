import React from 'react';
import { MadeWithApplaa } from '@/components/made-with-applaa';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Volume2, Smartphone, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [sound, setSound] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [colorBlind, setColorBlind] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate({ to: '/game' })} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Sound</span>
              </div>
              <Switch checked={sound} onCheckedChange={setSound} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Haptics</span>
              </div>
              <Switch checked={haptics} onCheckedChange={setHaptics} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Color Blind Mode</span>
              </div>
              <Switch checked={colorBlind} onCheckedChange={setColorBlind} />
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto">
        <MadeWithApplaa />
      </footer>
    </div>
  );
};

export default Settings;