
import React, { useState } from 'react';
import { IngredientType, Slot, GameState, Ingredient, Skill } from '../types';
import { INGREDIENT_STATS, UPGRADE_MULTIPLIER, STAT_MULTIPLIER, getSkillsForType, GAME_Config } from '../constants';
import { getChefAdvice } from '../services/geminiService';
import { ChefHat, Info, X, Zap, Utensils, ShoppingBag, Sprout, Lock, Check, RotateCcw, Radiation, Gem, Sword, Heart, Clock, Target, ArrowRight, ShieldCheck, ArrowUp, Star, Coins } from 'lucide-react';
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
      <div className="flex flex-col w-full h-full">
         {/* Filter Tabs */}
         <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0 px-2">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 ${filter === 'ALL' ? 'bg-amber-500 text-black border-2 border-amber-300' : 'bg-stone-700 text-stone-300 border-2 border-stone-600'}`}>全部</button>
            <button onClick={() => setFilter('BASIC')} className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 ${filter === 'BASIC' ? 'bg-orange-600 text-white border-2 border-orange-400' : 'bg-stone-700 text-stone-300 border-2 border-stone-600'}`}>基礎</button>
            <button onClick={() => setFilter('KING')} className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 ${filter === 'KING' ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-stone-700 text-stone-300 border-2 border-stone-600'}`}>王者</button>
            <button onClick={() => setFilter('GOD')} className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 ${filter === 'GOD' ? 'bg-red-700 text-white border-2 border-red-500' : 'bg-stone-700 text-stone-300 border-2 border-stone-600'}`}>戰神</button>
            <button onClick={() => setFilter('SUPREME')} className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1 ${filter === 'SUPREME' ? 'bg-cyan-600 text-white border-2 border-cyan-400' : 'bg-stone-700 text-stone-300 border-2 border-stone-600'}`}><Gem size={14} />極致</button>
            <button onClick={() => setFilter('BONUS')} className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1 ${filter === 'BONUS' ? 'bg-pink-600 text-white border-2 border-pink-400' : 'bg-stone-700 text-stone-300 border-2 border-stone-600'}`}><Star size={14} />加分</button>
         </div>

         {/* Scrollable Grid */}
         <div className="overflow-y-auto pr-2 custom-scrollbar pb-20 px-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group shadow-lg btn-3d
                      ${canAfford 
                        ? 'bg-[#2a2522] border-[#5c4a3d] hover:bg-[#38302a] hover:border-amber-500' 
                        : 'bg-[#1a1512] border-[#2d241f] opacity-60 grayscale cursor-not-allowed'}
                      ${isGod ? 'bg-red-950/40 border-red-900' : ''}
                      ${isSupreme ? 'bg-cyan-950/40 border-cyan-900' : ''}
                    `}
                  >
                    <div className="w-14 h-14 mb-3 group-hover:scale-110 transition-transform drop-shadow-xl">
                        <IngredientRenderer type={type} />
                    </div>
                    <div className={`font-bold text-sm text-center leading-tight mb-1 truncate w-full
                       ${isGod ? 'text-red-400' : 
                         (isKing ? 'text-yellow-400' : 
                           (isSupreme ? 'text-cyan-300' :
                             (isBonus ? 'text-pink-300' : 'text-stone-200')))}`}>
                      {stats.name}
                    </div>
                    <div className={`font-mono text-xs px-2 py-0.5 rounded ${canAfford ? 'bg-black/40 text-yellow-400' : 'bg-red-900/30 text-red-500'}`}>
                        ${stats.cost}
                    </div>
                    
                    {isBonus && (
                        <div className="absolute top-0 right-0 bg-pink-600 text-[9px] px-1.5 py-0.5 text-white font-bold rounded-bl-lg shadow-sm">
                            SYNERGY
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
    const tiers = [1, 2, 3];
    
    return (
      <div className="flex flex-col relative h-full">
         <div className="flex justify-between items-center mb-4 bg-black/30 p-3 rounded-lg border border-white/5 shadow-inner">
            <div>
               <h3 className="text-yellow-400 font-bold text-lg flex items-center gap-2"><Sprout size={18}/> 天賦技能樹</h3>
               <p className="text-stone-400 text-xs">等級每提升 5 級獲得 1 點 SP。</p>
            </div>
            <div className="text-right bg-blue-900/30 px-3 py-1 rounded border border-blue-500/30">
               <div className="text-xs text-blue-300 uppercase font-bold">技能點 (SP)</div>
               <div className="text-2xl font-black text-white">{ingredient.availableSkillPoints}</div>
            </div>
         </div>

         <div className="overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
            {skills.length === 0 && (
              <div className="text-center text-stone-500 mt-10 italic">此食材尚未開發特殊技能...</div>
            )}

            {tiers.map(tier => {
                const tierSkills = skills.filter(s => {
                   if (s.tier !== tier) return false;
                   if (s.hidden && ingredient.level < s.unlockLevel) return false;
                   return true;
                });
                
                if (tierSkills.length === 0) return null;
                const isTierUnlocked = ingredient.level >= tierSkills[0].unlockLevel;

                return (
                  <div key={tier} className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`text-xs font-black px-2 py-1 rounded uppercase tracking-wider ${isTierUnlocked ? 'bg-blue-600 text-white shadow-md' : 'bg-stone-700 text-stone-500'}`}>
                          階層 {tier}
                        </div>
                        <div className="h-px bg-stone-700 flex-1"></div>
                        <div className="text-[10px] text-stone-500 font-mono">需求等級: Lv.{tierSkills[0].unlockLevel}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tierSkills.map(skill => {
                          const isSelected = ingredient.selectedSkills.includes(skill.id);
                          const canAfford = ingredient.availableSkillPoints >= skill.cost;
                          const canBuy = isTierUnlocked && canAfford && !isSelected;
                          const isAnimating = justUnlockedSkillId === skill.id;

                          return (
                            <button
                              key={skill.id}
                              onClick={() => {
                                if (canBuy) {
                                  audioService.playSkillUnlock();
                                  setJustUnlockedSkillId(skill.id);
                                  setTimeout(() => setJustUnlockedSkillId(null), 600);
                                  onSelectSkill(selectedSlot.id, skill.id);
                                }
                              }}
                              disabled={!canBuy && !isSelected}
                              className={`p-3 rounded-lg border-2 text-left transition-all relative overflow-hidden group
                                ${isSelected 
                                    ? 'bg-blue-950/60 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                    : (canBuy 
                                      ? 'bg-[#2a2522] border-stone-600 hover:border-yellow-500 hover:bg-[#38302a] cursor-pointer active:scale-95' 
                                      : 'bg-[#1a1512] border-[#25201d] opacity-50 cursor-not-allowed')
                                }
                                ${isAnimating ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] z-10' : ''}
                              `}
                            >
                              <div className="flex justify-between items-start mb-1 relative z-10">
                                  <span className={`font-bold text-sm ${isSelected ? 'text-blue-300' : 'text-stone-200'}`}>
                                    {skill.name}
                                  </span>
                                  {isSelected ? <Check size={16} className="text-blue-400" /> : <span className="text-xs text-yellow-500 font-mono font-bold bg-black/30 px-1.5 rounded">{skill.cost} SP</span>}
                              </div>
                              <p className="text-xs text-stone-400 leading-snug mb-2 relative z-10">{skill.description}</p>
                              
                              {!isSelected && isTierUnlocked && (
                                <div className={`text-[10px] text-center py-1 rounded font-bold uppercase tracking-wider relative z-10 ${canAfford ? 'bg-yellow-600 text-white shadow-sm' : 'bg-stone-800 text-stone-600'}`}>
                                   {canAfford ? '解鎖' : 'SP不足'}
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

         <div className="absolute bottom-0 left-0 right-0 pt-4 bg-gradient-to-t from-[#1e1e1e] to-transparent pointer-events-none h-12"></div>
         <div className="sticky bottom-0 bg-[#251e1a] border-t border-white/5 p-2 rounded-b-xl shadow-lg">
             <button onClick={() => onResetSkills(selectedSlot.id)} className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 text-xs transition-colors font-bold uppercase tracking-widest">
                <RotateCcw size={14} /> 重置技能 (${GAME_Config.SKILL_RESET_COST})
             </button>
         </div>
      </div>
    );
  };

  const renderUpgrade = (ingredient: Ingredient) => {
    const stats = INGREDIENT_STATS[ingredient.type];
    const upgradeCost = Math.floor(stats.cost * Math.pow(UPGRADE_MULTIPLIER, ingredient.level));
    const canAfford = gameState.money >= upgradeCost;
    const isMaxLevel = ingredient.level >= GAME_Config.MAX_LEVEL;

    const currentDmg = Math.floor(stats.damage * (1 + (ingredient.level * 0.5)));
    const nextDmg = Math.floor(stats.damage * (1 + ((ingredient.level + 1) * 0.5)));
    const nextHp = Math.floor(ingredient.maxHp * STAT_MULTIPLIER);
    const currentSpeedMs = Math.floor(stats.attackSpeed / Math.pow(0.9, ingredient.level - 1));
    const nextSpeedMs = Math.floor(stats.attackSpeed / Math.pow(0.9, ingredient.level));

    const isBonus = ingredient.type.startsWith('BONUS_');
    const isSupreme = ingredient.type.startsWith('SUPREME_');
    const isCaptain = ingredient.type === IngredientType.SEASONING_CAPTAIN;
    const activeSkillsList = getSkillsForType(ingredient.type).filter(s => ingredient.selectedSkills.includes(s.id));

    return (
      <div className="flex flex-col h-full">
        {/* Toggle View */}
        <div className="flex bg-black/40 p-1 rounded-lg shrink-0 mb-4 border border-white/5">
           <button onClick={() => setViewMode('STATS')} className={`flex-1 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'STATS' ? 'bg-stone-700 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}>數值</button>
           <button onClick={() => setViewMode('SKILLS')} className={`flex-1 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all relative ${viewMode === 'SKILLS' ? 'bg-blue-700 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}>
             技能 {ingredient.availableSkillPoints > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
           </button>
        </div>

        {viewMode === 'SKILLS' ? (
           renderSkillTree(ingredient)
        ) : (
          <div className="flex flex-col h-full">
            <div className={`flex flex-col bg-[#2a2522] p-4 rounded-xl border-2 relative overflow-hidden flex-1 shadow-inner
               ${isBonus ? 'border-pink-900/50' : 'border-[#3f322a]'}
               ${isSupreme || isCaptain ? 'border-cyan-900/50 shadow-[inset_0_0_30px_rgba(6,182,212,0.1)]' : ''}
            `}>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 relative shrink-0 bg-black/40 rounded-xl p-3 border border-white/5 shadow-inner">
                      <IngredientRenderer type={ingredient.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-black text-white flex items-center gap-2 truncate tracking-tight">
                      {stats.name} 
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500 text-xs font-mono font-bold bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-700/50">LVL {ingredient.level}</span>
                        {isSupreme && <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-cyan-800 px-1 rounded">Supreme</span>}
                    </div>
                    <p className="text-stone-400 text-xs mt-2 line-clamp-2">{stats.description}</p>
                  </div>
              </div>

              {/* Stats Display */}
              <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded border border-white/5">
                      <div className="text-stone-400 text-xs font-bold uppercase flex items-center gap-2"><Sword size={14} className="text-red-500"/> 傷害</div>
                      <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">{currentDmg}</span>
                          {!isMaxLevel && <div className="text-xs text-green-500 font-mono animate-pulse">▲ {nextDmg}</div>}
                      </div>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded border border-white/5">
                      <div className="text-stone-400 text-xs font-bold uppercase flex items-center gap-2"><Heart size={14} className="text-green-500"/> 生命</div>
                      <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">{Math.floor(ingredient.maxHp)}</span>
                          {!isMaxLevel && <div className="text-xs text-green-500 font-mono animate-pulse">▲ {nextHp}</div>}
                      </div>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded border border-white/5">
                      <div className="text-stone-400 text-xs font-bold uppercase flex items-center gap-2"><Clock size={14} className="text-blue-500"/> 攻速</div>
                      <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">{(currentSpeedMs/1000).toFixed(2)}s</span>
                          {!isMaxLevel && <div className="text-xs text-green-500 font-mono animate-pulse">▼ {(nextSpeedMs/1000).toFixed(2)}s</div>}
                      </div>
                  </div>
              </div>

              {/* Active Skills Mini-View */}
              <div className="mt-auto">
                  <div className="text-[10px] text-stone-500 uppercase font-black mb-2 flex items-center gap-1">
                      <ShieldCheck size={12} /> 激活特質
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {activeSkillsList.length > 0 ? (
                          activeSkillsList.map(skill => (
                              <div key={skill.id} className="bg-blue-900/30 text-blue-200 text-[10px] px-2 py-1 rounded border border-blue-500/20 font-bold shadow-sm">
                                  {skill.name}
                              </div>
                          ))
                      ) : (
                          <span className="text-stone-600 text-[10px] italic">無激活特質</span>
                      )}
                  </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4 shrink-0">
              <button 
                onClick={onUpgrade}
                disabled={!canAfford || isMaxLevel}
                className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest transition-all border-b-4 active:border-b-0 active:translate-y-1 shadow-lg btn-3d
                  ${canAfford && !isMaxLevel
                      ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white' 
                      : 'bg-stone-700 border-stone-800 text-stone-500 cursor-not-allowed'}
                `}
              >
                  <div className="flex flex-col items-center leading-none gap-1">
                      <span className="flex items-center gap-2 text-sm"><ArrowUp size={16} /> 升級</span>
                      {!isMaxLevel ? <span className="text-[10px] font-mono opacity-80 bg-black/20 px-1 rounded">${upgradeCost}</span> : <span className="text-[10px]">已滿級</span>}
                  </div>
              </button>

              <button 
                onClick={onSell}
                disabled={isCaptain}
                className={`w-1/3 py-3 rounded-lg font-black uppercase tracking-widest transition-all border-b-4 active:border-b-0 active:translate-y-1 shadow-lg btn-3d
                   ${isCaptain 
                      ? 'bg-stone-700 border-stone-800 text-stone-500 cursor-not-allowed' 
                      : 'bg-red-900 hover:bg-red-800 border-red-950 text-red-100'}
                `}
              >
                 <div className="flex flex-col items-center leading-none gap-1">
                     <span className="flex items-center gap-2 text-sm"><X size={16} /> 販賣</span>
                     {!isCaptain && <span className="text-[10px] font-mono opacity-80">+$ {Math.floor(stats.cost * 0.5)}</span>}
                 </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-zoom-in" onClick={onClose}>
      <div 
        className="bg-wood w-full max-w-5xl h-[85vh] rounded-xl border-[6px] border-[#2d1f16] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Metal Clips (Visual Polish) */}
        <div className="absolute top-0 left-12 w-8 h-12 bg-gradient-to-b from-[#78716c] to-[#44403c] rounded-b-lg shadow-lg border-x border-b border-[#292524] z-20"></div>
        <div className="absolute top-0 right-12 w-8 h-12 bg-gradient-to-b from-[#78716c] to-[#44403c] rounded-b-lg shadow-lg border-x border-b border-[#292524] z-20"></div>

        {/* Header */}
        <div className="bg-[#2d1f16] p-4 pt-6 border-b-2 border-[#1c130d] flex justify-between items-center shrink-0 shadow-lg relative z-10">
          <div className="flex items-center gap-4">
             <div className="bg-amber-600 p-2.5 rounded-lg text-white shadow-inner border border-amber-500">
                <ChefHat size={28} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest font-display drop-shadow-md">
                   {currentIngredient ? '強化工坊' : '食材市場'}
                </h2>
                <div className="flex items-center gap-3 text-xs text-stone-400 font-bold">
                   <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded text-yellow-400"><Coins size={12}/> ${gameState.money}</span>
                   {currentIngredient && <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded text-blue-300"><Sprout size={12}/> {currentIngredient.availableSkillPoints} SP</span>}
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-[#44352f] hover:bg-red-600 text-white rounded-lg transition-colors border-2 border-[#291e1a] shadow-md btn-3d"><X size={24} /></button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4 relative flex flex-col bg-[#1e1916]">
            {currentIngredient ? renderUpgrade(currentIngredient) : renderShop()}
        </div>

        {/* Footer Advice */}
        <div className="bg-[#2d1f16] p-3 border-t-2 border-[#3f2e23] shrink-0 flex items-center gap-4 relative shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-10">
            <div className="w-12 h-12 rounded-full bg-stone-700 border-2 border-stone-500 overflow-hidden shrink-0 shadow-lg">
                <div className="w-full h-full flex items-center justify-center bg-stone-800"><ChefHat size={24} className="text-stone-400"/></div>
            </div>
            <div className="flex-1 bg-stone-800/50 p-2 rounded-lg border border-white/5 relative">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45 border-l border-b border-white/5"></div>
                <p className="text-xs text-amber-500 font-bold uppercase mb-0.5">主廚建議</p>
                <p className="text-sm text-stone-300 italic">"{chefMessage || '選得好不如烤得好！需要什麼建議嗎？'}"</p>
            </div>
            <button onClick={handleAskChef} disabled={loadingAdvice} className={`bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 btn-3d ${loadingAdvice ? 'opacity-50' : ''}`}>
               {loadingAdvice ? <RotateCcw className="animate-spin" size={14} /> : <Info size={14} />} 詢問
            </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeMenu;
