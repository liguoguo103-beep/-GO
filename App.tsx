
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
    }
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
  
  // Dynamic HP Calculation
  const calculateMaxHp = (lanes: number) => {
    // Linear interpolation: 3 lanes -> 10 HP, 10 lanes -> 50 HP
    // Formula: minHp + ( (current - minLanes) / (maxLanes - minLanes) ) * (maxHp - minHp)
    // 10 + ((lanes - 3) / 7) * 40
    return Math.floor(10 + ((lanes - 3) / 7) * 40);
  };

  // Helper to determine lane buffs for UI display
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

  // --- Cinematic Transition Helper ---
  // Wraps state changes in a smoke animation
  const performTransition = (callback: () => void) => {
    setIsTransitioning(true);
    // Wait for smoke to cover screen (approx 40% of 1.2s animation = 480ms)
    setTimeout(() => {
      callback();
      // Wait for smoke to clear
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
        
        // Calculate Dynamic Max HP
        const calculatedMaxHp = calculateMaxHp(lanes);

        // Generate Slots dynamically based on settings
        const newSlots: Slot[] = [];
        const middleLaneIndex = Math.floor(lanes / 2); // Identify middle lane

        for (let lane = 0; lane < lanes; lane++) {
            for (let i = 0; i < slotsPerLane; i++) {
                let initialIngredient: Ingredient | null = null;

                // Spawn Seasoning Captain in the middle lane, first slot
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

                newSlots.push({
                    id: `l${lane}-s${i}`,
                    laneIndex: lane,
                    slotIndex: i,
                    ingredient: initialIngredient
                });
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
          mapConfig: {
              lanes,
              slotsPerLane
          }
        });
        setEnemies([]);
        setSelectedSlotId(null);
        setShowTutorialHint(true); // Show hint on first start
        setTimeout(() => setShowTutorialHint(false), 8000); // Hide after 8s
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
          hp: prev.maxHp, // Heal player
          heat: Math.max(0, prev.heat - 30) // Decay heat slightly between levels
        }));
        
        // Reset slots but KEEP the Seasoning Captain if it's alive
        const lanes = gameState.mapConfig.lanes;
        const middleLaneIndex = Math.floor(lanes / 2);
        
        setSlots(prev => prev.map(s => {
            if (s.laneIndex === middleLaneIndex && s.slotIndex === 0) {
                 // Respawn Captain
                 const stats = INGREDIENT_STATS[IngredientType.SEASONING_CAPTAIN];
                 return {
                     ...s,
                     ingredient: {
                        id: `captain-${Math.random()}`, 
                        type: IngredientType.SEASONING_CAPTAIN,
                        level: 1, 
                        lastAttackTime: 0,
                        lastAutoLevelTime: performance.now(),
                        hp: stats.hp,
                        maxHp: stats.maxHp,
                        selectedSkills: [],
                        availableSkillPoints: 0
                     }
                 };
            }
            return { ...s, ingredient: null };
        }));

        setEnemies([]);
        setSelectedSlotId(null);
    });
  };

  const REVIVE_COST = 500;

  const handleRevivePay = () => {
    if (gameState.money >= REVIVE_COST) {
        performTransition(() => {
            setGameState(prev => ({
                ...prev,
                status: GameStatus.PLAYING,
                hp: prev.maxHp,
                money: prev.money - REVIVE_COST
            }));
            setEnemies(prev => prev.map(e => ({...e, x: Math.max(e.x + 40, 100)})));
            audioService.play('GAME');
        });
    }
  };

  const handleReviveAd = () => {
    const confirm = window.confirm("觀看一段精彩的廣告... (模擬)");
    if(confirm) {
        performTransition(() => {
            setGameState(prev => ({
                ...prev,
                status: GameStatus.PLAYING,
                hp: prev.maxHp
            }));
            setEnemies(prev => prev.map(e => ({...e, x: Math.max(e.x + 40, 100)})));
            audioService.play('GAME');
        });
    }
  };

  const handleGiveUp = () => {
      performTransition(() => {
          setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
          audioService.play('GAMEOVER');
      });
  };

  const handlePause = () => {
    if (isTransitioning) return;
    setGameState(prev => ({ ...prev, status: GameStatus.PAUSED }));
  };

  const handleResume = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.PLAYING }));
  };

  const handleQuitGame = () => {
    performTransition(() => {
        setGameState(prev => ({ ...prev, status: GameStatus.MENU }));
        setSlots([]); // Clear slots on quit
        setEnemies([]);
        setSelectedSlotId(null);
    });
  };

  const handleSlotClick = (slotId: string) => {
    if (gameState.status !== GameStatus.PLAYING) return;
    if (showTutorialHint) setShowTutorialHint(false); // Dismiss hint on interaction
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null); 
    } else {
      setSelectedSlotId(slotId);
    }
  };

  const handleBuy = (type: IngredientType) => {
    if (!selectedSlotId) return;
    
    const slot = slots.find(s => s.id === selectedSlotId);
    if (slot?.ingredient) {
        return;
    }

    const cost = INGREDIENT_STATS[type].cost;
    
    if (gameState.money >= cost) {
      setGameState(prev => ({ ...prev, money: prev.money - cost }));
      setSlots(prev => prev.map(slot => {
        if (slot.id === selectedSlotId) {
          const stats = INGREDIENT_STATS[type];
          const newIngredient: Ingredient = {
            id: Math.random().toString(),
            type,
            level: 1,
            lastAttackTime: 0,
            lastAutoLevelTime: performance.now(),
            hp: stats.hp,
            maxHp: stats.maxHp,
            selectedSkills: [],
            availableSkillPoints: 0
          };
          return { ...slot, ingredient: newIngredient };
        }
        return slot;
      }));
    }
  };

  const handleUpgrade = () => {
    if (!selectedSlotId) return;
    const slot = slots.find(s => s.id === selectedSlotId);
    if (!slot || !slot.ingredient) return;

    const stats = INGREDIENT_STATS[slot.ingredient.type];
    const upgradeCost = Math.floor(stats.cost * Math.pow(UPGRADE_MULTIPLIER, slot.ingredient.level));

    if (gameState.money >= upgradeCost) {
      setGameState(prev => ({ ...prev, money: prev.money - upgradeCost }));
      setSlots(prev => prev.map(s => {
        if (s.id === selectedSlotId && s.ingredient) {
           const newLevel = s.ingredient.level + 1;
           let sp = s.ingredient.availableSkillPoints;
           if (newLevel % GAME_Config.SKILL_POINT_INTERVAL === 0) {
              sp += 1;
           }

           return {
             ...s,
             ingredient: {
               ...s.ingredient,
               level: newLevel,
               maxHp: Math.floor(s.ingredient.maxHp * STAT_MULTIPLIER),
               hp: Math.floor(s.ingredient.hp * STAT_MULTIPLIER),
               availableSkillPoints: sp
             }
           };
        }
        return s;
      }));
    }
  };

  const handleSell = () => {
    if (!selectedSlotId) return;
    const slot = slots.find(s => s.id === selectedSlotId);
    if (!slot || !slot.ingredient) return;

    // Prevent selling Captain
    if (slot.ingredient.type === IngredientType.SEASONING_CAPTAIN) {
        return;
    }

    const refund = Math.floor(INGREDIENT_STATS[slot.ingredient.type].cost * 0.5); 
    setGameState(prev => ({ ...prev, money: prev.money + refund }));
    setSlots(prev => prev.map(s => s.id === selectedSlotId ? { ...s, ingredient: null } : s));
    setSelectedSlotId(null);
  };

  const handleUnlockSkill = (slotId: string, skillId: string) => {
    setSlots(prev => prev.map(s => {
      if (s.id === slotId && s.ingredient) {
         const currentSkills = s.ingredient.selectedSkills;
         const availableSkills = getSkillsForType(s.ingredient.type);
         const targetSkill = availableSkills.find(sk => sk.id === skillId);
         
         if (!targetSkill) return s;
         if (currentSkills.includes(skillId)) return s;
         if (s.ingredient.availableSkillPoints < targetSkill.cost) return s;
         if (s.ingredient.level < targetSkill.unlockLevel) return s;

         return {
           ...s,
           ingredient: {
             ...s.ingredient!,
             availableSkillPoints: s.ingredient.availableSkillPoints - targetSkill.cost,
             selectedSkills: [...currentSkills, skillId]
           }
         };
      }
      return s;
    }));
  };

  const handleResetSkills = (slotId: string) => {
    if (!slotId) return;
    const slot = slots.find(s => s.id === selectedSlotId);
    if (!slot || !slot.ingredient) return;

    if (gameState.money >= GAME_Config.SKILL_RESET_COST) {
       setGameState(prev => ({ ...prev, money: prev.money - GAME_Config.SKILL_RESET_COST }));
       setSlots(prev => prev.map(s => {
         if (s.id === slotId && s.ingredient) {
            const skills = getSkillsForType(s.ingredient.type);
            const spentPoints = s.ingredient.selectedSkills.reduce((acc, skillId) => {
               const skill = skills.find(sk => sk.id === skillId);
               return acc + (skill ? skill.cost : 0);
            }, 0);

            return {
              ...s,
              ingredient: {
                ...s.ingredient!,
                selectedSkills: [],
                availableSkillPoints: s.ingredient.availableSkillPoints + spentPoints
              }
            };
         }
         return s;
       }));
    }
  };

  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  // --- Dynamic Instructions based on Config ---
  const victoryConditionText = `勝利條件：集滿 ${Math.min(configLanes, 5)} 串完整烤肉即可過關！`;
  const fastLanes = getLaneIndices(configLanes, 'FAST');
  const pierceLanes = getLaneIndices(configLanes, 'PIERCE');
  const strongLanes = getLaneIndices(configLanes, 'STRONG');

  return (
    <div className="w-screen h-screen bg-stone-900 flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {/* Cinematic Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden">
           {/* Dark Coal Smoke Cloud */}
           <div className="w-[150vw] h-[150vh] bg-gradient-to-r from-gray-900 via-gray-800 to-black animate-smoke absolute transform -rotate-12 opacity-95"></div>
           
           {/* Fiery Edge */}
           <div className="w-[150vw] h-[150vh] absolute transform -rotate-12 animate-smoke" style={{ animationDelay: '0.1s', opacity: 0.5 }}>
              <div className="w-40 h-full bg-gradient-to-r from-transparent via-orange-600 to-transparent blur-3xl absolute left-0 top-0 bottom-0"></div>
           </div>
           
           {/* Icon or Logo in smoke (Optional) */}
           <div className="relative z-10 animate-pulse text-orange-500 opacity-0 animate-smoke" style={{ animationDelay: '0.2s' }}>
              <Flame size={120} />
           </div>
        </div>
      )}

      {/* Loading Screen */}
      {gameState.status === GameStatus.LOADING && (
         <LoadingScreen onComplete={handleLoadingComplete} />
      )}

      {/* --- TOP HUD BAR (Revamped Wooden Sign Style) --- */}
      {gameState.status === GameStatus.PLAYING && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-title-drop pointer-events-none w-full max-w-lg px-4 pt-2">
           {/* Chains */}
           <div className="flex justify-between w-48 -mb-2 z-0 opacity-50">
              <div className="w-0.5 h-8 bg-neutral-500"></div>
              <div className="w-0.5 h-8 bg-neutral-500"></div>
           </div>
           
           {/* Wooden Sign Board */}
           <div className="relative bg-[#5d2e0e] border-4 border-[#3f1f0a] rounded-lg shadow-xl px-4 py-2 flex items-center justify-between gap-4 z-10 transform rotate-1 w-full"
                style={{
                    backgroundImage: `repeating-linear-gradient(90deg, #5d2e0e 0, #5d2e0e 10px, #4a250b 12px, #5d2e0e 14px)`
                }}
           >
               {/* Screws */}
               <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#9ca3af] shadow-inner border border-[#4b5563]"></div>
               <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#9ca3af] shadow-inner border border-[#4b5563]"></div>
               <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-[#9ca3af] shadow-inner border border-[#4b5563]"></div>
               <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#9ca3af] shadow-inner border border-[#4b5563]"></div>

               {/* Money */}
               <div className="flex items-center gap-2">
                   <div className="bg-black/40 p-1 rounded-full border border-yellow-600/50">
                        <Coins size={16} className="text-yellow-400 drop-shadow-md" />
                   </div>
                   <span className="text-lg font-black text-yellow-100 font-mono tracking-wider drop-shadow-md" style={{textShadow: '1px 1px 0 #000'}}>${gameState.money}</span>
               </div>

               {/* Wave */}
               <div className="flex items-center gap-2">
                   <div className="bg-black/40 p-1 rounded-full border border-red-600/50">
                        <Skull size={16} className="text-red-300" />
                   </div>
                   <span className="text-white font-bold text-xs uppercase opacity-80 hidden sm:inline">Wave</span>
                   <span className="text-lg font-black text-red-100 font-mono drop-shadow-md" style={{textShadow: '1px 1px 0 #000'}}>{gameState.wave}</span>
               </div>

               {/* HP */}
               <div className="flex items-center gap-2">
                   <div className="relative">
                        <Heart size={18} className="text-green-600 fill-green-600 drop-shadow-md" />
                        <div className="absolute inset-0 animate-ping opacity-50">
                            <Heart size={18} className="text-green-400 fill-green-400" />
                        </div>
                   </div>
                   <div className="flex flex-col w-20">
                       <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                          <div 
                             className="h-full bg-gradient-to-r from-green-700 to-green-500 transition-all duration-300"
                             style={{ width: `${(gameState.hp / gameState.maxHp) * 100}%` }}
                          ></div>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* Top Right Controls (Pause & Audio) */}
      {gameState.status !== GameStatus.LOADING && gameState.status !== GameStatus.MENU && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            {gameState.status === GameStatus.PLAYING && (
                <button 
                onClick={handlePause}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors border border-white/20 active:scale-95"
                title="暫停"
                >
                    <Pause size={24} />
                </button>
            )}
            <button 
            onClick={toggleMute}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors border border-white/20 active:scale-95"
            title={isMuted ? "開啟聲音" : "靜音"}
            >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
      )}

      {/* Tutorial Hint (First Play) */}
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
           <h2 className="text-5xl font-black text-white mb-8 tracking-widest border-b-4 border-yellow-500 pb-2">暫停</h2>
           
           <div className="flex flex-col gap-4 w-64">
             <button 
               onClick={handleResume}
               className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-3 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 transform hover:scale-105 transition active:scale-95"
             >
               <Play size={24} fill="currentColor" /> 繼續遊戲
             </button>

             <button 
               onClick={handleQuitGame}
               className="bg-gray-700 hover:bg-red-600 text-gray-200 hover:text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 transform hover:scale-105 transition active:scale-95"
             >
               <Home size={24} /> 回主選單
             </button>
           </div>
        </div>
      )}

      {/* Game Header/Title for Menu */}
      {gameState.status === GameStatus.MENU && (
        <div className="absolute top-10 sm:top-20 text-center z-10 w-full flex flex-col items-center px-4">
           <div className="animate-title-drop relative">
             <h1 className="text-5xl sm:text-6xl font-black text-orange-500 tracking-tighter drop-shadow-lg stroke-white">
               烤串英雄
             </h1>
             <p className="text-lg sm:text-xl text-yellow-200 mt-2 font-bold">Grill Hero: Rat Defense</p>
           </div>
           
           {/* Map Settings Panel */}
           <div className="mt-6 sm:mt-8 bg-black/40 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/10 animate-zoom-in max-w-full" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-center text-white font-bold mb-4 flex items-center justify-center gap-2">
                 <Grid3X3 size={20} className="text-yellow-400" /> 地圖設定
              </h3>
              
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                 {/* Lanes Control */}
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-2 uppercase font-bold">烤架寬度 (列數)</span>
                    <div className="flex items-center gap-3 bg-black/50 p-2 rounded-lg border border-white/5">
                        <button 
                           onClick={() => setConfigLanes(l => Math.max(3, l - 1))}
                           className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-red-600 rounded text-white transition-colors active:scale-90"
                        >
                           <Minus size={16} />
                        </button>
                        <span className="text-xl font-mono font-bold w-6 text-center text-yellow-300">{configLanes}</span>
                        <button 
                           onClick={() => setConfigLanes(l => Math.min(10, l + 1))}
                           className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-green-600 rounded text-white transition-colors active:scale-90"
                        >
                           <Plus size={16} />
                        </button>
                    </div>
                    {/* HP Preview */}
                    <div className="text-[10px] text-red-400 mt-2 font-bold bg-red-900/30 px-2 py-0.5 rounded border border-red-900/50">
                        ❤️ 生命值: {calculateMaxHp(configLanes)}
                    </div>
                 </div>

                 {/* Slots Control */}
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-2 uppercase font-bold">烤串長度 (格數)</span>
                    <div className="flex items-center gap-3 bg-black/50 p-2 rounded-lg border border-white/5">
                        <button 
                           onClick={() => setConfigSlots(s => Math.max(15, s - 5))}
                           className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-red-600 rounded text-white transition-colors active:scale-90"
                        >
                           <Minus size={16} />
                        </button>
                        <span className="text-xl font-mono font-bold w-8 text-center text-blue-300">{configSlots}</span>
                        <button 
                           onClick={() => setConfigSlots(s => Math.min(40, s + 5))}
                           className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-green-600 rounded text-white transition-colors active:scale-90"
                        >
                           <Plus size={16} />
                        </button>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 flex flex-wrap justify-center gap-4 animate-zoom-in" style={{ animationDelay: '0.5s' }}>
             <button 
               onClick={startGame}
               className="bg-red-600 hover:bg-red-500 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95 flex items-center gap-3 group"
             >
               <div className="relative">
                 <Play fill="currentColor" className="relative z-10" />
                 <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
               </div>
               開始燒烤
             </button>
             
             <button 
               onClick={() => setShowGlossary(true)}
               className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-4 px-6 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
               title="技能圖鑑"
             >
               <BookOpen size={24} /> 技能圖鑑
             </button>
           </div>
           
           <div className="mt-8 max-w-md mx-auto bg-black/50 p-6 rounded-xl text-left text-gray-300 animate-zoom-in text-sm sm:text-base" style={{ animationDelay: '0.7s' }}>
             <h3 className="font-bold text-white mb-2">如何遊玩:</h3>
             <ul className="list-disc pl-5 space-y-1">
               <li>點擊烤串上的空位放置食材。</li>
               <li>食材每 30 秒自動升級並繁殖！</li>
               <li className="text-yellow-400 font-bold">{victoryConditionText}</li>
               
               {fastLanes.length > 0 && (
                   <li className="text-yellow-400">⚡ 急速攻擊 (第 {fastLanes.join(', ')} 列)</li>
               )}
               {pierceLanes.length > 0 && (
                   <li className="text-green-400">🏹 穿透射擊 (第 {pierceLanes.join(', ')} 列)</li>
               )}
               {strongLanes.length > 0 && (
                   <li className="text-red-400">💪 強力傷害 (第 {strongLanes.join(', ')} 列)</li>
               )}
             </ul>
           </div>
        </div>
      )}

      {/* Skill Glossary Modal */}
      {showGlossary && (
        <SkillGlossary onClose={() => setShowGlossary(false)} />
      )}

      {/* Revive Offer Screen */}
      {gameState.status === GameStatus.REVIVE_OFFER && (
         <div className="absolute z-50 bg-black/90 inset-0 flex flex-col items-center justify-center animate-zoom-in px-4">
             <HeartPulse size={80} className="text-red-500 mb-4 animate-pulse" />
             <h2 className="text-4xl sm:text-5xl font-black text-white mb-2 drop-shadow-md">你倒下了！</h2>
             <p className="text-lg sm:text-xl text-gray-300 mb-8">要復活並繼續戰鬥嗎？</p>

             <div className="flex flex-col gap-4 w-full max-w-md">
                 <button 
                    onClick={handleReviveAd}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-lg sm:text-xl font-bold py-4 px-8 rounded-xl shadow-xl transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                 >
                     <Tv size={24} /> 觀看廣告復活 (模擬)
                 </button>

                 <button 
                    onClick={handleRevivePay}
                    disabled={gameState.money < REVIVE_COST}
                    className={`text-lg sm:text-xl font-bold py-4 px-8 rounded-xl shadow-xl transform transition flex items-center justify-center gap-3
                        ${gameState.money >= REVIVE_COST 
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white hover:scale-105 active:scale-95' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                    `}
                 >
                     <Coins size={24} className="text-yellow-300" /> 
                     支付 ${REVIVE_COST} 復活
                     {gameState.money < REVIVE_COST && <span className="text-sm ml-2 text-red-400">(餘額不足)</span>}
                 </button>

                 <div className="h-px bg-gray-700 my-2"></div>

                 <button 
                    onClick={handleGiveUp}
                    className="text-gray-400 hover:text-white font-bold py-2 transition-colors flex items-center justify-center gap-2 active:scale-95"
                 >
                     <X size={20} /> 放棄治療 (結束遊戲)
                 </button>
             </div>
         </div>
      )}

      {/* Game Over Screen */}
      {gameState.status === GameStatus.GAME_OVER && (
        <div className="absolute z-50 bg-black/80 inset-0 flex flex-col items-center justify-center animate-zoom-in px-4">
           <h2 className="text-5xl sm:text-6xl font-bold text-red-500 mb-4">GAME OVER</h2>
           <p className="text-xl sm:text-2xl text-white mb-8 text-center">你的烤串被老鼠吃光了！</p>
           <div className="text-lg sm:text-xl text-yellow-400 mb-8">
             最終分數: {gameState.score} | 到達波數: {gameState.wave}
           </div>
           <button 
             onClick={startGame}
             className="bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition"
           >
             <RotateCcw size={20} /> 重新開始
           </button>
        </div>
      )}

      {/* Level Complete Screen */}
      {gameState.status === GameStatus.LEVEL_COMPLETE && (
        <div className="absolute z-50 bg-black/80 inset-0 flex flex-col items-center justify-center animate-zoom-in px-4">
           <Trophy size={80} className="mb-6 text-yellow-400 animate-bounce" />
           <h2 className="text-4xl sm:text-5xl font-black text-yellow-400 mb-2 drop-shadow-md">戰場制霸！</h2>
           <p className="text-lg sm:text-xl text-white mb-8 font-bold text-center">你成功完成了 5 串絕世美味！</p>
           
           <div className="bg-white/10 p-6 rounded-xl mb-8 text-center backdrop-blur-sm border border-white/20 w-full max-w-sm">
             <div className="text-lg text-gray-300">下一關獎勵金</div>
             <div className="text-4xl font-bold text-green-400 mb-2">+${500 + (gameState.wave * 100)}</div>
             <div className="text-sm text-red-300">注意：下一波老鼠將更加兇猛，戰場將重置！</div>
           </div>

           <button 
             onClick={handleNextLevel}
             className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95 flex items-center gap-3"
           >
             進入第 {gameState.wave + 1} 波 <ArrowRight size={24} />
           </button>
        </div>
      )}

      {/* Main Game Area */}
      <div className={`w-full max-w-5xl aspect-video transition-all duration-500 
          ${gameState.status === GameStatus.MENU || gameState.status === GameStatus.LOADING ? 'opacity-20 blur-sm scale-95' : 'opacity-100 scale-100'}
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
