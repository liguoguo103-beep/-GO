
import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import UpgradeMenu from './components/UpgradeMenu';
import SkillGlossary from './components/SkillGlossary';
import LoadingScreen from './components/LoadingScreen';
import { GameState, GameStatus, Slot, Enemy, IngredientType, Ingredient } from './types';
import { GAME_Config, INGREDIENT_STATS, UPGRADE_MULTIPLIER, STAT_MULTIPLIER, getSkillsForType } from './constants';
import { Play, RotateCcw, Volume2, VolumeX, ArrowRight, Trophy, BookOpen, Tv, HeartPulse, Coins, X, Flame, Pause, Home, Minus, Plus, Grid3X3, ArrowLeftRight, Heart, Skull, MousePointer2 } from 'lucide-react';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  // --- Game Settings State ---
  const [configLanes, setConfigLanes] = useState(GAME_Config.DEFAULT_LANES);
  const [configSlots, setConfigSlots] = useState(GAME_Config.DEFAULT_SLOTS_PER_LANE);

  // --- Global State ---
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.LOADING, // Start with Loading
    money: GAME_Config.STARTING_MONEY,
    score: 0,
    wave: 1,
    hp: GAME_Config.PLAYER_MAX_HP,
    maxHp: GAME_Config.PLAYER_MAX_HP,
    heat: 0,
    isOverheated: false,
    overheatEndTime: 0,
    mapConfig: {
       lanes: GAME_Config.DEFAULT_LANES,
       slotsPerLane: GAME_Config.DEFAULT_SLOTS_PER_LANE
    },
    combo: 0 // Init combo
  });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showTutorialHint, setShowTutorialHint] = useState(false);
  
  // Transition State
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- App Lifecycle & Visibility Handling ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState.status === GameStatus.PLAYING) {
        setGameState(prev => ({ ...prev, status: GameStatus.PAUSED }));
        audioService.stop();
      } else if (!document.hidden && gameState.status === GameStatus.PLAYING) {
         if (!isMuted) audioService.play('GAME');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState.status, isMuted]);

  // Music Logic
  useEffect(() => {
    if (gameState.status === GameStatus.MENU) {
      audioService.play('MENU');
    } else if (gameState.status === GameStatus.PLAYING) {
      audioService.play('GAME');
    } else if (gameState.status === GameStatus.GAME_OVER) {
      audioService.play('GAMEOVER');
    } else if (gameState.status === GameStatus.LEVEL_COMPLETE) {
      audioService.play('MENU'); // Chill music for victory
    } else if (gameState.status === GameStatus.REVIVE_OFFER || gameState.status === GameStatus.PAUSED) {
      audioService.stop(); // Silence for suspense or pause
    }
  }, [gameState.status]);

  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  // --- Helpers ---
  const calculateMaxHp = (lanes: number) => {
    return Math.floor(10 + ((lanes - 3) / 7) * 40);
  };

  const getLaneIndices = (totalLanes: number, type: 'FAST' | 'PIERCE' | 'STRONG') => {
      const indices: number[] = [];
      for (let i = 0; i < totalLanes; i++) {
          const pattern = i % 5;
          if (type === 'FAST' && (pattern === 0 || pattern === 3)) indices.push(i + 1);
          if (type === 'PIERCE' && pattern === 1) indices.push(i + 1);
          if (type === 'STRONG' && (pattern === 2 || pattern === 4)) indices.push(i + 1);
      }
      return indices;
  };

  const performTransition = (callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700);
    }, 500);
  };

  const handleLoadingComplete = () => {
    performTransition(() => {
      setGameState(prev => ({ ...prev, status: GameStatus.MENU }));
    });
  };

  const startGame = () => {
    audioService.init();
    performTransition(() => {
        const lanes = configLanes;
        const slotsPerLane = configSlots;
        const calculatedMaxHp = calculateMaxHp(lanes);
        const newSlots: Slot[] = [];
        const middleLaneIndex = Math.floor(lanes / 2);

        for (let lane = 0; lane < lanes; lane++) {
            for (let i = 0; i < slotsPerLane; i++) {
                let initialIngredient: Ingredient | null = null;
                if (lane === middleLaneIndex && i === 0) {
                    const stats = INGREDIENT_STATS[IngredientType.SEASONING_CAPTAIN];
                    initialIngredient = {
                        id: `captain-${Math.random()}`,
                        type: IngredientType.SEASONING_CAPTAIN,
                        level: 1,
                        lastAttackTime: 0,
                        lastAutoLevelTime: performance.now(),
                        hp: stats.hp,
                        maxHp: stats.maxHp,
                        selectedSkills: [],
                        availableSkillPoints: 0
                    };
                }
                newSlots.push({ id: `l${lane}-s${i}`, laneIndex: lane, slotIndex: i, ingredient: initialIngredient });
            }
        }
        setSlots(newSlots);
        setGameState({
          status: GameStatus.PLAYING,
          money: GAME_Config.STARTING_MONEY,
          score: 0,
          wave: 1,
          hp: calculatedMaxHp,
          maxHp: calculatedMaxHp,
          heat: 0,
          isOverheated: false,
          overheatEndTime: 0,
          mapConfig: { lanes, slotsPerLane },
          combo: 0
        });
        setEnemies([]);
        setSelectedSlotId(null);
        setShowTutorialHint(true); 
        setTimeout(() => setShowTutorialHint(false), 8000);
    });
  };

  const handleNextLevel = () => {
    performTransition(() => {
        const bonusMoney = 500 + (gameState.wave * 100);
        setGameState(prev => ({
          ...prev,
          status: GameStatus.PLAYING,
          wave: prev.wave + 1,
          money: prev.money + bonusMoney,
          hp: prev.maxHp, 
          heat: Math.max(0, prev.heat - 30), 
          combo: 0 
        }));
        
        const lanes = gameState.mapConfig.lanes;
        const middleLaneIndex = Math.floor(lanes / 2);
        
        setSlots(prev => prev.map(s => {
            if (s.laneIndex === middleLaneIndex && s.slotIndex === 0) {
                 const stats = INGREDIENT_STATS[IngredientType.SEASONING_CAPTAIN];
                 return { ...s, ingredient: { id: `captain-${Math.random()}`, type: IngredientType.SEASONING_CAPTAIN, level: 1, lastAttackTime: 0, lastAutoLevelTime: performance.now(), hp: stats.hp, maxHp: stats.maxHp, selectedSkills: [], availableSkillPoints: 0 } };
            }
            return { ...s, ingredient: null };
        }));
        setEnemies([]);
        setSelectedSlotId(null);
    });
  };

  const REVIVE_COST = 500;
  const handleRevivePay = () => { if (gameState.money >= REVIVE_COST) { performTransition(() => { setGameState(prev => ({ ...prev, status: GameStatus.PLAYING, hp: prev.maxHp, money: prev.money - REVIVE_COST })); setEnemies(prev => prev.map(e => ({...e, x: Math.max(e.x + 40, 100)}))); audioService.play('GAME'); }); } };
  const handleReviveAd = () => { const confirm = window.confirm("觀看一段精彩的廣告... (模擬)"); if(confirm) { performTransition(() => { setGameState(prev => ({ ...prev, status: GameStatus.PLAYING, hp: prev.maxHp })); setEnemies(prev => prev.map(e => ({...e, x: Math.max(e.x + 40, 100)}))); audioService.play('GAME'); }); } };
  const handleGiveUp = () => { performTransition(() => { setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER })); audioService.play('GAMEOVER'); }); };
  const handlePause = () => { if (isTransitioning) return; setGameState(prev => ({ ...prev, status: GameStatus.PAUSED })); };
  const handleResume = () => { setGameState(prev => ({ ...prev, status: GameStatus.PLAYING })); };
  const handleQuitGame = () => { performTransition(() => { setGameState(prev => ({ ...prev, status: GameStatus.MENU })); setSlots([]); setEnemies([]); setSelectedSlotId(null); }); };
  const handleSlotClick = (slotId: string) => { if (gameState.status !== GameStatus.PLAYING) return; if (showTutorialHint) setShowTutorialHint(false); if (selectedSlotId === slotId) { setSelectedSlotId(null); } else { setSelectedSlotId(slotId); } };
  const handleBuy = (type: IngredientType) => { if (!selectedSlotId) return; const slot = slots.find(s => s.id === selectedSlotId); if (slot?.ingredient) { return; } const cost = INGREDIENT_STATS[type].cost; if (gameState.money >= cost) { setGameState(prev => ({ ...prev, money: prev.money - cost })); setSlots(prev => prev.map(slot => { if (slot.id === selectedSlotId) { const stats = INGREDIENT_STATS[type]; const newIngredient: Ingredient = { id: Math.random().toString(), type, level: 1, lastAttackTime: 0, lastAutoLevelTime: performance.now(), hp: stats.hp, maxHp: stats.maxHp, selectedSkills: [], availableSkillPoints: 0 }; return { ...slot, ingredient: newIngredient }; } return slot; })); } };
  const handleUpgrade = () => { if (!selectedSlotId) return; const slot = slots.find(s => s.id === selectedSlotId); if (!slot || !slot.ingredient) return; const stats = INGREDIENT_STATS[slot.ingredient.type]; const upgradeCost = Math.floor(stats.cost * Math.pow(UPGRADE_MULTIPLIER, slot.ingredient.level)); if (gameState.money >= upgradeCost) { setGameState(prev => ({ ...prev, money: prev.money - upgradeCost })); setSlots(prev => prev.map(s => { if (s.id === selectedSlotId && s.ingredient) { const newLevel = s.ingredient.level + 1; let sp = s.ingredient.availableSkillPoints; if (newLevel % GAME_Config.SKILL_POINT_INTERVAL === 0) { sp += 1; } return { ...s, ingredient: { ...s.ingredient, level: newLevel, maxHp: Math.floor(s.ingredient.maxHp * STAT_MULTIPLIER), hp: Math.floor(s.ingredient.hp * STAT_MULTIPLIER), availableSkillPoints: sp } }; } return s; })); } };
  const handleSell = () => { if (!selectedSlotId) return; const slot = slots.find(s => s.id === selectedSlotId); if (!slot || !slot.ingredient) return; if (slot.ingredient.type === IngredientType.SEASONING_CAPTAIN) { return; } const refund = Math.floor(INGREDIENT_STATS[slot.ingredient.type].cost * 0.5); setGameState(prev => ({ ...prev, money: prev.money + refund })); setSlots(prev => prev.map(s => s.id === selectedSlotId ? { ...s, ingredient: null } : s)); setSelectedSlotId(null); };
  const handleUnlockSkill = (slotId: string, skillId: string) => { setSlots(prev => prev.map(s => { if (s.id === slotId && s.ingredient) { const currentSkills = s.ingredient.selectedSkills; const availableSkills = getSkillsForType(s.ingredient.type); const targetSkill = availableSkills.find(sk => sk.id === skillId); if (!targetSkill) return s; if (currentSkills.includes(skillId)) return s; if (s.ingredient.availableSkillPoints < targetSkill.cost) return s; if (s.ingredient.level < targetSkill.unlockLevel) return s; return { ...s, ingredient: { ...s.ingredient!, availableSkillPoints: s.ingredient.availableSkillPoints - targetSkill.cost, selectedSkills: [...currentSkills, skillId] } }; } return s; })); };
  const handleResetSkills = (slotId: string) => { if (!slotId) return; const slot = slots.find(s => s.id === selectedSlotId); if (!slot || !slot.ingredient) return; if (gameState.money >= GAME_Config.SKILL_RESET_COST) { setGameState(prev => ({ ...prev, money: prev.money - GAME_Config.SKILL_RESET_COST })); setSlots(prev => prev.map(s => { if (s.id === slotId && s.ingredient) { const skills = getSkillsForType(s.ingredient.type); const spentPoints = s.ingredient.selectedSkills.reduce((acc, skillId) => { const skill = skills.find(sk => sk.id === skillId); return acc + (skill ? skill.cost : 0); }, 0); return { ...s, ingredient: { ...s.ingredient!, selectedSkills: [], availableSkillPoints: s.ingredient.availableSkillPoints + spentPoints } }; } return s; })); } };
  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  return (
    <div className="w-screen h-screen bg-[#0f0505] flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {/* Cinematic Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden">
           <div className="w-[150vw] h-[150vh] bg-gradient-to-r from-gray-900 via-gray-800 to-black animate-smoke absolute transform -rotate-12 opacity-95"></div>
           <div className="w-[150vw] h-[150vh] absolute transform -rotate-12 animate-smoke" style={{ animationDelay: '0.1s', opacity: 0.5 }}>
              <div className="w-40 h-full bg-gradient-to-r from-transparent via-orange-600 to-transparent blur-3xl absolute left-0 top-0 bottom-0"></div>
           </div>
           <div className="relative z-10 animate-pulse text-orange-500 opacity-0 animate-smoke" style={{ animationDelay: '0.2s' }}>
              <Flame size={120} />
           </div>
        </div>
      )}

      {/* Loading Screen */}
      {gameState.status === GameStatus.LOADING && (
         <LoadingScreen onComplete={handleLoadingComplete} />
      )}

      {/* HUD Bar */}
      {gameState.status === GameStatus.PLAYING && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-title-drop pointer-events-none w-full max-w-lg px-4 pt-4">
           {/* Chains */}
           <div className="flex justify-between w-64 -mb-3 z-0 opacity-80">
              <div className="w-1 h-12 bg-gradient-to-b from-[#555] to-[#222]"></div>
              <div className="w-1 h-12 bg-gradient-to-b from-[#555] to-[#222]"></div>
           </div>
           
           {/* Wooden Sign Board */}
           <div className="relative bg-wood border-[3px] border-[#291e1a] rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.8)] px-6 py-3 flex items-center justify-between gap-6 z-10 transform rotate-1 w-full max-w-md">
               {/* Screws */}
               <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#555] shadow-inner border border-[#333]"></div>
               <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#555] shadow-inner border border-[#333]"></div>
               <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#555] shadow-inner border border-[#333]"></div>
               <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#555] shadow-inner border border-[#333]"></div>

               {/* Money */}
               <div className="flex items-center gap-2">
                   <div className="bg-black/40 p-1.5 rounded-full border border-yellow-600/50 shadow-inner">
                        <Coins size={18} className="text-yellow-400 drop-shadow-md" />
                   </div>
                   <span className="text-2xl font-black text-yellow-100 font-mono tracking-wider drop-shadow-md" style={{textShadow: '2px 2px 0 #000'}}>${gameState.money}</span>
               </div>

               {/* Wave */}
               <div className="flex items-center gap-2">
                   <div className="bg-black/40 p-1.5 rounded-full border border-red-600/50 shadow-inner">
                        <Skull size={18} className="text-red-300" />
                   </div>
                   <span className="text-2xl font-black text-red-100 font-mono drop-shadow-md" style={{textShadow: '2px 2px 0 #000'}}>{gameState.wave}</span>
               </div>

               {/* HP */}
               <div className="flex items-center gap-2">
                   <div className="relative">
                        <Heart size={20} className="text-green-600 fill-green-600 drop-shadow-md" />
                        <div className="absolute inset-0 animate-ping opacity-50">
                            <Heart size={20} className="text-green-400 fill-green-400" />
                        </div>
                   </div>
                   <div className="flex flex-col w-24">
                       <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
                          <div 
                             className="h-full bg-gradient-to-r from-green-700 to-green-400 transition-all duration-300"
                             style={{ width: `${(gameState.hp / gameState.maxHp) * 100}%` }}
                          ></div>
                          {/* Glint */}
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20"></div>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* Top Right Controls (Pause & Audio) */}
      {gameState.status !== GameStatus.LOADING && gameState.status !== GameStatus.MENU && (
        <div className="absolute top-4 right-4 z-50 flex gap-3">
            {gameState.status === GameStatus.PLAYING && (
                <button 
                onClick={handlePause}
                className="bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors border-2 border-white/10 active:scale-95 shadow-lg backdrop-blur-sm btn-3d"
                >
                    <Pause size={20} />
                </button>
            )}
            <button 
            onClick={toggleMute}
            className="bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors border-2 border-white/10 active:scale-95 shadow-lg backdrop-blur-sm btn-3d"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>
      )}

      {/* Tutorial Hint */}
      {showTutorialHint && gameState.status === GameStatus.PLAYING && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center animate-pulse">
              <div className="bg-black/80 text-white p-6 rounded-xl border-2 border-yellow-400 flex flex-col items-center gap-4 shadow-2xl backdrop-blur-sm max-w-sm text-center">
                  <div className="bg-yellow-500 rounded-full p-3 animate-bounce">
                      <MousePointer2 size={32} className="text-black" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-1">開始燒烤！</h3>
                      <p className="text-sm text-gray-300">點擊任意空位放置食材，<br/>抵禦老鼠的進攻！</p>
                  </div>
              </div>
          </div>
      )}

      {/* Pause Menu Overlay */}
      {gameState.status === GameStatus.PAUSED && (
        <div className="absolute z-50 bg-black/80 inset-0 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
           <h2 className="text-6xl font-black text-white mb-8 tracking-widest drop-shadow-lg font-display">PAUSED</h2>
           
           <div className="flex flex-col gap-6 w-72">
             <button 
               onClick={handleResume}
               className="bg-green-600 hover:bg-green-500 text-white text-xl font-black py-4 px-8 rounded-xl shadow-[0_10px_0_#14532d] active:shadow-[0_0_0] active:translate-y-2.5 transition-all flex items-center justify-center gap-3 border-2 border-green-400"
             >
               <Play size={28} fill="currentColor" /> RESUME
             </button>

             <button 
               onClick={handleQuitGame}
               className="bg-gray-700 hover:bg-red-600 text-gray-200 hover:text-white text-lg font-bold py-4 px-8 rounded-xl shadow-[0_10px_0_#1f2937] active:shadow-[0_0_0] active:translate-y-2.5 transition-all flex items-center justify-center gap-3 border-2 border-gray-500"
             >
               <Home size={28} /> MAIN MENU
             </button>
           </div>
        </div>
      )}

      {/* Main Menu */}
      {gameState.status === GameStatus.MENU && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 overflow-y-auto">
           {/* Background Video/Image would go here, using CSS pattern for now */}
           <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/50 via-black to-black"></div>

           <div className="animate-title-drop relative flex flex-col items-center mb-8">
             <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,1)] stroke-white font-display text-center" style={{ WebkitTextStroke: '2px #3d0000' }}>
               GRILL HERO
             </h1>
             <div className="flex items-center gap-4 mt-2">
                 <div className="h-1 w-12 bg-blue-500"></div>
                 <span className="text-2xl sm:text-3xl text-blue-400 font-bold tracking-[0.5em] uppercase font-display italic">Ultimate 2.0</span>
                 <div className="h-1 w-12 bg-blue-500"></div>
             </div>
           </div>
           
           {/* Map Settings Panel */}
           <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border-2 border-white/10 animate-zoom-in w-full max-w-2xl mb-8 shadow-2xl relative" style={{ animationDelay: '0.3s' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a1a] px-4 py-1 rounded text-xs font-bold text-gray-400 border border-white/10 uppercase tracking-widest">Map Configuration</div>
              
              <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-2">
                 {/* Lanes Control */}
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-2 uppercase font-bold flex items-center gap-1"><Grid3X3 size={14}/> Grill Rows</span>
                    <div className="flex items-center gap-4 bg-black/80 p-1.5 rounded-xl border border-white/10 shadow-inner">
                        <button onClick={() => setConfigLanes(l => Math.max(3, l - 1))} className="w-10 h-10 flex items-center justify-center bg-stone-700 hover:bg-red-600 rounded-lg text-white transition-colors active:scale-95 border border-white/5"><Minus size={18} /></button>
                        <span className="text-3xl font-mono font-black w-8 text-center text-yellow-400">{configLanes}</span>
                        <button onClick={() => setConfigLanes(l => Math.min(10, l + 1))} className="w-10 h-10 flex items-center justify-center bg-stone-700 hover:bg-green-600 rounded-lg text-white transition-colors active:scale-95 border border-white/5"><Plus size={18} /></button>
                    </div>
                    <div className="text-[10px] text-red-400 mt-2 font-bold bg-red-950/50 px-3 py-1 rounded-full border border-red-900/50 flex items-center gap-1">
                        <Heart size={10} className="fill-red-500" /> HP: {calculateMaxHp(configLanes)}
                    </div>
                 </div>

                 {/* Slots Control */}
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-2 uppercase font-bold flex items-center gap-1"><ArrowLeftRight size={14}/> Skewer Length</span>
                    <div className="flex items-center gap-4 bg-black/80 p-1.5 rounded-xl border border-white/10 shadow-inner">
                        <button onClick={() => setConfigSlots(s => Math.max(15, s - 5))} className="w-10 h-10 flex items-center justify-center bg-stone-700 hover:bg-red-600 rounded-lg text-white transition-colors active:scale-95 border border-white/5"><Minus size={18} /></button>
                        <span className="text-3xl font-mono font-black w-12 text-center text-blue-300">{configSlots}</span>
                        <button onClick={() => setConfigSlots(s => Math.min(40, s + 5))} className="w-10 h-10 flex items-center justify-center bg-stone-700 hover:bg-green-600 rounded-lg text-white transition-colors active:scale-95 border border-white/5"><Plus size={18} /></button>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-wrap justify-center gap-6 animate-zoom-in" style={{ animationDelay: '0.5s' }}>
             <button 
               onClick={startGame}
               className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white text-3xl font-black py-5 px-16 rounded-2xl shadow-[0_10px_0_#1e3a8a] active:shadow-[0_0_0] active:translate-y-2.5 transition-all flex items-center gap-4 group border-4 border-blue-400 relative overflow-hidden"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
               <Play fill="currentColor" size={32} className="relative z-10 drop-shadow-md" />
               <span className="relative z-10 drop-shadow-md">PLAY NOW</span>
             </button>
             
             <button 
               onClick={() => setShowGlossary(true)}
               className="bg-stone-700 hover:bg-stone-600 text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-[0_10px_0_#292524] active:shadow-[0_0_0] active:translate-y-2.5 transition-all flex items-center gap-2 border-2 border-stone-500"
             >
               <BookOpen size={24} /> GLOSSARY
             </button>
           </div>
           
           <div className="mt-8 max-w-md mx-auto text-center text-gray-500 text-xs animate-fade-in" style={{ animationDelay: '1s' }}>
             <p>VERSION 2.0.0 ULTIMATE • GRILL HERO STUDIO</p>
           </div>
        </div>
      )}

      {/* Skill Glossary Modal */}
      {showGlossary && (
        <SkillGlossary onClose={() => setShowGlossary(false)} />
      )}

      {/* Revive Offer Screen */}
      {gameState.status === GameStatus.REVIVE_OFFER && (
         <div className="absolute z-50 bg-black/95 inset-0 flex flex-col items-center justify-center animate-zoom-in px-4">
             <HeartPulse size={100} className="text-red-500 mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
             <h2 className="text-6xl font-black text-white mb-2 drop-shadow-md font-display uppercase">Defeated</h2>
             <p className="text-xl text-gray-300 mb-12">The rats have consumed your grill...</p>

             <div className="flex flex-col gap-6 w-full max-w-sm">
                 <button 
                    onClick={handleReviveAd}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-[0_5px_20px_rgba(22,163,74,0.4)] transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-green-400"
                 >
                     <Tv size={28} /> WATCH AD TO REVIVE
                 </button>

                 <button 
                    onClick={handleRevivePay}
                    disabled={gameState.money < REVIVE_COST}
                    className={`text-xl font-bold py-4 px-8 rounded-xl shadow-lg transform transition flex items-center justify-center gap-3 border
                        ${gameState.money >= REVIVE_COST 
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-400 hover:scale-105 active:scale-95' 
                            : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'}
                    `}
                 >
                     <Coins size={24} className={gameState.money >= REVIVE_COST ? "text-yellow-200" : "text-stone-500"} /> 
                     PAY ${REVIVE_COST}
                 </button>

                 <div className="h-px bg-stone-800 my-2 w-full"></div>

                 <button 
                    onClick={handleGiveUp}
                    className="text-stone-500 hover:text-red-400 font-bold py-2 transition-colors flex items-center justify-center gap-2 active:scale-95 text-sm uppercase tracking-widest"
                 >
                     <X size={18} /> Accept Defeat
                 </button>
             </div>
         </div>
      )}

      {/* Game Over Screen */}
      {gameState.status === GameStatus.GAME_OVER && (
        <div className="absolute z-50 bg-black/90 inset-0 flex flex-col items-center justify-center animate-zoom-in px-4">
           <h2 className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-6 font-display drop-shadow-[0_5px_0_#fff]">GAME OVER</h2>
           <div className="bg-stone-800/50 p-8 rounded-2xl border border-white/10 text-center mb-10 backdrop-blur-md">
               <p className="text-stone-400 text-sm uppercase tracking-widest mb-2">Final Score</p>
               <div className="text-6xl font-black text-yellow-400 font-mono mb-6 drop-shadow-md">{gameState.score}</div>
               <div className="flex gap-8 justify-center">
                   <div className="text-center">
                       <div className="text-xs text-stone-500 uppercase">Wave</div>
                       <div className="text-2xl font-bold text-white">{gameState.wave}</div>
                   </div>
                   <div className="text-center">
                       <div className="text-xs text-stone-500 uppercase">Money</div>
                       <div className="text-2xl font-bold text-green-400">${gameState.money}</div>
                   </div>
               </div>
           </div>
           
           <button 
             onClick={startGame}
             className="bg-white hover:bg-gray-200 text-black text-xl font-black py-4 px-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-3 transform hover:scale-105 active:scale-95 transition"
           >
             <RotateCcw size={24} /> TRY AGAIN
           </button>
        </div>
      )}

      {/* Level Complete Screen */}
      {gameState.status === GameStatus.LEVEL_COMPLETE && (
        <div className="absolute z-50 bg-black/90 inset-0 flex flex-col items-center justify-center animate-zoom-in px-4">
           <Trophy size={100} className="mb-6 text-yellow-400 animate-bounce drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
           <h2 className="text-5xl sm:text-7xl font-black text-yellow-400 mb-4 drop-shadow-md font-display uppercase text-center">Victory!</h2>
           <p className="text-xl text-white mb-10 font-bold text-center opacity-80">Wave {gameState.wave} Cleared</p>
           
           <div className="bg-gradient-to-b from-green-900/40 to-green-900/10 p-8 rounded-2xl mb-10 text-center backdrop-blur-sm border border-green-500/30 w-full max-w-sm shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
             <div className="text-sm text-green-300 uppercase tracking-widest font-bold mb-2">Completion Bonus</div>
             <div className="text-5xl font-black text-green-400 mb-2 drop-shadow-sm">+${500 + (gameState.wave * 100)}</div>
           </div>

           <button 
             onClick={handleNextLevel}
             className="bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 text-white text-2xl font-black py-5 px-16 rounded-full shadow-[0_10px_30px_rgba(220,38,38,0.5)] transform transition hover:scale-105 active:scale-95 flex items-center gap-4 group border-4 border-orange-400"
           >
             NEXT WAVE <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      )}

      {/* Main Game Area */}
      <div className={`w-full max-w-5xl aspect-video transition-all duration-500 
          ${gameState.status === GameStatus.MENU || gameState.status === GameStatus.LOADING ? 'opacity-20 blur-xl scale-90' : 'opacity-100 scale-100'}
          ${gameState.status === GameStatus.REVIVE_OFFER || gameState.status === GameStatus.PAUSED ? 'opacity-50 blur-sm' : ''}
      `}>
        <GameCanvas 
          gameState={gameState}
          setGameState={setGameState}
          slots={slots}
          setSlots={setSlots}
          enemies={enemies}
          setEnemies={setEnemies}
          onSlotClick={handleSlotClick}
          selectedSlotId={selectedSlotId}
        />
      </div>

      {/* Upgrade Menu Overlay */}
      {selectedSlotId && gameState.status === GameStatus.PLAYING && (
        <UpgradeMenu 
          selectedSlot={selectedSlot}
          gameState={gameState}
          onBuy={handleBuy}
          onUpgrade={handleUpgrade}
          onSell={handleSell}
          onClose={() => setSelectedSlotId(null)}
          onSelectSkill={handleUnlockSkill}
          onResetSkills={handleResetSkills}
        />
      )}
    </div>
  );
};

export default App;
