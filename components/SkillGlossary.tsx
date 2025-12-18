
import React, { useState } from 'react';
import { IngredientType } from '../types';
import { INGREDIENT_STATS, getSkillsForType } from '../constants';
import { IngredientRenderer } from './GameAssets';
import { X, BookOpen, Lock, Star, Shield, Zap, EyeOff } from 'lucide-react';

interface SkillGlossaryProps {
  onClose: () => void;
}

const SkillGlossary: React.FC<SkillGlossaryProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<'BASIC' | 'KING' | 'GOD'>('BASIC');
  const [selectedType, setSelectedType] = useState<IngredientType>(IngredientType.BEEF);

  const filteredTypes = Object.values(IngredientType).filter(type => {
    if (filter === 'BASIC') return !type.includes('KING_') && !type.includes('GOD_') && !type.includes('SUPREME_') && !type.startsWith('BONUS_');
    if (filter === 'KING') return type.includes('KING_');
    if (filter === 'GOD') return type.includes('GOD_');
    return true;
  });

  React.useEffect(() => {
    if (!filteredTypes.includes(selectedType) && filteredTypes.length > 0) setSelectedType(filteredTypes[0]);
  }, [filter]);

  const currentStats = INGREDIENT_STATS[selectedType];
  const skills = getSkillsForType(selectedType);

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#1e1e1e] w-full max-w-6xl h-[85vh] rounded-[2.5rem] border-8 border-[#3d2b2b] shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative">
        <div className="bg-gradient-to-b from-[#2a1a1a] to-[#1a1a1a] p-8 border-b-4 border-[#3d2b2b] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
             <div className="bg-yellow-600 p-4 rounded-2xl text-black shadow-2xl border-4 border-yellow-400 rotate-2 scale-110"><BookOpen size={40} /></div>
             <div><h2 className="text-5xl font-black text-yellow-500 font-display drop-shadow-[0_4px_0_#000] tracking-tighter">烤串英雄技能圖鑑</h2><p className="text-stone-400 text-lg font-bold tracking-widest uppercase opacity-70">官方食材能力百科全書</p></div>
          </div>
          <button onClick={onClose} className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl transition-all border-4 border-red-900 shadow-xl active:scale-90"><X size={32} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 bg-black/40 flex flex-col border-r-4 border-[#3d2b2b]">
            <div className="flex p-4 gap-2 border-b-4 border-[#3d2b2b]">
               {(['BASIC', 'KING', 'GOD'] as const).map(f => (
                 <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-4 rounded-xl text-lg font-black transition-all font-display border-b-4 active:border-b-0 active:translate-y-1 shadow-lg ${filter === f ? 'bg-orange-600 text-white border-orange-800 ring-2 ring-white/20' : 'bg-stone-800 text-stone-500 border-stone-900 opacity-60'}`}>{f === 'BASIC' ? '基礎' : f === 'KING' ? '王者' : '戰神'}</button>
               ))}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-black/20">
               {filteredTypes.map(type => (
                 <button key={type} onClick={() => setSelectedType(type)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left shadow-lg ${selectedType === type ? 'bg-[#3e2723] border-yellow-500 scale-105 ring-2 ring-yellow-500/20' : 'bg-[#1e1e1e] border-transparent hover:bg-stone-800'}`}>
                    <div className="w-14 h-14 shrink-0 drop-shadow-xl"><IngredientRenderer type={type} /></div>
                    <div className="min-w-0"><div className={`font-black text-xl truncate font-display ${type.includes('GOD') ? 'text-red-400' : type.includes('KING') ? 'text-yellow-400' : 'text-[#d7ccc8]'}`}>{INGREDIENT_STATS[type].name}</div></div>
                 </button>
               ))}
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-[#1e1e1e] to-[#0a0a0a] p-10 overflow-y-auto custom-scrollbar">
             <div className="flex items-center gap-10 mb-12 bg-black/40 p-8 rounded-3xl border-4 border-white/5 shadow-inner">
                <div className="w-32 h-32 shrink-0 scale-125 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"><IngredientRenderer type={selectedType} /></div>
                <div className="flex-1">
                   <h3 className={`text-6xl font-black mb-4 font-display tracking-tighter drop-shadow-md ${selectedType.includes('GOD') ? 'text-red-500' : selectedType.includes('KING') ? 'text-yellow-400' : 'text-white'}`}>{currentStats?.name}</h3>
                   <p className="text-stone-300 text-xl font-bold italic opacity-80 leading-relaxed mb-6">"{currentStats?.description}"</p>
                   <div className="flex gap-6"><div className="bg-red-950/50 px-6 py-2 rounded-xl border-2 border-red-900/50 text-red-300 font-display text-xl font-black shadow-lg">攻擊: {currentStats?.damage}</div><div className="bg-green-950/50 px-6 py-2 rounded-xl border-2 border-green-900/50 text-green-300 font-display text-xl font-black shadow-lg">生命: {currentStats?.maxHp}</div><div className="bg-blue-950/50 px-6 py-2 rounded-xl border-2 border-blue-900/50 text-blue-300 font-display text-xl font-black shadow-lg">攻速: {(currentStats?.attackSpeed / 1000).toFixed(1)}s</div></div>
                </div>
             </div>

             <div className="space-y-12">
                <div className="flex items-center gap-4 mb-8"><Star size={32} className="text-yellow-400 drop-shadow-[0_0_10px_#facc15]" /><h4 className="font-black text-3xl text-white font-display tracking-widest uppercase">專屬天賦樹解密</h4></div>
                {[1, 2, 3].map(tier => {
                   const tierSkills = skills.filter(s => s.tier === tier);
                   if (!tierSkills.length) return null;
                   return (
                     <div key={tier} className="relative pl-12 border-l-8 border-dashed border-[#3d2b2b] pb-12 last:pb-0">
                        <div className="absolute -left-[28px] top-0 bg-[#3d2b2b] text-sm font-black px-3 py-1 rounded-full text-yellow-500 border-4 border-[#1e1e1e] font-display shadow-2xl">Tier {tier}</div>
                        <div className="text-lg text-stone-500 mb-6 flex items-center gap-2 font-black uppercase tracking-tighter"><Lock size={18} /> 需要等級 Lv.{tierSkills[0].unlockLevel}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {tierSkills.map(skill => (
                             <div key={skill.id} className="p-8 rounded-[2rem] border-4 border-[#3d2b2b] bg-black/40 shadow-2xl transition-all hover:scale-[1.05] hover:border-blue-500/50 group">
                                <div className="flex justify-between items-center mb-4"><div className="font-black text-2xl font-display text-blue-400 group-hover:text-blue-300 transition-colors">{skill.name}</div><div className="text-lg font-display font-black text-yellow-500 bg-yellow-900/30 px-4 py-1 rounded-full border-2 border-yellow-600/50 shadow-inner">{skill.cost} SP</div></div>
                                <p className="text-lg text-stone-400 font-bold leading-relaxed group-hover:text-stone-200 transition-colors">{skill.description}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGlossary;
