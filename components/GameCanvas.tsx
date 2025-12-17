
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GameState, Slot, Enemy, Projectile, IngredientType, GameStatus, EnemyType, Ingredient } from '../types';
import { GAME_Config, INGREDIENT_STATS, ENEMY_STATS, STAT_MULTIPLIER } from '../constants';
import CuteIngredient from './CuteIngredient';
import { EnemyRenderer, ProjectileSVG } from './GameAssets';
import { Heart, Coins, Trophy, Zap, Crosshair, BicepsFlexed, ArrowUp, Flame, UtensilsCrossed, Leaf, Skull, Radiation, Utensils, Star, Trash2, Sword, ShieldAlert } from 'lucide-react';
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

// Particle System Types
interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  shape?: 'circle' | 'ring' | 'slash' | 'spark' | 'beam' | 'ripple' | 'flash' | 'ember' | 'magma-shockwave' | 'void-slash' | 'void-bubble' | 'skull' | 'star' | 'buff-arrow' | 'heat-wave' | 'crit';
  rotation?: number;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  velocity?: number;
  scale?: number;
}

// Visual coin drop entity
interface CoinVisual {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  life: number;
  rotation: number;
  rotationSpeed: number;
}

// Helper to get base type for combo check
const getBaseType = (type: IngredientType): string => {
    if (!type) return 'UNKNOWN';
    if (type.startsWith('BONUS_')) return 'BONUS';
    if (type.startsWith('SUPREME_')) return 'SUPREME'; 
    if (type === IngredientType.SEASONING_CAPTAIN) return 'SEASONING';
    if (type.includes('BEEF')) return 'BEEF';
    if (type.includes('CHILI')) return 'CHILI';
    if (type.includes('GARLIC')) return 'GARLIC';
    if (type.includes('CORN')) return 'CORN';
    if (type.includes('SAUSAGE')) return 'SAUSAGE';
    if (type.includes('MUSHROOM')) return 'MUSHROOM';
    if (type.includes('ONION')) return 'ONION';
    if (type.includes('GREEN_PEPPER')) return 'GREEN_PEPPER';
    if (type.includes('SHRIMP')) return 'SHRIMP';
    if (type.includes('CHICKEN')) return 'CHICKEN';
    if (type.includes('SQUID')) return 'SQUID';
    if (type.includes('PINEAPPLE')) return 'PINEAPPLE';
    if (type.includes('MARSHMALLOW')) return 'MARSHMALLOW';
    return type;
};

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
  // --- Refs for Game Loop (Source of Truth) ---
  const slotsRef = useRef<Slot[]>(slots);
  const enemiesRef = useRef<Enemy[]>(enemies);
  const projectilesRef = useRef<Projectile[]>([]);
  const gameStateRef = useRef<GameState>(gameState);

  // --- Visual State (Managed by React State for rendering) ---
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [droppedCoins, setDroppedCoins] = useState<CoinVisual[]>([]);
  
  // Visual state
  const [attackingIngredients, setAttackingIngredients] = useState<Set<string>>(new Set());
  const [isDamaged, setIsDamaged] = useState(false); 
  const [deleteMode, setDeleteMode] = useState(false); // Mobile QoL
  
  // 2.0 Features State
  const [comboCount, setComboCount] = useState(0);
  const [activeBoss, setActiveBoss] = useState<{name: string, hp: number, maxHp: number} | null>(null);

  const lastTickRef = useRef<number>(0);
  const enemySpawnTimerRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const comboTimerRef = useRef<number>(0);
  
  // Sync Refs with Props
  useEffect(() => { slotsRef.current = slots; }, [slots]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Update visual combo/boss from refs periodically
  useEffect(() => {
      setComboCount(gameState.combo);
      const boss = enemies.find(e => e.type === EnemyType.BOSS_SUPER_RAT);
      if (boss) {
          setActiveBoss({ name: '鼠王‧暴食者', hp: boss.hp, maxHp: boss.maxHp });
      } else {
          setActiveBoss(null);
      }
  }, [gameState.combo, enemies]);

  // Helpers for dynamic grid sizing
  const LANES = gameState.mapConfig.lanes;
  const SLOTS_PER_LANE = gameState.mapConfig.slotsPerLane;
  const LANE_HEIGHT_PERCENT = 100 / LANES;
  const HALF_LANE_HEIGHT = LANE_HEIGHT_PERCENT / 2;
  const SLOT_WIDTH_PERCENT = 96 / SLOTS_PER_LANE; 

  // --- Combo Detection (Memoized for UI) ---
  const laneCombos = useMemo(() => {
      const combos = new Map<number, string[]>();
      for (let l = 0; l < LANES; l++) {
          const laneSlots = slots.filter(s => s.laneIndex === l && s.ingredient);
          const types = new Set(laneSlots.map(s => getBaseType(s.ingredient!.type)));
          const activeCombos: string[] = [];
          if (types.has('BEEF') && types.has('CHILI')) activeCombos.push('SPICY_MEAT');
          if (types.has('BEEF') && types.has('SHRIMP')) activeCombos.push('SURF_TURF');
          if (types.has('CORN') && types.has('MUSHROOM')) activeCombos.push('VEGGIE_MIX');
          if (types.has('BONUS') && types.has('SUPREME')) activeCombos.push('DELICIOUS_SYNERGY'); 
          if (activeCombos.length > 0) combos.set(l, activeCombos);
      }
      return combos;
  }, [slots, LANES]);

  // --- Activate Overheat ---
  const handleActivateOverheat = useCallback(() => {
      if (gameState.heat >= GAME_Config.MAX_HEAT && !gameState.isOverheated) {
          setGameState(prev => ({
              ...prev,
              isOverheated: true,
              overheatEndTime: Date.now() + GAME_Config.OVERHEAT_DURATION,
              heat: 0
          }));
          audioService.playSkillUnlock();
          // Blue Flash for 2.0 Hellfire
          setParticles(prev => [...prev, {
              id: 'overheat-flash', x: 50, y: 50, vx: 0, vy: 0, life: 0.8, color: '#3B82F6', size: 120, shape: 'flash'
          }]);
      }
  }, [gameState.heat, gameState.isOverheated, setGameState]);

  // --- Visual Helpers (Particles, etc) ---
  const spawnLevelUpEffect = (xPercent: number, yPercent: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#FACC15', '#F59E0B', '#FFFFFF', '#60A5FA']; 
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.5 + 0.2;
      newParticles.push({
        id: Math.random().toString(),
        x: xPercent,
        y: yPercent,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2, 
        life: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 2,
        shape: 'circle'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setFloatingTexts(prev => [...prev, {
      id: Math.random().toString(), x: xPercent, y: yPercent - 5, text: "LEVEL UP!", color: "#FACC15", life: 1.5, scale: 1.2
    }]);
  };

  const spawnAutoUpgradeEffect = (xPercent: number, yPercent: number) => {
      setParticles(prev => [...prev, 
          { id: Math.random().toString(), x: xPercent, y: yPercent, vx: 0, vy: 0, life: 1.0, color: '#60A5FA', size: 10, shape: 'beam' },
          { id: Math.random().toString(), x: xPercent, y: yPercent, vx: 0, vy: 0, life: 1.2, color: '#3B82F6', size: 5, shape: 'ripple' }
      ]);
  };

  const spawnAttackParticles = (x: number, y: number, type: IngredientType) => {
    const newParticles: Particle[] = [];
    if (type === IngredientType.SEASONING_CAPTAIN) {
        for(let i=0; i<8; i++) {
           const angle = Math.random() * Math.PI * 2;
           newParticles.push({ id: Math.random().toString(), x, y, vx: Math.cos(angle)*0.5, vy: Math.sin(angle)*0.5, life: 0.6, color: '#FCD34D', size: 4, shape: 'circle' });
        }
    } else {
        // Generic muzzle flash
        newParticles.push({ id: Math.random().toString(), x: x+2, y, vx: 0.5, vy: 0, life: 0.2, color: '#FFF', size: 5, shape: 'spark' });
    }
    if (newParticles.length) setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string, scale: number = 1.0) => {
      setFloatingTexts(prev => [...prev, { id: Math.random().toString(), x, y, text, color, life: 1.0, scale }]);
  };

  const spawnCoin = (x: number, laneIndex: number, value: number) => {
      const currentLanes = gameStateRef.current.mapConfig.lanes;
      const laneHeight = 100 / currentLanes;
      const y = (laneIndex * laneHeight) + (laneHeight / 2);

      setDroppedCoins(prev => [...prev, {
          id: Math.random().toString(),
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1.2,
          value,
          life: 1.5, 
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 20
      }]);
  };

  // --- Main Game Loop (Same Logic, just keeping it robust) ---
  const updateGame = useCallback((timestamp: number) => {
    if (gameStateRef.current.status !== GameStatus.PLAYING && gameStateRef.current.status !== GameStatus.LEVEL_COMPLETE) {
      lastTickRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(updateGame);
      return;
    }

    const deltaTime = timestamp - lastTickRef.current;
    lastTickRef.current = timestamp;
    const updateRatio = Math.min(deltaTime / 16, 4);

    let currentSlots = slotsRef.current.map(s => ({ ...s, ingredient: s.ingredient ? { ...s.ingredient } : null }));
    let currentEnemies = enemiesRef.current.map(e => ({ ...e }));
    let currentProjectiles = [...projectilesRef.current];
    let currentGameState = { ...gameStateRef.current };
    
    // Create new projectiles array for this frame
    const newProjectiles: Projectile[] = [];

    const currentLanes = currentGameState.mapConfig.lanes;
    const currentSlotsPerLane = currentGameState.mapConfig.slotsPerLane;
    const currentLaneHeight = 100 / currentLanes;
    const currentHalfLaneHeight = currentLaneHeight / 2;
    const currentSlotWidth = 96 / currentSlotsPerLane;

    let stateChanged = false; 
    let slotsChanged = false;
    let enemiesChanged = false;

    // --- 2.0 Feature: Combo Decay ---
    if (currentGameState.combo > 0) {
        if (timestamp - comboTimerRef.current > 3000) { 
            currentGameState.combo = 0;
            stateChanged = true;
        }
    }

    // --- 2. Game Logic ---
    if (currentGameState.isOverheated && timestamp > currentGameState.overheatEndTime) {
        currentGameState.isOverheated = false;
        stateChanged = true;
    }

    enemySpawnTimerRef.current += deltaTime;
    let spawnInterval = Math.max(1000, 5000 - currentGameState.wave * 200);
    if (currentGameState.isOverheated) spawnInterval *= 0.8; 

    if (enemySpawnTimerRef.current > spawnInterval) {
        const lane = Math.floor(Math.random() * currentLanes);
        let type = EnemyType.RAT;
        const wave = currentGameState.wave;
        if (wave > 1 && Math.random() > 0.7) type = EnemyType.BABY_RAT;
        if (wave > 3 && Math.random() > 0.8) type = EnemyType.NINJA_RAT;
        if (wave % 5 === 0 && Math.random() < 0.2 && !currentEnemies.some(e=>e.type===EnemyType.BOSS_SUPER_RAT)) type = EnemyType.BOSS_SUPER_RAT;
        
        const stats = ENEMY_STATS[type];
        currentEnemies.push({
            id: Math.random().toString(36).substr(2, 9),
            type,
            laneIndex: lane,
            x: 100,
            hp: stats.hp * (1 + wave * 0.1),
            maxHp: stats.hp * (1 + wave * 0.1),
            speed: stats.speed,
            damage: stats.damage,
            attackSpeed: 1000,
            lastAttackTime: 0,
            isAttacking: false,
            lastHitTime: 0
        });
        enemySpawnTimerRef.current = 0;
        enemiesChanged = true;
    }

    // Slots & Ingredients Logic
    const justAttackedIds = new Set<string>();
    const laneIngredientsMap = new Map<number, Set<string>>();
    currentSlots.forEach(s => {
       if(!s.ingredient) return;
       if (!laneIngredientsMap.has(s.laneIndex)) laneIngredientsMap.set(s.laneIndex, new Set());
       laneIngredientsMap.get(s.laneIndex)!.add(getBaseType(s.ingredient.type));
    });

    currentSlots.forEach((slot, index) => {
        if (!slot.ingredient) return;
        const ing = slot.ingredient;
        const stats = INGREDIENT_STATS[ing.type];

        if (timestamp - ing.lastAutoLevelTime >= GAME_Config.AUTO_LEVEL_INTERVAL) {
            if (ing.level < GAME_Config.MAX_LEVEL) {
                ing.level++;
                ing.lastAutoLevelTime = timestamp;
                ing.hp = Math.floor(stats.maxHp * (1 + ing.level * 1.0)); 
                ing.maxHp = ing.hp;
                if (ing.level % GAME_Config.SKILL_POINT_INTERVAL === 0) ing.availableSkillPoints++;
                spawnAutoUpgradeEffect(slot.slotIndex * currentSlotWidth + 2, (slot.laneIndex * currentLaneHeight) + currentHalfLaneHeight);
                audioService.playAutoUpgrade();
                slotsChanged = true;
            }
        }

        if (ing.type === IngredientType.SEASONING_CAPTAIN) {
            if (timestamp - ing.lastAttackTime >= stats.attackSpeed) {
                ing.lastAttackTime = timestamp;
                justAttackedIds.add(ing.id);
                audioService.playSkillUnlock();
                spawnAttackParticles(slot.slotIndex * currentSlotWidth, (slot.laneIndex * currentLaneHeight) + currentHalfLaneHeight, ing.type);

                const potentialTargets = [
                    ...currentSlots.filter(s => s.ingredient && s.ingredient.id !== ing.id).map(s => ({type: 'friendly', obj: s})),
                    ...currentEnemies.filter(e => e.hp > 0).map(e => ({type: 'enemy', obj: e}))
                ];
                
                for (let i = potentialTargets.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [potentialTargets[i], potentialTargets[j]] = [potentialTargets[j], potentialTargets[i]];
                }

                const targets = potentialTargets.slice(0, 5);
                targets.forEach(t => {
                    if (t.type === 'friendly') {
                        const s = t.obj as Slot;
                        if(s.ingredient) {
                            s.ingredient.level++;
                            s.ingredient.hp = s.ingredient.maxHp; 
                            spawnLevelUpEffect(s.slotIndex * currentSlotWidth, (s.laneIndex * currentLaneHeight) + currentHalfLaneHeight);
                            slotsChanged = true;
                        }
                    } else {
                        const e = t.obj as Enemy;
                        e.hp = Math.floor(e.hp * 0.5); 
                        e.lastHitTime = timestamp;
                        enemiesChanged = true;
                        spawnFloatingText(e.x, (e.laneIndex * currentLaneHeight) + currentHalfLaneHeight, "-50%", "#FCD34D");
                    }
                });
            }
            return;
        }

        let cooldownMod = currentGameState.isOverheated ? GAME_Config.OVERHEAT_SPEED_BOOST : 1.0;
        const laneTypes = laneIngredientsMap.get(slot.laneIndex);
        if (laneTypes && laneTypes.has('BEEF') && laneTypes.has('CHILI')) cooldownMod *= 0.85;

        const effectiveAttackSpeed = stats.attackSpeed * cooldownMod / (Math.pow(0.9, ing.level - 1));

        if (timestamp - ing.lastAttackTime >= effectiveAttackSpeed) {
            const rangePercent = slot.slotIndex * currentSlotWidth;
            const effectiveRange = rangePercent + 25; 

            const targets = currentEnemies.filter(e => e.laneIndex === slot.laneIndex && e.x > rangePercent && e.x < effectiveRange && e.hp > 0);
            
            if (targets.length > 0 || stats.range === 0) { 
                if (ing.type.includes('PINEAPPLE')) {
                    ing.lastAttackTime = timestamp;
                    const amount = 15 * (ing.type.includes('KING') ? 3 : 1);
                    currentGameState.money += amount;
                    stateChanged = true;
                    spawnFloatingText(slot.slotIndex * currentSlotWidth, (slot.laneIndex * currentLaneHeight) + currentHalfLaneHeight, `+$${amount}`, "#FACC15");
                    justAttackedIds.add(ing.id);
                    return;
                }

                if (targets.length > 0) {
                    ing.lastAttackTime = timestamp;
                    justAttackedIds.add(ing.id);
                    audioService.playAttack(ing.type); 
                    spawnAttackParticles(slot.slotIndex * currentSlotWidth, (slot.laneIndex * currentLaneHeight) + currentHalfLaneHeight, ing.type);

                    const dmg = stats.damage * (1 + ing.level * 0.5);
                    let speed = 0.4;
                    if (ing.type.includes('CHILI')) speed = 0.7;
                    
                    newProjectiles.push({
                        id: Math.random().toString(),
                        laneIndex: slot.laneIndex,
                        x: (slot.slotIndex * currentSlotWidth) + (currentSlotWidth/2),
                        speed: speed,
                        damage: dmg,
                        visualType: ing.type,
                        pierce: ing.type.includes('SAUSAGE') ? 10 : 0,
                        hitIds: []
                    });
                }
            }
        }
    });

    if (justAttackedIds.size > 0) {
        setAttackingIngredients(prev => {
            const next = new Set(prev);
            justAttackedIds.forEach(id => next.add(id));
            setTimeout(() => {
                setAttackingIngredients(p => {
                    const n = new Set(p);
                    justAttackedIds.forEach(id => n.delete(id));
                    return n;
                });
            }, 150);
            return next;
        });
    }

    currentProjectiles = [...currentProjectiles, ...newProjectiles];
    currentProjectiles = currentProjectiles.filter(proj => {
        proj.x += proj.speed * updateRatio;
        
        let hit = false;
        for (const enemy of currentEnemies) {
            if (enemy.hp <= 0) continue;
            if (enemy.laneIndex !== proj.laneIndex) continue;
            
            if (Math.abs(proj.x - enemy.x) < 3 && !proj.hitIds.includes(enemy.id)) {
                enemy.hp -= proj.damage;
                enemy.lastHitTime = timestamp;
                proj.hitIds.push(enemy.id);
                hit = true;
                enemiesChanged = true;
                
                if (proj.visualType.includes('SHRIMP')) enemy.x = Math.min(100, enemy.x + 5);

                if (proj.pierce <= 0) break;
                else proj.pierce--;
            }
        }
        
        if (hit && proj.pierce < 0) return false; 
        return proj.x < 110; 
    });

    let playerDamageTaken = 0;
    currentEnemies.forEach(enemy => {
        if (enemy.hp <= 0) return; 

        const slotWidth = 100 / currentSlotsPerLane;
        const enemySlotIndex = Math.floor(enemy.x / slotWidth);
        const blocker = currentSlots.find(s => s.laneIndex === enemy.laneIndex && s.slotIndex === enemySlotIndex && s.ingredient !== null);

        if (blocker && blocker.ingredient) {
            enemy.isAttacking = true;
            if (timestamp - enemy.lastAttackTime > enemy.attackSpeed) {
                enemy.lastAttackTime = timestamp;
                blocker.ingredient.hp -= enemy.damage;
                
                if (blocker.ingredient.type.includes('GREEN_PEPPER')) {
                    enemy.hp -= 20;
                    enemy.lastHitTime = timestamp;
                    audioService.playReflect();
                }

                if (blocker.ingredient.hp <= 0) {
                    blocker.ingredient = null; 
                    audioService.playEnemyDeath(); 
                }
                slotsChanged = true;
                enemiesChanged = true;
            }
        } else {
            enemy.isAttacking = false;
            enemy.x -= enemy.speed * updateRatio;
        }

        if (enemy.x <= 0) {
            playerDamageTaken += ENEMY_STATS[enemy.type].playerDamage;
            enemy.hp = 0; 
            enemiesChanged = true;
        }
    });

    const aliveEnemies: Enemy[] = [];
    currentEnemies.forEach(e => {
        if (e.hp > 0) {
            aliveEnemies.push(e);
        } else {
            if (e.x > 0) { 
                currentGameState.money += ENEMY_STATS[e.type].money;
                currentGameState.score += 100 * (1 + (currentGameState.combo || 0) * 0.1); 
                currentGameState.heat = Math.min(GAME_Config.MAX_HEAT, currentGameState.heat + GAME_Config.HEAT_PER_KILL);
                
                currentGameState.combo = (currentGameState.combo || 0) + 1;
                comboTimerRef.current = timestamp;

                spawnCoin(e.x, e.laneIndex, ENEMY_STATS[e.type].money);
                audioService.playEnemyDeath();
                stateChanged = true;
            }
        }
    });
    currentEnemies = aliveEnemies;

    if (playerDamageTaken > 0) {
        currentGameState.hp -= playerDamageTaken;
        currentGameState.combo = 0; 
        setIsDamaged(true);
        audioService.playDamage();
        setTimeout(() => setIsDamaged(false), 200);
        stateChanged = true;
        if (currentGameState.hp <= 0) {
            currentGameState.hp = 0;
            currentGameState.status = GameStatus.REVIVE_OFFER;
        }
    }

    setParticles(prev => prev.length > 0 ? prev.map(p => ({
        ...p,
        x: p.x + p.vx * updateRatio,
        y: p.y + p.vy * updateRatio,
        vy: p.vy + 0.01 * updateRatio, 
        life: p.life - 0.02 * updateRatio
    })).filter(p => p.life > 0) : []);

    setFloatingTexts(prev => prev.length > 0 ? prev.map(t => ({
        ...t,
        y: t.y - 0.05 * updateRatio,
        life: t.life - 0.01 * updateRatio
    })).filter(t => t.life > 0) : []);

    setDroppedCoins(prev => prev.length > 0 ? prev.map(c => ({
        ...c,
        x: c.x + c.vx * updateRatio,
        y: c.y + c.vy * updateRatio,
        vy: (c.vy + 0.02) * updateRatio,
        rotation: c.rotation + c.rotationSpeed * updateRatio,
        life: c.life - 0.01 * updateRatio
    })).filter(c => c.life > 0) : []);

    slotsRef.current = currentSlots;
    enemiesRef.current = currentEnemies;
    projectilesRef.current = currentProjectiles;
    gameStateRef.current = currentGameState;

    setProjectiles(currentProjectiles);
    if (slotsChanged) setSlots(currentSlots);
    if (enemiesChanged || currentEnemies.length !== enemies.length) setEnemies(currentEnemies);
    if (stateChanged) setGameState(currentGameState);

    animationFrameRef.current = requestAnimationFrame(updateGame);
  }, []); 

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateGame]);

  const handleSlotInteraction = (slotId: string) => {
      if (deleteMode) {
          const slot = slotsRef.current.find(s => s.id === slotId);
          if (slot && slot.ingredient) {
              const refund = Math.floor(INGREDIENT_STATS[slot.ingredient.type].cost * 0.5);
              setGameState(prev => ({ ...prev, money: prev.money + refund }));
              setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ingredient: null } : s));
              spawnFloatingText(slot.slotIndex * SLOT_WIDTH_PERCENT, (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT, `+$${refund}`, '#FACC15');
              audioService.playSkillUnlock(); 
          }
      } else {
          onSlotClick(slotId);
      }
  };

  const getLaneIcon = (index: number) => {
    const pattern = index % 5;
    switch(pattern) {
      case 0: return { icon: <Zap size={14} />, color: 'text-yellow-400', label: '急速' };
      case 1: return { icon: <Crosshair size={14} />, color: 'text-green-400', label: '穿透' };
      case 2: return { icon: <BicepsFlexed size={14} />, color: 'text-red-400', label: '強力' };
      case 3: return { icon: <Zap size={14} />, color: 'text-yellow-400', label: '急速' };
      case 4: return { icon: <BicepsFlexed size={14} />, color: 'text-red-400', label: '強力' };
      default: return null;
    }
  }

  const lanes = Array.from({ length: LANES }, (_, i) => i);

  return (
    <div className={`relative w-full h-full bg-[#0f0505] overflow-hidden rounded-xl shadow-2xl transition-all duration-100 border border-gray-800
      ${isDamaged ? 'animate-shake border-red-600' : ''}
    `}>
      {/* Dynamic Background with Grill Texture */}
      <div className="absolute inset-0 z-0 bg-metal-grate opacity-20 pointer-events-none"></div>
      
      {/* Lava/Ember Base */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          <div className={`absolute inset-0 opacity-60 animate-fire-glow transition-all duration-1000 ${gameState.isOverheated ? 'mix-blend-color-dodge opacity-90' : ''}`}
               style={{
                  background: gameState.isOverheated 
                    ? 'radial-gradient(circle at center bottom, #3b82f6 0%, #1e40af 40%, #1e3a8a 70%, #000 100%)' 
                    : 'radial-gradient(circle at center bottom, #b91c1c 0%, #7f1d1d 20%, #450a0a 40%, #000 80%)',
               }}
          />
      </div>

      {isDamaged && (
        <div className="absolute inset-0 z-50 pointer-events-none animate-damage bg-red-500/20 mix-blend-overlay"></div>
      )}
      
      {/* Hellfire Overlay */}
      {gameState.isOverheated && (
          <div className="absolute inset-0 z-[45] pointer-events-none animate-pulse" 
               style={{ 
                   background: 'radial-gradient(circle, transparent 60%, rgba(59, 130, 246, 0.4) 100%)', 
                   boxShadow: 'inset 0 0 80px #3B82F6' 
               }}>
          </div>
      )}

      {/* BOSS HEALTH BAR */}
      {activeBoss && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 z-[60] flex flex-col items-center animate-title-drop">
              <div className="flex items-center gap-2 mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <Skull size={24} className="text-red-500 animate-pulse fill-black" />
                  <span className="text-red-500 font-black text-xl tracking-widest uppercase font-display">{activeBoss.name}</span>
                  <Skull size={24} className="text-red-500 animate-pulse fill-black" />
              </div>
              <div className="w-full h-6 bg-black border-2 border-red-800 rounded-lg overflow-hidden relative shadow-[0_0_15px_#dc2626]">
                  <div className="absolute inset-0 bg-red-950/80"></div>
                  <div 
                      className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 transition-all duration-200"
                      style={{ width: `${(activeBoss.hp / activeBoss.maxHp) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 font-mono tracking-widest shadow-black drop-shadow-md">
                      {Math.ceil(activeBoss.hp)} / {activeBoss.maxHp}
                  </div>
              </div>
          </div>
      )}

      {/* COMBO COUNTER */}
      {comboCount > 1 && (
          <div className="absolute top-24 right-4 z-40 flex flex-col items-end animate-bounce pointer-events-none">
              <div className="text-5xl font-black text-yellow-400 italic tracking-tighter drop-shadow-[4px_4px_0_#000] transform skew-x-12 font-display stroke-black" style={{ WebkitTextStroke: '2px black' }}>
                  {comboCount}x
              </div>
              <div className="text-lg font-bold text-white bg-red-600 px-3 py-1 transform skew-x-12 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                  COMBO!
              </div>
          </div>
      )}

      {/* Left UI: Lane Info (Metal Plate Style) */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 bg-[#1f1f1f] z-20 flex flex-col justify-around items-center border-r-4 border-[#333] shadow-2xl">
         {lanes.map(i => {
           const laneInfo = getLaneIcon(i);
           const activeCombos = laneCombos.get(i) || [];
           return (
             <div key={i} className="flex flex-col items-center gap-0.5 relative w-full border-b border-[#333] last:border-0 bg-gradient-to-r from-[#111] to-[#222]" style={{ height: `${LANE_HEIGHT_PERCENT}%`, justifyContent: 'center' }}>
               
               {/* Lane Number / Icon */}
               <div className="filter drop-shadow-lg text-amber-600/50">
                   <Utensils size={24} />
               </div>
               
               {laneInfo && (
                 <div className={`hidden sm:flex items-center gap-0.5 text-[8px] font-bold ${laneInfo.color} bg-black/80 px-1.5 py-0.5 rounded border border-white/5 shadow-inner`}>
                   {laneInfo.icon}
                 </div>
               )}

               {/* Connector to Main Grill */}
               <div className="absolute right-0 top-1/2 h-4 w-2 bg-[#333] transform -translate-y-1/2 rounded-l-sm z-10 border-l border-white/10"></div>
               
               {/* Combo Indicators */}
               {activeCombos.length > 0 && (
                   <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
                       {activeCombos.map(c => {
                           if (c === 'DELICIOUS_SYNERGY') return <div key={c} className="bg-pink-900/90 p-1.5 rounded-full border-2 border-pink-500 shadow-lg animate-pulse"><Star size={14} className="text-yellow-400 fill-yellow-400" /></div>;
                           return null;
                       })}
                   </div>
               )}
             </div>
           );
         })}
      </div>

      {/* Main Grid - The Grill */}
      <div className="absolute inset-0 left-16 sm:left-20 flex flex-col">
        {lanes.map((laneIndex) => (
          <div key={laneIndex} className="flex-1 relative box-border group border-b border-white/5 last:border-0" style={{ height: `${LANE_HEIGHT_PERCENT}%` }}>
             
             {/* Grill Bars (Visual only) */}
             <div className="absolute inset-0 z-0" style={{
                 backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 19%, rgba(255,255,255,0.05) 20%, transparent 21%)`
             }}></div>

             {/* The Skewer Stick - Real 3D Look */}
             <div className="absolute top-1/2 left-0 right-0 h-3 -translate-y-1/2 shadow-lg z-0" 
                  style={{ 
                      background: 'linear-gradient(to bottom, #d4a373 0%, #8b5e3c 50%, #5d4037 100%)',
                      borderRadius: '2px',
                      boxShadow: '0 4px 4px rgba(0,0,0,0.5)'
                  }}>
                  {/* Wood grain detail */}
                  <div className="w-full h-full opacity-30" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 12px)` }}></div>
             </div>

             {slots.filter(s => s.laneIndex === laneIndex).map((slot) => (
               <div
                 key={slot.id}
                 onClick={() => handleSlotInteraction(slot.id)}
                 className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transform transition-all cursor-pointer z-10
                   ${selectedSlotId === slot.id ? 'z-20 scale-125' : 'hover:scale-110'}
                   ${deleteMode && slot.ingredient ? 'animate-pulse' : ''}
                 `}
                 style={{ 
                   left: `${slot.slotIndex * SLOT_WIDTH_PERCENT + 2}%`,
                   width: `${Math.min(48, 1000/SLOTS_PER_LANE)}px`, 
                   height: `${Math.min(48, 1000/SLOTS_PER_LANE)}px` 
                 }} 
               >
                 {/* Selection Glow */}
                 {selectedSlotId === slot.id && (
                     <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-md animate-pulse"></div>
                 )}
                 {/* Delete Mode Hazard */}
                 {deleteMode && slot.ingredient && (
                     <div className="absolute inset-0 rounded-full border-2 border-red-500 border-dashed animate-spin-slow opacity-70"></div>
                 )}

                 {/* Empty Slot Highlight */}
                 {!slot.ingredient && (
                     <div className="w-2 h-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 )}

                 {slot.ingredient && (
                   <div className="relative w-full h-full flex items-center justify-center">
                      <CuteIngredient 
                        type={slot.ingredient.type} 
                        isAttacking={attackingIngredients.has(slot.ingredient.id)}
                        level={slot.ingredient.level}
                        isStunned={slot.ingredient.stunnedUntil && slot.ingredient.stunnedUntil > Date.now()} 
                      />
                      
                      {/* Delete Icon Overlay */}
                      {deleteMode && (
                          <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md animate-bounce border border-white">
                              <Trash2 size={12} />
                          </div>
                      )}

                      {/* HP Bar (Compact) */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10/12 h-1.5 bg-black/50 rounded-full overflow-hidden border border-black/30">
                        <div 
                            className={`h-full ${slot.ingredient.hp < slot.ingredient.maxHp * 0.3 ? 'bg-red-500' : 'bg-green-500'} transition-all duration-300`} 
                            style={{ width: `${(slot.ingredient.hp / slot.ingredient.maxHp) * 100}%` }}
                        ></div>
                      </div>
                   </div>
                 )}
               </div>
             ))}
          </div>
        ))}
      </div>

      {/* Floating Elements */}
      {particles.map(p => (
          <div key={p.id} className={`absolute pointer-events-none z-50 rounded-full mix-blend-screen`} 
               style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, backgroundColor: p.color, opacity: p.life, transform: 'translate(-50%, -50%)', boxShadow: `0 0 ${p.size/2}px ${p.color}` }} />
      ))}

      {floatingTexts.map(t => (
        <div key={t.id} className="absolute pointer-events-none z-50 font-black text-[12px] whitespace-nowrap transition-transform drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ left: `${t.x}%`, top: `${t.y}%`, color: t.color, opacity: t.life, transform: `translate(-50%, -50%) scale(${t.scale || 1})` }}>
          {t.text}
        </div>
      ))}

      {droppedCoins.map(c => (
        <div key={c.id} className="absolute pointer-events-none z-40 flex items-center justify-center gap-1" style={{ left: `${c.x}%`, top: `${c.y}%`, opacity: c.life, transform: 'translate(-50%, -50%)' }}>
           <div style={{ transform: `rotateY(${c.rotation}deg)` }}><Coins size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-md stroke-yellow-700" /></div>
           <span className="text-xs font-black text-yellow-300 drop-shadow-[0_2px_0_#000]">+${c.value}</span>
        </div>
      ))}

      {enemies.map(enemy => (
        <div key={enemy.id} className={`absolute transition-transform duration-100 ease-linear z-30 w-12 h-12 pointer-events-none`}
          style={{ top: `${(enemy.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT}%`, left: `${enemy.x}%`, transform: `translate(-50%, -50%) ${enemy.type === EnemyType.BOSS_SUPER_RAT ? 'scale(3)' : ''}` }}
        >
          <div className={`w-full h-full ${enemy.isAttacking ? 'animate-bounce' : ''} ${enemy.lastHitTime && Date.now() - enemy.lastHitTime < 100 ? 'brightness-200 sepia-0 hue-rotate-0 saturate-0 contrast-200' : ''}`}>
             <EnemyRenderer type={enemy.type} />
          </div>
          {enemy.type !== EnemyType.BOSS_SUPER_RAT && (
              <div className="w-10 h-1.5 bg-black/60 absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full overflow-hidden border border-black/20">
                 <div className="h-full bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
              </div>
          )}
        </div>
      ))}

      {projectiles.map(proj => (
        <div key={proj.id} className="absolute z-20 w-4 h-4 flex items-center justify-center pointer-events-none"
          style={{ top: `${(proj.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT}%`, left: `${proj.x}%`, width: '20px', transform: `translate(-50%, -50%)` }}
        >
           <div className="drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] w-full h-full">
                <ProjectileSVG type={proj.visualType} />
           </div>
        </div>
      ))}

      {/* UI Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50 pointer-events-none">
          {/* Overheat Button - Industrial Style */}
          <div className="pointer-events-auto">
              <button onClick={handleActivateOverheat} disabled={gameState.heat < GAME_Config.MAX_HEAT && !gameState.isOverheated}
                 className={`w-20 h-20 rounded-full border-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all transform active:scale-95 relative overflow-hidden group btn-3d
                    ${gameState.isOverheated 
                        ? 'bg-blue-600 border-blue-400 animate-pulse shadow-[0_0_30px_#3B82F6]' 
                        : (gameState.heat >= GAME_Config.MAX_HEAT 
                            ? 'bg-gradient-to-br from-orange-500 to-red-600 border-yellow-400 animate-bounce' 
                            : 'bg-gray-800 border-gray-600 opacity-90')}`}
              >
                 {gameState.isOverheated ? <div className="text-white font-black text-[10px] animate-ping font-display">HELLFIRE</div> : <Flame size={36} className={`mb-1 drop-shadow-md ${gameState.heat >= GAME_Config.MAX_HEAT ? 'text-yellow-300 fill-yellow-300' : 'text-gray-500'}`} />}
                 
                 {/* Progress Liquid */}
                 {!gameState.isOverheated && (
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600 to-yellow-500 opacity-80 z-0 transition-all duration-300" style={{ height: `${(gameState.heat / GAME_Config.MAX_HEAT) * 100}%` }}></div>
                 )}
                 {/* Gloss */}
                 <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
              </button>
          </div>
      </div>

      {/* Delete Mode Toggle (Mobile QoL) - Hazard Style */}
      <div className="absolute bottom-4 left-4 z-50 pointer-events-auto">
          <button onClick={() => setDeleteMode(!deleteMode)} 
            className={`w-14 h-14 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)] border-2 transition-all active:scale-95 flex items-center justify-center btn-3d
                ${deleteMode 
                    ? 'bg-red-600 border-red-400 text-white animate-pulse bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.2)_5px,rgba(0,0,0,0.2)_10px)]' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
          >
              <Trash2 size={24} className="drop-shadow-md" />
          </button>
      </div>

    </div>
  );
};

export default GameCanvas;
