
import React from 'react';
import { EnemyType, IngredientType } from '../types';

// --- Base SVG Components ---

// Beef
export const BeefSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="15" y="15" width="70" height="70" rx="15" fill="#8B4513" stroke="#5D2906" strokeWidth="3" /><path d="M25 30 L75 30" stroke="#3E1A03" strokeWidth="4" opacity="0.6" strokeLinecap="round" /><path d="M25 50 L75 50" stroke="#3E1A03" strokeWidth="4" opacity="0.6" strokeLinecap="round" /><path d="M25 70 L75 70" stroke="#3E1A03" strokeWidth="4" opacity="0.6" strokeLinecap="round" /><ellipse cx="70" cy="25" rx="10" ry="5" fill="#FFFFFF" opacity="0.2" transform="rotate(20 70 25)" /></svg>
);
export const KingBeefSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"><rect x="10" y="15" width="80" height="70" rx="15" fill="#B45309" stroke="#FBBF24" strokeWidth="4" /><path d="M20 35 L80 35 M20 55 L80 55 M20 75 L80 75" stroke="#FBBF24" strokeWidth="3" opacity="0.8" /><path d="M30 15 L30 0 L45 10 L50 0 L55 10 L70 0 L70 15 Z" fill="#FACC15" stroke="#B45309" strokeWidth="2" /></svg>
);
export const GodBeefSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"><rect x="10" y="15" width="80" height="70" rx="15" fill="#450A0A" stroke="#DC2626" strokeWidth="4" className="animate-pulse" /><path d="M30 30 L50 50 L70 30 M30 70 L50 50 L70 70" stroke="#EF4444" strokeWidth="3" fill="none" /><path d="M20 15 Q10 0 0 10 M80 15 Q90 0 100 10" stroke="#DC2626" strokeWidth="5" fill="none" /></svg>
);
export const SupremeBeefSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#06b6d4]"><rect x="10" y="15" width="80" height="70" rx="15" fill="#083344" stroke="#22d3ee" strokeWidth="4" className="animate-pulse" /><path d="M20 35 L80 35 M20 55 L80 55 M20 75 L80 75" stroke="#67e8f9" strokeWidth="3" opacity="0.8" /><path d="M30 15 L30 0 L45 10 L50 0 L55 10 L70 0 L70 15 Z" fill="#cffafe" stroke="#083344" strokeWidth="2" /><circle cx="70" cy="25" r="5" fill="#22d3ee" className="animate-ping" /></svg>
);

// Chili
export const ChiliSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M50 10 Q80 10 85 40 Q90 80 50 95 Q20 80 30 40 Q35 10 50 10 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="3" /><path d="M50 10 Q45 0 55 -5 L60 0 Q55 5 50 10" fill="#166534" stroke="#14532D" strokeWidth="2" /><path d="M40 20 Q50 20 55 40" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" fill="none" /></svg>
);
export const KingChiliSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"><path d="M50 10 Q85 10 90 40 Q95 80 50 95 Q15 80 25 40 Q30 10 50 10 Z" fill="#EAB308" stroke="#713F12" strokeWidth="3" /><path d="M50 10 L40 0 L60 0 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" /><path d="M40 20 Q50 20 55 40" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.8" fill="none" /></svg>
);
export const GodChiliSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,1)]"><path d="M50 5 Q85 5 90 40 Q95 90 50 95 Q15 90 20 40 Q25 5 50 5 Z" fill="#1E40AF" stroke="#60A5FA" strokeWidth="3" className="animate-pulse" /><path d="M10 20 L20 30 M90 20 L80 30 M50 95 L50 105" stroke="#93C5FD" strokeWidth="2" className="animate-ping" /><ellipse cx="50" cy="50" rx="10" ry="25" fill="#60A5FA" opacity="0.7" filter="blur(2px)" /></svg>
);
export const SupremeChiliSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#a855f7]"><path d="M50 5 Q85 5 90 40 Q95 90 50 95 Q15 90 20 40 Q25 5 50 5 Z" fill="#581c87" stroke="#d8b4fe" strokeWidth="3" className="animate-pulse" /><path d="M50 5 L40 -5 L60 -5 Z" fill="#e9d5ff" stroke="#581c87" strokeWidth="1" /><circle cx="50" cy="50" r="10" fill="#d8b4fe" filter="blur(5px)" /><path d="M20 20 L30 30 M80 20 L70 30" stroke="#f0abfc" strokeWidth="3" className="animate-spin-slow" /></svg>
);

// Garlic
export const GarlicSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M50 15 C80 15 90 45 90 65 C90 85 75 95 50 95 C25 95 10 85 10 65 C10 45 20 15 50 15" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" /><path d="M50 95 C50 80 50 30 50 15 M50 95 C70 80 75 40 50 15 M50 95 C30 80 25 40 50 15" stroke="#E5E7EB" strokeWidth="2" fill="none" /><path d="M50 15 L50 5" stroke="#A3A3A3" strokeWidth="3" strokeLinecap="round" /></svg>
);
export const KingGarlicSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg"><path d="M50 15 C85 15 95 45 95 65 C95 85 75 95 50 95 C25 95 5 85 5 65 C5 45 15 15 50 15" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" /><path d="M50 95 C50 80 50 30 50 15" stroke="#CA8A04" strokeWidth="2" fill="none" /><path d="M35 15 L35 5 L45 10 L50 0 L55 10 L65 5 L65 15" fill="#EF4444" stroke="#B91C1C" /></svg>
);
export const GodGarlicSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"><ellipse cx="50" cy="15" rx="30" ry="5" fill="none" stroke="#FCD34D" strokeWidth="4" className="animate-bounce" /><path d="M50 20 C80 20 90 50 90 70 C90 90 75 95 50 95 C25 95 10 90 10 70 C10 50 20 20 50 20" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" opacity="0.9" /><circle cx="50" cy="60" r="15" fill="#BAE6FD" filter="blur(5px)" className="animate-pulse" /></svg>
);
export const SupremeGarlicSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#14b8a6]"><path d="M50 15 C85 15 95 45 95 65 C95 85 75 95 50 95 C25 95 5 85 5 65 C5 45 15 15 50 15" fill="#134e4a" stroke="#2dd4bf" strokeWidth="3" /><path d="M50 95 C50 80 50 30 50 15" stroke="#5eead4" strokeWidth="2" fill="none" /><circle cx="50" cy="55" r="20" fill="none" stroke="#ccfbf1" strokeWidth="2" strokeDasharray="5,5" className="animate-spin-slow" /></svg>
);

// Corn
export const CornSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M20 90 Q10 50 30 20 L70 20 Q90 50 80 90 Z" fill="#65A30D" stroke="#365314" strokeWidth="2" /><rect x="35" y="10" width="30" height="70" rx="10" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" /><circle cx="45" cy="20" r="4" fill="#FEF08A" /><circle cx="55" cy="20" r="4" fill="#FEF08A" /><circle cx="45" cy="35" r="4" fill="#FEF08A" /><circle cx="55" cy="35" r="4" fill="#FEF08A" /><circle cx="45" cy="50" r="4" fill="#FEF08A" /><circle cx="55" cy="50" r="4" fill="#FEF08A" /></svg>);
export const KingCornSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"><path d="M15 95 Q5 50 30 15 L70 15 Q95 50 85 95 Z" fill="#A16207" stroke="#FBBF24" strokeWidth="3" /><rect x="35" y="10" width="30" height="75" rx="10" fill="#EAB308" stroke="#FDE047" strokeWidth="2" /><circle cx="45" cy="20" r="5" fill="#FEF9C3" /><circle cx="55" cy="20" r="5" fill="#FEF9C3" /><circle cx="45" cy="40" r="5" fill="#FEF9C3" /><circle cx="55" cy="40" r="5" fill="#FEF9C3" /><path d="M35 10 L30 0 L45 5 L50 -5 L55 5 L70 0 L65 10" fill="#FACC15" stroke="#B45309" /></svg>);
export const GodCornSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]"><circle cx="50" cy="50" r="45" fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="5,5" className="animate-spin-slow" /><path d="M25 90 Q15 50 35 20 L65 20 Q85 50 75 90 Z" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" /><rect x="38" y="15" width="24" height="70" rx="8" fill="#FDBA74" className="animate-pulse" /><circle cx="50" cy="50" r="10" fill="#FFF7ED" filter="blur(4px)" /></svg>);
export const SupremeCornSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#ec4899]"><path d="M20 90 Q10 50 30 20 L70 20 Q90 50 80 90 Z" fill="#831843" stroke="#f472b6" strokeWidth="2" /><rect x="35" y="10" width="30" height="70" rx="10" fill="#be185d" stroke="#fbcfe8" strokeWidth="2" /><circle cx="45" cy="20" r="4" fill="#fce7f3" className="animate-ping" /><circle cx="55" cy="35" r="4" fill="#fce7f3" className="animate-ping" style={{animationDelay: '0.2s'}} /><circle cx="45" cy="50" r="4" fill="#fce7f3" className="animate-ping" style={{animationDelay: '0.4s'}} /></svg>);

// Sausage
export const SausageSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="30" y="10" width="40" height="80" rx="20" fill="#BE123C" stroke="#881337" strokeWidth="3" transform="rotate(-10 50 50)" /><path d="M40 20 Q45 20 45 70" stroke="white" strokeWidth="4" opacity="0.3" strokeLinecap="round" transform="rotate(-10 50 50)" fill="none" /></svg>);
export const KingSausageSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"><rect x="25" y="5" width="50" height="90" rx="25" fill="#9F1239" stroke="#FBBF24" strokeWidth="4" transform="rotate(-10 50 50)" /><path d="M40 15 L60 15 L50 5 Z" fill="#FACC15" transform="rotate(-10 50 50)" /><path d="M35 20 Q45 20 45 80" stroke="#FDE047" strokeWidth="5" opacity="0.6" strokeLinecap="round" transform="rotate(-10 50 50)" fill="none" /></svg>);
export const GodSausageSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]"><rect x="30" y="10" width="40" height="80" rx="20" fill="#831843" stroke="#EC4899" strokeWidth="4" transform="rotate(-10 50 50)" className="animate-pulse" /><path d="M40 10 L60 10 L50 90 L30 90 Z" fill="#FBCFE8" opacity="0.3" transform="rotate(-10 50 50)" filter="blur(2px)" /></svg>);
export const SupremeSausageSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#f59e0b]">
  <defs>
    <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="20%" stopColor="#fcd34d" />
        <stop offset="40%" stopColor="#86efac" />
        <stop offset="60%" stopColor="#7dd3fc" />
        <stop offset="80%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#f0abfc" />
    </linearGradient>
  </defs>
  <rect x="30" y="10" width="40" height="80" rx="20" fill="#451a03" stroke="#fbbf24" strokeWidth="3" transform="rotate(-10 50 50)" />
  <path d="M30 10 L70 10 L70 90 L30 90" fill="url(#rainbow)" opacity="0.5" transform="rotate(-10 50 50)" />
  <path d="M40 20 Q45 20 45 70" stroke="#fffbeb" strokeWidth="4" strokeLinecap="round" transform="rotate(-10 50 50)" fill="none" className="animate-pulse" />
</svg>);

// Mushroom
export const MushroomSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="40" y="50" width="20" height="40" rx="5" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" /><path d="M10 50 Q50 0 90 50 Z" fill="#713F12" stroke="#451A03" strokeWidth="3" /><circle cx="30" cy="40" r="5" fill="#D97706" opacity="0.6" /><circle cx="70" cy="35" r="4" fill="#D97706" opacity="0.6" /><circle cx="50" cy="25" r="6" fill="#D97706" opacity="0.6" /></svg>);
export const KingMushroomSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#A855F7]"><rect x="40" y="50" width="20" height="40" rx="5" fill="#F3E8FF" stroke="#A855F7" strokeWidth="2" /><path d="M5 50 Q50 -10 95 50 Z" fill="#581C87" stroke="#D8B4FE" strokeWidth="3" /><circle cx="30" cy="40" r="6" fill="#A855F7" /><circle cx="70" cy="35" r="5" fill="#A855F7" /><circle cx="50" cy="20" r="7" fill="#A855F7" /><path d="M40 10 L50 0 L60 10" fill="#FACC15" /></svg>);
export const GodMushroomSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#000]"><rect x="42" y="55" width="16" height="40" rx="5" fill="#18181B" stroke="#52525B" strokeWidth="2" /><path d="M5 55 Q50 -15 95 55 Z" fill="#000000" stroke="#7C3AED" strokeWidth="3" /><circle cx="50" cy="30" r="10" fill="#8B5CF6" className="animate-ping" /><circle cx="30" cy="45" r="5" fill="#4C1D95" /><circle cx="70" cy="45" r="5" fill="#4C1D95" /></svg>);
export const SupremeMushroomSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#f3f4f6]"><rect x="42" y="55" width="16" height="40" rx="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" /><path d="M5 55 Q50 -15 95 55 Z" fill="#f9fafb" stroke="#d1d5db" strokeWidth="3" /><circle cx="30" cy="40" r="6" fill="#e5e7eb" /><circle cx="70" cy="35" r="5" fill="#e5e7eb" /><circle cx="50" cy="20" r="7" fill="#e5e7eb" /><path d="M50 0 L55 10 L45 10 Z" fill="#60a5fa" className="animate-bounce" /></svg>);

// Onion
export const OnionSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M50 10 Q90 50 50 90 Q10 50 50 10" fill="#A855F7" stroke="#7E22CE" strokeWidth="2" /><path d="M50 20 Q75 50 50 80 Q25 50 50 20" stroke="#E9D5FF" strokeWidth="1" fill="none" /><path d="M50 10 L50 0" stroke="#22C55E" strokeWidth="3" /><circle cx="20" cy="50" r="2" fill="#38BDF8" className="animate-ping" /><circle cx="80" cy="50" r="2" fill="#38BDF8" className="animate-ping" style={{animationDelay: '0.5s'}} /></svg>);
export const KingOnionSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#C084FC]"><path d="M50 10 Q95 50 50 95 Q5 50 50 10" fill="#7E22CE" stroke="#FACC15" strokeWidth="3" /><path d="M50 25 Q70 50 50 75 Q30 50 50 25" stroke="#FDE047" strokeWidth="2" fill="none" /><path d="M50 10 L50 -5" stroke="#FACC15" strokeWidth="4" /><circle cx="20" cy="50" r="3" fill="#D8B4FE" className="animate-ping" /><circle cx="80" cy="50" r="3" fill="#D8B4FE" className="animate-ping" /></svg>);
export const GodOnionSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#4C1D95]"><path d="M50 10 Q95 50 50 95 Q5 50 50 10" fill="#2E1065" stroke="#8B5CF6" strokeWidth="3" className="animate-pulse" /><path d="M50 25 Q70 50 50 75 Q30 50 50 25" stroke="#8B5CF6" strokeWidth="2" fill="none" /><path d="M10 50 L90 50" stroke="#A78BFA" strokeWidth="1" opacity="0.5" /><circle cx="50" cy="50" r="15" fill="#5B21B6" filter="blur(5px)" /></svg>);
export const SupremeOnionSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#a78bfa]"><path d="M50 10 Q95 50 50 95 Q5 50 50 10" fill="#4c1d95" stroke="#c4b5fd" strokeWidth="2" /><path d="M50 25 Q70 50 50 75 Q30 50 50 25" stroke="#c4b5fd" strokeWidth="2" fill="none" className="animate-pulse" /><circle cx="50" cy="50" r="25" fill="none" stroke="#8b5cf6" strokeWidth="1" className="animate-spin-slow" /></svg>);

// Green Pepper
export const GreenPepperSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="25" y="20" width="50" height="60" rx="15" fill="#15803D" stroke="#14532D" strokeWidth="3" /><path d="M25 20 Q25 80 50 80 Q75 80 75 20" stroke="#14532D" strokeWidth="1" fill="none" opacity="0.3" /><rect x="45" y="10" width="10" height="10" fill="#14532D" /><path d="M25 50 L15 50 M75 50 L85 50" stroke="#15803D" strokeWidth="4" strokeLinecap="round" /></svg>);
export const KingGreenPepperSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#22C55E]"><rect x="20" y="15" width="60" height="70" rx="20" fill="#166534" stroke="#FACC15" strokeWidth="3" /><rect x="45" y="5" width="10" height="10" fill="#FACC15" /><path d="M20 30 L10 25 M20 50 L5 50 M20 70 L10 75 M80 30 L90 25 M80 50 L95 50 M80 70 L90 75" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" /></svg>);
export const GodGreenPepperSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#064E3B]"><rect x="20" y="15" width="60" height="70" rx="20" fill="#064E3B" stroke="#059669" strokeWidth="4" className="animate-pulse" /><path d="M0 0 L100 100 M100 0 L0 100" stroke="#065F46" strokeWidth="2" opacity="0.3" /><path d="M20 50 L5 50 M80 50 L95 50" stroke="#34D399" strokeWidth="6" strokeLinecap="round" /></svg>);
export const SupremeGreenPepperSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#84cc16]"><rect x="20" y="15" width="60" height="70" rx="20" fill="#3f6212" stroke="#bef264" strokeWidth="3" /><rect x="45" y="5" width="10" height="10" fill="#d9f99d" /><path d="M20 30 L80 30 M20 50 L80 50 M20 70 L80 70" stroke="#bef264" strokeWidth="2" opacity="0.5" /><circle cx="50" cy="50" r="10" fill="#d9f99d" className="animate-ping" /></svg>);

// Shrimp
export const ShrimpSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M30 70 Q20 20 70 20 Q90 20 90 40 Q90 60 70 60" fill="#FB7185" stroke="#BE123C" strokeWidth="3" strokeLinecap="round" /><path d="M30 70 Q40 40 60 40" stroke="#BE123C" strokeWidth="3" fill="none" /><path d="M45 50 Q55 30 70 30" stroke="#BE123C" strokeWidth="3" fill="none" /><path d="M30 70 L20 80 M30 70 L40 80" stroke="#FB7185" strokeWidth="4" /></svg>);
export const KingShrimpSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#F43F5E]"><path d="M25 75 Q15 15 75 15 Q95 15 95 40 Q95 65 75 65" fill="#E11D48" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" /><path d="M35 75 L20 85 M35 75 L45 85" stroke="#FACC15" strokeWidth="5" /><path d="M75 15 L75 5 L80 15" stroke="#FACC15" strokeWidth="3" fill="none" /></svg>);
export const GodShrimpSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_#0EA5E9]"><path d="M30 70 Q20 20 70 20 Q90 20 90 40 Q90 60 70 60" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" className="animate-pulse" /><path d="M20 20 Q50 0 80 20" stroke="#7DD3FC" strokeWidth="2" fill="none" className="animate-ping" /></svg>);
export const SupremeShrimpSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#2563eb]"><path d="M25 75 Q15 15 75 15 Q95 15 95 40 Q95 65 75 65" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" /><path d="M35 75 L20 85 M35 75 L45 85" stroke="#60a5fa" strokeWidth="5" /><circle cx="85" cy="30" r="5" fill="#bfdbfe" className="animate-ping" /></svg>);

// Chicken
export const ChickenSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="40" y="70" width="20" height="20" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" /><circle cx="45" cy="85" r="5" fill="#F3F4F6" stroke="#D1D5DB" /><circle cx="55" cy="85" r="5" fill="#F3F4F6" stroke="#D1D5DB" /><path d="M30 70 Q10 20 50 10 Q90 20 70 70 Z" fill="#D97706" stroke="#92400E" strokeWidth="3" /><path d="M35 30 Q50 40 65 30" stroke="#78350F" strokeWidth="2" fill="none" opacity="0.5" /><circle cx="20" cy="20" r="5" fill="red" className="animate-bounce" /><circle cx="80" cy="20" r="5" fill="red" className="animate-bounce" style={{animationDelay: '0.1s'}} /></svg>);
export const KingChickenSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#D97706]"><rect x="40" y="75" width="20" height="15" fill="#FDE047" stroke="#B45309" strokeWidth="2" /><path d="M25 75 Q5 15 50 5 Q95 15 75 75 Z" fill="#B45309" stroke="#FACC15" strokeWidth="3" /><path d="M40 5 L50 -5 L60 5" fill="#EF4444" /><circle cx="15" cy="15" r="6" fill="#FACC15" className="animate-bounce" /><circle cx="85" cy="15" r="6" fill="#FACC15" className="animate-bounce" /></svg>);
export const GodChickenSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#DC2626]"><path d="M30 70 Q10 20 50 10 Q90 20 70 70 Z" fill="#7F1D1D" stroke="#EF4444" strokeWidth="4" className="animate-pulse" /><path d="M50 10 Q90 -10 90 30" stroke="#FCA5A5" strokeWidth="3" fill="none" /><path d="M50 10 Q10 -10 10 30" stroke="#FCA5A5" strokeWidth="3" fill="none" /><circle cx="50" cy="40" r="10" fill="#EF4444" filter="blur(3px)" /></svg>);
export const SupremeChickenSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#e5e7eb]"><rect x="40" y="75" width="20" height="15" fill="#374151" stroke="#f3f4f6" strokeWidth="2" /><path d="M25 75 Q5 15 50 5 Q95 15 75 75 Z" fill="#111827" stroke="#e5e7eb" strokeWidth="3" /><circle cx="50" cy="40" r="5" fill="#fff" className="animate-ping" /></svg>);

// Squid
export const SquidSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M20 30 L50 0 L80 30 L80 50 L20 50 Z" fill="#E879F9" stroke="#A21CAF" strokeWidth="2" /><path d="M30 50 Q20 80 30 90" stroke="#E879F9" strokeWidth="4" fill="none" /><path d="M45 50 Q45 80 45 95" stroke="#E879F9" strokeWidth="4" fill="none" /><path d="M55 50 Q55 80 55 95" stroke="#E879F9" strokeWidth="4" fill="none" /><path d="M70 50 Q80 80 70 90" stroke="#E879F9" strokeWidth="4" fill="none" /></svg>);
export const KingSquidSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#D946EF]"><path d="M15 30 L50 -5 L85 30 L85 55 L15 55 Z" fill="#C026D3" stroke="#FACC15" strokeWidth="3" /><path d="M30 55 Q10 90 30 100" stroke="#F0ABFC" strokeWidth="5" fill="none" /><path d="M70 55 Q90 90 70 100" stroke="#F0ABFC" strokeWidth="5" fill="none" /><path d="M40 0 L50 -10 L60 0" fill="#FACC15" /></svg>);
export const GodSquidSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#111827]"><path d="M20 30 L50 0 L80 30 L80 50 L20 50 Z" fill="#111827" stroke="#4B5563" strokeWidth="2" /><path d="M30 50 Q10 100 50 80 Q90 100 70 50" stroke="#6B7280" strokeWidth="4" fill="none" className="animate-pulse" /><circle cx="35" cy="25" r="4" fill="#DC2626" /><circle cx="65" cy="25" r="4" fill="#DC2626" /></svg>);
export const SupremeSquidSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#be185d]"><path d="M15 30 L50 -5 L85 30 L85 55 L15 55 Z" fill="#831843" stroke="#f472b6" strokeWidth="3" /><path d="M30 55 Q10 90 30 100" stroke="#fbcfe8" strokeWidth="5" fill="none" /><path d="M70 55 Q90 90 70 100" stroke="#fbcfe8" strokeWidth="5" fill="none" /><circle cx="50" cy="25" r="10" fill="#f472b6" filter="blur(3px)" className="animate-pulse" /></svg>);

// Pineapple
export const PineappleSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="25" y="30" width="50" height="60" rx="10" fill="#FACC15" stroke="#A16207" strokeWidth="2" /><path d="M25 30 L75 90 M75 30 L25 90" stroke="#A16207" strokeWidth="1" opacity="0.5" /><path d="M50 30 L50 10 M50 30 L30 5 M50 30 L70 5" stroke="#15803D" strokeWidth="4" strokeLinecap="round" /><path d="M50 45 L50 75 M40 50 C60 50 60 65 50 75 C40 65 40 50 60 50" stroke="#A16207" strokeWidth="3" fill="none" /></svg>);
export const KingPineappleSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#FACC15]"><rect x="20" y="30" width="60" height="60" rx="15" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" /><path d="M20 30 L80 90 M80 30 L20 90" stroke="#CA8A04" strokeWidth="2" /><path d="M50 30 L50 0 M50 30 L25 -5 M50 30 L75 -5" stroke="#166534" strokeWidth="5" strokeLinecap="round" /><path d="M45 50 L45 75 M55 50 L55 75 M35 55 C75 55 75 70 35 70" stroke="#B45309" strokeWidth="3" fill="none" /></svg>);
export const GodPineappleSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_#F59E0B]"><rect x="25" y="30" width="50" height="60" rx="10" fill="#78350F" stroke="#F59E0B" strokeWidth="4" className="animate-pulse" /><path d="M40 50 L40 75 M50 50 L50 75 M60 50 L60 75 M35 55 C75 55 75 70 35 70" stroke="#FDE047" strokeWidth="3" fill="none" /><circle cx="50" cy="60" r="30" stroke="#FDE047" strokeWidth="2" fill="none" className="animate-spin-slow" /></svg>);
export const SupremePineappleSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#fbbf24]"><rect x="20" y="30" width="60" height="60" rx="15" fill="#b45309" stroke="#fcd34d" strokeWidth="3" /><path d="M20 30 L80 90 M80 30 L20 90" stroke="#fcd34d" strokeWidth="1" /><path d="M50 30 L50 0 M50 30 L25 -5 M50 30 L75 -5" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" /><circle cx="50" cy="60" r="20" fill="none" stroke="#fff" strokeWidth="2" className="animate-pulse" /></svg>);

// Marshmallow
export const MarshmallowSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="25" y="25" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" /><line x1="50" y1="75" x2="50" y2="100" stroke="#92400E" strokeWidth="3" /><circle cx="35" cy="55" r="3" fill="#FBCFE8" /><circle cx="65" cy="55" r="3" fill="#FBCFE8" /><rect x="45" y="40" width="10" height="20" fill="#F472B6" /><rect x="40" y="45" width="20" height="10" fill="#F472B6" /></svg>);
export const KingMarshmallowSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#F472B6]"><rect x="20" y="20" width="60" height="60" rx="15" fill="#FDF2F8" stroke="#F472B6" strokeWidth="3" /><path d="M30 20 L30 10 L40 15 L50 5 L60 15 L70 10 L70 20" fill="#F472B6" /><rect x="45" y="40" width="10" height="20" fill="#EC4899" /><rect x="40" y="45" width="20" height="10" fill="#EC4899" /></svg>);
export const GodMarshmallowSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#FFF]"><circle cx="50" cy="50" r="40" fill="#FFFFFF" filter="blur(5px)" opacity="0.5" /><rect x="25" y="25" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="2" /><path d="M10 50 L90 50 M50 10 L50 90" stroke="#93C5FD" strokeWidth="4" className="animate-spin-slow" /><rect x="45" y="40" width="10" height="20" fill="#3B82F6" /><rect x="40" y="45" width="20" height="10" fill="#3B82F6" /></svg>);
export const SupremeMarshmallowSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#f9a8d4]"><circle cx="50" cy="50" r="35" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" /><path d="M20 50 L80 50" stroke="#fff" strokeWidth="3" opacity="0.5" /><circle cx="35" cy="40" r="5" fill="#fff" /><circle cx="65" cy="40" r="5" fill="#fff" /><path d="M40 60 Q50 70 60 60" stroke="#ec4899" strokeWidth="2" fill="none" /></svg>);

// Seasoning Captain (Unique)
export const SeasoningCaptainSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_#22d3ee]">
     {/* Jar Body */}
     <rect x="25" y="25" width="50" height="60" rx="5" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="3" />
     {/* Label */}
     <rect x="25" y="40" width="50" height="30" fill="#0ea5e9" opacity="0.2" />
     {/* Lid */}
     <rect x="20" y="15" width="60" height="10" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
     {/* Eyes (Cute) handled by wrapper, but add some shine */}
     <path d="M30 30 L35 30" stroke="#fff" strokeWidth="2" opacity="0.5" />
     <path d="M70 30 L65 30" stroke="#fff" strokeWidth="2" opacity="0.5" />
     {/* Sparkles around */}
     <circle cx="15" cy="20" r="3" fill="#22d3ee" className="animate-ping" style={{animationDelay:'0.3s'}} />
     <circle cx="85" cy="80" r="2" fill="#22d3ee" className="animate-ping" style={{animationDelay:'0.3s'}} />
  </svg>
);

// --- Bonus Delicious Series SVG ---
export const BonusFoodSVG = ({type}: {type: IngredientType}) => {
  const getFoodStyle = (t: IngredientType) => {
      switch(t) {
          case IngredientType.BONUS_MINI_BUN: return { color: '#FDE047', shape: 'bun' }; 
          case IngredientType.BONUS_SQUID_BALL: return { color: '#F3F4F6', shape: 'ball_white' }; 
          case IngredientType.BONUS_PORK_BALL: return { color: '#D1D5DB', shape: 'ball_grey' }; 
          case IngredientType.BONUS_TEMPURA: return { color: '#D97706', shape: 'tempura' }; 
          case IngredientType.BONUS_RICE_CAKE: return { color: '#1F2937', shape: 'rice_cake' }; 
          case IngredientType.BONUS_TOFU_SKIN: return { color: '#FCD34D', shape: 'tofu_skin' }; 
          case IngredientType.BONUS_GREEN_BEAN: return { color: '#22C55E', shape: 'bean' }; 
          case IngredientType.BONUS_ENOKI: return { color: '#FEF9C3', shape: 'enoki' }; 
          case IngredientType.BONUS_CLAM: return { color: '#6B7280', shape: 'clam' }; 
          case IngredientType.BONUS_BACON_ROLL: return { color: '#EF4444', shape: 'bacon' }; 
          default: return { color: '#6B7280', shape: 'mess' };
      }
  };

  const style = getFoodStyle(type);

  if (style.shape === 'bun') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <circle cx="50" cy="50" r="35" fill="#FEF9C3" stroke="#FDE047" strokeWidth="2" />
           <path d="M30 40 Q50 20 70 40" stroke="#FCD34D" strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
      );
  }
  if (style.shape === 'ball_white' || style.shape === 'ball_grey') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <circle cx="50" cy="50" r="35" fill={style.color} stroke="#9CA3AF" strokeWidth="2" />
           <path d="M40 30 Q50 40 60 30" fill="none" stroke="black" strokeWidth="1" opacity="0.1" />
           <circle cx="65" cy="35" r="5" fill="white" opacity="0.5" />
        </svg>
      );
  }
  if (style.shape === 'tempura') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <rect x="25" y="35" width="50" height="30" rx="5" fill="#D97706" stroke="#92400E" strokeWidth="2" />
           <circle cx="35" cy="50" r="3" fill="#B45309" opacity="0.5" />
           <circle cx="65" cy="50" r="3" fill="#B45309" opacity="0.5" />
        </svg>
      );
  }
  if (style.shape === 'rice_cake') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <rect x="30" y="20" width="40" height="60" fill="#1F2937" stroke="#374151" strokeWidth="2" />
           <rect x="35" y="80" width="30" height="5" fill="#FACC15" /> {/* Peanut powder */}
           <path d="M30 20 L40 10 L60 10 L70 20" fill="#1F2937" />
        </svg>
      );
  }
  if (style.shape === 'tofu_skin') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <path d="M20 30 Q50 10 80 30 L80 70 Q50 90 20 70 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
           <path d="M25 40 Q50 30 75 40" stroke="#D97706" strokeWidth="1" fill="none" />
           <path d="M25 50 Q50 40 75 50" stroke="#D97706" strokeWidth="1" fill="none" />
           <path d="M25 60 Q50 50 75 60" stroke="#D97706" strokeWidth="1" fill="none" />
        </svg>
      );
  }
  if (style.shape === 'bean') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <path d="M45 10 Q30 50 45 90" stroke="#166534" strokeWidth="14" fill="none" />
           <path d="M45 10 Q30 50 45 90" stroke="#22C55E" strokeWidth="10" fill="none" strokeLinecap="round" />
           <path d="M55 15 Q70 55 55 95" stroke="#166534" strokeWidth="14" fill="none" />
           <path d="M55 15 Q70 55 55 95" stroke="#22C55E" strokeWidth="10" fill="none" strokeLinecap="round" />
        </svg>
      );
  }
  if (style.shape === 'enoki') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <rect x="35" y="60" width="30" height="30" rx="5" fill="#FEF9C3" stroke="#FDE047" strokeWidth="2" />
           <path d="M40 60 L40 20 M50 60 L50 15 M60 60 L60 20" stroke="#FEF9C3" strokeWidth="4" strokeLinecap="round" />
           <circle cx="40" cy="20" r="4" fill="#FEF9C3" />
           <circle cx="50" cy="15" r="4" fill="#FEF9C3" />
           <circle cx="60" cy="20" r="4" fill="#FEF9C3" />
        </svg>
      );
  }
  if (style.shape === 'clam') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <path d="M20 50 Q50 10 80 50 Q50 80 20 50" fill="#374151" stroke="#9CA3AF" strokeWidth="2" />
           <path d="M20 50 Q50 20 80 50" fill="#6B7280" />
           <path d="M30 50 L70 50" stroke="#111827" strokeWidth="1" opacity="0.3" />
        </svg>
      );
  }
  if (style.shape === 'bacon') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
           <rect x="30" y="20" width="40" height="60" rx="5" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
           <path d="M30 30 L70 30 M30 50 L70 50 M30 70 L70 70" stroke="#FECACA" strokeWidth="4" opacity="0.8" />
           <rect x="45" y="10" width="10" height="80" fill="#FEF08A" /> {/* Enoki inside */}
        </svg>
      );
  }
  
  return null;
};

// --- Enemy Renderers ---
export const RatSVG = ({ color = "#78716C", secondary = "#57534E", scale = 1 }) => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: `scaleX(-1) scale(${scale})` }}><path d="M10 60 Q-10 60 -5 80" stroke="#DB2777" strokeWidth="4" fill="none" /><ellipse cx="50" cy="60" rx="35" ry="25" fill={color} stroke={secondary} strokeWidth="2" /><circle cx="75" cy="50" r="18" fill={color} stroke={secondary} strokeWidth="2" /><circle cx="65" cy="35" r="8" fill="#DB2777" opacity="0.8" /><circle cx="85" cy="35" r="8" fill="#DB2777" opacity="0.8" /><circle cx="90" cy="55" r="3" fill="pink" /><circle cx="80" cy="45" r="3" fill="yellow" /><path d="M75 42 L85 45" stroke="black" strokeWidth="1" /></svg>);
export const BombRatSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: 'scaleX(-1)' }}><circle cx="50" cy="60" r="35" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3" /><path d="M50 25 Q50 10 70 5" stroke="#4B5563" strokeWidth="3" fill="none" /><circle cx="70" cy="5" r="3" fill="yellow" className="animate-ping" /><circle cx="75" cy="50" r="15" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3" /><path d="M40 55 L45 65 L50 55 L55 65 L60 55" stroke="black" strokeWidth="2" fill="none" opacity="0.5" /><circle cx="80" cy="45" r="4" fill="white" /><circle cx="80" cy="45" r="1" fill="black" /></svg>);
export const MamaRatSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: 'scaleX(-1)' }}><ellipse cx="45" cy="65" rx="40" ry="30" fill="#65A30D" stroke="#365314" strokeWidth="3" /><circle cx="75" cy="50" r="20" fill="#65A30D" stroke="#365314" strokeWidth="3" /><path d="M30 65 Q45 85 60 65" fill="#84CC16" opacity="0.5" /><circle cx="80" cy="45" r="3" fill="red" /></svg>);
export const NinjaRatSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: 'scaleX(-1)' }}><ellipse cx="50" cy="60" rx="30" ry="20" fill="#1E3A8A" stroke="#172554" strokeWidth="2" /><circle cx="75" cy="55" r="15" fill="#1E3A8A" stroke="#172554" strokeWidth="2" /><path d="M60 45 L90 45" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" /><path d="M58 45 L40 35 M58 45 L40 45" stroke="#DC2626" strokeWidth="2" /><path d="M72 52 L82 52" stroke="yellow" strokeWidth="2" /></svg>);
export const ShamanRatSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: 'scaleX(-1)' }}><ellipse cx="50" cy="60" rx="30" ry="25" fill="#7C3AED" stroke="#5B21B6" strokeWidth="2" /><circle cx="75" cy="45" r="15" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="2" /><path d="M10 30 L30 70 M10 30 L5 20" stroke="#A78BFA" strokeWidth="3" /><circle cx="5" cy="20" r="5" fill="#14B8A6" className="animate-pulse" /><path d="M70 45 L80 48" stroke="white" strokeWidth="1" /><circle cx="75" cy="45" r="3" fill="white" /></svg>);
export const SummonerRatSVG = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: 'scaleX(-1)' }}><ellipse cx="50" cy="65" rx="35" ry="30" fill="#92400E" stroke="#78350F" strokeWidth="2" /><path d="M50 35 L50 95" stroke="#451A03" strokeWidth="4" /><circle cx="75" cy="45" r="18" fill="#B45309" stroke="#78350F" strokeWidth="2" /><path d="M20 20 L40 50" stroke="#A16207" strokeWidth="3" /><circle cx="20" cy="20" r="6" fill="#FACC15" className="animate-spin-slow" /><circle cx="80" cy="40" r="3" fill="red" /></svg>);

// New Enemies
export const GhostRatSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: 'scaleX(-1)' }}>
    <g opacity="0.8">
       <path d="M20 90 Q10 40 50 30 Q90 40 80 90 Q50 80 20 90 Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
       <circle cx="65" cy="45" r="12" fill="#DBEAFE" />
       <circle cx="65" cy="45" r="3" fill="#1E3A8A" />
       <path d="M20 50 L50 40" stroke="#93C5FD" strokeWidth="2" opacity="0.5" />
    </g>
  </svg>
);

export const HealerRatSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" style={{ transform: 'scaleX(-1)' }}>
    {/* Body */}
    <ellipse cx="50" cy="70" rx="30" ry="25" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2" />
    <circle cx="75" cy="55" r="15" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2" />
    {/* Chef Hat */}
    <path d="M60 40 L60 20 Q60 10 75 10 Q90 10 90 20 L90 40 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
    <rect x="60" y="40" width="30" height="5" fill="#E5E7EB" />
    {/* Green Cross */}
    <rect x="40" y="60" width="20" height="6" fill="#22C55E" />
    <rect x="47" y="53" width="6" height="20" fill="#22C55E" />
    <circle cx="80" cy="50" r="2" fill="black" />
  </svg>
);

export const BossRatSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#EF4444]" style={{ transform: 'scaleX(-1)' }}>
    <defs>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4B5563" />
        <stop offset="50%" stopColor="#1F2937" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>
    </defs>
    {/* Huge Body Armor */}
    <path d="M10 60 Q-10 40 50 30 Q110 40 90 80 Q50 90 10 60 Z" fill="url(#metal)" stroke="#9CA3AF" strokeWidth="3" />
    {/* Head */}
    <circle cx="75" cy="45" r="22" fill="#374151" stroke="#EF4444" strokeWidth="2" />
    {/* Glowing Eye */}
    <circle cx="80" cy="40" r="6" fill="#DC2626" className="animate-pulse" />
    <circle cx="80" cy="40" r="2" fill="white" />
    {/* Teeth */}
    <path d="M65 55 L70 65 L75 55 L80 65 L85 55" stroke="white" strokeWidth="2" fill="white" />
    {/* Spikes */}
    <path d="M30 35 L20 10 L40 30" fill="#1F2937" stroke="#EF4444" />
    <path d="M50 30 L50 5 L60 30" fill="#1F2937" stroke="#EF4444" />
  </svg>
);

// --- Projectile Renderers ---
export const ProjectileSVG = ({ type }: { type: IngredientType }) => {
  if (type.startsWith('BONUS_')) {
      if (type === IngredientType.BONUS_TEMPURA) return <svg viewBox="0 0 20 20" className="w-full h-full animate-spin"><path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill="#D97706" /></svg>;
      if (type === IngredientType.BONUS_GREEN_BEAN) return <svg viewBox="0 0 20 20" className="w-full h-full"><rect x="0" y="8" width="20" height="4" fill="#22C55E" className="animate-pulse" /></svg>;
      return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="5" fill="#FDE047" /></svg>;
  }

  if (type.includes('SUPREME') || type === IngredientType.SEASONING_CAPTAIN) {
      return <svg viewBox="0 0 20 20" className="w-full h-full"><path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill="#cffafe" stroke="#06b6d4" strokeWidth="1" className="animate-spin-slow" /></svg>;
  }

  if ([IngredientType.CHILI, IngredientType.KING_CHILI, IngredientType.GOD_CHILI].includes(type)) {
     if(type === IngredientType.GOD_CHILI) return <svg viewBox="0 0 20 20" className="w-full h-full"><path d="M0 10 L20 10" stroke="#3B82F6" strokeWidth="4" /><path d="M2 10 L18 10" stroke="#FFFFFF" strokeWidth="2" /></svg>;
     if(type === IngredientType.KING_CHILI) return <svg viewBox="0 0 20 20" className="w-full h-full"><rect x="5" y="8" width="12" height="4" fill="#EAB308" className="animate-pulse" /></svg>;
     return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="6" fill="#EF4444" /><circle cx="10" cy="10" r="4" fill="#FCA5A5" className="animate-pulse" /></svg>;
  }
  if ([IngredientType.CORN, IngredientType.KING_CORN, IngredientType.GOD_CORN].includes(type)) {
    if(type === IngredientType.GOD_CORN) return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="7" fill="#F97316" /><circle cx="10" cy="10" r="4" fill="#FFF7ED" className="animate-ping" /></svg>;
    return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="5" fill="#FACC15" /></svg>;
  }
  if ([IngredientType.SAUSAGE, IngredientType.KING_SAUSAGE, IngredientType.GOD_SAUSAGE].includes(type)) {
    if(type === IngredientType.GOD_SAUSAGE) return <svg viewBox="0 0 40 10" className="w-full h-full"><rect width="40" height="8" rx="4" fill="#EC4899" className="animate-pulse" /></svg>;
    return <svg viewBox="0 0 40 10" className="w-full h-full"><rect width="40" height="6" rx="3" fill="#BE123C" /></svg>;
  }
  if ([IngredientType.MUSHROOM, IngredientType.KING_MUSHROOM, IngredientType.GOD_MUSHROOM].includes(type)) {
    if(type === IngredientType.GOD_MUSHROOM) return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="8" fill="#18181B" stroke="#7C3AED" strokeWidth="2" /></svg>;
    return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="6" fill="#A855F7" opacity="0.8" /><circle cx="10" cy="10" r="4" fill="#E879F9" className="animate-ping" /></svg>;
  }
  if ([IngredientType.SHRIMP, IngredientType.KING_SHRIMP, IngredientType.GOD_SHRIMP].includes(type)) {
     if(type === IngredientType.GOD_SHRIMP) return <svg viewBox="0 0 20 20" className="w-full h-full"><path d="M2 10 Q10 0 18 10" stroke="#0EA5E9" strokeWidth="3" fill="none" /></svg>;
     return <svg viewBox="0 0 20 20" className="w-full h-full"><path d="M5 5 Q15 5 15 15" stroke="#38BDF8" strokeWidth="3" fill="none" opacity="0.8" /></svg>;
  }
  if (type === IngredientType.GOD_BEEF) {
     return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="8" fill="#7F1D1D" /><circle cx="10" cy="10" r="5" fill="#EF4444" className="animate-ping" /></svg>;
  }
  return <svg viewBox="0 0 20 20" className="w-full h-full"><circle cx="10" cy="10" r="5" fill="#F97316" /><path d="M5 10 L15 10" stroke="#FFF7ED" strokeWidth="2" strokeLinecap="round" /></svg>;
};

// --- Main Ingredient Switch ---
export const IngredientRenderer = ({ type }: { type: IngredientType }) => {
  if (type.startsWith('BONUS_')) {
      return <BonusFoodSVG type={type} />;
  }

  switch (type) {
    case IngredientType.BEEF: return <BeefSVG />;
    case IngredientType.KING_BEEF: return <KingBeefSVG />;
    case IngredientType.GOD_BEEF: return <GodBeefSVG />;
    case IngredientType.SUPREME_BEEF: return <SupremeBeefSVG />;
    
    case IngredientType.CHILI: return <ChiliSVG />;
    case IngredientType.KING_CHILI: return <KingChiliSVG />;
    case IngredientType.GOD_CHILI: return <GodChiliSVG />;
    case IngredientType.SUPREME_CHILI: return <SupremeChiliSVG />;

    case IngredientType.GARLIC: return <GarlicSVG />;
    case IngredientType.KING_GARLIC: return <KingGarlicSVG />;
    case IngredientType.GOD_GARLIC: return <GodGarlicSVG />;
    case IngredientType.SUPREME_GARLIC: return <SupremeGarlicSVG />;

    case IngredientType.CORN: return <CornSVG />;
    case IngredientType.KING_CORN: return <KingCornSVG />;
    case IngredientType.GOD_CORN: return <GodCornSVG />;
    case IngredientType.SUPREME_CORN: return <SupremeCornSVG />;

    case IngredientType.SAUSAGE: return <SausageSVG />;
    case IngredientType.KING_SAUSAGE: return <KingSausageSVG />;
    case IngredientType.GOD_SAUSAGE: return <GodSausageSVG />;
    case IngredientType.SUPREME_SAUSAGE: return <SupremeSausageSVG />;

    case IngredientType.MUSHROOM: return <MushroomSVG />;
    case IngredientType.KING_MUSHROOM: return <KingMushroomSVG />;
    case IngredientType.GOD_MUSHROOM: return <GodMushroomSVG />;
    case IngredientType.SUPREME_MUSHROOM: return <SupremeMushroomSVG />;

    case IngredientType.ONION: return <OnionSVG />;
    case IngredientType.KING_ONION: return <KingOnionSVG />;
    case IngredientType.GOD_ONION: return <GodOnionSVG />;
    case IngredientType.SUPREME_ONION: return <SupremeOnionSVG />;

    case IngredientType.GREEN_PEPPER: return <GreenPepperSVG />;
    case IngredientType.KING_GREEN_PEPPER: return <KingGreenPepperSVG />;
    case IngredientType.GOD_GREEN_PEPPER: return <GodGreenPepperSVG />;
    case IngredientType.SUPREME_GREEN_PEPPER: return <SupremeGreenPepperSVG />;

    case IngredientType.SHRIMP: return <ShrimpSVG />;
    case IngredientType.KING_SHRIMP: return <KingShrimpSVG />;
    case IngredientType.GOD_SHRIMP: return <GodShrimpSVG />;
    case IngredientType.SUPREME_SHRIMP: return <SupremeShrimpSVG />;

    case IngredientType.CHICKEN: return <ChickenSVG />;
    case IngredientType.KING_CHICKEN: return <KingChickenSVG />;
    case IngredientType.GOD_CHICKEN: return <GodChickenSVG />;
    case IngredientType.SUPREME_CHICKEN: return <SupremeChickenSVG />;

    case IngredientType.SQUID: return <SquidSVG />;
    case IngredientType.KING_SQUID: return <KingSquidSVG />;
    case IngredientType.GOD_SQUID: return <GodSquidSVG />;
    case IngredientType.SUPREME_SQUID: return <SupremeSquidSVG />;

    case IngredientType.PINEAPPLE: return <PineappleSVG />;
    case IngredientType.KING_PINEAPPLE: return <KingPineappleSVG />;
    case IngredientType.GOD_PINEAPPLE: return <GodPineappleSVG />;
    case IngredientType.SUPREME_PINEAPPLE: return <SupremePineappleSVG />;

    case IngredientType.MARSHMALLOW: return <MarshmallowSVG />;
    case IngredientType.KING_MARSHMALLOW: return <KingMarshmallowSVG />;
    case IngredientType.GOD_MARSHMALLOW: return <GodMarshmallowSVG />;
    case IngredientType.SUPREME_MARSHMALLOW: return <SupremeMarshmallowSVG />;

    case IngredientType.SEASONING_CAPTAIN: return <SeasoningCaptainSVG />;
    default: return null;
  }
};

export const EnemyRenderer = ({ type }: { type: EnemyType }) => {
  switch (type) {
    case EnemyType.RAT: return <RatSVG />;
    case EnemyType.NINJA_RAT: return <NinjaRatSVG />;
    case EnemyType.BOMB_RAT: return <BombRatSVG />;
    case EnemyType.MAMA_RAT: return <MamaRatSVG />;
    case EnemyType.BABY_RAT: return <RatSVG color="#A3E635" secondary="#4D7C0F" scale={0.7} />;
    case EnemyType.SHAMAN_RAT: return <ShamanRatSVG />;
    case EnemyType.SUMMONER_RAT: return <SummonerRatSVG />;
    case EnemyType.GHOST_RAT: return <GhostRatSVG />;
    case EnemyType.HEALER_RAT: return <HealerRatSVG />;
    case EnemyType.BOSS_SUPER_RAT: return <BossRatSVG />;
    default: return <RatSVG />;
  }
};
