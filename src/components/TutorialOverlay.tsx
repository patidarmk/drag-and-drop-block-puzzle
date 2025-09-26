import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TutorialOverlay: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [step, setStep] = useState(0);
  const steps = [
    'Drag a piece from the tray below...',
    'Drop it on the grid to place!',
    'Complete rows/columns to score combos!',
  ];

  useEffect(() => {
    if (!localStorage.getItem('tutorial-seen')) {
      localStorage.setItem('tutorial-seen', 'true');
    }
  }, []);

  if (localStorage.getItem('tutorial-seen')) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Welcome to Combo Blocks!</h2>
          <button onClick={onDismiss} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mb-4">{steps[step]}</p>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="px-4 py-2 bg-blue-500 text-white rounded">
            Next
          </button>
        ) : (
          <button onClick={onDismiss} className="px-4 py-2 bg-green-500 text-white rounded">
            Start Playing
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;