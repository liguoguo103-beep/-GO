
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

  const filterBtnBase = "px-5 py-2.5 rounded-xl text-sm font-black shadow-lg transition-all active:scale-95 font-display border-2 uppercase tracking-tighter";
  const filterBtnActive = "bg-[#f59e0b] text-[#1a0505] border-white ring-2 ring-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105";
  const filterBtnInactive = "bg-[#2d1f16] text-[#a1887f] border-[#4e342e] hover:bg-[#3e2723] opacity-80";

  const actionBtnBase = "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all border-b-8 active:border-b-0 active:translate-y-2 shadow-2xl font-display text-lg";
  const upgradeBtnStyle = "bg-gradient-to-b from-green-500 to-green-700 border-green-900 text-white hover:from-green-400";
  const sellBtnStyle = "w-1/3 bg-gradient-to-b from-red-700 to-red-900 border-red-950 text-red-100 hover:from-red-600";
  const disabledBtnStyle = "bg-[#374151] border-[#1f2937] text-gray-500 cursor-not-allowed border-b-4 opacity-50";

  const renderShop = () => {
    const allTypes = Object.values(IngredientType);
    const filteredTypes = allTypes.filter(type => {
      if (type === IngredientType.SEASONING_CAPTAIN) return false;
      const isKing = type.includes('KING_'), isGod = type.includes('GOD_'), isSupreme = type.includes('SUPREME_'), isBonus = type.startsWith('BONUS_');
      if (filter === 'BASIC') return !isKing && !isGod && !isSupreme && !isBonus;
      if (filter === 'KING') return isKing;
      if (filter === 'GOD') return isGod;
      if (filter === 'SUPREME') return isSupreme;
      if (filter === 'BONUS') return isBonus;
      return true;
    });

    return (
      <div className="flex flex-col w-full h-full">
         <div className="flex gap-3 mb-6 overflow-x-auto pb-4 shrink-0 px-2 scrollbar-hide">
            <button onClick={() => setFilter('ALL')} className={`${filterBtnBase} ${filter === 'ALL' ? filterBtnActive : filterBtnInactive}`}>全部</button>
            <button onClick={() => setFilter('BASIC')} className={`${filterBtnBase} ${filter === 'BASIC' ? filterBtnActive : filterBtnInactive}`}>基礎</button>
            <button onClick={() => setFilter('KING')} className={`${filterBtnBase} ${filter === 'KING' ? filterBtnActive : filterBtnInactive}`}>王者</button>
            <button onClick={() => setFilter('GOD')} className={`${filterBtnBase} ${filter === 'GOD' ? filterBtnActive : filterBtnInactive}`}>戰神</button>
            <button onClick={() => setFilter('SUPREME')} className={`${filterBtnBase} flex items-center gap-2 ${filter === 'SUPREME' ? filterBtnActive : filterBtnInactive}`}><Gem size={16} />極致</button>
            <button onClick={() => setFilter('BONUS')} className={`${filterBtnBase} flex items-center gap-2 ${filter === 'BONUS' ? filterBtnActive : filterBtnInactive}`}><Star size={16} />加分</button>
         </div>

         <div className="overflow-y-auto pr-3 custom-scrollbar pb-24 px-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredTypes.map((type) => {
                const stats = INGREDIENT_STATS[type];
                const canAfford = gameState.money >= stats.cost;
                const isGod = type.includes('GOD_'), isSupreme = type.includes('SUPREME_'), isKing = type.includes('KING_'), isBonus = type.startsWith('BONUS_');

                return (
                  <button key={type} onClick={() => canAfford && onBuy(type)} disabled={!canAfford}
                    className={`flex flex-col items-center p-4 rounded-2xl border-4 transition-all relative overflow-hidden group shadow-xl
                      ${canAfford ? 'bg-[#3e2723] border-[#5d4037] hover:border-yellow-400 hover:scale-105 active:scale-95' : 'bg-[#1a1512] border-[#2d241f] opacity-40 grayscale cursor-not-allowed'}
                      ${isGod ? 'bg-[#450a0a] border-red-700 shadow-[inset_0_0_20px_#991b1b]' : ''}
                      ${isSupreme ? 'bg-[#083344] border-cyan-700 shadow-[inset_0_0_20px_#0e7490]' : ''}
                    `}
                  >
                    <div className="w-20 h-20 mb-4 group-hover:rotate-6 transition-transform drop-shadow-2xl"><IngredientRenderer type={type} /></div>
                    <div className={`font-black text-lg text-center leading-tight mb-2 truncate w-full font-display drop-shadow-sm
                       ${isGod ? 'text-red-400' : (isKing ? 'text-yellow-400' : (isSupreme ? 'text-cyan-300' : (isBonus ? 'text-pink-300' : 'text-[#d7ccc8]')))}`}>
                      {stats.name}
                    </div>
                    <div className={`font-display text-base px-3 py-1 rounded-full border ${canAfford ? 'bg-black/60 text-yellow-400 border-yellow-600/50' : 'bg-red-900/30 text-red-500 border-red-900'}`}>
                        ${stats.cost}
                    </div>
                    {isBonus && <div className="absolute top-0 right-0 bg-pink-600 text-[10px] px-2 py-1 text-white font-black rounded-bl-xl shadow-lg font-display">SYNERGY</div>}
                  </button>
                );
              })}
            </div>
         </div>
      </div>
    );
  };

  const renderUpgrade = (ingredient: Ingredient) => {
    const stats = INGREDIENT_STATS[ingredient.type];
    const upgradeCost = Math.floor(stats.cost * Math.pow(UPGRADE_MULTIPLIER, ingredient.level));
    const canAfford = gameState.money >= upgradeCost;
    const isMaxLevel = ingredient.level >= GAME_Config.MAX_LEVEL;
    const isCaptain = ingredient.type === IngredientType.SEASONING_CAPTAIN;

    return (
      <div className="flex flex-col h-full">
        <div className="flex bg-black/50 p-2 rounded-2xl shrink-0 mb-8 border-2 border-white/5 shadow-inner">
           <button onClick={() => setViewMode('STATS')} className={`flex-1 py-3 rounded-xl text-base font-black uppercase tracking-widest transition-all font-display ${viewMode === 'STATS' ? 'bg-[#5d4037] text-white shadow-lg scale-105' : 'text-stone-500 hover:text-stone-300'}`}>數值強化</button>
           <button onClick={() => setViewMode('SKILLS')} className={`flex-1 py-3 rounded-xl text-base font-black uppercase tracking-widest transition-all relative font-display ${viewMode === 'SKILLS' ? 'bg-blue-700 text-white shadow-lg scale-105' : 'text-stone-500 hover:text-stone-300'}`}>
             天賦樹 {ingredient.availableSkillPoints > 0 && <span className="absolute top-2 right-4 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
           </button>
        </div>

        {viewMode === 'SKILLS' ? (
           <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6 bg-blue-900/20 p-5 rounded-2xl border-2 border-blue-500/30 shadow-2xl">
                 <div><h3 className="text-yellow-400 font-black text-2xl font-display drop-shadow-md">天賦點剩餘</h3><p className="text-blue-300 text-sm font-bold">每 5 級獲得 1 點</p></div>
                 <div className="text-6xl font-display font-black text-white drop-shadow-[0_0_15px_#3b82f6]">{ingredient.availableSkillPoints}</div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-10 pb-20">
                 {[1, 2, 3].map(tier => {
                    const tierSkills = getSkillsForType(ingredient.type).filter(s => s.tier === tier);
                    if (!tierSkills.length) return null;
                    return (
                      <div key={tier} className="relative pl-8 border-l-4 border-dashed border-[#5d4037]">
                         <div className="absolute -left-[18px] top-0 bg-yellow-600 text-black text-xs font-black px-2 py-1 rounded-full font-display border-2 border-white shadow-lg">階層 {tier}</div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {tierSkills.map(skill => {
                               const isSelected = ingredient.selectedSkills.includes(skill.id);
                               const canBuy = !isSelected && ingredient.availableSkillPoints >= skill.cost && ingredient.level >= skill.unlockLevel;
                               return (
                                 <button key={skill.id} onClick={() => canBuy && onSelectSkill(selectedSlot.id, skill.id)} disabled={!canBuy && !isSelected}
                                   className={`p-5 rounded-2xl border-4 text-left transition-all relative overflow-hidden group
                                     ${isSelected ? 'bg-blue-900/60 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-105' : (canBuy ? 'bg-[#3e2723] border-[#5d4037] hover:border-yellow-400 hover:scale-[1.02]' : 'bg-[#1a1512] border-transparent opacity-50 cursor-not-allowed')}
                                   `}
                                 >
                                   <div className="flex justify-between items-start mb-2"><span className={`font-black text-xl font-display ${isSelected ? 'text-blue-300' : 'text-yellow-100'}`}>{skill.name}</span><span className="text-sm font-display font-black bg-black/40 px-3 py-1 rounded-full text-yellow-500">{skill.cost} SP</span></div>
                                   <p className="text-sm text-[#d7ccc8] font-bold leading-relaxed">{skill.description}</p>
                                   {!isSelected && <div className="mt-4 text-[11px] font-black uppercase text-stone-500 tracking-tighter">需求等級: Lv.{skill.unlockLevel}</div>}
                                   {isSelected && <div className="absolute top-2 right-2"><Check size={32} className="text-blue-400 opacity-20" /></div>}
                                 </button>
                               );
                            })}
                         </div>
                      </div>
                    );
                 })}
              </div>
              <button onClick={() => onResetSkills(selectedSlot.id)} className="mt-6 woodBtnStyle w-full py-4 text-xl"><RotateCcw size={24} /> 重置所有技能 ($500)</button>
           </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className={`flex flex-col bg-[#2a2522] p-8 rounded-3xl border-4 relative overflow-hidden flex-1 shadow-2xl ${ingredient.type.startsWith('BONUS_') ? 'border-pink-900/50' : 'border-[#3e2723]'} ${ingredient.type.startsWith('SUPREME_') || isCaptain ? 'border-cyan-700 shadow-[inset_0_0_50px_rgba(6,182,212,0.2)]' : ''}`}>
              <div className="flex items-center gap-8 mb-10">
                  <div className="w-32 h-32 relative shrink-0 bg-black/40 rounded-3xl p-4 border-2 border-white/5 shadow-inner scale-110"><IngredientRenderer type={ingredient.type} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-5xl font-black text-white font-display mb-3 drop-shadow-md tracking-tight">{stats.name}</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-yellow-400 text-xl font-display font-black bg-yellow-900/40 px-4 py-1 rounded-xl border-2 border-yellow-700/50 shadow-lg">LVL {ingredient.level}</span>
                        {ingredient.type.includes('SUPREME') && <span className="text-cyan-400 text-lg font-black uppercase border-2 border-cyan-800 px-3 py-1 rounded-xl font-display animate-pulse">SUPREME</span>}
                    </div>
                  </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mb-10">
                  <div className="flex items-center justify-between bg-black/30 p-5 rounded-2xl border-2 border-white/5">
                      <div className="text-stone-400 text-lg font-black font-display uppercase flex items-center gap-3"><Sword size={24} className="text-red-500"/> 攻擊力</div>
                      <div className="flex items-baseline gap-4"><span className="text-4xl font-display font-black text-white">{Math.floor(stats.damage * (1 + ingredient.level * 0.5))}</span>{!isMaxLevel && <div className="text-xl text-green-500 font-display animate-bounce">▲ {Math.floor(stats.damage * (1 + (ingredient.level + 1) * 0.5))}</div>}</div>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 p-5 rounded-2xl border-2 border-white/5">
                      <div className="text-stone-400 text-lg font-black font-display uppercase flex items-center gap-3"><Heart size={24} className="text-green-500"/> 生命值</div>
                      <div className="flex items-baseline gap-4"><span className="text-4xl font-display font-black text-white">{Math.floor(ingredient.maxHp)}</span>{!isMaxLevel && <div className="text-xl text-green-500 font-display animate-bounce">▲ {Math.floor(ingredient.maxHp * STAT_MULTIPLIER)}</div>}</div>
                  </div>
              </div>
            </div>
            <div className="flex gap-6 mt-8 shrink-0">
              <button onClick={onUpgrade} disabled={!canAfford || isMaxLevel} className={`${actionBtnBase} ${canAfford && !isMaxLevel ? upgradeBtnStyle : disabledBtnStyle}`}>
                  <div className="flex flex-col items-center gap-1"><span>{isMaxLevel ? '已達上限' : '強化食材'}</span>{!isMaxLevel && <span className="text-base font-display text-yellow-300 shadow-sm">${upgradeCost}</span>}</div>
              </button>
              <button onClick={onSell} disabled={isCaptain} className={`${actionBtnBase} ${isCaptain ? disabledBtnStyle : sellBtnStyle}`}>
                 <div className="flex flex-col items-center gap-1"><span>回收食材</span>{!isCaptain && <span className="text-base font-display opacity-80">+${Math.floor(stats.cost * 0.5)}</span>}</div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-zoom-in" onClick={onClose}>
      <div className="bg-wood w-full max-w-6xl h-[90vh] rounded-[2rem] border-[10px] border-[#2d1f16] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-20 w-12 h-16 bg-gradient-to-b from-[#78716c] to-[#44403c] rounded-b-2xl shadow-2xl border-x-4 border-b-4 border-[#292524] z-20"></div>
        <div className="absolute top-0 right-20 w-12 h-16 bg-gradient-to-b from-[#78716c] to-[#44403c] rounded-b-2xl shadow-2xl border-x-4 border-b-4 border-[#292524] z-20"></div>
        <div className="bg-[#2d1f16] p-8 pt-10 border-b-4 border-[#1c130d] flex justify-between items-center shrink-0 shadow-2xl relative z-10">
          <div className="flex items-center gap-6">
             <div className="bg-amber-600 p-4 rounded-2xl text-white shadow-[0_0_20px_#d97706] border-2 border-amber-400 scale-110"><ChefHat size={40} /></div>
             <div><h2 className="text-5xl font-black text-amber-500 uppercase tracking-tighter font-display drop-shadow-[0_4px_0_#000]">{currentIngredient ? '強化工坊' : '食材市場'}</h2><div className="flex items-center gap-5 text-xl text-stone-400 font-black mt-2 font-display"><span className="flex items-center gap-2 bg-black/40 px-4 py-1 rounded-full text-yellow-400 border border-yellow-600/30 shadow-inner"><Coins size={20}/> ${gameState.money}</span></div></div>
          </div>
          <button onClick={onClose} className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl transition-all border-4 border-red-900 shadow-xl active:scale-90"><X size={32} /></button>
        </div>
        <div className="flex-1 overflow-hidden p-8 relative flex flex-col bg-[#1e1916]">{currentIngredient ? renderUpgrade(currentIngredient) : renderShop()}</div>
        <div className="bg-[#2d1f16] p-6 border-t-4 border-[#3f2e23] shrink-0 flex items-center gap-8 relative shadow-2xl z-10">
            <div className="w-20 h-20 rounded-full bg-stone-800 border-4 border-stone-600 overflow-hidden shrink-0 shadow-2xl flex items-center justify-center scale-110"><ChefHat size={40} className="text-stone-500"/></div>
            <div className="flex-1 bg-black/50 p-5 rounded-3xl border-2 border-white/5 relative italic text-xl text-[#d7ccc8] font-bold leading-snug drop-shadow-md">"{chefMessage || '選得好不如烤得好！需要建議嗎？'}"</div>
            <button onClick={handleAskChef} disabled={loadingAdvice} className="bg-blue-600 hover:bg-blue-500 text-white text-2xl font-black px-12 py-5 rounded-2xl shadow-[0_0_20px_#3b82f6] flex items-center gap-4 font-display transition-all active:scale-95 disabled:opacity-50">{loadingAdvice ? <RotateCcw className="animate-spin" size={28} /> : <Info size={28} />} 諮詢</button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeMenu;
