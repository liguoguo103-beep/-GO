
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
  const [configLanes, setConfigLanes] = useState(GAME_Config.DEFAULT_LANES);
  const [configSlots, setConfigSlots] = useState(GAME_Config.DEFAULT_SLOTS_PER_LANE);

  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.LOADING,
    money: GAME_Config.STARTING_MONEY,
    score: 0,
    wave: 1,
    hp: GAME_Config.PLAYER_MAX_HP,
    maxHp: GAME_Config.PLAYER_MAX_HP,
    heat: 0,
    isOverheated: false,
    overheatEndTime: 0,
    mapConfig: { lanes: GAME_Config.DEFAULT_LANES, slotsPerLane: GAME_Config.DEFAULT_SLOTS_PER_LANE },
    combo: 0
  });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  useEffect(() => {
    if (gameState.status === GameStatus.MENU) {
      audioService.play('MENU');
    } else if (gameState.status === GameStatus.PLAYING) {
      audioService.play('GAME');
    } else if (gameState.status === GameStatus.GAME_OVER) {
      audioService.play('GAMEOVER');
    } else if (gameState.status === GameStatus.LEVEL_COMPLETE) {
      audioService.play('MENU');
    } else if (gameState.status === GameStatus.PAUSED) {
      audioService.stop();
    }
  }, [gameState.status]);

  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const performTransition = (callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 700);
    }, 500);
  };

  const handleLoadingComplete = () => performTransition(() => setGameState(prev => ({ ...prev, status: GameStatus.MENU })));

  const startGame = () => {
    audioService.init();
    performTransition(() => {
        const lanes = configLanes;
        const slotsPerLane = configSlots;
        const newSlots: Slot[] = [];
        const middleLaneIndex = Math.floor(lanes / 2);

        for (let lane = 0; lane < lanes; lane++) {
            for (let i = 0; i < slotsPerLane; i++) {
                let initialIngredient: Ingredient | null = null;
                if (lane === middleLaneIndex && i === 0) {
                    const stats = INGREDIENT_STATS[IngredientType.SEASONING_CAPTAIN];
                    initialIngredient = {
                        id: `captain-${Math.random()}`, type: IngredientType.SEASONING_CAPTAIN, level: 1, lastAttackTime: 0, lastAutoLevelTime: performance.now(),
                        hp: stats.hp, maxHp: stats.maxHp, selectedSkills: [], availableSkillPoints: 0
                    };
                }
                newSlots.push({ id: `l${lane}-s${i}`, laneIndex: lane, slotIndex: i, ingredient: initialIngredient });
            }
        }
        setSlots(newSlots);
        setGameState({
          status: GameStatus.PLAYING, money: GAME_Config.STARTING_MONEY, score: 0, wave: 1, hp: 20, maxHp: 20, heat: 0, isOverheated: false, overheatEndTime: 0,
          mapConfig: { lanes, slotsPerLane }, combo: 0
        });
        setEnemies([]);
        setSelectedSlotId(null);
    });
  };

  const handleNextLevel = () => {
    performTransition(() => {
        setGameState(prev => ({ ...prev, status: GameStatus.PLAYING, wave: prev.wave + 1, money: prev.money + 500 + (prev.wave * 100), hp: prev.maxHp, heat: 0, combo: 0 }));
        setEnemies([]);
        setSelectedSlotId(null);
    });
  };

  const handlePause = () => setGameState(prev => ({ ...prev, status: GameStatus.PAUSED }));
  const handleResume = () => setGameState(prev => ({ ...prev, status: GameStatus.PLAYING }));
  const handleQuitGame = () => performTransition(() => setGameState(prev => ({ ...prev, status: GameStatus.MENU })));
  const handleSlotClick = (slotId: string) => { if (gameState.status === GameStatus.PLAYING) setSelectedSlotId(slotId); };
  
  const handleBuy = (type: IngredientType) => {
    const cost = INGREDIENT_STATS[type].cost;
    if (gameState.money >= cost && selectedSlotId) {
      setGameState(prev => ({ ...prev, money: prev.money - cost }));
      setSlots(prev => prev.map(s => s.id === selectedSlotId ? { ...s, ingredient: { id: Math.random().toString(), type, level: 1, lastAttackTime: 0, lastAutoLevelTime: performance.now(), hp: INGREDIENT_STATS[type].hp, maxHp: INGREDIENT_STATS[type].maxHp, selectedSkills: [], availableSkillPoints: 0 } } : s));
      setSelectedSlotId(null);
    }
  };

  const handleUpgrade = () => {
    const slot = slots.find(s => s.id === selectedSlotId);
    if (slot?.ingredient) {
      const cost = Math.floor(INGREDIENT_STATS[slot.ingredient.type].cost * Math.pow(UPGRADE_MULTIPLIER, slot.ingredient.level));
      if (gameState.money >= cost) {
        setGameState(prev => ({ ...prev, money: prev.money - cost }));
        setSlots(prev => prev.map(s => s.id === selectedSlotId && s.ingredient ? { ...s, ingredient: { ...s.ingredient, level: s.ingredient.level + 1, hp: Math.floor(s.ingredient.hp * STAT_MULTIPLIER), maxHp: Math.floor(s.ingredient.maxHp * STAT_MULTIPLIER), availableSkillPoints: s.ingredient.availableSkillPoints + ( (s.ingredient.level + 1) % 5 === 0 ? 1 : 0 ) } } : s));
      }
    }
  };

  const handleSell = () => {
    const slot = slots.find(s => s.id === selectedSlotId);
    if (slot?.ingredient && slot.ingredient.type !== IngredientType.SEASONING_CAPTAIN) {
      setGameState(prev => ({ ...prev, money: prev.money + Math.floor(INGREDIENT_STATS[slot.ingredient!.type].cost * 0.5) }));
      setSlots(prev => prev.map(s => s.id === selectedSlotId ? { ...s, ingredient: null } : s));
      setSelectedSlotId(null);
    }
  };

  const handleUnlockSkill = (slotId: string, skillId: string) => {
    setSlots(prev => prev.map(s => {
      if (s.id === slotId && s.ingredient) {
        const skill = getSkillsForType(s.ingredient.type).find(sk => sk.id === skillId);
        if (skill && s.ingredient.availableSkillPoints >= skill.cost && s.ingredient.level >= skill.unlockLevel) {
          return { ...s, ingredient: { ...s.ingredient, availableSkillPoints: s.ingredient.availableSkillPoints - skill.cost, selectedSkills: [...s.ingredient.selectedSkills, skillId] } };
        }
      }
      return s;
    }));
  };

  const woodBtnStyle = "bg-[#5d4037] border-2 border-[#3e2723] hover:bg-[#6d4c41] text-[#ffecb3] shadow-[0_4px_0_#271c19] active:shadow-none active:translate-y-1 transition-all rounded-lg font-black px-4 py-2 flex items-center justify-center gap-2";
  const fireBtnStyle = "bg-gradient-to-b from-orange-500 to-red-600 border-2 border-red-800 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_6px_0_#7f1d1d] active:shadow-none active:translate-y-1 transition-all rounded-2xl font-black uppercase flex items-center justify-center gap-3 px-8 py-4";

  return (
    <div className="w-screen h-screen bg-[#0f0505] flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {isTransitioning && (
        <div className="absolute inset-0 z-[500] pointer-events-none flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="relative animate-smoke text-orange-500"><Flame size={150} fill="currentColor" /></div>
        </div>
      )}

      {gameState.status === GameStatus.LOADING && <LoadingScreen onComplete={handleLoadingComplete} />}

      {gameState.status !== GameStatus.LOADING && gameState.status !== GameStatus.MENU && (
        <div className="absolute top-6 right-6 z-[300] flex gap-3">
            {gameState.status === GameStatus.PLAYING && (
              <button onClick={handlePause} className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all text-white border border-white/20"><Pause size={24} /></button>
            )}
            <button onClick={toggleMute} className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all text-white border border-white/20">{isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}</button>
        </div>
      )}

      {gameState.status === GameStatus.PAUSED && (
        <div className="absolute z-[400] bg-black/90 inset-0 flex flex-col items-center justify-center animate-fade-in backdrop-blur-md">
           <h2 className="text-8xl font-display text-white mb-12 tracking-widest">PAUSED</h2>
           <div className="flex flex-col gap-8 w-80">
             <button onClick={handleResume} className={fireBtnStyle + " text-2xl font-display"}><Play fill="currentColor" /> RESUME</button>
             <button onClick={handleQuitGame} className={woodBtnStyle + " text-xl py-4 font-display"}><Home size={28} /> MAIN MENU</button>
           </div>
        </div>
      )}

      {gameState.status === GameStatus.MENU && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
           <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_center,_#450a0a_0%,_#000_70%)] animate-pulse" />
           <div className="animate-title-drop flex flex-col items-center mb-10">
             <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-700 tracking-tighter font-display text-center drop-shadow-[0_10px_0_#000]" style={{ WebkitTextStroke: '2px #fff' }}>烤串英雄</h1>
             <div className="flex items-center gap-6 mt-4 italic font-display text-3xl text-blue-400 drop-shadow-lg tracking-widest uppercase">Ultimate 2.0</div>
           </div>
           
           <div className="bg-black/60 backdrop-blur-xl p-10 rounded-[3rem] border-4 border-[#3e2723] animate-zoom-in w-full max-w-2xl mb-12 shadow-2xl">
              <div className="grid grid-cols-2 gap-12">
                 <div className="flex flex-col items-center gap-4">
                    <span className="text-sm font-display text-gray-400 uppercase tracking-widest">Lanes</span>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setConfigLanes(l => Math.max(3, l - 1))} className={woodBtnStyle + " w-12 h-12 p-0"}><Minus /></button>
                        <span className="text-6xl font-display text-yellow-400">{configLanes}</span>
                        <button onClick={() => setConfigLanes(l => Math.min(8, l + 1))} className={woodBtnStyle + " w-12 h-12 p-0"}><Plus /></button>
                    </div>
                 </div>
                 <div className="flex flex-col items-center gap-4">
                    <span className="text-sm font-display text-gray-400 uppercase tracking-widest">Length</span>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setConfigSlots(s => Math.max(10, s - 5))} className={woodBtnStyle + " w-12 h-12 p-0"}><Minus /></button>
                        <span className="text-6xl font-display text-blue-400">{configSlots}</span>
                        <button onClick={() => setConfigSlots(s => Math.min(30, s + 5))} className={woodBtnStyle + " w-12 h-12 p-0"}><Plus /></button>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-wrap justify-center gap-8 animate-zoom-in">
             <button onClick={startGame} className={fireBtnStyle + " text-4xl py-6 px-24 font-display hover:scale-105 active:scale-95 transition-all"}>
               <Play fill="currentColor" size={44} /> START GRILLING
             </button>
             <button onClick={() => setShowGlossary(true)} className={woodBtnStyle + " text-2xl py-6 px-12 font-display"}><BookOpen size={32} /> LIBRARY</button>
           </div>
        </div>
      )}

      {showGlossary && <SkillGlossary onClose={() => setShowGlossary(false)} />}

      {gameState.status === GameStatus.LEVEL_COMPLETE && (
        <div className="absolute z-[450] bg-black/95 inset-0 flex flex-col items-center justify-center animate-zoom-in">
           <Trophy size={180} className="mb-8 text-yellow-400 animate-bounce drop-shadow-[0_0_50px_#facc15]" />
           <h2 className="text-8xl font-display text-yellow-100 mb-6 drop-shadow-[0_5px_0_#713f12]">VICTORY!</h2>
           <div className="bg-metal-panel p-8 rounded-2xl mb-12 text-center w-full max-w-md border-4 border-gray-600">
             <div className="text-lg text-gray-400 uppercase font-display mb-2">Stage Rewards</div>
             <div className="text-7xl font-display text-green-400">+${500 + (gameState.wave * 100)}</div>
           </div>
           <button onClick={handleNextLevel} className={fireBtnStyle + " text-3xl py-6 px-20 font-display"}>NEXT WAVE <ArrowRight size={36} /></button>
        </div>
      )}

      <div className={`w-full max-w-7xl aspect-video transition-all duration-1000 
          ${gameState.status === GameStatus.MENU || gameState.status === GameStatus.LOADING ? 'opacity-20 blur-3xl scale-90' : 'opacity-100 scale-100'}
          ${gameState.status === GameStatus.PAUSED ? 'opacity-40 blur-lg' : ''}
      `}>
        <GameCanvas gameState={gameState} setGameState={setGameState} slots={slots} setSlots={setSlots} enemies={enemies} setEnemies={setEnemies} onSlotClick={handleSlotClick} selectedSlotId={selectedSlotId} />
      </div>

      {selectedSlotId && gameState.status === GameStatus.PLAYING && (
        <UpgradeMenu selectedSlot={slots.find(s => s.id === selectedSlotId)} gameState={gameState} onBuy={handleBuy} onUpgrade={handleUpgrade} onSell={handleSell} onClose={() => setSelectedSlotId(null)} onSelectSkill={handleUnlockSkill} onResetSkills={() => {}} />
      )}
    </div>
  );
};

export default App;
