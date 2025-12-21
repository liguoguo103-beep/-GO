import React, { useEffect, useState, useRef } from 'react';
import { IngredientType } from '../types.ts';
import { IngredientRenderer } from './GameAssets';

interface CuteIngredientProps {
  type: IngredientType;
  isAttacking?: boolean;
  level: number;
  isStunned?: boolean;
}

const CuteIngredient: React.FC<CuteIngredientProps> = ({ type, isAttacking, level, isStunned }) => {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setIsLevelingUp(true);
      const timer = setTimeout(() => setIsLevelingUp(false), 400); // Match CSS animation duration
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = level;
  }, [level]);
  
  // Determine eye expression/position based on type
  const eyeContainerClass = type === IngredientType.GARLIC ? "gap-4" : "gap-1";
  const eyeColor = type === IngredientType.CHILI ? "bg-yellow-300 shadow-[0_0_5px_rgba(253,224,71,0.8)]" : "bg-white";

  // Dynamic Level Badge Color
  const getBadgeStyle = (lvl: number) => {
    if (lvl >= 100) return "bg-red-600 border-red-300 shadow-[0_0_15px_#dc2626]";
    if (lvl >= 50) return "bg-fuchsia-600 border-fuchsia-300 shadow-[0_0_10px_#c026d3]";
    if (lvl >= 25) return "bg-purple-600 border-purple-300 shadow-[0_0_10px_#a855f7]";
    if (lvl >= 10) return "bg-orange-500 border-orange-200 shadow-[0_0_8px_#f97316]";
    if (lvl >= 5) return "bg-blue-500 border-blue-200";
    return "bg-gray-600 border-gray-400"; // Level 1 is simple
  };

  // Evolution Filters/Effects based on level
  const getLevelEffect = (lvl: number) => {
     if (lvl >= 100) return "filter drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] brightness-125 saturate-150 animate-pulse"; // God Mode
     if (lvl >= 50) return "filter drop-shadow-[0_0_5px_rgba(168,85,247,0.6)] brightness-110"; // Epic
     if (lvl < 3) return "filter sepia-[0.3] brightness-90"; // Raw look for low levels
     return "";
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none transform transition-transform duration-100 
      ${isAttacking ? 'animate-recoil' : ''} 
      ${isLevelingUp ? 'animate-level-up' : ''}
    `}>
      
      {/* Base SVG Asset with Level Effect */}
      <div className={`w-14 h-14 z-10 transition-all duration-500 ${getLevelEffect(level)} ${isStunned ? 'filter grayscale brightness-50' : ''}`}>
        <IngredientRenderer type={type} />
      </div>
      
      {/* Stunned Indicator */}
      {isStunned && (
         <div className="absolute top-0 right-0 z-40 animate-pulse">
            <span className="text-xl font-bold text-blue-300 drop-shadow-md">Zzz</span>
         </div>
      )}

      {/* Cute Eyes Wrapper - Positioned absolutely over the SVG */}
      <div className={`absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex ${eyeContainerClass} pointer-events-none`}>
         {/* Left Eye */}
         <div className={`w-3 h-3 ${eyeColor} rounded-full relative shadow-sm border border-black/20 overflow-hidden`}>
            { !isStunned && <div className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-black rounded-full animate-blink"></div> }
            { isStunned && <div className="absolute top-1.5 left-0.5 w-2 h-0.5 bg-black rounded-full rotate-45"></div> }
         </div>
         {/* Right Eye */}
         <div className={`w-3 h-3 ${eyeColor} rounded-full relative shadow-sm border border-black/20 overflow-hidden`}>
            { !isStunned && <div className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-black rounded-full animate-blink"></div> }
            { isStunned && <div className="absolute top-1.5 left-0.5 w-2 h-0.5 bg-black rounded-full -rotate-45"></div> }
         </div>
      </div>

      {/* Level Badge (Now passed as prop to control internal style, but rendered outside in GameCanvas usually. 
          However, keeping it here ensures it pops with the ingredient) */}
      <div className={`absolute -top-2 -right-2 text-[10px] min-w-[1.25rem] h-5 flex items-center justify-center rounded-full border-2 font-bold z-30 shadow-md transition-colors duration-300 px-1 ${getBadgeStyle(level)}`}>
        {level}
      </div>

    </div>
  );
};

export default CuteIngredient;