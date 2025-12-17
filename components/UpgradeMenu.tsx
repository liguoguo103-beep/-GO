
import React, { useState } from 'react';
import { IngredientType, Slot, GameState, Ingredient, Skill } from '../types';
import { INGREDIENT_STATS, UPGRADE_MULTIPLIER, STAT_MULTIPLIER, getSkillsForType, GAME_Config } from '../constants';
import { getChefAdvice } from '../services/geminiService';
import { ChefHat, Info, X, Zap, Utensils, ShoppingBag, Sprout, Lock, Check, RotateCcw, Radiation, Gem, Sword, Heart, Clock, Target, ArrowRight, ShieldCheck, ArrowUp, Star } from 'lucide-react';
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
  const [filter, setFilter] = useState<'ALL' | 'BASIC' | 'KING' | 'GOD' | 'SUPREME' | 'BONUS'>('ALL');
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
      // Exclude special unique types like Seasoning Captain from shop
      if (type === IngredientType.SEASONING_CAPTAIN) return false;

      const isKing = type.includes('KING_');
      const isGod = type.includes('GOD_');
      const isSupreme = type.includes('SUPREME_');
      const isBonus = type.startsWith('BONUS_');

      if (filter === 'BASIC') return !isKing && !isGod && !isSupreme && !isBonus;
      if (filter === 'KING') return isKing;
      if (filter === 'GOD') return isGod;
      if (filter === 'SUPREME') return isSupreme;
      if (filter === 'BONUS') return isBonus;
      return true;
    });

    return (
      <div className="flex flex-col w-full">
         {/* Filter Tabs */}
         <div className="flex gap-2 mb-2 overflow-x-auto pb-1 shrink-0">
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
              onClick={() => setFilter('BONUS')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${filter === 'BONUS' ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.6)]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <Star size={12} /> 美味加分
            </button>
         </div>

         {/* Scrollable Grid - Auto height up to 55vh, then scroll */}
         <div className="overflow-y-auto pr-2 custom-scrollbar max-h-[55vh]">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredTypes.map((type) => {
                const stats = INGREDIENT_STATS[type];
                const canAfford = gameState.money >= stats.cost;
                const isGod = type.includes('GOD_');
                const isKing = type.includes('KING_');
                const isSupreme = type.includes('SUPREME_');
                const isBonus = type.startsWith('BONUS_');

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
                      ${isBonus ? 'border-pink-900/50 bg-pink-950/20' : ''}
                    `}
                  >
                    <div className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform">
                        <IngredientRenderer type={type} />
                    </div>
                    <div className={`font-bold text-sm text-center leading-tight mb-1 
                       ${isGod ? 'text-red-400' : 
                         (isKing ? 'text-yellow-400' : 
                           (isSupreme ? 'text-cyan-300' :
                             (isBonus ? 'text-pink-300' : 'text-white')))}`}>
                      {stats.name}
                    </div>
                    <div className="text-yellow-500 font-mono text-xs">${stats.cost}</div>
                    
                    {isBonus && (
                        <div className="absolute top-1 right-1 bg-pink-600/80 text-[8px] px-1 rounded text-white font-bold">
                            連動
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
      <div className="flex flex-col relative max-h-[55vh]">
         {/* Header Info */}
         <div className="flex justify-between items-center mb-4 bg-black/20 p-2 rounded shrink-0">
            <div>
               <h3 className="text-yellow-400 font-bold text-lg">天賦技能樹</h3>
               <p className="text-gray-400 text-xs">每 5 級獲得 1 點技能點。</p>
            </div>
            <div className="text-right">
               <div className="text-xs text-gray-400">可用點數</div>
               <div className="text-2xl font-bold text-blue-400">{ingredient.availableSkillPoints} SP</div>
            </div>
         </div>

         <div className="overflow-y-auto pr-2 custom-scrollbar pb-16">
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
                                  // Play Sound
                                  audioService.playSkillUnlock();
                                  
                                  // Trigger Animation
                                  setJustUnlockedSkillId(skill.id);
                                  setTimeout(() => setJustUnlockedSkillId(null), 600); // Duration slightly longer than CSS anim
                                  
                                  // Update State
                                  onSelectSkill(selectedSlot.id, skill.id);
                                }
                              }}
                              disabled={!canBuy && !isSelected}
                              className={`p-3 rounded-lg border text-left transition-all duration-300 relative flex flex-col h-full overflow-hidden
                                ${isSelected 
                                    ? 'bg-blue-900/40 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]' 
                                    : (canBuy 
                                      ? 'bg-gray-800 border-gray-600 hover:border-yellow-500 hover:bg-gray-750 cursor-pointer active:scale-95' 
                                      : 'bg-gray-900 border-gray-800 opacity-60 cursor-not-allowed')
                                }
                                ${skill.hidden ? 'border-purple-500/30' : ''}
                                ${isAnimating ? 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] border-yellow-400' : ''}
                              `}
                            >
                              <div className="flex justify-between items-start mb-1 w-full relative z-10">
                                  <span className={`font-bold text-sm transition-all transform origin-left 
                                    ${isSelected ? 'text-blue-300' : (skill.hidden ? 'text-purple-300' : 'text-gray-300')} 
                                    ${isAnimating ? 'animate-skill-unlock text-yellow-300 scale-110' : ''}
                                  `}>
                                    {skill.name}
                                  </span>
                                  {isSelected ? <Check size={14} className="text-blue-400" /> : <span className="text-xs text-yellow-500 font-mono">{skill.cost} SP</span>}
                              </div>
                              <p className="text-xs text-gray-400 leading-tight mb-2 flex-1 relative z-10">{skill.description}</p>
                              
                              {!isSelected && isTierUnlocked && (
                                <div className={`text-[10px] text-center py-1 rounded mt-auto relative z-10 ${canAfford ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
                                   {canAfford ? '學習技能' : '點數不足'}
                                </div>
                              )}
                              
                              {/* Success Flash Background */}
                              {isAnimating && (
                                <div className="absolute inset-0 bg-yellow-500/20 animate-pulse z-0 pointer-events-none"></div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                );
            })}
         </div>

         {/* Reset Button (Sticky at bottom) */}
         <div className="sticky bottom-0 bg-[#1e1e1e] pt-2 border-t border-white/5 mt-auto">
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
    const isMaxLevel = ingredient.level >= GAME_Config.MAX_LEVEL;

    // --- Stats Calculations ---
    const currentDmg = Math.floor(stats.damage * (1 + (ingredient.level * 0.5)));
    const nextDmg = Math.floor(stats.damage * (1 + ((ingredient.level + 1) * 0.5)));
    const nextHp = Math.floor(ingredient.maxHp * STAT_MULTIPLIER);
    const currentSpeedMs = Math.floor(stats.attackSpeed / Math.pow(0.9, ingredient.level - 1));
    const nextSpeedMs = Math.floor(stats.attackSpeed / Math.pow(0.9, ingredient.level));
    const currentRange = stats.range;

    const isBonus = ingredient.type.startsWith('BONUS_');
    const isSupreme = ingredient.type.startsWith('SUPREME_');
    const isCaptain = ingredient.type === IngredientType.SEASONING_CAPTAIN;

    // Get Active Skills
    const allSkills = getSkillsForType(ingredient.type);
    const activeSkillsList = allSkills.filter(s => ingredient.selectedSkills.includes(s.id));

    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Toggle View Tabs */}
        <div className="flex gap-2 bg-black/40 p-1 rounded-lg self-start shrink-0">
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
            <div className={`flex flex-col bg-gray-800 p-4 rounded-xl border border-gray-600 relative overflow-hidden shrink-0
               ${isBonus ? 'border-pink-600 bg-gray-900' : ''}
               ${isSupreme || isCaptain ? 'border-cyan-500 bg-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : ''}
            `}>
              {/* Top Banner: Image & Name */}
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 relative shrink-0 bg-black/30 rounded-lg p-2 border border-white/10">
                      <div className="w-full h-full">
                        <IngredientRenderer type={ingredient.type} />
                      </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 truncate">
                      {stats.name} 
                      <span className="text-yellow-500 text-xs font-mono bg-yellow-900/30 px-1.5 py-0.5 rounded border border-yellow-700 shrink-0">Lv.{ingredient.level}</span>
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 truncate">{stats.description}</p>
                  </div>
                  {isBonus && (
                      <div className="absolute top-0 right-0 bg-pink-600 text-[10px] px-2 py-1 text-white font-bold rounded-bl-lg z-10 flex items-center gap-1">
                          <Star size={10} /> 加分
                      </div>
                  )}
                  {(isSupreme || isCaptain) && (
                      <div className="absolute top-0 right-0 bg-cyan-600 text-[10px] px-2 py-1 text-black font-bold rounded-bl-lg z-10 flex items-center gap-1">
                          <Gem size={10} /> 極致
                      </div>
                  )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Damage */}
                  <div className="bg-black/30 px-3 py-2 rounded border border-white/5 flex flex-col justify-center">
                      <div className="text-gray-400 text-[10px] mb-0.5 flex items-center gap-1"><Sword size={10} /> 攻擊傷害</div>
                      <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-red-300">{currentDmg}</span>
                          {!isMaxLevel && (
                              <div className="flex items-center text-[10px] text-green-400 animate-pulse">
                                  <ArrowRight size={8} /> {nextDmg}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* HP */}
                  <div className="bg-black/30 px-3 py-2 rounded border border-white/5 flex flex-col justify-center">
                      <div className="text-gray-400 text-[10px] mb-0.5 flex items-center gap-1"><Heart size={10} /> 最大生命</div>
                      <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-green-300">{Math.floor(ingredient.maxHp)}</span>
                          {!isMaxLevel && (
                              <div className="flex items-center text-[10px] text-green-400 animate-pulse">
                                  <ArrowRight size={8} /> {nextHp}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Attack Speed */}
                  <div className="bg-black/30 px-3 py-2 rounded border border-white/5 flex flex-col justify-center">
                      <div className="text-gray-400 text-[10px] mb-0.5 flex items-center gap-1"><Clock size={10} /> 攻擊間隔</div>
                      <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-blue-300">{(currentSpeedMs/1000).toFixed(2)}s</span>
                          {!isMaxLevel && (
                              <div className="flex items-center text-[10px] text-green-400 animate-pulse">
                                  <ArrowRight size={8} /> {(nextSpeedMs/1000).toFixed(2)}s
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Range */}
                  <div className="bg-black/30 px-3 py-2 rounded border border-white/5 flex flex-col justify-center">
                      <div className="text-gray-400 text-[10px] mb-0.5 flex items-center gap-1"><Target size={10} /> 射程範圍</div>
                      <span className="text-lg font-bold text-yellow-300">{currentRange}</span>
                  </div>
              </div>

              {/* Active Skills List */}
              <div className="mt-auto">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                      <ShieldCheck size={10} /> 已啟用技能
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                      {activeSkillsList.length > 0 ? (
                          activeSkillsList.map(skill => (
                              <div key={skill.id} className="bg-blue-900/40 text-blue-200 text-[10px] px-2 py-1 rounded border border-blue-500/30 flex items-center gap-1" title={skill.description}>
                                  <Check size={8} /> {skill.name}
                              </div>
                          ))
                      ) : (
                          <span className="text-gray-600 text-[10px] italic">尚未學習任何技能</span>
                      )}
                  </div>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={onUpgrade}
                disabled={!canAfford || isMaxLevel}
                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg font-bold transition-colors border-b-4 active:border-b-0 active:translate-y-1
                  ${canAfford && !isMaxLevel
                      ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white shadow-lg shadow-green-900/50' 
                      : 'bg-gray-700 border-gray-800 text-gray-500 cursor-not-allowed'}
                `}
              >
                  <span className="flex items-center gap-2 text-lg">
                      <ArrowUp size={20} /> 升級
                  </span>
                  {!isMaxLevel && (
                    <span className="text-xs font-mono opacity-80">${upgradeCost}</span>
                  )}
                  {isMaxLevel && <span className="text-xs opacity-80">MAX</span>}
              </button>

              <button 
                onClick={onSell}
                disabled={isCaptain}
                className={`w-1/3 flex flex-col items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 py-3 rounded-lg transition-colors
                   ${isCaptain 
                      ? 'bg-gray-700 border-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-900/50 hover:bg-red-800 border-red-800 text-red-300'}
                `}
                title={isCaptain ? "此單位無法販售" : "賣出食材"}
              >
                 <span className="flex items-center gap-1 font-bold"><X size={18} /> {isCaptain ? '不可販售' : '賣出'}</span>
                 {!isCaptain && <span className="text-xs font-mono opacity-80">+${Math.floor(stats.cost * 0.5)}</span>}
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#1e1e1e] w-full max-w-4xl max-h-[90vh] h-auto rounded-2xl border-2 border-[#3d2b2b] shadow-2xl flex flex-col overflow-hidden relative transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2a1a1a] p-4 border-b border-[#3d2b2b] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-orange-600 p-2 rounded-lg text-white">
                <ChefHat size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-orange-500">
                   {currentIngredient ? '食材升級中心' : '購買新食材'}
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                   <div className="bg-black/50 px-2 py-0.5 rounded text-yellow-400 font-mono">
                      擁有資金: ${gameState.money}
                   </div>
                   {currentIngredient && (
                     <div className="bg-black/50 px-2 py-0.5 rounded text-blue-300 font-mono">
                       技能點數: {currentIngredient.availableSkillPoints} SP
                     </div>
                   )}
                </div>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4 relative flex flex-col min-h-0">
            {currentIngredient ? renderUpgrade(currentIngredient) : renderShop()}
        </div>

        {/* Chef Message Footer */}
        <div className="bg-[#2a1a1a] p-3 border-t border-[#3d2b2b] shrink-0 flex items-start gap-3 relative">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0 border border-gray-600 overflow-hidden">
                <ChefHat size={20} className="text-gray-300" />
            </div>
            <div className="flex-1">
                <div className="text-[10px] text-gray-500 font-bold mb-0.5 uppercase">Master Chef says:</div>
                <div className="text-sm text-gray-300 italic leading-snug">"{chefMessage || '歡迎光臨！想來點什麼？'}"</div>
            </div>
            <button 
               onClick={handleAskChef}
               disabled={loadingAdvice}
               className={`absolute right-3 top-3 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition-transform active:scale-95 ${loadingAdvice ? 'opacity-50 cursor-wait' : ''}`}
            >
               {loadingAdvice ? <RotateCcw className="animate-spin" size={12} /> : <Info size={12} />}
               尋求建議
            </button>
        </div>

      </div>
    </div>
  );
};

export default UpgradeMenu;
