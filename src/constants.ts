
import { IngredientType, IngredientStats, EnemyType, Skill } from './types';

export const GAME_Config = {
  FPS: 60,
  DEFAULT_LANES: 5, 
  DEFAULT_SLOTS_PER_LANE: 20, 
  PLAYER_MAX_HP: 20, 
  STARTING_MONEY: 1000, 
  LANE_LENGTH_PIXELS: 1000, 
  AUTO_LEVEL_INTERVAL: 30000, // 30 seconds
  MAX_LEVEL: 100,
  SKILL_POINT_INTERVAL: 5, 
  SKILL_RESET_COST: 500,
  MAX_HEAT: 100,
  HEAT_PER_KILL: 5,
  OVERHEAT_DURATION: 8000, // 8 seconds
  OVERHEAT_SPEED_BOOST: 0.5 // Multiplier (0.5 means 2x speed)
};

export const ENEMY_STATS: Record<EnemyType, { hp: number; speed: number; damage: number; money: number; playerDamage: number }> = {
  [EnemyType.RAT]: { hp: 40, speed: 0.08, damage: 10, money: 10, playerDamage: 1 },
  [EnemyType.NINJA_RAT]: { hp: 30, speed: 0.18, damage: 15, money: 20, playerDamage: 2 },
  [EnemyType.BOMB_RAT]: { hp: 80, speed: 0.05, damage: 50, money: 30, playerDamage: 5 }, // High player damage
  [EnemyType.MAMA_RAT]: { hp: 120, speed: 0.04, damage: 20, money: 40, playerDamage: 3 },
  [EnemyType.BABY_RAT]: { hp: 15, speed: 0.12, damage: 5, money: 5, playerDamage: 1 },
  [EnemyType.SHAMAN_RAT]: { hp: 50, speed: 0.05, damage: 0, money: 40, playerDamage: 2 }, // No damage, stuns
  [EnemyType.SUMMONER_RAT]: { hp: 90, speed: 0.03, damage: 10, money: 60, playerDamage: 3 },
  [EnemyType.GHOST_RAT]: { hp: 45, speed: 0.07, damage: 12, money: 45, playerDamage: 2 }, // Immune periodically
  [EnemyType.HEALER_RAT]: { hp: 70, speed: 0.04, damage: 5, money: 50, playerDamage: 2 }, // Heals others
  // BOSS
  [EnemyType.BOSS_SUPER_RAT]: { hp: 10000, speed: 0.02, damage: 9999, money: 1000, playerDamage: 20 }, // Instakills ingredients
};

export const INGREDIENT_STATS: Record<IngredientType, IngredientStats> = {
  // --- Original ---
  [IngredientType.BEEF]: { name: '厚切牛肉', description: '中等攻速，傷害可觀。', cost: 50, damage: 25, attackSpeed: 1200, hp: 100, maxHp: 100, range: 100 },
  [IngredientType.CHILI]: { name: '地獄辣椒', description: '極快攻速，低傷害。', cost: 75, damage: 8, attackSpeed: 400, hp: 60, maxHp: 60, range: 100 },
  [IngredientType.GARLIC]: { name: '鐵皮大蒜', description: '高血量盾牌，無法攻擊。', cost: 40, damage: 0, attackSpeed: 0, hp: 450, maxHp: 450, range: 0 },
  [IngredientType.CORN]: { name: '爆米花機', description: '散射三顆玉米粒。', cost: 90, damage: 15, attackSpeed: 1500, hp: 80, maxHp: 80, range: 60 },
  [IngredientType.SAUSAGE]: { name: '雷射香腸', description: '發射穿透攻擊。', cost: 120, damage: 18, attackSpeed: 1800, hp: 90, maxHp: 90, range: 100 },
  [IngredientType.MUSHROOM]: { name: '毒爆香菇', description: '造成範圍爆炸傷害。', cost: 110, damage: 30, attackSpeed: 2000, hp: 70, maxHp: 70, range: 100 },
  [IngredientType.ONION]: { name: '催淚洋蔥', description: '緩速同排敵人(50%)。', cost: 60, damage: 0, attackSpeed: 0, hp: 150, maxHp: 150, range: 0 },
  [IngredientType.GREEN_PEPPER]: { name: '反傷青椒', description: '反彈 15 點傷害。', cost: 250, damage: 15, attackSpeed: 0, hp: 350, maxHp: 350, range: 0 },
  [IngredientType.SHRIMP]: { name: '彈力鮮蝦', description: '擊退敵人。', cost: 100, damage: 12, attackSpeed: 1400, hp: 80, maxHp: 80, range: 100 },
  [IngredientType.CHICKEN]: { name: '啦啦雞腿', description: '加速相鄰食材(30%)。', cost: 130, damage: 0, attackSpeed: 0, hp: 120, maxHp: 120, range: 0 },
  [IngredientType.SQUID]: { name: '觸手魷魚', description: '近戰範圍攻擊。', cost: 140, damage: 50, attackSpeed: 1200, hp: 110, maxHp: 110, range: 20 },
  [IngredientType.PINEAPPLE]: { name: '披薩鳳梨', description: '每5秒生產 $15。', cost: 100, damage: 0, attackSpeed: 5000, hp: 60, maxHp: 60, range: 0 },
  [IngredientType.MARSHMALLOW]: { name: '治癒棉花糖', description: '治療受傷隊友。', cost: 95, damage: 0, attackSpeed: 4000, hp: 50, maxHp: 50, range: 0 },

  // --- King Series ---
  [IngredientType.KING_BEEF]: { name: '王者骰子牛', description: '【王者】黃金甲防護，火力升級。', cost: 150, damage: 65, attackSpeed: 1100, hp: 300, maxHp: 300, range: 100 },
  [IngredientType.KING_CHILI]: { name: '王者金椒', description: '【王者】黃金槍管，射速驚人。', cost: 200, damage: 20, attackSpeed: 300, hp: 150, maxHp: 150, range: 100 },
  [IngredientType.KING_GARLIC]: { name: '王者金蒜', description: '【王者】堅不可摧的黃金盾。', cost: 120, damage: 0, attackSpeed: 0, hp: 1200, maxHp: 1200, range: 0 },
  [IngredientType.KING_CORN]: { name: '王者金玉米', description: '【王者】發射黃金玉米粒，傷害更高。', cost: 230, damage: 40, attackSpeed: 1400, hp: 200, maxHp: 200, range: 60 },
  [IngredientType.KING_SAUSAGE]: { name: '王者熱狗', description: '【王者】更粗的雷射，貫穿一切。', cost: 300, damage: 45, attackSpeed: 1600, hp: 250, maxHp: 250, range: 100 },
  [IngredientType.KING_MUSHROOM]: { name: '王者松露', description: '【王者】昂貴的爆炸，範圍更廣。', cost: 280, damage: 75, attackSpeed: 1800, hp: 200, maxHp: 100, range: 100 },
  [IngredientType.KING_ONION]: { name: '王者紫洋蔥', description: '【王者】強烈氣味，緩速 70%。', cost: 160, damage: 0, attackSpeed: 0, hp: 400, maxHp: 400, range: 0 },
  [IngredientType.KING_GREEN_PEPPER]: { name: '王者翡翠椒', description: '【王者】反彈 40 點傷害。', cost: 600, damage: 40, attackSpeed: 0, hp: 900, maxHp: 900, range: 0 },
  [IngredientType.KING_SHRIMP]: { name: '王者龍蝦', description: '【王者】強大水壓，擊退距離加倍。', cost: 250, damage: 30, attackSpeed: 1300, hp: 220, maxHp: 220, range: 100 },
  [IngredientType.KING_CHICKEN]: { name: '王者火雞', description: '【王者】加速相鄰食材 40%。', cost: 350, damage: 0, attackSpeed: 0, hp: 300, maxHp: 300, range: 0 },
  [IngredientType.KING_SQUID]: { name: '王者大烏賊', description: '【王者】巨型觸手，橫掃千軍。', cost: 380, damage: 120, attackSpeed: 1100, hp: 300, maxHp: 300, range: 25 },
  [IngredientType.KING_PINEAPPLE]: { name: '王者金鑽鳳梨', description: '【王者】每 4 秒生產 $40。', cost: 300, damage: 0, attackSpeed: 4000, hp: 150, maxHp: 150, range: 0 },
  [IngredientType.KING_MARSHMALLOW]: { name: '王者夾心棉', description: '【王者】快速治療重傷隊友。', cost: 260, damage: 0, attackSpeed: 3000, hp: 150, maxHp: 150, range: 0 },

  // --- God Series (~6x stats, Divine/Cosmic Theme) ---
  [IngredientType.GOD_BEEF]: { name: '戰神·A5和牛', description: '【戰神】地獄業火，毀滅打擊。', cost: 600, damage: 200, attackSpeed: 900, hp: 1000, maxHp: 1000, range: 100 },
  [IngredientType.GOD_CHILI]: { name: '戰神·魔界鬼椒', description: '【戰神】超越物理極限的雷電連射。', cost: 650, damage: 45, attackSpeed: 150, hp: 400, maxHp: 400, range: 100 },
  [IngredientType.GOD_GARLIC]: { name: '戰神·聖光大蒜', description: '【戰神】神聖力場，近乎無敵。', cost: 500, damage: 0, attackSpeed: 0, hp: 3500, maxHp: 3500, range: 0 },
  [IngredientType.GOD_CORN]: { name: '戰神·太陽神玉米', description: '【戰神】如太陽耀斑般的散射轟炸。', cost: 700, damage: 120, attackSpeed: 1000, hp: 600, maxHp: 600, range: 80 },
  [IngredientType.GOD_SAUSAGE]: { name: '戰神·等離子熱狗', description: '【戰神】毀滅性光束，瞬間蒸發敵人。', cost: 800, damage: 150, attackSpeed: 1200, hp: 700, maxHp: 700, range: 100 },
  [IngredientType.GOD_MUSHROOM]: { name: '戰神·虛空蕈菇', description: '【戰神】召喚黑洞般的連鎖爆炸。', cost: 750, damage: 250, attackSpeed: 1500, hp: 600, maxHp: 600, range: 100 },
  [IngredientType.GOD_ONION]: { name: '戰神·絕望洋蔥', description: '【戰神】敵人陷入絕望，緩速 90%。', cost: 600, damage: 0, attackSpeed: 0, hp: 1500, maxHp: 1500, range: 0 },
  [IngredientType.GOD_GREEN_PEPPER]: { name: '戰神·荊棘魔椒', description: '【戰神】反彈 150 點真實傷害。', cost: 1200, damage: 150, attackSpeed: 0, hp: 3000, maxHp: 3000, range: 0 },
  [IngredientType.GOD_SHRIMP]: { name: '戰神·波塞頓蝦', description: '【戰神】召喚海嘯，擊退所有敵人。', cost: 700, damage: 100, attackSpeed: 1000, hp: 650, maxHp: 650, range: 100 },
  [IngredientType.GOD_CHICKEN]: { name: '戰神·鳳凰雞腿', description: '【戰神】浴火重生，加速相鄰食材 60%。', cost: 900, damage: 0, attackSpeed: 0, hp: 1000, maxHp: 1000, range: 0 },
  [IngredientType.GOD_SQUID]: { name: '戰神·克蘇魯魷魚', description: '【戰神】來自深淵的恐懼，瘋狂輸出。', cost: 950, damage: 400, attackSpeed: 800, hp: 900, maxHp: 900, range: 30 },
  [IngredientType.GOD_PINEAPPLE]: { name: '戰神·黃金國鳳梨', description: '【戰神】每 3 秒生產 $100。', cost: 800, damage: 0, attackSpeed: 3000, hp: 500, maxHp: 500, range: 0 },
  [IngredientType.GOD_MARSHMALLOW]: { name: '戰神·天使棉花糖', description: '【戰神】神聖之光，大幅治療全體。', cost: 750, damage: 0, attackSpeed: 2500, hp: 500, maxHp: 500, range: 0 },

  // --- Supreme Series (Delicious Extreme - ~10x stats / Utility) ---
  [IngredientType.SUPREME_BEEF]:         { name: '極致·熟成和牛', description: '【美味至極】每一口都是奢華。毀滅性的單體傷害。', cost: 1500, damage: 500, attackSpeed: 700, hp: 2000, maxHp: 2000, range: 100 },
  [IngredientType.SUPREME_CHILI]:        { name: '極致·鑽石辣椒', description: '【美味至極】如鑽石般堅硬且鋒利。超音速連射。', cost: 1600, damage: 100, attackSpeed: 80, hp: 800, maxHp: 800, range: 100 },
  [IngredientType.SUPREME_GARLIC]:       { name: '極致·黑鑽大蒜', description: '【美味至極】經過歲月沉澱的守護。絕對防禦。', cost: 1200, damage: 0, attackSpeed: 0, hp: 8000, maxHp: 8000, range: 0 },
  [IngredientType.SUPREME_CORN]:         { name: '極致·寶石玉米', description: '【美味至極】五彩斑斕的寶石雨。全畫面轟炸。', cost: 1800, damage: 300, attackSpeed: 800, hp: 1200, maxHp: 1200, range: 100 },
  [IngredientType.SUPREME_SAUSAGE]:      { name: '極致·伊比利臘腸', description: '【美味至極】頂級風味的光束。無視護甲與距離。', cost: 2000, damage: 400, attackSpeed: 1000, hp: 1500, maxHp: 1500, range: 100 },
  [IngredientType.SUPREME_MUSHROOM]:     { name: '極致·白鑽松露', description: '【美味至極】香氣引發核爆。極大範圍的奢華衝擊。', cost: 1900, damage: 600, attackSpeed: 1200, hp: 1200, maxHp: 1200, range: 100 },
  [IngredientType.SUPREME_ONION]:        { name: '極致·干蔥', description: '【美味至極】濃縮的精華。時間彷彿凍結(緩速95%)。', cost: 1500, damage: 0, attackSpeed: 0, hp: 3000, maxHp: 3000, range: 0 },
  [IngredientType.SUPREME_GREEN_PEPPER]: { name: '極致·有機彩椒', description: '【美味至極】天然無毒的反擊。反彈300%真實傷害。', cost: 2500, damage: 300, attackSpeed: 0, hp: 6000, maxHp: 6000, range: 0 },
  [IngredientType.SUPREME_SHRIMP]:       { name: '極致·藍鑽龍蝦', description: '【美味至極】海洋霸主的威壓。擊退全場敵人。', cost: 1800, damage: 250, attackSpeed: 800, hp: 1500, maxHp: 1500, range: 100 },
  [IngredientType.SUPREME_CHICKEN]:      { name: '極致·烏骨雞', description: '【美味至極】滋補聖品。相鄰食材攻速翻倍。', cost: 2200, damage: 0, attackSpeed: 0, hp: 2000, maxHp: 2000, range: 0 },
  [IngredientType.SUPREME_SQUID]:        { name: '極致·巨型章魚', description: '【美味至極】深海的擁抱。同時攻擊5個目標。', cost: 2400, damage: 800, attackSpeed: 600, hp: 2000, maxHp: 2000, range: 40 },
  [IngredientType.SUPREME_PINEAPPLE]:    { name: '極致·黃金鳳梨', description: '【美味至極】點石成金。每2秒生產 $300。', cost: 2000, damage: 0, attackSpeed: 2000, hp: 1000, maxHp: 1000, range: 0 },
  [IngredientType.SUPREME_MARSHMALLOW]:  { name: '極致·馬卡龍', description: '【美味至極】少女的酥胸。瞬間治癒全隊並無敵1秒。', cost: 2000, damage: 0, attackSpeed: 2000, hp: 1000, maxHp: 1000, range: 0 },

  // --- SPECIAL UNIQUE ---
  [IngredientType.SEASONING_CAPTAIN]:    { name: '調味料隊長', description: '【唯一】戰場指揮官。噴灑神秘香料，升級友軍或削減敵人一半生命。', cost: 9999, damage: 0, attackSpeed: 800, hp: 3000, maxHp: 3000, range: 0 },

  // --- Bonus Delicious Series (Friendly Synergy) ---
  [IngredientType.BONUS_MINI_BUN]:   { name: '煉乳小饅頭', description: '【美味加分】高速連射。若同排有極致食材，變身加特林。', cost: 400, damage: 20, attackSpeed: 300, hp: 300, maxHp: 300, range: 100 },
  [IngredientType.BONUS_SQUID_BALL]: { name: '澎湖花枝丸', description: '【美味加分】彈跳攻擊，一次打三個。', cost: 450, damage: 45, attackSpeed: 1000, hp: 400, maxHp: 400, range: 100 },
  [IngredientType.BONUS_PORK_BALL]:  { name: '新竹貢丸', description: '【美味加分】紮實的口感，附帶強力擊退。', cost: 500, damage: 60, attackSpeed: 1200, hp: 500, maxHp: 500, range: 100 },
  [IngredientType.BONUS_TEMPURA]:    { name: '基隆甜不辣', description: '【美味加分】發射三枚飛鏢。', cost: 480, damage: 35, attackSpeed: 900, hp: 450, maxHp: 450, range: 80 },
  [IngredientType.BONUS_RICE_CAKE]:  { name: '花生豬血糕', description: '【美味加分】厚實軟Q，超強肉盾。', cost: 420, damage: 0, attackSpeed: 0, hp: 2000, maxHp: 2000, range: 0 },
  [IngredientType.BONUS_TOFU_SKIN]:  { name: '酥炸豆皮', description: '【美味加分】酥脆的聲音，提升左右攻速 20%。', cost: 550, damage: 0, attackSpeed: 0, hp: 600, maxHp: 600, range: 0 },
  [IngredientType.BONUS_GREEN_BEAN]: { name: '鹽酥四季豆', description: '【美味加分】直線穿透攻擊。', cost: 460, damage: 40, attackSpeed: 1100, hp: 350, maxHp: 350, range: 100 },
  [IngredientType.BONUS_ENOKI]:      { name: '奶油金針菇', description: '【美味加分】難以咬斷，纏繞敵人造成緩速。', cost: 520, damage: 15, attackSpeed: 500, hp: 400, maxHp: 400, range: 100 },
  [IngredientType.BONUS_CLAM]:       { name: '酒蒸蛤蜊', description: '【美味加分】噴射高溫蒸氣，範圍傷害。', cost: 600, damage: 70, attackSpeed: 1500, hp: 500, maxHp: 500, range: 80 },
  [IngredientType.BONUS_BACON_ROLL]: { name: '金針培根捲', description: '【美味加分】油脂爆發，高單體傷害。', cost: 650, damage: 150, attackSpeed: 1300, hp: 550, maxHp: 550, range: 100 },
};

export const UPGRADE_MULTIPLIER = 1.5; 
export const STAT_MULTIPLIER = 1.2;

// --- Skill Tree Definitions ---
export const SKILL_TREE: Partial<Record<IngredientType, Skill[]>> = {
  // Generic fallback will be handled in UI, these are specific implementations
  [IngredientType.BEEF]: [
    { id: 'BEEF_CRIT', name: '致命一擊', description: '15% 機率造成雙倍傷害', unlockLevel: 5, tier: 1, cost: 1 },
    { id: 'BEEF_TANK', name: '鐵牛之軀', description: '最大生命值 +40%', unlockLevel: 5, tier: 1, cost: 1 },
    { id: 'BEEF_RAGE', name: '狂暴怒火', description: '生命低於 50% 時，攻速提升 50%', unlockLevel: 15, tier: 2, cost: 1 },
  ],
  [IngredientType.KING_BEEF]: [
    { id: 'KING_BEEF_GOLD_SKIN', name: '黃金甲', description: '減少 20% 受到的所有傷害', unlockLevel: 5, tier: 1, cost: 1 },
    { id: 'BEEF_CRIT', name: '致命一擊', description: '15% 機率造成雙倍傷害', unlockLevel: 5, tier: 1, cost: 1 },
    { id: 'KING_BEEF_SHOCKWAVE', name: '黃金震盪', description: '攻擊時 20% 機率對全排敵人造成 250% 傷害並擊退', unlockLevel: 10, tier: 2, cost: 2 },
  ],
  [IngredientType.CHILI]: [
    { id: 'CHILI_DOUBLE', name: '雙重連射', description: '20% 機率連射兩發子彈', unlockLevel: 5, tier: 1, cost: 1 },
    { id: 'CHILI_PIERCE', name: '穿甲彈頭', description: '子彈可額外穿透 1 個敵人', unlockLevel: 15, tier: 2, cost: 1 },
    { id: 'CHILI_BURN', name: '烈焰燃燒', description: '擊中時產生小範圍燃燒效果', unlockLevel: 15, tier: 2, cost: 1 },
  ],
  [IngredientType.GARLIC]: [
    { id: 'GARLIC_REGEN', name: '自我修復', description: '每秒回復 2% 最大生命', unlockLevel: 5, tier: 1, cost: 1 },
    { id: 'GARLIC_TAUNT', name: '嘲諷', description: '吸引附近敵人攻擊', unlockLevel: 10, tier: 2, cost: 2 },
    { id: 'GARLIC_THORNS', name: '荊棘護甲', description: '反彈 20% 近戰傷害', unlockLevel: 15, tier: 2, cost: 1 },
  ],
  [IngredientType.PINEAPPLE]: [
    { id: 'PINEAPPLE_FURY', name: '禁忌風味', description: '【隱藏】當左右相鄰分別是牛肉與香腸時，覺醒攻擊能力，攻速提升 500% 並發射披薩飛彈', unlockLevel: 20, tier: 3, cost: 3, hidden: true },
  ],
};

// Helper to get skills (including generics for types not explicitly defined above)
export const getSkillsForType = (type: IngredientType): Skill[] => {
  const specificSkills = SKILL_TREE[type];
  if (specificSkills) return specificSkills;

  // Supreme Series Fallback
  if (type.startsWith('SUPREME_') || type === IngredientType.SEASONING_CAPTAIN) {
      return [
         { id: 'SUPREME_AURA', name: '極致光環', description: '相鄰食材傷害 +20%', unlockLevel: 5, tier: 1, cost: 2 },
         { id: 'SUPREME_OVERLOAD', name: '美味爆發', description: '攻擊有 30% 機率造成 3倍 傷害', unlockLevel: 15, tier: 2, cost: 3 },
      ];
  }

  // Bonus Series Fallback
  if (type.startsWith('BONUS_')) {
      return [
         { id: 'BONUS_SYNERGY_UP', name: '美味加倍', description: '若與極致食材同排，額外提升 20% 傷害。', unlockLevel: 5, tier: 1, cost: 2 },
         { id: 'BONUS_DISCOUNT', name: '銅板美食', description: '升級費用減少 15%。', unlockLevel: 10, tier: 2, cost: 2 },
      ];
  }

  // Generic Shooters
  if (type.includes('SAUSAGE') || type.includes('CORN') || type.includes('MUSHROOM')) {
    return [
       { id: 'GEN_SCOPE', name: '鷹眼瞄準', description: '攻擊範圍 +20%', unlockLevel: 5, tier: 1, cost: 1 },
       { id: 'GEN_RELOAD', name: '快速裝填', description: '攻速 +15%', unlockLevel: 15, tier: 2, cost: 1 },
    ];
  }

  // Generic Tanks/Melee
  if (type.includes('SQUID') || type.includes('SHRIMP') || type.includes('GREEN_PEPPER') || type.includes('ONION')) {
    return [
       { id: 'GEN_HEALTH', name: '強健體魄', description: '最大生命 +30%', unlockLevel: 5, tier: 1, cost: 1 },
       { id: 'GEN_RECOVERY', name: '戰地急救', description: '每波結束回復 20% 生命', unlockLevel: 15, tier: 2, cost: 1 },
    ];
  }

  // Supports
  if (type.includes('PINEAPPLE') || type.includes('CHICKEN') || type.includes('MARSHMALLOW')) {
     return [
       { id: 'SUP_EFFICIENCY', name: '高效運轉', description: '技能冷卻時間 -10%', unlockLevel: 5, tier: 1, cost: 1 },
       { id: 'SUP_SURVIVAL', name: '求生本能', description: '最大生命 +50%', unlockLevel: 15, tier: 2, cost: 1 },
     ];
  }

  return [];
};
