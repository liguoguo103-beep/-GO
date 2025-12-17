
import React, { useEffect, useState } from 'react';
import { BeefSVG, KingBeefSVG } from './GameAssets';
import { Flame } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("正在準備木炭...");

  useEffect(() => {
    // Text changes
    const textTimers = [
      setTimeout(() => setLoadingText("正在醃製肉串..."), 1000),
      setTimeout(() => setLoadingText("召喚傳說中的食材..."), 2000),
      setTimeout(() => setLoadingText("趕走偷吃的老鼠..."), 3000),
      setTimeout(() => setLoadingText("點火！"), 3800),
    ];

    // Progress bar loop
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Small delay before closing
          return 100;
        }
        // Accelerate towards the end
        const increment = prev > 80 ? 2 : prev > 50 ? 1 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 20);

    return () => {
      clearInterval(interval);
      textTimers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a0505] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 via-black to-black animate-pulse"></div>
        
        {/* Promo / Logo Area */}
        <div className="relative z-10 flex flex-col items-center mb-16 scale-110 md:scale-150 transform transition-all">
            <div className="flex items-center gap-2 mb-2">
                 <Flame size={40} className="text-orange-500 animate-fire-glow" />
                 <Flame size={56} className="text-red-600 animate-fire-glow" style={{ animationDelay: '0.2s' }} />
                 <Flame size={40} className="text-yellow-500 animate-fire-glow" style={{ animationDelay: '0.4s' }} />
            </div>
            
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-red-600 tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-white" 
                style={{ WebkitTextStroke: '2px #3d0000' }}>
              烤串英雄
            </h1>
            <div className="text-yellow-200 font-bold tracking-[0.5em] text-sm mt-2 opacity-80 uppercase">
                Grill Hero
            </div>
            <div className="mt-4 px-4 py-1 bg-white/10 rounded-full border border-white/20 text-xs text-gray-400">
                策略塔防 x 美味燒烤
            </div>
        </div>

        {/* Progress Section */}
        <div className="w-full max-w-2xl px-8 relative z-10">
            {/* The Runner Track */}
            <div className="w-full h-1 bg-gray-700 rounded-full mb-8 relative">
                 {/* Progress Fill */}
                 <div 
                   className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full transition-all duration-75 ease-linear"
                   style={{ width: `${progress}%` }}
                 ></div>

                 {/* The Running Meat */}
                 <div 
                    className="absolute top-1/2 -translate-y-1/2 -ml-6 w-12 h-12 transition-all duration-75 ease-linear"
                    style={{ left: `${progress}%` }}
                 >
                    <div className="w-full h-full animate-run">
                       {/* Switch to King Beef when close to done for visual flair */}
                       {progress > 80 ? <KingBeefSVG /> : <BeefSVG />}
                       
                       {/* Dust particles behind */}
                       <div className="absolute bottom-0 -left-4 flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-ping opacity-50"></div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.1s' }}></div>
                       </div>
                    </div>
                    {/* Speech Bubble */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-lg">
                        {Math.floor(progress)}%
                    </div>
                 </div>
            </div>
            
            {/* Loading Text */}
            <div className="text-center font-mono text-orange-300 animate-pulse text-sm min-h-[1.5rem]">
               {loadingText}
            </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-center text-[10px] text-gray-600">
           © 2024 Grill Hero Studio. Do not eat screen.
        </div>
    </div>
  );
};

export default LoadingScreen;
