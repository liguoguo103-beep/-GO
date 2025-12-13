
import React, { useState } from 'react';
import { IngredientType, Slot, GameState, Ingredient, Skill } from '../types';
import { INGREDIENT_STATS, UPGRADE_MULTIPLIER, STAT_MULTIPLIER, getSkillsForType, GAME_Config } from '../constants';
import { getChefAdvice } from '../services/geminiService';
import { ChefHat, Info, X, Zap, Utensils, ShoppingBag, Sprout, Lock, Check, RotateCcw, Radiation, Gem } from 'lucide-react';
import { IngredientRenderer } from './GameAssets';
import { audioService } from '../services/audioService';

interface UpgradeMenuProps {
  selectedSlot: Slot | undefined;
  gameState: GameState;
  onBuy: (type: IngredientType) => void;
  onUpgrade: () => void;
  onSell: () => void;
  onClose: () => void;
  onSelectSkill: (slotId: string, skillId: string) => void;
  onResetSkills: (slotId: string) => void;
}

const UpgradeMenu: React.FC<UpgradeMenuProps> = ({ selectedSlot, gameState, onBuy, onUpgrade, onSell, onClose, onSelectSkill, onResetSkills }) => {
  const [chefMessage, setChefMessage] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'BASIC' | 'KING' | 'GOD' | 'SUPREME' | 'DANGEROUS'>('ALL');
  const [viewMode, setViewMode] = useState<'STATS' | 'SKILLS'>('STATS');
  const [justUnlockedSkillId, setJustUnlockedSkillId] = useState<string | null>(null);

  if (!selectedSlot) return null;

  const handleAskChef = async () => {
    setLoadingAdvice(true);
    setChefMessage("主廚正在思考...");
    const advice = await getChefAdvice(gameState, !!selectedSlot.ingredient);
    setChefMessage(advice);
    setLoadingAdvice(false);
  };

  const currentIngredient = selectedSlot.ingredient;

  // Render Buy Options
  const renderShop = () => {
    // Filter logic to help user find items
    const allTypes = Object.values(IngredientType);
    const filteredTypes = allTypes.filter(type => {
      const isKing = type.includes('KING_');
      const isGod = type.includes('GOD_');
      const isSupreme = type.includes('SUPREME_');
      const isDangerous = type.startsWith('D_');

      if (filter === 'BASIC') return !isKing && !isGod && !isSupreme && !isDangerous;
      if (filter === 'KING') return isKing;
      if (filter === 'GOD') return isGod;
      if (filter === 'SUPREME') return isSupreme;
      if (filter === 'DANGEROUS') return isDangerous;
      return true;
    });

    return (
      <div className="flex flex-col h-full">
         {/* Filter Tabs */}
         <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              全部
            </button>
            <button 
              onClick={() => setFilter('BASIC')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'BASIC' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              基礎
            </button>
            <button 
              onClick={() => setFilter('KING')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'KING' ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.4)]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              王者
            </button>
            <button 
              onClick={() => setFilter('GOD')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'GOD' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.6)]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              戰神
            </button>
            <button 
              onClick={() => setFilter('SUPREME')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${filter === 'SUPREME' ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <Gem size={12} /> 美味至極
            </button>
            <button 
              onClick={() => setFilter('DANGEROUS')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${filter === 'DANGEROUS' ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.6)]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <Radiation size={12} /> 危險
            </button>
         </div>

         {/* Scrollable Grid */}
         <div className="flex-1 overflow-y-auto pr-2 min-h-[250px] max-h-[300px]">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredTypes.map((type) => {
                const stats = INGREDIENT_STATS[type];
                const canAfford = gameState.money >= stats.cost;
                const isGod = type.includes('GOD_');
                const isKing = type.includes('KING_');
                const isSupreme = type.includes('SUPREME_');
                const isDangerous = type.startsWith('D_');

                return (
                  <button
                    key={type}
                    onClick={() => canAfford && onBuy(type)}
                    disabled={!canAfford}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group
                      ${canAfford 
                        ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-yellow-500' 
                        : 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'}
                      ${isGod ? 'border-red-900/50 bg-red-950/20' : ''}
                      ${isKing ? 'border-yellow-900/50 bg-yellow-950/20' : ''}
                      ${isSupreme ? 'border-cyan-900/50 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : ''}
                      ${isDangerous ? 'border-purple-900/50 bg-purple-950/20' : ''}
                    `}
                  >
                    <div className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform">
                        <IngredientRenderer type={type} />
                    </div>
                    <div className={`font-bold text-sm text-center leading-tight mb-1 
                       ${isGod ? 'text-red-400' : 
                         (isKing ? 'text-yellow-400' : 
                           (isSupreme ? 'text-cyan-300' :
                             (isDangerous ? 'text-purple-400' : 'text-white')))}`}>
                      {stats.name}
                    </div>
                    <div className="text-yellow-500 font-mono text-xs">${stats.cost}</div>
                    
                    {isDangerous && stats.friendlyFire && (
                        <div className="absolute top-1 right-1 bg-red-600/80 text-[8px] px-1 rounded text-white font-bold">
                            誤傷
                        </div>
                    )}
                  </button>
                );
              })}
            </div>
         </div>
      </div>
    );
  };

  const renderSkillTree = (ingredient: Ingredient) => {
    const skills = getSkillsForType(ingredient.type);
    
    // Group skills by tier
    const tiers = [1, 2, 3];
    
    return (
      <div className="flex flex-col h-full relative">
         {/* Header Info */}
         <div className="flex justify-between items-center mb-4 bg-black/20 p-2 rounded">
            <div>
               <h3 className="text-yellow-400 font-bold text-lg">天賦技能樹</h3>
               <p className="text-gray-400 text-xs">每 5 級獲得 1 點技能點。</p>
            </div>
            <div className="text-right">
               <div className="text-xs text-gray-400">可用點數</div>
               <div className="text-2xl font-bold text-blue-400">{ingredient.availableSkillPoints} SP</div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-16">
            {skills.length === 0 && (
              <div className="text-center text-gray-500 mt-10">此食材暫無特殊技能樹。</div>
            )}

            {tiers.map(tier => {
                // Filter logic: If a skill is "hidden" and ingredient level < unlockLevel, don't show it at all.
                const tierSkills = skills.filter(s => {
                   if (s.tier !== tier) return false;
                   if (s.hidden && ingredient.level < s.unlockLevel) return false; // Hide completely
                   return true;
                });
                
                if (tierSkills.length === 0) return null;

                const isTierUnlocked = ingredient.level >= tierSkills[0].unlockLevel;

                return (
                  <div key={tier} className="mb-6 relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`text-xs font-bold px-2 py-0.5 rounded ${isTierUnlocked ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
                          Tier {tier} (Lv.{tierSkills[0].unlockLevel})
                        </div>
                        {!isTierUnlocked && <Lock size={12} className="text-gray-500" />}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {tierSkills.map(skill => {
                          const isSelected = ingredient.selectedSkills.includes(skill.id);
                          const canAfford = ingredient.availableSkillPoints >= skill.cost;
                          const canBuy = isTierUnlocked && canAfford && !isSelected;
                          
                          // Check if this skill was just unlocked to apply animation
                          const isAnimating = justUnlockedSkillId === skill.id;

                          return (
                            <button
                              key={skill.id}
                              onClick={() => {
                                if (canBuy) {
                                  audioService.playSkillUnlock();
                                  setJustUnlockedSkillId(skill.id);
                                  setTimeout(() => setJustUnlockedSkillId(null), 500); // Clear animation state
                                  onSelectSkill(selectedSlot.id, skill.id);
                                }
                              }}
                              disabled={!canBuy && !isSelected}
                              className={`p-3 rounded-lg border text-left transition-all relative flex flex-col h-full
                                ${isSelected 
                                    ? 'bg-blue-900/40 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]' 
                                    : (canBuy 
                                      ? 'bg-gray-800 border-gray-600 hover:border-yellow-500 hover:bg-gray-750 cursor-pointer active:scale-95' 
                                      : 'bg-gray-900 border-gray-800 opacity-60 cursor-not-allowed')
                                }
                                ${skill.hidden ? 'border-purple-500/30' : ''}
                              `}
                            >
                              <div className="flex justify-between items-start mb-1 w-full">
                                  <span className={`font-bold text-sm transition-all ${isSelected ? 'text-blue-300' : (skill.hidden ? 'text-purple-300' : 'text-gray-300')} ${isAnimating ? 'animate-skill-unlock' : ''}`}>
                                    {skill.name}
                                  </span>
                                  {isSelected ? <Check size={14} className="text-blue-400" /> : <span className="text-xs text-yellow-500 font-mono">{skill.cost} SP</span>}
                              </div>
                              <p className="text-xs text-gray-400 leading-tight mb-2 flex-1">{skill.description}</p>
                              
                              {!isSelected && isTierUnlocked && (
                                <div className={`text-[10px] text-center py-1 rounded mt-auto ${canAfford ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
                                   {canAfford ? '學習技能' : '點數不足'}
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                );
            })}
         </div>

         {/* Reset Button (Fixed at bottom) */}
         <div className="absolute bottom-0 left-0 right-0 bg-[#1e1e1e] pt-2 border-t border-white/5">
             <button
               onClick={() => onResetSkills(selectedSlot.id)}
               className="w-full flex items-center justify-center gap-2 py-2 rounded border border-red-800/50 text-red-400 hover:bg-red-900/30 text-xs transition-colors"
               title={`花費 $${GAME_Config.SKILL_RESET_COST} 重置技能`}
             >
                <RotateCcw size={14} /> 重置技能樹 (${GAME_Config.SKILL_RESET_COST})
             </button>
         </div>
      </div>
    );
  };

  // Render Upgrade/Sell Options
  const renderUpgrade = (ingredient: Ingredient) => {
    const stats = INGREDIENT_STATS[ingredient.type];
    const upgradeCost = Math.floor(stats.cost * Math.pow(UPGRADE_MULTIPLIER, ingredient.level));
    const canAfford = gameState.money >= upgradeCost;

    // Calculate current and next stats based on GameCanvas and App logic
    // Damage: Linear scaling 1 + 0.5 * level (from GameCanvas)
    const currentDmg = Math.floor(stats.damage * (1 + (ingredient.level * 0.5)));
    const nextDmg = Math.floor(stats.damage * (1 + ((ingredient.level + 1) * 0.5)));
    const dmgDiff = nextDmg - currentDmg;

    // HP: Exponential scaling * 1.2 (from App.tsx manual upgrade logic)
    const nextHp = Math.floor(ingredient.maxHp * STAT_MULTIPLIER);
    const hpDiff = nextHp - ingredient.maxHp;

    const isDangerous = ingredient.type.startsWith('D_');
    const isSupreme = ingredient.type.startsWith('SUPREME_');

    return (
      <div className="flex flex-col gap-4 h-full">
        {/* Toggle View Tabs */}
        <div className="flex gap-2 bg-black/40 p-1 rounded-lg self-start">
           <button 
             onClick={() => setViewMode('STATS')}
             className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'STATS' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
           >
             <Zap size={14} /> 屬性
           </button>
           <button 
             onClick={() => setViewMode('SKILLS')}
             className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'SKILLS' ? 'bg-blue-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
           >
             <Sprout size={14} /> 技能樹
             {ingredient.availableSkillPoints > 0 && <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span>}
           </button>
        </div>

        {viewMode === 'SKILLS' ? (
           renderSkillTree(ingredient)
        ) : (
          <>
            <div className={`flex items-center gap-4 bg-gray-800 p-4 rounded-xl border border-gray-600 flex-1 relative overflow-hidden
               ${isDangerous ? 'border-purple-600 bg-gray-900' : ''}
               ${isSupreme ? 'border-cyan-500 bg-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : ''}
            `}>
              {isDangerous && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-xs px-2 py-1 text-white font-bold rounded-bl-lg z-10 flex items-center gap-1">
                      <Radiation size={12} /> 危險物品
                  </div>
              )}
              {isSupreme && (
                  <div className="absolute top-0 right-0 bg-cyan-600 text-xs px-2 py-1 text-black font-bold rounded-bl-lg z-10 flex items-center gap-1">
                      <Gem size={12} /> 美味至極
                  </div>
              )}
              <div className="w-24 h-24 relative shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full scale-125">
                      <IngredientRenderer type={ingredient.type} />
                    </div>
                  </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 truncate">
                  {stats.name} 
                  <span className="text-yellow-500 text-sm bg-yellow-900/30 px-2 py-0.5 rounded border border-yellow-700 shrink-0">Lv.{ingredient.level}</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1 truncate">{stats.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="bg-black/30 px-3 py-2 rounded border border-white/5">
                      <div className="text-gray-400 text-xs mb-1">攻擊傷害</div>
                      <div className="font-bold text-red-300 flex items-baseline gap-1">
                        {currentDmg}
                        {dmgDiff > 0 && <span className="text-green-400 text-xs animate-pulse">(+{dmgDiff})</span>}
                      </div>
                    </div>
                    <div className="bg-black/30 px-3 py-2 rounded border border-white/5">
                      <div className="text-gray-400 text-xs mb-1">最大生命</div>
                      <div className="font-bold text-green-300 flex items-baseline gap-1">
                        {Math.floor(ingredient.maxHp)}
                        {hpDiff > 0 && <span className="text-green-400 text-xs animate-pulse">(+{hpDiff})</span>}
                      </div>
                    </div>
                    {isDangerous && stats.friendlyFire && (
                        <div className="col-span-2 bg-red-900/20 px-3 py-2 rounded border border-red-500/30">
                            <div className="text-red-400 text-xs mb-1 flex items-center gap-1"><Radiation size={10} /> 友軍誤傷 (每秒)</div>
                            <div className="font-bold text-red-500">
                                -{stats.friendlyFire} HP
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={onUpgrade}
                disabled={!canAfford}
                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg font-bold transition-colors border-b-4 active:border-b-0 active:translate-y-1
                  ${canAfford 
                      ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white shadow-lg shadow-green-900/50' 
                      : 'bg-gray-700 border-gray-800 text-gray-500 cursor-not-allowed'}
                `}
              >
                <div className="flex items-center gap-2 text-lg">
                  <Zap size={20} />
                  升級
                </div>
                <div className="text-xs opacity-90 font-mono">
                  ${upgradeCost.toLocaleString()}
                </div>
              </button>
              
              <button 
                onClick={onSell}
                className="flex-none w-1/3 flex flex-col items-center justify-center bg-red-900/50 hover:bg-red-800 text-red-200 py-3 rounded-lg font-bold border border-red-800 transition-colors"
              >
                <span className="text-lg">賣出</span>
                <span className="text-xs opacity-80">+${Math.floor(stats.cost * 0.5).toLocaleString()}</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-x-0 bottom-0 bg-[#1e1e1e] border-t-4 border-[#3d2b2b] p-4 pb-8 shadow-2xl z-50 animate-slide-up h-[480px]">
       <div className="max-w-5xl mx-auto relative h-full flex flex-col">
         <button onClick={onClose} className="absolute -top-8 right-0 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-white/10 z-50">
           <X size={20} />
         </button>
         
         <div className="flex gap-6 h-full">
            {/* Left: Actions */}
            <div className="flex-1 flex flex-col overflow-hidden">
               <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-yellow-500 shrink-0">
                 {currentIngredient ? <Utensils size={24} /> : <ShoppingBag size={24} />}
                 {currentIngredient ? '管理食材' : '食材商店'}
               </h2>
               <div className="flex-1 overflow-hidden min-h-0">
                  {currentIngredient ? renderUpgrade(currentIngredient) : renderShop()}
               </div>
            </div>

            {/* Right: Chef's Corner - Fixed width */}
            <div className="w-64 bg-[#2a2a2a] rounded-xl p-4 border border-[#3d2b2b] flex flex-col shrink-0 shadow-inner">
               <div className="flex items-center gap-2 mb-3 text-orange-400 font-bold">
                 <ChefHat size={20} />
                 主廚建議
               </div>
               
               <div className="flex-1 bg-black/30 rounded p-3 mb-3 text-sm text-gray-300 overflow-y-auto italic custom-scrollbar border border-white/5">
                 {chefMessage || "選好食材了嗎？那些老鼠可不會等你！"}
               </div>

               <button 
                 onClick={handleAskChef}
                 disabled={loadingAdvice}
                 className={`w-full py-3 rounded-lg font-bold text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg
                   ${loadingAdvice ? 'bg-gray-600 text-gray-400' : 'bg-orange-600 hover:bg-orange-500 text-white hover:shadow-orange-500/20'}
                 `}
               >
                 {loadingAdvice ? '通靈中...' : '詢問主廚'}
               </button>
            </div>
         </div>
       </div>
    </div>
  );
};

export default UpgradeMenu;
