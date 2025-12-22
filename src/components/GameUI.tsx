import React from 'react';
import { Heart, Coins, Flame } from 'lucide-react';
import CircularButton from './ui/CircularButton';

const GameUI: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none text-white font-display">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-2 border-2 border-white/20 flex items-center gap-3">
            <Heart size={32} className="text-red-500" />
            <span className="text-3xl font-black">100 / 100</span>
          </div>
          <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-2 border-2 border-white/20 flex items-center gap-3">
            <Coins size={32} className="text-yellow-400" />
            <span className="text-3xl font-black">5000</span>
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-2 border-2 border-white/20">
          <span className="text-4xl font-black">Wave 1</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="w-1/3 bg-black/50 backdrop-blur-md rounded-2xl p-4 border-2 border-white/20 flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-500 rounded-lg"></div>
          <div>
            <h3 className="text-2xl font-bold">Captain</h3>
            <p className="text-lg">Level 5</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <CircularButton icon={<Flame size={40} />} onClick={() => {}} size="lg" />
        </div>
      </div>
    </div>
  );
};

export default GameUI;
