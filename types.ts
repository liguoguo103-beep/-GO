
export enum GameStatus {
  LOADING = 'LOADING', // New state
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  PAUSED = 'PAUSED',
  REVIVE_OFFER = 'REVIVE_OFFER' // New: Player died, offering revive
}

export enum IngredientType {
  BEEF = 'BEEF',       
  CHILI = 'CHILI',     
  GARLIC = 'GARLIC',   
  CORN = 'CORN',       
  SAUSAGE = 'SAUSAGE', 
  MUSHROOM = 'MUSHROOM', 
  ONION = 'ONION',     
  GREEN_PEPPER = 'GREEN_PEPPER', 
  SHRIMP = 'SHRIMP',   
  CHICKEN = 'CHICKEN', 
  SQUID = 'SQUID',     
  PINEAPPLE = 'PINEAPPLE', 
  MARSHMALLOW = 'MARSHMALLOW', 

  // --- King Series ---
  KING_BEEF = 'KING_BEEF',
  KING_CHILI = 'KING_CHILI',
  KING_GARLIC = 'KING_GARLIC',
  KING_CORN = 'KING_CORN',
  KING_SAUSAGE = 'KING_SAUSAGE',
  KING_MUSHROOM = 'KING_MUSHROOM',
  KING_ONION = 'KING_ONION',
  KING_GREEN_PEPPER = 'KING_GREEN_PEPPER',
  KING_SHRIMP = 'KING_SHRIMP',
  KING_CHICKEN = 'KING_CHICKEN',
  KING_SQUID = 'KING_SQUID',
  KING_PINEAPPLE = 'KING_PINEAPPLE',
  KING_MARSHMALLOW = 'KING_MARSHMALLOW',

  // --- God Series ---
  GOD_BEEF = 'GOD_BEEF',
  GOD_CHILI = 'GOD_CHILI',
  GOD_GARLIC = 'GOD_GARLIC',
  GOD_CORN = 'GOD_CORN',
  GOD_SAUSAGE = 'GOD_SAUSAGE',
  GOD_MUSHROOM = 'GOD_MUSHROOM',
  GOD_ONION = 'GOD_ONION',
  GOD_GREEN_PEPPER = 'GOD_GREEN_PEPPER',
  GOD_SHRIMP = 'GOD_SHRIMP',
  GOD_CHICKEN = 'GOD_CHICKEN',
  GOD_SQUID = 'GOD_SQUID',
  GOD_PINEAPPLE = 'GOD_PINEAPPLE',
  GOD_MARSHMALLOW = 'GOD_MARSHMALLOW',

  // --- Supreme Series (Delicious Extreme) ---
  SUPREME_BEEF = 'SUPREME_BEEF',
  SUPREME_CHILI = 'SUPREME_CHILI',
  SUPREME_GARLIC = 'SUPREME_GARLIC',
  SUPREME_CORN = 'SUPREME_CORN',
  SUPREME_SAUSAGE = 'SUPREME_SAUSAGE',
  SUPREME_MUSHROOM = 'SUPREME_MUSHROOM',
  SUPREME_ONION = 'SUPREME_ONION',
  SUPREME_GREEN_PEPPER = 'SUPREME_GREEN_PEPPER',
  SUPREME_SHRIMP = 'SUPREME_SHRIMP',
  SUPREME_CHICKEN = 'SUPREME_CHICKEN',
  SUPREME_SQUID = 'SUPREME_SQUID',
  SUPREME_PINEAPPLE = 'SUPREME_PINEAPPLE',
  SUPREME_MARSHMALLOW = 'SUPREME_MARSHMALLOW',

  // --- Dangerous Series (Food Themed Hazards) ---
  D_GHOST_PEPPER = 'D_GHOST_PEPPER', // 魔鬼椒 (Was Uranium) - Radiates heat
  D_DURIAN = 'D_DURIAN',             // 榴槤 (Was TNT) - Explosion/Spikes
  D_SURSTROMMING = 'D_SURSTROMMING', // 鯡魚罐頭 (Was Acid Slime) - Bio/Gas
  D_VOLCANO_CAKE = 'D_VOLCANO_CAKE', // 岩漿蛋糕 (Was Lava Rock) - Heat/Reflect
  D_CENTURY_EGG = 'D_CENTURY_EGG',   // 千年皮蛋 (Was Void Orb) - Void/Dark
  D_SEA_URCHIN = 'D_SEA_URCHIN',     // 海膽 (Was Spike Ball) - Spikes
  D_BLUE_CHEESE = 'D_BLUE_CHEESE',   // 藍紋起司 (Was Bio Hazard) - Mold/Poison
  D_KING_CRAB = 'D_KING_CRAB',       // 帝王蟹鉗 (Was Chainsaw) - Melee
  D_NATTO = 'D_NATTO',               // 黏稠納豆 (Was Poison Ivy) - Slow/Sticky
  D_FUGU = 'D_FUGU',                 // 河豚 (Was Fugu Toxin) - Poison
  D_SPIRIT_WINE = 'D_SPIRIT_WINE',   // 高粱烈酒 (Was Ghost Fire) - Fire
  D_DRY_ICE = 'D_DRY_ICE',           // 乾冰生魚片 (Was Liquid Nitro) - Freeze
  D_EEL = 'D_EEL',                   // 烤電鰻 (Was Plasma Core) - Lightning
  D_FORTUNE_COOKIE = 'D_FORTUNE_COOKIE', // 厄運餅乾 (Was Cursed Doll) - Random
  D_AGED_BEEF = 'D_AGED_BEEF',       // 乾式熟成 (Was Rotten Flesh) - Rot
  D_FISH_BONE = 'D_FISH_BONE',       // 魚刺 (Was Glass Shard) - Sharp
  D_MOLASSES = 'D_MOLASSES',         // 濃稠糖蜜 (Was Mercury) - Slow/Heavy
  D_BURNT_FOOD = 'D_BURNT_FOOD',     // 黑暗料理 (Was Dark Matter) - Destruction
  D_MYSTERY_MEAT = 'D_MYSTERY_MEAT'  // 謎之肉 (Was Unknown X) - Random
}

export enum EnemyType {
  RAT = 'RAT',
  NINJA_RAT = 'NINJA_RAT',
  BOMB_RAT = 'BOMB_RAT', 
  MAMA_RAT = 'MAMA_RAT', 
  BABY_RAT = 'BABY_RAT',
  SHAMAN_RAT = 'SHAMAN_RAT', 
  SUMMONER_RAT = 'SUMMONER_RAT',
  GHOST_RAT = 'GHOST_RAT',   
  HEALER_RAT = 'HEALER_RAT',
  BOSS_SUPER_RAT = 'BOSS_SUPER_RAT' // The Counter to Dangerous ingredients
}

export interface IngredientStats {
  damage: number;
  attackSpeed: number; // ms per attack
  hp: number;
  maxHp: number;
  range: number;
  cost: number;
  name: string;
  description: string;
  friendlyFire?: number; // Damage per second to neighbors
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  unlockLevel: number; // Level required to unlock
  tier: number; // 1, 2, 3... used for UI grouping
  cost: number; // Skill Points cost
  icon?: string;
  hidden?: boolean; // New: If true, logic might hide it until unlocked
}

export interface Ingredient {
  id: string;
  type: IngredientType;
  level: number;
  lastAttackTime: number;
  lastAutoLevelTime: number; // For auto-leveling every 60s
  hp: number;
  maxHp: number;
  selectedSkills: string[]; // List of Skill IDs that are active
  availableSkillPoints: number; // Unspent skill points
  stunnedUntil?: number; // If set and > currentTime, ingredient cannot attack
}

export interface Slot {
  id: string;
  laneIndex: number;
  slotIndex: number; // 0 is closest to handle, 4 is tip
  ingredient: Ingredient | null;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  laneIndex: number;
  x: number; // 0 to 100 percentage of lane
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackSpeed: number;
  lastAttackTime: number;
  isAttacking: boolean;
  // Status effects
  slowed?: boolean;
  // Ghost Rat specific
  isPhasing?: boolean; 
  phaseOffset?: number; // To desync ghosts
  // Healer Rat specific
  healCooldown?: number;
}

export interface Projectile {
  id: string;
  laneIndex: number;
  x: number;
  damage: number;
  speed: number;
  visualType: IngredientType;
  pierce: number; // Number of enemies it can hit before disappearing
  hitIds: string[]; // Track which enemies have been hit
  knockback?: number; // Distance to push back
  isSplash?: boolean; // Does it explode on impact?
  isCrit?: boolean; // Visual effect for crit
}

export interface MapConfig {
  lanes: number;
  slotsPerLane: number;
}

export interface GameState {
  status: GameStatus;
  money: number;
  score: number;
  wave: number;
  hp: number; // Player HP (skewers integrity)
  maxHp: number;
  mapConfig: MapConfig; // Added map config
}
