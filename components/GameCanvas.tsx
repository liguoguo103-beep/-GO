
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GameState, Slot, Enemy, Projectile, IngredientType, GameStatus, EnemyType, Ingredient } from '../types';
import { GAME_Config, INGREDIENT_STATS, ENEMY_STATS, STAT_MULTIPLIER } from '../constants';
import CuteIngredient from './CuteIngredient';
import { EnemyRenderer, ProjectileSVG } from './GameAssets';
import { Heart, Coins, Trophy, Zap, Crosshair, BicepsFlexed, ArrowUp, Flame, UtensilsCrossed, Leaf, Skull, Radiation, Utensils, Star, Trash2, Sword, ShieldAlert, Activity } from 'lucide-react';
import { audioService } from '../services/audioService';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  slots: Slot[];
  setSlots: React.Dispatch<React.SetStateAction<Slot[]>>;
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  onSlotClick: (slotId: string) => void;
  selectedSlotId: string | null;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  scale?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  slots,
  setSlots,
  enemies,
  setEnemies,
  onSlotClick,
  selectedSlotId
}) => {
  const slotsRef = useRef<Slot[]>(slots);
  const enemiesRef = useRef<Enemy[]>(enemies);
  const projectilesRef = useRef<Projectile[]>([]);
  const gameStateRef = useRef<GameState>(gameState);

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [attackingIngredients, setAttackingIngredients] = useState<Set<string>>(new Set());
  const [isDamaged, setIsDamaged] = useState(false); 
  const [deleteMode, setDeleteMode] = useState(false); 

  const lastTickRef = useRef<number>(0);
  const enemySpawnTimerRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  useEffect(() => { slotsRef.current = slots; }, [slots]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const LANES = gameState.mapConfig.lanes;
  const SLOTS_PER_LANE = gameState.mapConfig.slotsPerLane;
  const LANE_HEIGHT_PERCENT = 100 / LANES;
  const HALF_LANE_HEIGHT = LANE_HEIGHT_PERCENT / 2;
  const SLOT_WIDTH_PERCENT = 96 / SLOTS_PER_LANE; 

  const spawnLevelUpEffect = (xPercent: number, yPercent: number) => {
    setFloatingTexts(prev => [...prev, {
      id: Math.random().toString(), x: xPercent, y: Math.max(15, yPercent - 12), text: "UPGRADE!", color: "#FACC15", life: 1.8, scale: 2.2
    }]);
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string, scale: number = 1.0) => {
      setFloatingTexts(prev => [...prev, { id: Math.random().toString(), x, y: Math.max(10, y), text, color, life: 1.2, scale }]);
  };

  const updateGame = useCallback((timestamp: number) => {
    if (gameStateRef.current.status !== GameStatus.PLAYING) {
      lastTickRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(updateGame);
      return;
    }

    const deltaTime = timestamp - lastTickRef.current;
    lastTickRef.current = timestamp;
    const updateRatio = Math.min(deltaTime / 16.67, 4);

    let currentSlots = slotsRef.current.map(s => ({ ...s, ingredient: s.ingredient ? { ...s.ingredient } : null }));
    let currentEnemies = [...enemiesRef.current];
    let currentProjectiles = [...projectilesRef.current];
    let currentGameState = { ...gameStateRef.current };
    
    const justAttackedIds = new Set<string>();
    const newProjectiles: Projectile[] = [];

    const currentLanes = currentGameState.mapConfig.lanes;
    const currentSlotsPerLane = currentGameState.mapConfig.slotsPerLane;
    const currentLaneHeight = 100 / currentLanes;
    const currentSlotWidth = 96 / currentSlotsPerLane;

    let stateChanged = false; 
    let slotsChanged = false;
    let enemiesChanged = false;

    // 敵人生成
    enemySpawnTimerRef.current += deltaTime;
    let spawnInterval = Math.max(1000, 4000 - currentGameState.wave * 200);
    if (currentGameState.isOverheated) spawnInterval *= 0.6;

    if (enemySpawnTimerRef.current > spawnInterval) {
        const lane = Math.floor(Math.random() * currentLanes);
        let type = EnemyType.RAT;
        if (currentGameState.wave > 3 && Math.random() > 0.7) type = EnemyType.NINJA_RAT;
        if (currentGameState.wave % 5 === 0 && !currentEnemies.some(e=>e.type === EnemyType.BOSS_SUPER_RAT)) type = EnemyType.BOSS_SUPER_RAT;

        const stats = ENEMY_STATS[type];
        currentEnemies.push({
            id: `rat-${Math.random()}`, type, laneIndex: lane, x: 100,
            hp: stats.hp * (1 + currentGameState.wave * 0.2),
            maxHp: stats.hp * (1 + currentGameState.wave * 0.2),
            speed: stats.speed, damage: stats.damage, attackSpeed: 1000, lastAttackTime: 0, isAttacking: false, lastHitTime: 0
        });
        enemySpawnTimerRef.current = 0;
        enemiesChanged = true;
    }

    // 食材邏輯
    currentSlots.forEach((slot) => {
        if (!slot.ingredient) return;
        const ing = slot.ingredient;
        const stats = INGREDIENT_STATS[ing.type];

        // 攻擊
        let cooldownMod = currentGameState.isOverheated ? 0.4 : 1.0;
        const effectiveAttackSpeed = (stats.attackSpeed || 1000) * cooldownMod / (Math.pow(0.9, ing.level - 1));

        if (stats.attackSpeed > 0 && timestamp - ing.lastAttackTime >= effectiveAttackSpeed) {
            const targets = currentEnemies.filter(e => e.laneIndex === slot.laneIndex && e.x > slot.slotIndex * currentSlotWidth && e.hp > 0);
            if (targets.length > 0 || ing.type === IngredientType.SEASONING_CAPTAIN) {
                ing.lastAttackTime = timestamp;
                justAttackedIds.add(ing.id);

                if (ing.type === IngredientType.SEASONING_CAPTAIN) {
                   audioService.playSkillUnlock();
                   const allies = currentSlots.filter(s => s.ingredient && s.ingredient.id !== ing.id);
                   if (allies.length > 0) {
                       const target = allies[Math.floor(Math.random() * allies.length)];
                       target.ingredient!.level++;
                       spawnLevelUpEffect(target.slotIndex * currentSlotWidth, (target.laneIndex * currentLaneHeight) + (currentLaneHeight/2));
                       slotsChanged = true;
                   }
                } else {
                    audioService.playAttack(ing.type);
                    newProjectiles.push({
                        id: `p-${Math.random()}`, laneIndex: slot.laneIndex, x: (slot.slotIndex * currentSlotWidth) + 2, speed: 0.6, damage: stats.damage * (1 + ing.level * 0.5), visualType: ing.type, pierce: ing.type.includes('SAUSAGE') ? 3 : 0, hitIds: []
                    });
                }
            }
        }
    });

    if (justAttackedIds.size > 0) {
        setAttackingIngredients(prev => {
            const next = new Set(prev);
            justAttackedIds.forEach(id => next.add(id));
            setTimeout(() => setAttackingIngredients(p => { const n = new Set(p); justAttackedIds.forEach(id => n.delete(id)); return n; }), 150);
            return next;
        });
    }

    // 移動與碰撞
    currentProjectiles = [...currentProjectiles, ...newProjectiles].filter(proj => {
        proj.x += proj.speed * updateRatio;
        for (const enemy of currentEnemies) {
            if (enemy.hp <= 0 || enemy.laneIndex !== proj.laneIndex) continue;
            if (Math.abs(proj.x - enemy.x) < 4 && !proj.hitIds.includes(enemy.id)) {
                enemy.hp -= proj.damage;
                enemy.lastHitTime = timestamp;
                proj.hitIds.push(enemy.id);
                enemiesChanged = true;
                if (proj.pierce <= 0) return false;
                else proj.pierce--;
            }
        }
        return proj.x < 105;
    });

    let playerDamage = 0;
    currentEnemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const blocker = currentSlots.find(s => s.laneIndex === enemy.laneIndex && s.ingredient && Math.abs(enemy.x - (s.slotIndex * currentSlotWidth)) < 3);

        if (blocker && blocker.ingredient) {
            enemy.isAttacking = true;
            if (timestamp - enemy.lastAttackTime > 1000) {
                enemy.lastAttackTime = timestamp;
                blocker.ingredient.hp -= enemy.damage;
                if (blocker.ingredient.hp <= 0) { blocker.ingredient = null; audioService.playEnemyDeath(); }
                slotsChanged = true;
            }
        } else {
            enemy.isAttacking = false;
            enemy.x -= enemy.speed * updateRatio;
        }

        if (enemy.x <= 0) { playerDamage += ENEMY_STATS[enemy.type].playerDamage; enemy.hp = 0; }
    });

    const aliveEnemies = currentEnemies.filter(e => {
        if (e.hp <= 0) {
            if (e.x > 0) {
                currentGameState.money += ENEMY_STATS[e.type].money;
                currentGameState.score += 100;
                currentGameState.heat = Math.min(100, currentGameState.heat + 4);
                currentGameState.combo = (currentGameState.combo || 0) + 1;
                stateChanged = true;
            }
            return false;
        }
        return true;
    });

    if (playerDamage > 0) {
        currentGameState.hp -= playerDamage;
        currentGameState.combo = 0;
        setIsDamaged(true);
        audioService.playDamage();
        setTimeout(() => setIsDamaged(false), 200);
        stateChanged = true;
        if (currentGameState.hp <= 0) currentGameState.status = GameStatus.REVIVE_OFFER;
    }

    setFloatingTexts(prev => prev.map(t => ({ ...t, y: t.y - 0.08, life: t.life - 0.015 })).filter(t => t.life > 0));

    slotsRef.current = currentSlots;
    enemiesRef.current = aliveEnemies;
    projectilesRef.current = currentProjectiles;
    gameStateRef.current = currentGameState;

    setProjectiles(currentProjectiles);
    if (slotsChanged) setSlots(currentSlots);
    if (enemiesChanged) setEnemies(aliveEnemies);
    if (stateChanged) setGameState(currentGameState);

    animationFrameRef.current = requestAnimationFrame(updateGame);
  }, []); 

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [updateGame]);

  const handleSlotInteraction = (slotId: string) => {
      const slot = slotsRef.current.find(s => s.id === slotId);
      if (deleteMode) {
          if (slot && slot.ingredient && slot.ingredient.type !== IngredientType.SEASONING_CAPTAIN) {
              const refund = Math.floor(INGREDIENT_STATS[slot.ingredient.type].cost * 0.5);
              setGameState(prev => ({ ...prev, money: prev.money + refund }));
              setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ingredient: null } : s));
              spawnFloatingText(slot.slotIndex * SLOT_WIDTH_PERCENT, (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT, `+$${refund}`, '#FACC15');
          }
      } else {
          onSlotClick(slotId);
      }
  };

  const currentHeatProgress = (gameState.heat / 100) * 100;

  return (
    <div className={`relative w-full h-full bg-[#080202] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,1)] transition-all border-4 border-[#1f1f1f] ${isDamaged ? 'animate-shake border-red-900' : ''}`}>
      
      {/* Hyper HUD: Heat Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
         <div className={`absolute inset-0 transition-opacity duration-1000 ${gameState.isOverheated ? 'opacity-40' : 'opacity-10'}`} 
              style={{ background: `radial-gradient(circle at center bottom, ${gameState.isOverheated ? '#3b82f6' : '#ef4444'} 0%, transparent 70%)` }} />
         {gameState.heat > 50 && (
             <div className="absolute inset-0 animate-pulse-glow opacity-20 border-[20px] border-orange-600/30 rounded-3xl" />
         )}
      </div>

      {/* Top HUD Panel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 py-2 z-[100] flex justify-between items-start pointer-events-none">
          {/* Money Panel */}
          <div className="bg-metal-panel px-4 py-2 rounded-xl border-2 border-gray-600 shadow-2xl flex items-center gap-3 transform -rotate-1">
             <div className="bg-yellow-500 p-1.5 rounded-full"><Coins size={20} className="text-black" /></div>
             <div className="font-display text-2xl text-yellow-100 tracking-widest">${gameState.money}</div>
          </div>

          {/* Wave & Progress Panel */}
          <div className="flex flex-col items-center gap-1">
             <div className="bg-metal-panel px-6 py-1 rounded-t-xl border-x-2 border-t-2 border-gray-600 font-display text-xl text-red-400">WAVE {gameState.wave}</div>
             <div className="w-48 h-3 bg-black/80 rounded-full border border-gray-700 overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-400 transition-all duration-500" style={{ width: `${Math.min(100, (enemies.length / 10) * 100)}%` }} />
             </div>
          </div>

          {/* HP Panel */}
          <div className="bg-metal-panel px-4 py-2 rounded-xl border-2 border-gray-600 shadow-2xl flex items-center gap-3 transform rotate-1">
             <div className="font-display text-2xl text-green-400 tracking-widest">{gameState.hp}</div>
             <div className="bg-green-600 p-1.5 rounded-full animate-pulse"><Heart size={20} className="text-white fill-current" /></div>
          </div>
      </div>

      {/* Combo Counter Overlay */}
      {(gameState.combo || 0) > 1 && (
          <div className="absolute top-24 right-10 z-[100] pointer-events-none select-none">
              <div className={`flex flex-col items-end ${(gameState.combo || 0) > 10 ? 'animate-hyper-combo' : 'animate-bounce'}`}>
                  <div className="text-7xl font-display text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[0_5px_0_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '2px black' }}>
                    {(gameState.combo || 0)}x
                  </div>
                  <div className="bg-red-600 px-4 py-1 rounded-lg border-2 border-black font-display text-lg tracking-tighter shadow-xl transform skew-x-12">
                     COMBO!
                  </div>
              </div>
          </div>
      )}

      {/* Left Lane Info */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-[#111] z-20 flex flex-col border-r-4 border-[#333] shadow-2xl">
         {Array.from({length: LANES}).map((_, i) => (
           <div key={i} className="flex-1 flex items-center justify-center border-b border-[#222] last:border-0 hover:bg-white/5 transition-colors group">
              <Utensils size={24} className="text-amber-800 group-hover:text-amber-600 transition-colors opacity-40 group-hover:opacity-100" />
           </div>
         ))}
      </div>

      {/* Combat Grid */}
      <div className="absolute inset-0 left-16 flex flex-col">
        {Array.from({length: LANES}).map((_, laneIndex) => (
          <div key={laneIndex} className="flex-1 relative border-b border-white/5 last:border-0 overflow-visible">
             {/* The Iron Skewer */}
             <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 bg-gradient-to-b from-[#2d2d2d] via-[#666] to-[#222] shadow-[0_5px_15px_rgba(0,0,0,0.8)] rounded-full z-0 mx-4" />
             
             {slots.filter(s => s.laneIndex === laneIndex).map((slot) => (
               <div key={slot.id} onClick={() => handleSlotInteraction(slot.id)} className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer z-10 transition-all ${selectedSlotId === slot.id ? 'scale-125' : 'hover:scale-110'}`} style={{ left: `${slot.slotIndex * SLOT_WIDTH_PERCENT + 2}%`, width: '48px', height: '48px' }}>
                 {selectedSlotId === slot.id && <div className="absolute inset-[-10px] bg-yellow-400/20 blur-xl rounded-full animate-pulse" />}
                 {slot.ingredient && (
                   <div className="relative w-full h-full flex items-center justify-center">
                      <CuteIngredient type={slot.ingredient.type} isAttacking={attackingIngredients.has(slot.ingredient.id)} level={slot.ingredient.level} />
                      {deleteMode && slot.ingredient.type !== IngredientType.SEASONING_CAPTAIN && <div className="absolute -top-4 -right-4 bg-red-600 rounded-full p-1.5 animate-bounce border-2 border-white shadow-lg"><Trash2 size={14} /></div>}
                      <div className="absolute -bottom-3 w-12 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
                        <div className={`h-full transition-all duration-300 ${slot.ingredient.hp < slot.ingredient.maxHp * 0.3 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(slot.ingredient.hp / slot.ingredient.maxHp) * 100}%` }} />
                      </div>
                   </div>
                 )}
               </div>
             ))}
          </div>
        ))}
      </div>

      {/* Floating Text layer */}
      <div className="absolute inset-0 pointer-events-none z-[150]">
          {floatingTexts.map(t => (
            <div key={t.id} className="absolute font-display font-black whitespace-nowrap drop-shadow-[0_4px_10px_rgba(0,0,0,1)] italic tracking-tighter" style={{ left: `${t.x}%`, top: `${t.y}%`, color: t.color, opacity: t.life, transform: `translate(-50%, -100%) scale(${t.scale || 1.2})`, textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
              {t.text}
            </div>
          ))}
      </div>

      {/* Entities layer */}
      <div className="absolute inset-0 left-16 pointer-events-none">
        {enemies.map(e => (
          <div key={e.id} className="absolute z-30 w-16 h-16 transition-all duration-100" style={{ top: `${(e.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT}%`, left: `${e.x}%`, transform: `translate(-50%, -50%) ${e.type === EnemyType.BOSS_SUPER_RAT ? 'scale(4)' : ''}` }}>
            <div className={`relative ${e.isAttacking ? 'animate-recoil' : ''} ${e.lastHitTime && Date.now() - e.lastHitTime < 100 ? 'brightness-[3] saturate-0' : ''}`}>
               <EnemyRenderer type={e.type} />
               {/* Fancy HP Bar for Rats */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-2 bg-black/80 rounded-full border border-white/20 p-[1px]">
                  <div className="h-full bg-gradient-to-r from-red-800 to-red-500 rounded-full transition-all" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
               </div>
            </div>
          </div>
        ))}

        {projectiles.map(p => (
          <div key={p.id} className="absolute z-20 w-8 h-8 drop-shadow-[0_0_8px_white]" style={{ top: `${(p.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT}%`, left: `${p.x}%`, transform: `translate(-50%, -50%)` }}>
            <ProjectileSVG type={p.visualType} />
          </div>
        ))}
      </div>

      {/* Bottom Interface Controls */}
      <div className="absolute bottom-6 right-8 z-[200] flex flex-col items-end gap-5">
          {/* Overheat / Ultimate Button */}
          <button onClick={() => {
              if (gameState.heat >= 100 && !gameState.isOverheated) {
                  setGameState(prev => ({ ...prev, isOverheated: true, overheatEndTime: Date.now() + 8000, heat: 0 }));
                  audioService.playSkillUnlock();
              }
          }} disabled={gameState.heat < 100 && !gameState.isOverheated} 
             className={`group relative w-24 h-24 rounded-full border-4 shadow-2xl transition-all btn-3d overflow-hidden
             ${gameState.isOverheated 
                ? 'bg-blue-600 border-blue-300 animate-pulse shadow-[0_0_40px_#3b82f6]' 
                : (gameState.heat >= 100 ? 'bg-orange-500 border-yellow-400 animate-bounce cursor-pointer' : 'bg-gray-800 border-gray-600 opacity-90 cursor-not-allowed')}`}>
             
             {/* Progress Fill */}
             {!gameState.isOverheated && (
               <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-700 to-orange-400 z-0 transition-all duration-300" style={{ height: `${gameState.heat}%` }} />
             )}

             <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <Flame size={40} className={`${gameState.heat >= 100 ? 'text-white fill-white' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                <span className={`text-[10px] font-display font-black tracking-tighter ${gameState.heat >= 100 ? 'text-white' : 'text-gray-500'}`}>HELLFIRE</span>
             </div>
             
             {/* Sparkle effects when full */}
             {gameState.heat >= 100 && !gameState.isOverheated && (
                 <div className="absolute inset-0 pointer-events-none bg-white/10 animate-ping rounded-full" />
             )}
          </button>
      </div>

      {/* Delete Tool */}
      <div className="absolute bottom-6 left-24 z-[200]">
          <button onClick={() => setDeleteMode(!deleteMode)} 
            className={`w-16 h-16 rounded-2xl border-4 shadow-2xl transition-all btn-3d flex items-center justify-center
                ${deleteMode ? 'bg-red-600 border-white text-white animate-pulse' : 'bg-metal-panel border-gray-500 text-gray-400 hover:text-red-400'}`}>
              <Trash2 size={28} />
          </button>
      </div>

    </div>
  );
};

export default GameCanvas;
