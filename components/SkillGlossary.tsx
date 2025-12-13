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

  // Filter types based on selection
  const filteredTypes = Object.values(IngredientType).filter(type => {
    if (filter === 'BASIC') return !type.includes('KING_') && !type.includes('GOD_');
    if (filter === 'KING') return type.includes('KING_');
    if (filter === 'GOD') return type.includes('GOD_');
    return true;
  });

  // Ensure selectedType is valid within current filter, otherwise reset to first in list
  React.useEffect(() => {
    if (!filteredTypes.includes(selectedType)) {
      if (filteredTypes.length > 0) {
        setSelectedType(filteredTypes[0]);
      }
    }
  }, [filter, filteredTypes, selectedType]);

  const currentStats = INGREDIENT_STATS[selectedType];
  const skills = getSkillsForType(selectedType);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#1e1e1e] w-full max-w-4xl h-[80vh] rounded-2xl border-2 border-[#3d2b2b] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#2a1a1a] p-4 border-b border-[#3d2b2b] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-yellow-600 p-2 rounded-lg text-white">
                <BookOpen size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-yellow-500">烤串英雄技能圖鑑</h2>
                <p className="text-gray-400 text-xs">查看所有食材的潛在能力與天賦</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar (Ingredient List) */}
          <div className="w-1/3 bg-[#181818] flex flex-col border-r border-[#3d2b2b]">
            {/* Filter Tabs */}
            <div className="flex p-2 gap-1 border-b border-[#3d2b2b]">
               {(['BASIC', 'KING', 'GOD'] as const).map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`flex-1 py-2 rounded text-xs font-bold transition-all
                     ${filter === f 
                        ? (f === 'BASIC' ? 'bg-orange-600 text-white' : f === 'KING' ? 'bg-yellow-500 text-black' : 'bg-red-700 text-white') 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                     }
                   `}
                 >
                   {f === 'BASIC' ? '基礎' : f === 'KING' ? '王者' : '戰神'}
                 </button>
               ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
               {filteredTypes.map(type => (
                 <button
                   key={type}
                   onClick={() => setSelectedType(type)}
                   className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                     ${selectedType === type 
                        ? 'bg-[#2a2a2a] border-yellow-500 shadow-md' 
                        : 'bg-transparent border-transparent hover:bg-white/5'
                     }
                   `}
                 >
                    <div className="w-10 h-10 shrink-0">
                       <IngredientRenderer type={type} />
                    </div>
                    <div className="min-w-0">
                       <div className={`font-bold text-sm truncate ${type.includes('GOD') ? 'text-red-400' : type.includes('KING') ? 'text-yellow-400' : 'text-gray-200'}`}>
                         {INGREDIENT_STATS[type].name}
                       </div>
                    </div>
                 </button>
               ))}
            </div>
          </div>

          {/* Main Content (Skill Tree) */}
          <div className="flex-1 bg-[#1e1e1e] p-6 overflow-y-auto custom-scrollbar flex flex-col">
             {/* Ingredient Info Header */}
             <div className="flex items-center gap-6 mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="w-20 h-20 shrink-0">
                   <div className="scale-125 w-full h-full">
                     <IngredientRenderer type={selectedType} />
                   </div>
                </div>
                <div>
                   <h3 className={`text-2xl font-bold mb-1 ${selectedType.includes('GOD') ? 'text-red-500' : selectedType.includes('KING') ? 'text-yellow-400' : 'text-white'}`}>
                     {currentStats?.name}
                   </h3>
                   <p className="text-gray-400 text-sm">{currentStats?.description}</p>
                   
                   <div className="flex gap-4 mt-3 text-xs">
                      <div className="bg-gray-800 px-2 py-1 rounded text-red-300">
                        攻擊: {currentStats?.damage}
                      </div>
                      <div className="bg-gray-800 px-2 py-1 rounded text-green-300">
                        生命: {currentStats?.maxHp}
                      </div>
                      <div className="bg-gray-800 px-2 py-1 rounded text-blue-300">
                        攻速: {(currentStats?.attackSpeed / 1000).toFixed(1)}s
                      </div>
                   </div>
                </div>
             </div>

             {/* Skills */}
             <div className="space-y-8">
                <div className="flex items-center gap-2 mb-4">
                   <Star size={18} className="text-yellow-500" />
                   <h4 className="font-bold text-lg text-gray-200">專屬技能樹</h4>
                </div>

                {[1, 2, 3].map(tier => {
                   const tierSkills = skills.filter(s => s.tier === tier);
                   if (tierSkills.length === 0) return null;

                   return (
                     <div key={tier} className="relative pl-6 border-l-2 border-dashed border-gray-700 pb-8 last:pb-0">
                        <div className="absolute -left-[11px] top-0 bg-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-gray-300 border border-gray-500">
                           Tier {tier}
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3 ml-2 flex items-center gap-1">
                           <Lock size={10} /> 需要等級 Lv.{tierSkills[0].unlockLevel}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {tierSkills.map(skill => (
                             <div 
                               key={skill.id} 
                               className={`p-4 rounded-lg border transition-all duration-300 group relative overflow-hidden hover:scale-[1.03] hover:shadow-lg
                                 ${skill.hidden 
                                   ? 'bg-purple-900/20 border-purple-800 hover:border-purple-500' 
                                   : 'bg-[#252525] border-gray-700 hover:border-yellow-500/50'
                                 }
                               `}
                             >
                                {skill.hidden && (
                                   <div className="absolute -right-4 -top-4 bg-purple-600 w-12 h-12 rotate-45 flex items-end justify-center pb-1">
                                      <EyeOff size={10} className="text-white -rotate-45" />
                                   </div>
                                )}
                                <div className="flex justify-between items-start mb-2">
                                   <div className={`font-bold text-base group-hover:text-blue-200 ${skill.hidden ? 'text-purple-300' : 'text-blue-300'}`}>
                                     {skill.name}
                                   </div>
                                   <div className="text-xs font-mono text-yellow-600 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-900/50">
                                     {skill.cost} SP
                                   </div>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
                                  {skill.description}
                                </p>
                             </div>
                           ))}
                        </div>
                     </div>
                   );
                })}

                {skills.length === 0 && (
                  <div className="text-center text-gray-500 py-10 bg-black/10 rounded-xl">
                     此食材暫無特殊技能。
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGlossary;