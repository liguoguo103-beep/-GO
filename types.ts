
export enum GameStatus {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  PAUSED = 'PAUSED',
  REVIVE_OFFER = 'REVIVE_OFFER'
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

  // --- SPECIAL UNIQUE ---
  SEASONING_CAPTAIN = 'SEASONING_CAPTAIN', // 調味料隊長

  // --- Bonus Delicious Series (Friendly Synergy) ---
  BONUS_MINI_BUN = 'BONUS_MINI_BUN',       // 小饅頭 (Rapid Fire)
  BONUS_SQUID_BALL = 'BONUS_SQUID_BALL',   // 花枝丸 (Bounce)
  BONUS_PORK_BALL = 'BONUS_PORK_BALL',     // 貢丸 (Knockback)
  BONUS_TEMPURA = 'BONUS_TEMPURA',         // 甜不辣 (Spread)
  BONUS_RICE_CAKE = 'BONUS_RICE_CAKE',     // 豬血糕 (Tank)
  BONUS_TOFU_SKIN = 'BONUS_TOFU_SKIN',     // 豆皮 (Buff)
  BONUS_GREEN_BEAN = 'BONUS_GREEN_BEAN',   // 四季豆 (Pierce)
  BONUS_ENOKI = 'BONUS_ENOKI',             // 金針菇 (Slow/Tangle)
  BONUS_CLAM = 'BONUS_CLAM',               // 蛤蜊 (Splash)
  BONUS_BACON_ROLL = 'BONUS_BACON_ROLL'    // 培根捲 (High Damage)
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
  BOSS_SUPER_RAT = 'BOSS_SUPER_RAT'
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
  // friendlyFire removed
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  unlockLevel: number; 
  tier: number; 
  cost: number; 
  icon?: string;
  hidden?: boolean; 
}

export interface Ingredient {
  id: string;
  type: IngredientType;
  level: number;
  lastAttackTime: number;
  lastAutoLevelTime: number; 
  hp: number;
  maxHp: number;
  selectedSkills: string[]; 
  availableSkillPoints: number; 
  stunnedUntil?: number; 
}

export interface Slot {
  id: string;
  laneIndex: number;
  slotIndex: number; 
  ingredient: Ingredient | null;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  laneIndex: number;
  x: number; 
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackSpeed: number;
  lastAttackTime: number;
  isAttacking: boolean;
  slowed?: boolean;
  isPhasing?: boolean; 
  phaseOffset?: number; 
  healCooldown?: number;
  lastHitTime?: number; // For visual red flash
}

export interface Projectile {
  id: string;
  laneIndex: number;
  x: number;
  damage: number;
  speed: number;
  visualType: IngredientType;
  pierce: number; 
  hitIds: string[]; 
  knockback?: number; 
  isSplash?: boolean; 
  isCrit?: boolean; 
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
  hp: number;
  maxHp: number;
  heat: number; // 0 - 100
  isOverheated: boolean;
  overheatEndTime: number;
  mapConfig: MapConfig;
}
