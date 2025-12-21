
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
    const textTimers = [
      setTimeout(() => setLoadingText("正在醃製頂級肉串..."), 1000),
      setTimeout(() => setLoadingText("召喚傳說中的食材大師..."), 2000),
      setTimeout(() => setLoadingText("驅逐飢餓的老鼠偵察兵..."), 3000),
      setTimeout(() => setLoadingText("猛火點燃！"), 3800),
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
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
    <div className="fixed inset-0 z-[300] bg-[#0f0505] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,_#7f1d1d_0%,_#000_80%)] animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center mb-20 scale-125 md:scale-150 transform transition-all">
            <div className="flex items-center gap-4 mb-4"><Flame size={50} className="text-orange-500 animate-fire-glow" /><Flame size={80} className="text-red-600 animate-fire-glow" style={{ animationDelay: '0.2s' }} /><Flame size={50} className="text-yellow-500 animate-fire-glow" style={{ animationDelay: '0.4s' }} /></div>
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-700 tracking-tighter drop-shadow-[0_6px_0_#000] font-display" style={{ WebkitTextStroke: '2px #fff' }}>烤串英雄</h1>
            <div className="text-yellow-200 font-black tracking-[0.6em] text-lg mt-4 opacity-90 uppercase font-display italic drop-shadow-md">最強燒烤 ‧ 終極防禦</div>
            <div className="mt-8 px-8 py-2 bg-black/60 rounded-full border-2 border-white/10 text-sm text-gray-400 font-black tracking-widest font-display shadow-2xl">策略塔防 X 極致美味</div>
        </div>

        <div className="w-full max-w-3xl px-12 relative z-10">
            <div className="w-full h-2 bg-stone-900 rounded-full mb-12 relative shadow-inner border-t border-white/5">
                 <div className="h-full bg-gradient-to-r from-orange-600 via-yellow-500 to-white rounded-full transition-all duration-75 ease-linear shadow-[0_0_15px_#f59e0b]" style={{ width: `${progress}%` }}></div>
                 <div className="absolute top-1/2 -translate-y-1/2 -ml-8 w-20 h-20 transition-all duration-75 ease-linear" style={{ left: `${progress}%` }}>
                    <div className="w-full h-full animate-run drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">{progress > 80 ? <KingBeefSVG /> : <BeefSVG />}<div className="absolute bottom-2 -left-6 flex gap-2"><div className="w-2 h-2 bg-orange-600/50 rounded-full animate-ping"></div><div className="w-1.5 h-1.5 bg-yellow-500/30 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div></div></div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-sm font-black px-4 py-1 rounded-full whitespace-nowrap shadow-2xl font-display">{Math.floor(progress)}%</div>
                 </div>
            </div>
            <div className="text-center font-display font-black tracking-widest text-orange-400 animate-pulse text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] min-h-[2.5rem]">{loadingText}</div>
        </div>

        <div className="absolute bottom-8 text-center text-xs text-stone-600 font-black tracking-widest font-display opacity-50 uppercase">© 2024 GRILL HERO STUDIO ‧ MADE WITH PASSION</div>
    </div>
  );
};

export default LoadingScreen;
