import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GameState, Slot, Enemy, Projectile, IngredientType, GameStatus, EnemyType, Ingredient } from '../types';
import { GAME_Config, INGREDIENT_STATS, ENEMY_STATS, STAT_MULTIPLIER } from '../constants';
import CuteIngredient from './CuteIngredient';
import { EnemyRenderer, ProjectileSVG } from './GameAssets';
import { Heart, Coins, Trophy, Zap, Crosshair, BicepsFlexed, ArrowUp, Flame, UtensilsCrossed, Leaf, Skull, Radiation, Utensils } from 'lucide-react';
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
  shape?: 'circle' | 'ring' | 'slash' | 'spark' | 'beam' | 'ripple' | 'flash' | 'ember' | 'magma-shockwave' | 'void-slash' | 'void-bubble' | 'skull';
  rotation?: number;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
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
    if (type.startsWith('D_')) return 'DANGEROUS'; // Group all dangerous
    if (type.startsWith('SUPREME_')) return 'SUPREME'; // Group all supreme
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
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [droppedCoins, setDroppedCoins] = useState<CoinVisual[]>([]);
  
  const lastTickRef = useRef<number>(0);
  const enemySpawnTimerRef = useRef<number>(0);
  const friendlyFireTimerRef = useRef<number>(0); // For Dangerous Ingredients
  const animationFrameRef = useRef<number>(0);
  const prevSlotsRef = useRef<Slot[]>(slots);
  
  // Ref for victory timer to prevent frequent resets from HP updates
  const victoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Visual state
  const [attackingIngredients, setAttackingIngredients] = useState<Set<string>>(new Set());
  const [explosions, setExplosions] = useState<{id: string, x: number, lane: number}[]>([]);
  const [isDamaged, setIsDamaged] = useState(false); // Screen shake/flash trigger

  // Helpers for dynamic grid sizing
  const LANES = gameState.mapConfig.lanes;
  const SLOTS_PER_LANE = gameState.mapConfig.slotsPerLane;
  const LANE_HEIGHT_PERCENT = 100 / LANES;
  const HALF_LANE_HEIGHT = LANE_HEIGHT_PERCENT / 2;
  const SLOT_WIDTH_PERCENT = 96 / SLOTS_PER_LANE; // 96% total width to leave some padding

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
          if (types.has('DANGEROUS')) activeCombos.push('HAZARD_ZONE'); 
          
          if (activeCombos.length > 0) {
              combos.set(l, activeCombos);
          }
      }
      return combos;
  }, [slots, LANES]);


  // --- Particle Helpers ---
  const spawnLevelUpEffect = (xPercent: number, yPercent: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#FACC15', '#F59E0B', '#FFFFFF', '#60A5FA']; 
    
    // Confetti particles
    for (let i = 0; i < 20; i++) {
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
      id: Math.random().toString(),
      x: xPercent,
      y: yPercent - 5,
      text: "LEVEL UP!",
      color: "#FACC15",
      life: 1.5 
    }]);
  };

  const spawnAutoUpgradeEffect = (xPercent: number, yPercent: number) => {
      // Create a vertical light beam and a ripple
      const newParticles: Particle[] = [];
      
      // Beam
      newParticles.push({
          id: Math.random().toString(),
          x: xPercent,
          y: yPercent,
          vx: 0,
          vy: 0,
          life: 1.0,
          color: '#60A5FA', // Blue beam
          size: 10,
          shape: 'beam'
      });

      // Ripple (Growing ring)
      newParticles.push({
        id: Math.random().toString(),
        x: xPercent,
        y: yPercent,
        vx: 0,
        vy: 0,
        life: 1.2,
        color: '#3B82F6', // Blue ring
        size: 5,
        shape: 'ripple'
      });

      setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnAttackParticles = (x: number, y: number, type: IngredientType) => {
    const newParticles: Particle[] = [];
    
    // --- DANGEROUS ATTACKS ---
    if (type.startsWith('D_')) {
        // Red / Black sinister particles
        for(let i=0; i<3; i++) {
           const angle = (Math.random() - 0.5) * Math.PI / 1.5; 
           newParticles.push({
             id: Math.random().toString(),
             x: x + 2, 
             y: y,
             vx: Math.cos(angle) * 0.8,
             vy: Math.sin(angle) * 0.8,
             life: 0.4,
             color: '#DC2626', 
             size: Math.random() * 4 + 2,
             shape: 'spark'
           });
        }
        setParticles(prev => [...prev, ...newParticles]);
        return;
    }

    // --- STANDARD ATTACKS ---
    const isShooter = [IngredientType.CHILI, IngredientType.BEEF, IngredientType.SAUSAGE, IngredientType.CORN, IngredientType.SHRIMP, IngredientType.PINEAPPLE].some(t => type.includes(t));
    const isMelee = type.includes('SQUID');
    const isSplash = type.includes('MUSHROOM');
    
    if (isShooter) {
        // Muzzle flash / Sparks
        for(let i=0; i<5; i++) {
           const angle = (Math.random() - 0.5) * Math.PI / 1.5; // Forward cone
           const speed = Math.random() * 0.8 + 0.5;
           let color = '#FEF08A';
           if (type.includes('PINEAPPLE')) color = '#FACC15';
           else if (type.includes('SUPREME')) color = '#22d3ee'; // Cyan
           else if (type.includes('GOD')) color = '#60A5FA';
           else if (type.includes('CHILI')) color = '#FCA5A5';

           newParticles.push({
             id: Math.random().toString(),
             x: x + 2, 
             y: y,
             vx: Math.cos(angle) * speed,
             vy: Math.sin(angle) * speed,
             life: 0.25,
             color: color,
             size: Math.random() * 3 + 2,
             shape: 'spark'
           });
        }
    } else if (isMelee) {
        // Slash effect
        newParticles.push({
             id: Math.random().toString(),
             x: x + 4,
             y: y,
             vx: 0.2,
             vy: 0,
             life: 0.2,
             color: type.includes('SUPREME') ? '#22d3ee' : (type.includes('GOD') ? '#1F2937' : (type.includes('KING') ? '#E879F9' : '#C084FC')),
             size: 30,
             shape: 'slash',
             rotation: Math.random() * 60 - 30
        });
    } else if (isSplash) {
         // Puff
         for(let i=0; i<5; i++) {
           newParticles.push({
             id: Math.random().toString(),
             x: x, 
             y: y,
             vx: (Math.random() - 0.5) * 0.5,
             vy: (Math.random() - 0.5) * 0.5,
             life: 0.5,
             color: '#A3E635', // lime
             size: 6,
             shape: 'circle'
           });
        }
    }
    
    if (newParticles.length > 0) {
        setParticles(prev => [...prev, ...newParticles]);
    }
  };

  const spawnDeathEffect = (xPercent: number, laneIndex: number) => {
    const yPercent = (laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
    const newParticles: Particle[] = [];
    const colors = ['#78716C', '#EF4444', '#1C1917']; 
    
    // Debris
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.4 + 0.1;
      newParticles.push({
        id: Math.random().toString(),
        x: xPercent,
        y: yPercent,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed, 
        life: 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2,
        shape: 'circle'
      });
    }

    // White Flash
    newParticles.push({
      id: Math.random().toString(),
      x: xPercent,
      y: yPercent,
      vx: 0,
      vy: 0,
      life: 0.2, // Short life
      color: '#FFFFFF',
      size: 40, 
      shape: 'flash'
    });

    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnFirework = (x: number, y: number) => {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.5; // High speed spread
        newParticles.push({
            id: Math.random().toString(),
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.5 + Math.random() * 0.5,
            color: color,
            size: Math.random() * 4 + 3,
            shape: 'circle'
        });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnCoin = (x: number, laneIndex: number, value: number) => {
    const y = (laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
    setDroppedCoins(prev => [...prev, {
      id: Math.random().toString(),
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.4, // Slight horizontal spread
      vy: -0.8, // Pop up initial velocity
      value: value,
      life: 1.2, // Seconds
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    }]);
  };

  // --- Detect Level Up ---
  useEffect(() => {
    slots.forEach((slot, index) => {
      const prevSlot = prevSlotsRef.current[index];
      if (slot.ingredient && prevSlot.ingredient && slot.id === prevSlot.id) {
        if (slot.ingredient.level > prevSlot.ingredient.level) {
          const x = slot.slotIndex * SLOT_WIDTH_PERCENT + 2 + (SLOT_WIDTH_PERCENT/2); 
          const y = (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
          spawnLevelUpEffect(x, y);
        }
      }
    });
    prevSlotsRef.current = slots;
  }, [slots, SLOT_WIDTH_PERCENT, LANE_HEIGHT_PERCENT, HALF_LANE_HEIGHT]);

  // --- Detect Victory ---
  useEffect(() => {
    if (gameState.status !== GameStatus.PLAYING || gameState.hp <= 0) {
        if (victoryTimerRef.current) {
            clearTimeout(victoryTimerRef.current);
            victoryTimerRef.current = null;
        }
        return;
    }
    
    if (slots.length === 0) return;

    let fullLanesCount = 0;
    for (let l = 0; l < LANES; l++) {
       const hasEmptySlot = slots.some(s => s.laneIndex === l && s.ingredient === null);
       if (!hasEmptySlot) {
         fullLanesCount++;
       }
    }
    
    if (fullLanesCount >= Math.min(LANES, 5)) {
      if (!victoryTimerRef.current) {
          victoryTimerRef.current = setTimeout(() => {
            setGameState(prev => {
              if (prev.status !== GameStatus.PLAYING || prev.hp <= 0) return prev;
              return { ...prev, status: GameStatus.LEVEL_COMPLETE };
            });
            victoryTimerRef.current = null;
          }, 500);
      }
    } else {
        if (victoryTimerRef.current) {
            clearTimeout(victoryTimerRef.current);
            victoryTimerRef.current = null;
        }
    }
  }, [slots, gameState.status, gameState.hp, setGameState, LANES]);

  useEffect(() => {
    return () => {
      if (victoryTimerRef.current) {
        clearTimeout(victoryTimerRef.current);
      }
    };
  }, []);

  // --- Game Loop Logic ---
  const spawnEnemy = useCallback((specificType?: EnemyType, laneOverride?: number, xOverride?: number) => {
    const lane = laneOverride ?? Math.floor(Math.random() * LANES);
    
    let type = specificType;
    if (!type) {
        // BOSS SPAWN LOGIC: Every 5 waves, 20% chance to spawn boss if no boss exists
        const bossExists = enemies.some(e => e.type === EnemyType.BOSS_SUPER_RAT);
        if (gameState.wave % 5 === 0 && !bossExists && Math.random() < 0.2) {
            type = EnemyType.BOSS_SUPER_RAT;
        } else {
            const rand = Math.random();
            type = EnemyType.RAT;
            
            // Progressive difficulty spawns
            if (gameState.wave > 1 && rand > 0.70) type = EnemyType.BABY_RAT;
            if (gameState.wave > 2 && rand > 0.80) type = EnemyType.NINJA_RAT;
            if (gameState.wave > 3 && rand > 0.85) {
                 const subRand = Math.random();
                 if (subRand > 0.5) type = EnemyType.SHAMAN_RAT;
                 else type = EnemyType.HEALER_RAT;
            }
            if (gameState.wave > 4 && rand > 0.90) type = EnemyType.MAMA_RAT;
            if (gameState.wave > 5 && rand > 0.94) {
                 const subRand = Math.random();
                 if (subRand > 0.5) type = EnemyType.SUMMONER_RAT;
                 else type = EnemyType.GHOST_RAT;
            }
            if (gameState.wave > 6 && rand > 0.97) type = EnemyType.BOMB_RAT;
        }
    }

    const stats = ENEMY_STATS[type];
    
    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      laneIndex: lane,
      x: xOverride ?? 100,
      hp: stats.hp * (1 + gameState.wave * 0.1),
      maxHp: stats.hp * (1 + gameState.wave * 0.1),
      speed: stats.speed,
      damage: stats.damage,
      attackSpeed: type === EnemyType.SHAMAN_RAT ? 3000 : 1000, 
      lastAttackTime: 0,
      isAttacking: false,
      slowed: false,
      isPhasing: false,
      phaseOffset: type === EnemyType.GHOST_RAT ? Math.random() * 2000 : 0,
      healCooldown: 0
    };

    setEnemies(prev => [...prev, newEnemy]);
  }, [gameState.wave, setEnemies, LANES, enemies]);

  const updateGame = useCallback((timestamp: number) => {
    if (gameState.status !== GameStatus.PLAYING && gameState.status !== GameStatus.LEVEL_COMPLETE) {
      lastTickRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(updateGame);
      return;
    }

    const deltaTime = timestamp - lastTickRef.current;
    lastTickRef.current = timestamp;

    const updateRatio = deltaTime / 16;

    // ... (Particles update code unchanged) ...
    if (Math.random() < 0.2 * updateRatio) { 
       setParticles(prev => [...prev, {
          id: `ember-${Math.random()}`,
          x: Math.random() * 100,
          y: 105, 
          vx: (Math.random() - 0.5) * 0.1, 
          vy: -(Math.random() * 0.2 + 0.1), 
          life: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? '#fca5a5' : '#fbbf24', 
          size: Math.random() * 2 + 0.5,
          shape: 'ember'
       }]);
    }

    setParticles(prev => prev.map(p => {
      let newSize = p.size;
      let newVy = p.vy;
      let lifeDecay = 0.03;

      if (p.shape === 'ring') {
         newSize += 3 * updateRatio; 
         newVy = 0; 
         lifeDecay = 0.04;
      } else if (p.shape === 'ripple') {
         newSize += 2 * updateRatio; 
         newVy = 0;
         lifeDecay = 0.05;
      } else if (p.shape === 'beam') {
         newVy = 0;
         lifeDecay = 0.05;
      } else if (p.shape === 'slash') {
         lifeDecay = 0.15; 
         newVy = 0;
         p.x += 0.1 * updateRatio;
      } else if (p.shape === 'void-slash') {
         lifeDecay = 0.1; 
         newVy = 0;
         newSize += 2 * updateRatio;
      } else if (p.shape === 'void-bubble') {
         lifeDecay = 0.05;
         newVy = p.vy * 0.95; 
      } else if (p.shape === 'magma-shockwave') {
         lifeDecay = 0.05;
         newVy = 0;
         newSize += 5 * updateRatio; 
      } else if (p.shape === 'spark') {
         lifeDecay = 0.08;
         newVy = p.vy * 0.9; 
      } else if (p.shape === 'flash') {
         newVy = 0;
         lifeDecay = 0.2; 
      } else if (p.shape === 'ember') {
         newVy = p.vy; 
         p.x += Math.sin(timestamp / 500 + p.y) * 0.02 * updateRatio; 
         lifeDecay = 0.01;
      } else {
         newVy = p.vy + 0.02 * updateRatio; 
      }

      return {
        ...p,
        x: p.x + p.vx * updateRatio,
        y: p.y + newVy * updateRatio,
        vy: newVy,
        life: p.life - lifeDecay * updateRatio,
        size: newSize
      };
    }).filter(p => p.life > 0));

    setFloatingTexts(prev => prev.map(t => ({
      ...t,
      y: t.y - 0.05 * updateRatio,
      life: t.life - 0.01 * updateRatio
    })).filter(t => t.life > 0));

    setDroppedCoins(prev => prev.map(c => ({
      ...c,
      x: c.x + c.vx * updateRatio,
      y: c.y + c.vy * updateRatio,
      vy: c.vy + 0.05 * updateRatio, // Gravity
      life: c.life - 0.01 * updateRatio,
      rotation: c.rotation + c.rotationSpeed * updateRatio
    })).filter(c => c.life > 0));


    // Victory Fireworks
    if (gameState.status === GameStatus.LEVEL_COMPLETE) {
        if (Math.random() < 0.05) { 
           spawnFirework(
               20 + Math.random() * 60,
               20 + Math.random() * 60
           );
           if (Math.random() < 0.3) {
             const textX = 20 + Math.random() * 60;
             const textY = 20 + Math.random() * 60;
             setFloatingTexts(prev => [...prev, {
                id: Math.random().toString(),
                x: textX,
                y: textY,
                text: ["VICTORY!", "NICE!", "AWESOME!", "TASTY!"][Math.floor(Math.random()*4)],
                color: "#FACC15",
                life: 2.0 
              }]);
           }
        }
        animationFrameRef.current = requestAnimationFrame(updateGame);
        return;
    }


    // 1. Spawn Enemies
    enemySpawnTimerRef.current += deltaTime;
    const spawnRate = Math.max(1000, 5000 - gameState.wave * 200); 
    if (enemySpawnTimerRef.current > spawnRate) {
      spawnEnemy();
      enemySpawnTimerRef.current = 0;
    }

    // 2. Ingredients Logic
    const justAttackedIds = new Set<string>();
    let moneyGained = 0;
    
    // --- Dangerous Friendly Fire Logic (Run every 1s) ---
    friendlyFireTimerRef.current += deltaTime;
    const shouldFriendlyFire = friendlyFireTimerRef.current >= 1000;
    if (shouldFriendlyFire) {
        friendlyFireTimerRef.current = 0;
    }

    const onionData = new Map<number, number>(); 
    
    const laneIngredientsMap = new Map<number, Set<string>>();
    slots.forEach(s => {
       if(!s.ingredient) return;
       
       if (!laneIngredientsMap.has(s.laneIndex)) {
           laneIngredientsMap.set(s.laneIndex, new Set());
       }
       laneIngredientsMap.get(s.laneIndex)!.add(getBaseType(s.ingredient.type));

       let factor = 1.0;
       if(s.ingredient.type === IngredientType.ONION) factor = 0.5;
       if(s.ingredient.type === IngredientType.KING_ONION) factor = 0.3;
       if(s.ingredient.type === IngredientType.GOD_ONION) factor = 0.1;
       
       if (factor < 1.0) {
          const current = onionData.get(s.laneIndex) || 1.0;
          onionData.set(s.laneIndex, Math.min(current, factor));
       }
    });

    setSlots(currentSlots => {
      const newSlots = [...currentSlots];
      let projectilesToAdd: Projectile[] = [];
      const cloningRequests: { lane: number, type: IngredientType }[] = [];

      newSlots.forEach((slot, index) => {
        if (!slot.ingredient) return;
        const ing = slot.ingredient;
        const stats = INGREDIENT_STATS[ing.type];

        // --- Friendly Fire Implementation ---
        if (shouldFriendlyFire && stats.friendlyFire) {
            // Damage Left
            if (index > 0 && newSlots[index-1].laneIndex === slot.laneIndex && newSlots[index-1].ingredient) {
                newSlots[index-1].ingredient!.hp -= stats.friendlyFire;
                // Visual
                setFloatingTexts(prev => [...prev, {
                    id: Math.random().toString(),
                    x: (newSlots[index-1].slotIndex * SLOT_WIDTH_PERCENT) + 2,
                    y: (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT,
                    text: `-${stats.friendlyFire}`,
                    color: "#EF4444",
                    life: 0.5 
                }]);
            }
            // Damage Right
            if (index < newSlots.length - 1 && newSlots[index+1].laneIndex === slot.laneIndex && newSlots[index+1].ingredient) {
                newSlots[index+1].ingredient!.hp -= stats.friendlyFire;
                setFloatingTexts(prev => [...prev, {
                    id: Math.random().toString(),
                    x: (newSlots[index+1].slotIndex * SLOT_WIDTH_PERCENT) + 2,
                    y: (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT,
                    text: `-${stats.friendlyFire}`,
                    color: "#EF4444",
                    life: 0.5 
                }]);
            }
        }

        // Cleanup dead friends immediately
        if (ing.hp <= 0) {
            newSlots[index].ingredient = null;
            return;
        }

        // Check for Stunned State
        if (ing.stunnedUntil && ing.stunnedUntil > timestamp) {
           return; 
        }

        // --- Active Skills Check ---
        const hasSkill = (id: string) => ing.selectedSkills.includes(id);

        // --- COMBO BONUSES CALCULATION ---
        const laneTypes = laneIngredientsMap.get(slot.laneIndex);
        let comboSpeedMod = 1.0;
        let comboDmgMod = 1.0;
        let comboRangeMod = 1.0;

        if (laneTypes) {
            if (laneTypes.has('BEEF') && laneTypes.has('CHILI')) {
                comboSpeedMod = 0.85; 
            }
            if (laneTypes.has('BEEF') && laneTypes.has('SHRIMP')) {
                comboDmgMod = 1.2; 
            }
            if (laneTypes.has('CORN') && laneTypes.has('MUSHROOM')) {
                comboRangeMod = 1.15; 
            }
        }

        if ((hasSkill('GARLIC_REGEN') || hasSkill('GEN_HEALTH')) && Math.random() < 0.017) {
           if (ing.hp < ing.maxHp) {
              const healAmount = Math.max(1, Math.floor(ing.maxHp * 0.02)); 
              ing.hp = Math.min(ing.maxHp, ing.hp + healAmount);
              
              const x = slot.slotIndex * SLOT_WIDTH_PERCENT + 2 + (SLOT_WIDTH_PERCENT/2);
              const y = (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
              
              setFloatingTexts(prev => [...prev, {
                  id: Math.random().toString(),
                  x: x,
                  y: y - 5,
                  text: `+${healAmount}`,
                  color: "#4ADE80",
                  life: 0.8 
              }]);
           }
        }

        // --- Auto Level Up & Cloning Logic ---
        if (timestamp - ing.lastAutoLevelTime >= GAME_Config.AUTO_LEVEL_INTERVAL) {
           if (ing.level < GAME_Config.MAX_LEVEL) {
             ing.level += 1;
             ing.lastAutoLevelTime = timestamp;
             
             let hpMultiplier = 1.0;
             if (hasSkill('BEEF_TANK') || hasSkill('GEN_HEALTH') || hasSkill('HAZARD_OVERLOAD')) hpMultiplier = 1.3;

             const newMaxHp = Math.floor(stats.maxHp * (1 + (ing.level * 1.0)) * hpMultiplier); 
             ing.maxHp = newMaxHp;
             ing.hp = newMaxHp;

             if (ing.level % GAME_Config.SKILL_POINT_INTERVAL === 0) {
                ing.availableSkillPoints += 1;
             }
             
             cloningRequests.push({ lane: slot.laneIndex, type: ing.type });
             
             const x = slot.slotIndex * SLOT_WIDTH_PERCENT + 2 + (SLOT_WIDTH_PERCENT/2); 
             const y = (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
             spawnAutoUpgradeEffect(x, y);
             audioService.playAutoUpgrade(); 

             setFloatingTexts(prev => [...prev, {
                id: Math.random().toString(),
                x: x,
                y: y - 5,
                text: "AUTO UPGRADE!",
                color: "#3B82F6",
                life: 2.0 
              }]);
           }
        }

        // --- Attack Logic ---
        if (ing.type.includes('PINEAPPLE')) {
          const hasHiddenFury = hasSkill('PINEAPPLE_FURY');
          let isFurious = false;

          if (hasHiddenFury) {
             const left = newSlots[index - 1];
             const right = newSlots[index + 1];
             if (left?.ingredient && right?.ingredient && left.laneIndex === slot.laneIndex && right.laneIndex === slot.laneIndex) {
                 const lType = left.ingredient.type;
                 const rType = right.ingredient.type;
                 if ((lType.includes('BEEF') && rType.includes('SAUSAGE')) || (lType.includes('SAUSAGE') && rType.includes('BEEF'))) {
                     isFurious = true;
                 }
             }
          }

          if (timestamp - ing.lastAttackTime >= stats.attackSpeed) {
             ing.lastAttackTime = timestamp;
             
             if (!isFurious) {
                let amount = 15;
                if (ing.type === IngredientType.KING_PINEAPPLE) amount = 40;
                if (ing.type === IngredientType.GOD_PINEAPPLE) amount = 100;
                if (ing.type === IngredientType.SUPREME_PINEAPPLE) amount = 300;

                moneyGained += amount;
                justAttackedIds.add(ing.id);
                audioService.playAttack(IngredientType.PINEAPPLE);

                const x = slot.slotIndex * SLOT_WIDTH_PERCENT + 2 + (SLOT_WIDTH_PERCENT/2);
                const y = (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
                setFloatingTexts(prev => [...prev, {
                  id: Math.random().toString(),
                  x: x,
                  y: y - 5,
                  text: `+$${amount}`,
                  color: "#FACC15",
                  life: 1.5 
                }]);
             } 
          }

          if (isFurious) {
              const furyAttackSpeed = 200; 
              if (timestamp - (ing.lastAttackTime - 100) >= furyAttackSpeed) {
                 const currentSpeed = isFurious ? furyAttackSpeed : stats.attackSpeed;
                 if (timestamp - ing.lastAttackTime >= currentSpeed) {
                     ing.lastAttackTime = timestamp;
                     
                     if (isFurious) {
                         justAttackedIds.add(ing.id);
                         audioService.playAttack(IngredientType.CHILI); 
                         
                         const dmg = 50 * (1 + (ing.level * 0.2));
                         
                         projectilesToAdd.push({
                           id: Math.random().toString(),
                           laneIndex: slot.laneIndex,
                           x: (slot.slotIndex * SLOT_WIDTH_PERCENT) + (SLOT_WIDTH_PERCENT / 2),
                           speed: 0.6,
                           damage: dmg,
                           visualType: IngredientType.PINEAPPLE, 
                           pierce: 0,
                           hitIds: [],
                           isCrit: true 
                         });
                     } else {
                         let amount = 15;
                         if (ing.type === IngredientType.KING_PINEAPPLE) amount = 40;
                         if (ing.type === IngredientType.GOD_PINEAPPLE) amount = 100;
                         if (ing.type === IngredientType.SUPREME_PINEAPPLE) amount = 300;
                         moneyGained += amount;
                         
                         const x = slot.slotIndex * SLOT_WIDTH_PERCENT + 2 + (SLOT_WIDTH_PERCENT/2);
                         const y = (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
                         setFloatingTexts(prev => [...prev, {
                            id: Math.random().toString(),
                            x: x,
                            y: y - 5,
                            text: `+$${amount}`,
                            color: "#FACC15",
                            life: 1.5 
                         }]);
                     }
                 }
                 return;
              }
          } else {
             return;
          }
        }

        // Marshmallow Family
        if ([IngredientType.MARSHMALLOW, IngredientType.KING_MARSHMALLOW, IngredientType.GOD_MARSHMALLOW, IngredientType.SUPREME_MARSHMALLOW].includes(ing.type)) {
          if (timestamp - ing.lastAttackTime >= stats.attackSpeed) {
             ing.lastAttackTime = timestamp;
             justAttackedIds.add(ing.id);
             audioService.playAttack(IngredientType.MARSHMALLOW);
             
             let healAmount = 20;
             if(ing.type === IngredientType.KING_MARSHMALLOW) healAmount = 50;
             if(ing.type === IngredientType.GOD_MARSHMALLOW) healAmount = 150;
             if(ing.type === IngredientType.SUPREME_MARSHMALLOW) healAmount = 500;

             newSlots.forEach(s => {
               if(s.ingredient && s.ingredient.hp < s.ingredient.maxHp) {
                 s.ingredient.hp = Math.min(s.ingredient.maxHp, s.ingredient.hp + healAmount);
               }
             });
          }
          return;
        }

        // Passive tanks
        const isPassiveTank = stats.damage === 0 && !ing.type.includes('SQUID'); 
        const isReflect = ing.type.includes('GREEN_PEPPER');
        if (isPassiveTank || isReflect) return;

        let cooldownMultiplier = 1.0;
        if (slot.laneIndex % 5 === 0 || slot.laneIndex % 5 === 3) cooldownMultiplier = 0.6; // Rapid
        
        const left = newSlots[index - 1];
        const right = newSlots[index + 1];
        
        const checkChicken = (neighbor: Slot | undefined) => {
           if (!neighbor || !neighbor.ingredient || neighbor.laneIndex !== slot.laneIndex) return 1.0;
           if (neighbor.ingredient.type === IngredientType.CHICKEN) return 0.7;
           if (neighbor.ingredient.type === IngredientType.KING_CHICKEN) return 0.6;
           if (neighbor.ingredient.type === IngredientType.GOD_CHICKEN) return 0.4;
           if (neighbor.ingredient.type === IngredientType.SUPREME_CHICKEN) return 0.2;
           return 1.0;
        };

        cooldownMultiplier *= checkChicken(left);
        cooldownMultiplier *= checkChicken(right);
        cooldownMultiplier *= comboSpeedMod;

        if (hasSkill('GEN_RELOAD')) cooldownMultiplier *= 0.85;
        if (hasSkill('SUP_EFFICIENCY')) cooldownMultiplier *= 0.90;
        if (hasSkill('BEEF_RAGE') && ing.hp < (ing.maxHp * 0.5)) {
           cooldownMultiplier *= 0.5;
        }

        const effectiveAttackSpeed = stats.attackSpeed * cooldownMultiplier / (Math.pow(0.9, ing.level - 1));

        if (timestamp - ing.lastAttackTime >= effectiveAttackSpeed) {
           const rangePercent = slot.slotIndex * SLOT_WIDTH_PERCENT;
           const rangeBonus = (hasSkill('GEN_SCOPE') ? 20 : 0);
           const effectiveRange = (rangePercent + 25 + rangeBonus) * comboRangeMod; 

           const enemyInLane = enemies.some(e => e.laneIndex === slot.laneIndex && e.x > rangePercent);
           const enemyClose = enemies.some(e => e.laneIndex === slot.laneIndex && e.x < effectiveRange && e.x > rangePercent);
           const isSquid = ing.type.includes('SQUID');
           const isDangerousMelee = ing.type === IngredientType.D_SEA_URCHIN || ing.type === IngredientType.D_KING_CRAB || ing.type === IngredientType.D_AGED_BEEF;

           if (enemyInLane || ((isSquid || isDangerousMelee) && enemyClose)) {
             ing.lastAttackTime = timestamp;
             const baseDmg = stats.damage;
             let dmg = baseDmg * (1 + (ing.level * 0.5));
             
             dmg *= comboDmgMod;
             if (hasSkill('HAZARD_OVERLOAD')) dmg *= 1.4;
             if (hasSkill('SUPREME_OVERLOAD') && Math.random() < 0.3) dmg *= 3; // Supreme skill

             if (slot.laneIndex % 5 === 2 || slot.laneIndex % 5 === 4) dmg = dmg * 1.5;

             let isCrit = false;
             if (hasSkill('BEEF_CRIT') && Math.random() < 0.15) {
                dmg *= 2;
                isCrit = true;
                const x = slot.slotIndex * SLOT_WIDTH_PERCENT + 2 + (SLOT_WIDTH_PERCENT/2);
                const y = (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
                setFloatingTexts(prev => [...prev, {
                  id: Math.random().toString(),
                  x: x,
                  y: y - 5,
                  text: "CRIT!",
                  color: "#EF4444",
                  life: 1.0 
                }]);
             }

             justAttackedIds.add(ing.id);
             audioService.playAttack(ing.type);
             
             const px = slot.slotIndex * SLOT_WIDTH_PERCENT + 2 + (SLOT_WIDTH_PERCENT/2);
             const py = (slot.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT;
             spawnAttackParticles(px, py, ing.type);

             if (ing.type === IngredientType.KING_BEEF && hasSkill('KING_BEEF_SHOCKWAVE') && Math.random() < 0.2) {
                setParticles(prev => [...prev, {
                   id: Math.random().toString(),
                   x: px, 
                   y: py,
                   vx: 0,
                   vy: 0,
                   life: 1.0,
                   color: '#FACC15', 
                   size: 30, 
                   shape: 'ring'
                }]);
                
                setIsDamaged(true);
                setTimeout(() => setIsDamaged(false), 200);

                setFloatingTexts(prev => [...prev, {
                   id: Math.random().toString(),
                   x: px,
                   y: py - 10,
                   text: "GOLDEN TREMOR!",
                   color: "#FACC15",
                   life: 2.0 
                }]);

                setEnemies(prev => prev.map(e => {
                   if (e.laneIndex === slot.laneIndex && e.x > 0) { 
                      return {
                         ...e,
                         hp: e.hp - (dmg * 2.5),
                         x: Math.max(0, e.x + 30) 
                      };
                   }
                   return e;
                }));
             }

             if (isSquid || isDangerousMelee) {
                setEnemies(prev => prev.map(e => {
                  if (e.laneIndex === slot.laneIndex && e.x < effectiveRange && e.x > rangePercent) {
                    return { ...e, hp: e.hp - dmg };
                  }
                  return e;
                }));
                return;
             }

             let projectileCount = 1;
             if (hasSkill('CHILI_DOUBLE') && Math.random() < 0.2) {
                projectileCount = 2;
             }

             const fireProjectile = (offset: number = 0) => {
                if (ing.type.includes('CORN')) {
                   // Supreme Corn shoots more pellets
                   const pelletCount = ing.type.includes('SUPREME') ? 5 : 3;
                   const startAngle = pelletCount === 5 ? -2 : -1;
                   
                   for(let i=startAngle; i<=Math.abs(startAngle); i++) {
                     projectilesToAdd.push({
                       id: Math.random().toString(),
                       laneIndex: slot.laneIndex,
                       x: (slot.slotIndex * SLOT_WIDTH_PERCENT) + (SLOT_WIDTH_PERCENT / 2),
                       speed: 0.25,
                       damage: dmg,
                       visualType: ing.type,
                       pierce: 0,
                       hitIds: [],
                       isCrit
                     });
                   }
                 } else {
                    let projSpeed = 0.25;
                    if (ing.type.includes('CHILI')) projSpeed = 0.5;
                    if (ing.type.includes('SAUSAGE')) projSpeed = 0.6;
                    if (ing.type === IngredientType.GOD_BEEF) projSpeed = 0.4;
                    // Dangerous Types Speed
                    if (ing.type.startsWith('D_')) projSpeed = 0.55; 
                    if (ing.type.startsWith('SUPREME_')) projSpeed = 0.65; // Faster supreme projectiles
    
                    let basePierce = ing.type.includes('SAUSAGE') || ing.type === IngredientType.GOD_CHILI || ing.type === IngredientType.D_GHOST_PEPPER || slot.laneIndex % 5 === 1 ? 100 : 0;
                    if (ing.type.startsWith('SUPREME_')) basePierce += 2; // Innate pierce for supreme
                    if (hasSkill('CHILI_PIERCE')) basePierce += 1;

                    const isSplash = ing.type.includes('MUSHROOM') || ing.type === IngredientType.GOD_BEEF || ing.type === IngredientType.D_DURIAN;
                    const knockback = ing.type.includes('SHRIMP') ? (ing.type.includes('GOD') || ing.type.includes('SUPREME') ? 15 : (ing.type.includes('KING') ? 10 : 5)) : 0;
    
                    projectilesToAdd.push({
                       id: Math.random().toString(),
                       laneIndex: slot.laneIndex,
                       x: (slot.slotIndex * SLOT_WIDTH_PERCENT) + (SLOT_WIDTH_PERCENT / 2) + offset,
                       speed: projSpeed,
                       damage: dmg,
                       visualType: ing.type,
                       pierce: basePierce, 
                       hitIds: [],
                       knockback: knockback,
                       isSplash: isSplash,
                       isCrit
                    });
                 }
             };

             for(let i=0; i<projectileCount; i++) {
                fireProjectile(i * 2);
             }
           }
        }
      });

      cloningRequests.forEach(req => {
         const emptySlots = newSlots.filter(s => s.laneIndex === req.lane && s.ingredient === null);
         if (emptySlots.length > 0) {
            const targetSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
            const baseStats = INGREDIENT_STATS[req.type];
            targetSlot.ingredient = {
               id: Math.random().toString(),
               type: req.type,
               level: 1, 
               lastAttackTime: timestamp,
               lastAutoLevelTime: timestamp,
               hp: baseStats.hp,
               maxHp: baseStats.maxHp,
               selectedSkills: [], 
               availableSkillPoints: 0 
            };
         }
      });
      
      if (projectilesToAdd.length > 0) {
        setProjectiles(prev => [...prev, ...projectilesToAdd]);
      }
      return newSlots;
    });

    if (moneyGained > 0) {
      setGameState(prev => ({ ...prev, money: prev.money + moneyGained }));
    }

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

    // 3. Projectiles
    setProjectiles(currentProjectiles => {
      const nextProjectiles: Projectile[] = [];
      const damageMap = new Map<string, {dmg: number, knockback: number}>(); 

      currentProjectiles.forEach(proj => {
        proj.x += proj.speed * updateRatio; 
        let hit = false;
        
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          
          if (enemy.type === EnemyType.GHOST_RAT && enemy.isPhasing) {
            continue;
          }

          let hitbox = 2; 
          if (proj.visualType.includes('SAUSAGE') || proj.visualType.includes('GOD') || proj.visualType.includes('SUPREME')) hitbox = 5;

          if (enemy.laneIndex === proj.laneIndex && 
              Math.abs(proj.x - enemy.x) < hitbox && 
              !proj.hitIds.includes(enemy.id)) {
            
            const current = damageMap.get(enemy.id) || {dmg: 0, knockback: 0};
            damageMap.set(enemy.id, {
              dmg: current.dmg + proj.damage,
              knockback: Math.max(current.knockback, proj.knockback || 0)
            });
            
            proj.hitIds.push(enemy.id);
            hit = true;
            
            if (proj.isSplash) {
               enemies.forEach(nearby => {
                 if (Math.abs(nearby.x - enemy.x) < 5 && Math.abs(nearby.laneIndex - enemy.laneIndex) <= 1) { 
                    if (nearby.id !== enemy.id) {
                       if (nearby.type === EnemyType.GHOST_RAT && nearby.isPhasing) return;
                       
                       const c = damageMap.get(nearby.id) || {dmg: 0, knockback: 0};
                       damageMap.set(nearby.id, { ...c, dmg: c.dmg + (proj.damage * 0.5) }); 
                    }
                 }
               });
            }

            if (proj.pierce <= 0) break;
          }
        }

        if (hit) {
           if (proj.pierce > 0) {
             proj.pierce -= 1;
             nextProjectiles.push(proj); 
           }
        } else if (proj.x < 110) { 
          nextProjectiles.push(proj); 
        }
      });

      if (damageMap.size > 0) {
        setEnemies(prev => prev.map(e => {
          const hitData = damageMap.get(e.id);
          if (hitData) {
            return { 
              ...e, 
              hp: e.hp - hitData.dmg,
              x: Math.min(100, e.x + hitData.knockback)
            };
          }
          return e;
        }));
      }

      return nextProjectiles;
    });

    // 4. Enemy Logic
    setEnemies(currentEnemies => {
      const nextEnemies: Enemy[] = []; 
      let moneyEarned = 0;
      let scoreEarned = 0;
      let playerDamageTotal = 0;
      let spawnedBabies: Enemy[] = [];
      const healEvents: {x: number, lane: number, amount: number}[] = [];

      const activeEnemies = currentEnemies.filter(e => e.hp > 0);
      
      activeEnemies.forEach(enemy => {
        const slotWidth = 100 / SLOTS_PER_LANE; 
        const enemySlotIndex = Math.floor(enemy.x / slotWidth);
        
        const slotInFront = slots.find(s => s.laneIndex === enemy.laneIndex && s.slotIndex === enemySlotIndex && s.ingredient !== null);

        const slowFactor = onionData.get(enemy.laneIndex) || 1.0;
        const currentSpeed = enemy.speed * slowFactor;
        enemy.slowed = slowFactor < 1.0;

        // --- ENEMY AI ---
        if (enemy.type === EnemyType.GHOST_RAT) {
            const phaseCycle = 4000;
            const timeInCycle = (timestamp + (enemy.phaseOffset || 0)) % phaseCycle;
            enemy.isPhasing = timeInCycle > 2000; 
        }

        if (enemy.type === EnemyType.HEALER_RAT) {
            if (!enemy.healCooldown || timestamp > enemy.healCooldown) {
                let healedCount = 0;
                activeEnemies.forEach(ally => {
                    if (ally.id !== enemy.id && ally.hp < ally.maxHp) {
                        const dist = Math.sqrt(Math.pow(ally.x - enemy.x, 2) + Math.pow(ally.laneIndex - enemy.laneIndex, 2) * 20); 
                        if (dist < 15) { 
                             ally.hp = Math.min(ally.maxHp, ally.hp + 20); 
                             healedCount++;
                        }
                    }
                });
                
                if (healedCount > 0) {
                     healEvents.push({ x: enemy.x, lane: enemy.laneIndex, amount: 20 });
                     enemy.healCooldown = timestamp + 2000;
                }
            }
        }

        if (enemy.type === EnemyType.SHAMAN_RAT) {
            const lookAheadRange = 8; 
            const targetSlot = slots.find(s => 
                 s.laneIndex === enemy.laneIndex && 
                 s.ingredient !== null && 
                 s.slotIndex * SLOT_WIDTH_PERCENT < enemy.x && 
                 s.slotIndex * SLOT_WIDTH_PERCENT > enemy.x - lookAheadRange
            );

            if (targetSlot && targetSlot.ingredient) {
                 enemy.isAttacking = true;
                 if (timestamp - enemy.lastAttackTime > enemy.attackSpeed) {
                    enemy.lastAttackTime = timestamp;
                    const stunDuration = 4000; 
                    
                    setSlots(prev => prev.map(s => {
                         if (s.id === targetSlot.id && s.ingredient) {
                             return {
                                 ...s,
                                 ingredient: {
                                     ...s.ingredient,
                                     stunnedUntil: timestamp + stunDuration
                                 }
                             };
                         }
                         return s;
                    }));

                    setFloatingTexts(prev => [...prev, {
                        id: Math.random().toString(),
                        x: enemy.x - 2,
                        y: (enemy.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT - 5,
                        text: "SILENCE!",
                        color: "#A78BFA",
                        life: 1.0 
                    }]);
                    
                    setParticles(prev => [...prev, {
                        id: Math.random().toString(),
                        x: targetSlot.slotIndex * SLOT_WIDTH_PERCENT + 2,
                        y: (enemy.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT,
                        vx: 0,
                        vy: 0,
                        life: 0.8,
                        color: "#8B5CF6",
                        size: 20,
                        shape: 'ring'
                    }]);
                 }
            } else {
                 enemy.isAttacking = false;
                 enemy.x -= currentSpeed * updateRatio; 
            }
        } else if (enemy.type === EnemyType.SUMMONER_RAT) {
             if (slotInFront && slotInFront.ingredient) {
                 enemy.isAttacking = true;
                 if (timestamp - enemy.lastAttackTime > enemy.attackSpeed) {
                     enemy.lastAttackTime = timestamp;
                     slotInFront.ingredient.hp -= enemy.damage;
                     setSlots(prev => prev.map(s => s.id === slotInFront.id ? { ...s, ingredient: { ...s.ingredient!, hp: Math.max(0, s.ingredient!.hp - enemy.damage) } } : s));
                     if (slotInFront.ingredient.hp <= enemy.damage) { 
                        setSlots(prev => prev.map(s => s.id === slotInFront.id ? { ...s, ingredient: null } : s));
                     }
                 }
             } else {
                 enemy.isAttacking = false;
                 enemy.x -= currentSpeed * updateRatio;
                 
                 if (Math.random() < 0.005) {
                    const babyStats = ENEMY_STATS[EnemyType.BABY_RAT];
                    spawnedBabies.push({
                      id: Math.random().toString(36).substr(2, 9),
                      type: EnemyType.BABY_RAT,
                      laneIndex: enemy.laneIndex,
                      x: enemy.x + 2, 
                      hp: babyStats.hp,
                      maxHp: babyStats.hp,
                      speed: babyStats.speed,
                      damage: babyStats.damage,
                      attackSpeed: 1000,
                      lastAttackTime: 0,
                      isAttacking: false
                    });
                    
                    setFloatingTexts(prev => [...prev, {
                        id: Math.random().toString(),
                        x: enemy.x,
                        y: (enemy.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT - 5,
                        text: "SUMMON!",
                        color: "#92400E",
                        life: 1.0 
                    }]);
                 }
             }
        } else {
            // STANDARD MELEE (Including BOSS)
            if (slotInFront && slotInFront.ingredient) {
              enemy.isAttacking = true;
              if (timestamp - enemy.lastAttackTime > enemy.attackSpeed) {
                 enemy.lastAttackTime = timestamp;
                 
                 let finalDamage = enemy.damage;

                 // BOSS Interaction: Instakill Dangerous Ingredients
                 if (enemy.type === EnemyType.BOSS_SUPER_RAT && slotInFront.ingredient.type.startsWith('D_')) {
                     finalDamage = 99999; // Instakill
                     setFloatingTexts(prev => [...prev, {
                        id: Math.random().toString(),
                        x: enemy.x,
                        y: (enemy.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT - 10,
                        text: "EATEN!",
                        color: "#EF4444",
                        life: 1.0 
                     }]);
                 }

                 // Reflect Logic
                 if (slotInFront.ingredient.type.includes('GREEN_PEPPER') || 
                     slotInFront.ingredient.selectedSkills.includes('GARLIC_THORNS') || 
                     slotInFront.ingredient.selectedSkills.includes('KING_BEEF_GOLD_SKIN')) {
                   let reflectDmg = 0;
                   if (slotInFront.ingredient.type.includes('GREEN_PEPPER')) {
                     reflectDmg = 15;
                     if(slotInFront.ingredient.type === IngredientType.KING_GREEN_PEPPER) reflectDmg = 40;
                     if(slotInFront.ingredient.type === IngredientType.GOD_GREEN_PEPPER) reflectDmg = 150;
                     if(slotInFront.ingredient.type === IngredientType.SUPREME_GREEN_PEPPER) reflectDmg = 300;
                   }
                   if (slotInFront.ingredient.selectedSkills.includes('GARLIC_THORNS')) {
                     reflectDmg += (finalDamage * 0.2);
                   }
                   
                   if (reflectDmg > 0) {
                     enemy.hp -= reflectDmg;
                     audioService.playReflect(); 
                   }
                 }

                 // Damage Reduction
                 let damageTaken = finalDamage;
                 if (slotInFront.ingredient.selectedSkills.includes('KING_BEEF_GOLD_SKIN')) {
                    damageTaken *= 0.8; 
                 }
                 
                 // Fix Logic: HP should decrease
                 const newHp = Math.max(0, slotInFront.ingredient.hp - damageTaken);
                 
                 setSlots(prev => prev.map(s => {
                     if (s.id === slotInFront.id) {
                         return newHp <= 0 ? { ...s, ingredient: null } : { ...s, ingredient: { ...s.ingredient!, hp: newHp } };
                     }
                     return s;
                 }));
              }
            } else {
              enemy.isAttacking = false;
              enemy.x -= currentSpeed * updateRatio;
            }
        }

        if (enemy.hp > 0) {
          if (enemy.x <= 0) {
            const damage = ENEMY_STATS[enemy.type].playerDamage;
            playerDamageTotal += damage;
          } else {
            nextEnemies.push(enemy);
          }
        } else {
           moneyEarned += ENEMY_STATS[enemy.type].money;
           scoreEarned += 100;
        }
      });
      
      spawnedBabies.forEach(b => nextEnemies.push(b));
      
      healEvents.forEach(evt => {
         setParticles(prev => [...prev, {
            id: Math.random().toString(),
            x: evt.x, 
            y: (evt.lane * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT,
            vx: 0,
            vy: -0.5,
            life: 0.8,
            color: '#22C55E',
            size: 25,
            shape: 'ring' 
         }]);
      });

      currentEnemies.forEach(e => {
         if (e.hp <= 0) {
           const reward = ENEMY_STATS[e.type].money;
           moneyEarned += reward;
           scoreEarned += 100;
           spawnDeathEffect(e.x, e.laneIndex);
           spawnCoin(e.x, e.laneIndex, reward); 
           audioService.playEnemyDeath();

           if (e.type === EnemyType.BOSS_SUPER_RAT) {
                // Boss Explosion
                spawnFirework(e.x, (e.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT);
                moneyEarned += 5000;
           }

           if (e.type === EnemyType.MAMA_RAT) {
              const babyStats = ENEMY_STATS[EnemyType.BABY_RAT];
              for(let k=0; k<2; k++) {
                  nextEnemies.push({
                      id: Math.random().toString(36).substr(2, 9),
                      type: EnemyType.BABY_RAT,
                      laneIndex: e.laneIndex,
                      x: e.x + (Math.random() * 5),
                      hp: babyStats.hp,
                      maxHp: babyStats.hp,
                      speed: babyStats.speed,
                      damage: babyStats.damage,
                      attackSpeed: 1000,
                      lastAttackTime: 0,
                      isAttacking: false
                  });
              }
           }

           if (e.type === EnemyType.BOMB_RAT) {
               setExplosions(prev => [...prev, { id: Math.random().toString(), x: e.x, lane: e.laneIndex }]);
               setTimeout(() => setExplosions(prev => prev.slice(1)), 500); 

               const explosionCenterSlotIndex = Math.floor(e.x / (100 / SLOTS_PER_LANE));
               setSlots(prevSlots => prevSlots.map(s => {
                   if (Math.abs(s.laneIndex - e.laneIndex) <= 1 && 
                       Math.abs(s.slotIndex - explosionCenterSlotIndex) <= 1 && 
                       s.ingredient) {
                       return {
                           ...s,
                           ingredient: {
                               ...s.ingredient,
                               hp: Math.max(0, s.ingredient.hp - 50) 
                           }
                       };
                   }
                   return s;
               }).map(s => s.ingredient && s.ingredient.hp === 0 ? {...s, ingredient: null} : s));
           }
        }
      });

      if (playerDamageTotal > 0) {
        setIsDamaged(true);
        audioService.playDamage();
        setTimeout(() => setIsDamaged(false), 300); 
        
        setGameState(prev => {
          const newHp = prev.hp - playerDamageTotal;
          if (newHp <= 0) {
             return { ...prev, hp: 0, status: GameStatus.REVIVE_OFFER };
          }
          return { ...prev, hp: newHp };
        });
      }

      if (moneyEarned > 0 || scoreEarned > 0) {
        setGameState(prev => {
          if (prev.status === GameStatus.GAME_OVER || prev.status === GameStatus.LEVEL_COMPLETE || prev.status === GameStatus.REVIVE_OFFER) return prev;
          return {
            ...prev,
            money: prev.money + moneyEarned,
            score: prev.score + scoreEarned,
            wave: 1 + Math.floor((prev.score + scoreEarned) / 500)
          };
        });
      }

      return nextEnemies;
    });

    animationFrameRef.current = requestAnimationFrame(updateGame);
  }, [gameState.status, gameState.wave, enemies, slots, spawnEnemy, setEnemies, setGameState, setProjectiles, setSlots, SLOTS_PER_LANE, LANE_HEIGHT_PERCENT, HALF_LANE_HEIGHT, SLOT_WIDTH_PERCENT]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateGame]);

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

  const getProjectileTrailColor = (type: string) => {
      if (type.startsWith('D_')) return 'from-red-600'; // Dangerous
      if (type.includes('SUPREME')) return 'from-cyan-400'; // Supreme
      if (type.includes('GOD')) return 'from-blue-400';
      if (type.includes('KING')) return 'from-yellow-400';
      if (type.includes('CHILI')) return 'from-red-400';
      if (type.includes('SAUSAGE')) return 'from-pink-500';
      if (type.includes('BEEF')) return 'from-orange-500';
      return 'from-white';
  };

  const lanes = Array.from({ length: LANES }, (_, i) => i);

  return (
    <div className={`relative w-full h-full bg-[#1a0505] overflow-hidden border-4 border-[#3d2b2b] rounded-xl shadow-2xl transition-all duration-100 
      ${isDamaged ? 'animate-shake border-red-600' : ''}
    `}>
      {/* Background - Coal & Fire */}
      <div className="absolute inset-0 z-0 bg-[#1a0505] overflow-hidden">
          <div className="absolute inset-0 opacity-40 animate-fire-glow"
               style={{
                  backgroundImage: 'radial-gradient(circle, #ef4444 2px, transparent 3px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0'
               }}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-orange-600/30 via-red-600/10 to-transparent pointer-events-none"></div>
      </div>

      {isDamaged && (
        <div className="absolute inset-0 z-50 pointer-events-none animate-damage bg-red-500/20 mix-blend-overlay"></div>
      )}

      <div className="absolute inset-0 opacity-30 pointer-events-none z-0" 
           style={{ backgroundImage: `linear-gradient(to bottom, transparent 95%, #000 95%), linear-gradient(to right, #333 2px, transparent 2px)`, backgroundSize: `100% ${LANE_HEIGHT_PERCENT}%, 50px 100%` }}>
      </div>

      {/* Skewer Handles (Left) & Lane Skills Info */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-[#1a1111] z-20 flex flex-col justify-around items-center border-r-4 border-[#3d2b2b] shadow-xl">
         {lanes.map(i => {
           const laneInfo = getLaneIcon(i);
           const activeCombos = laneCombos.get(i) || [];
           return (
             <div key={i} className="flex flex-col items-center gap-0.5 relative" style={{ height: `${LANE_HEIGHT_PERCENT}%`, justifyContent: 'center' }}>
               <div className="filter drop-shadow-lg text-orange-700">
                   <Utensils size={24} />
               </div>
               {laneInfo && (
                 <div className={`flex items-center gap-0.5 text-[8px] font-bold ${laneInfo.color} bg-black/50 px-1 py-0.5 rounded-full border border-white/10`}>
                   {laneInfo.icon} {laneInfo.label}
                 </div>
               )}
               {/* Combo Indicators */}
               {activeCombos.length > 0 && (
                   <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
                       {activeCombos.map(c => {
                           if (c === 'HAZARD_ZONE') return (
                               <div key={c} className="bg-purple-900/80 p-1 rounded-full border border-purple-500 shadow-md animate-pulse" title="危險區域: 友軍誤傷警告">
                                   <Radiation size={12} className="text-lime-400" />
                               </div>
                           );
                           if (c === 'SPICY_MEAT') return (
                               <div key={c} className="bg-red-900/80 p-1 rounded-full border border-red-500 shadow-md" title="麻辣鮮肉: 攻速 +15%">
                                   <Flame size={12} className="text-orange-400" />
                               </div>
                           );
                           if (c === 'SURF_TURF') return (
                               <div key={c} className="bg-blue-900/80 p-1 rounded-full border border-blue-500 shadow-md" title="海陸大餐: 傷害 +20%">
                                   <UtensilsCrossed size={12} className="text-yellow-400" />
                               </div>
                           );
                           if (c === 'VEGGIE_MIX') return (
                               <div key={c} className="bg-green-900/80 p-1 rounded-full border border-green-500 shadow-md" title="健康蔬食: 範圍 +15%">
                                   <Leaf size={12} className="text-green-300" />
                               </div>
                           );
                           return null;
                       })}
                   </div>
               )}
             </div>
           );
         })}
      </div>

      <div className="absolute inset-0 left-24 flex flex-col">
        {lanes.map((laneIndex) => (
          <div key={laneIndex} className="flex-1 relative border-b border-white/5 box-border group" style={{ height: `${LANE_HEIGHT_PERCENT}%` }}>
             <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-[#8B4513] -translate-y-1/2 shadow-inner"></div>

             {slots.filter(s => s.laneIndex === laneIndex).map((slot) => (
               <div
                 key={slot.id}
                 onClick={() => onSlotClick(slot.id)}
                 className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transform transition-all cursor-pointer z-10
                   ${selectedSlotId === slot.id ? 'ring-2 ring-yellow-400 scale-110 bg-white/10' : 'hover:scale-105 hover:bg-white/5'}
                   ${slot.ingredient ? '' : 'border border-dashed border-white/20'}
                 `}
                 style={{ 
                   left: `${slot.slotIndex * SLOT_WIDTH_PERCENT + 2}%`,
                   width: `${Math.min(32, 1000/SLOTS_PER_LANE)}px`, 
                   height: `${Math.min(32, 1000/SLOTS_PER_LANE)}px` 
                 }} 
               >
                 {slot.ingredient ? (
                   <div className="relative w-full h-full flex items-center justify-center">
                      <CuteIngredient 
                        type={slot.ingredient.type} 
                        isAttacking={attackingIngredients.has(slot.ingredient.id)}
                        level={slot.ingredient.level}
                        isStunned={slot.ingredient.stunnedUntil && slot.ingredient.stunnedUntil > Date.now()} 
                      />
                      
                      <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-900 rounded overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(slot.ingredient.hp / slot.ingredient.maxHp) * 100}%` }}></div>
                      </div>
                   </div>
                 ) : (
                   <span className="text-white/20 text-[6px] text-center font-bold">空位</span>
                 )}
               </div>
             ))}
          </div>
        ))}
      </div>

      {particles.map(p => {
        if (p.shape === 'magma-shockwave') {
            return (
               <div
                 key={p.id}
                 className="absolute pointer-events-none z-50 rounded-full"
                 style={{
                   left: `${p.x}%`,
                   top: `${p.y}%`,
                   width: `${p.size}px`,
                   height: `${p.size * 0.4}px`,
                   background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
                   opacity: p.life,
                   transform: 'translate(-50%, -50%)',
                   border: '2px solid rgba(255, 200, 100, 0.5)',
                   boxShadow: `0 0 20px ${p.color}`
                 }}
               />
            );
        }
        if (p.shape === 'spark') {
           return (
             <div 
               key={p.id}
               className="absolute pointer-events-none z-50 bg-white"
               style={{
                 left: `${p.x}%`,
                 top: `${p.y}%`,
                 width: `${p.size}px`,
                 height: `${p.size}px`,
                 backgroundColor: p.color,
                 opacity: p.life,
                 transform: 'translate(-50%, -50%) rotate(45deg)', 
                 boxShadow: `0 0 5px ${p.color}`
               }}
             />
           );
        }
        
        return (
          <div 
            key={p.id}
            className={`absolute pointer-events-none z-50 ${p.shape === 'ring' || p.shape === 'ripple' ? 'rounded-full border-2' : 'rounded-full shadow-lg'}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: (p.shape === 'ring' || p.shape === 'ripple' || p.shape === 'void-bubble') ? 'transparent' : p.color,
              borderColor: (p.shape === 'ring' || p.shape === 'ripple' || p.shape === 'void-bubble') ? p.color : 'transparent',
              borderWidth: (p.shape === 'void-bubble') ? '1px' : '2px',
              opacity: p.life,
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      })}

      {floatingTexts.map(t => (
        <div 
          key={t.id}
          className="absolute pointer-events-none z-50 font-black text-[8px] whitespace-nowrap"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            color: t.color,
            opacity: t.life,
            transform: 'translate(-50%, -50%)',
            textShadow: '0 1px 0 #000'
          }}
        >
          {t.text}
        </div>
      ))}

      {droppedCoins.map(c => (
        <div 
          key={c.id}
          className="absolute pointer-events-none z-40 flex items-center justify-center gap-1"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            opacity: c.life,
            transform: 'translate(-50%, -50%)',
          }}
        >
           <div style={{ transform: `rotateY(${c.rotation}deg)` }}>
             <Coins size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
           </div>
           <span className="text-[10px] font-bold text-yellow-300 drop-shadow-md">+${c.value}</span>
        </div>
      ))}

      {enemies.map(enemy => (
        <div 
          key={enemy.id}
          className={`absolute transition-transform duration-100 ease-linear z-30 w-12 h-12 pointer-events-none ${enemy.isPhasing ? 'opacity-40 filter blur-[1px]' : ''}`}
          style={{ 
            top: `${(enemy.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT}%`, 
            left: `${enemy.x}%`,
            transform: `translate(-50%, -50%) ${enemy.type === EnemyType.BOSS_SUPER_RAT ? 'scale(2.5)' : ''}`
          }}
        >
          <div className={`w-full h-full ${enemy.isAttacking ? 'animate-bounce' : ''} ${enemy.slowed ? 'filter hue-rotate-90 brightness-75 contrast-125' : ''}`}>
             <EnemyRenderer type={enemy.type} />
          </div>
          {enemy.slowed && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-purple-400 animate-pulse bg-black/50 px-0.5 rounded shadow">
               SLOW
            </div>
          )}
          {enemy.type === EnemyType.BOSS_SUPER_RAT && (
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-500 animate-pulse bg-black/80 px-2 rounded border border-red-500 whitespace-nowrap">
                ⚠ BOSS ⚠
             </div>
          )}
          <div className="w-8 h-1 bg-red-900 absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded overflow-hidden">
             <div className="h-full bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
          </div>
        </div>
      ))}

      {explosions.map(exp => (
        <div 
           key={exp.id}
           className="absolute z-50 pointer-events-none animate-ping"
           style={{ 
             top: `${(exp.lane * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT}%`, 
             left: `${exp.x}%`,
             transform: 'translate(-50%, -50%)',
             width: '60px',
             height: '60px'
           }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
               <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.5" />
               <circle cx="50" cy="50" r="20" fill="yellow" />
            </svg>
        </div>
      ))}

      {projectiles.map(proj => (
        <div
          key={proj.id}
          className="absolute z-20 w-4 h-4 rounded-full shadow-lg flex items-center justify-center pointer-events-none"
          style={{
            top: `${(proj.laneIndex * LANE_HEIGHT_PERCENT) + HALF_LANE_HEIGHT}%`,
            left: `${proj.x}%`,
            width: proj.visualType.includes('SAUSAGE') || proj.visualType.includes('GOD') ? '24px' : '16px', 
            transform: `translate(-50%, -50%) ${proj.isCrit ? 'scale(1.5)' : 'scale(1)'}`
          }}
        >
           {!proj.visualType.includes('SAUSAGE') && (
             <div className={`absolute right-1/2 w-12 h-full -z-10 bg-gradient-to-l to-transparent blur-sm rounded-full transform scale-y-75 origin-right ${getProjectileTrailColor(proj.visualType)} opacity-60`}></div>
           )}

           {proj.pierce > 0 && <div className="absolute w-6 h-1 bg-white blur-[1px] -z-10 animate-pulse"></div>}
           <ProjectileSVG type={proj.visualType} />
        </div>
      ))}

      <div className="absolute top-2 left-28 right-4 flex justify-between items-start pointer-events-none z-40">
         <div className="flex gap-2">
            <div className="bg-black/80 px-2 py-1 rounded-lg text-yellow-400 flex items-center gap-1 border border-yellow-600 shadow-lg">
              <Coins size={16} /> <span className="font-bold text-sm">{Math.floor(gameState.money)}</span>
            </div>
            <div className="bg-black/80 px-2 py-1 rounded-lg text-white flex items-center gap-1 border border-gray-600 shadow-lg">
              <Trophy size={16} /> <span className="font-bold text-sm">Score: {gameState.score}</span>
            </div>
         </div>
         
         <div className={`bg-black/80 px-2 py-1 rounded-lg flex items-center gap-1 border shadow-lg transition-colors duration-200
             ${isDamaged ? 'text-red-200 border-red-500 bg-red-900' : 'text-red-500 border-red-900'}
         `}>
             <Heart size={16} fill={isDamaged ? "#fff" : "#ef4444"} className={isDamaged ? "animate-ping" : ""} />
             <span className="font-bold text-sm">{gameState.hp}/{gameState.maxHp}</span>
         </div>
      </div>
      
      <div className="absolute bottom-2 right-4 bg-black/80 px-2 py-1 rounded-lg text-blue-300 font-bold border border-blue-900 pointer-events-none z-40 text-xs">
         WAVE {gameState.wave}
      </div>

    </div>
  );
};

export default GameCanvas;