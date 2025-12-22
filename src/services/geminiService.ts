
import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

export const getChefAdvice = async (gameState: GameState, hasIngredients: boolean): Promise<string> => {
  // 修正: 遵照規範初始化 GoogleGenAI 實例
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    你是一個脾氣暴躁但廚藝精湛的燒烤大師。
    玩家正在玩一個叫做「烤串英雄」的塔防遊戲。
    
    目前的遊戲狀態:
    - 波數 (Wave): ${gameState.wave}
    - 金錢: ${gameState.money}
    - 玩家生命: ${gameState.hp}/${gameState.maxHp}
    - 分數: ${gameState.score}
    - 玩家${hasIngredients ? '已經放置了一些食材' : '還沒有放置任何食材'}。

    請根據這些資訊，用繁體中文給出一句簡短的建議（不超過50個字）。
    可以是戰術建議（例如：多放點牛肉、大蒜可以擋住老鼠），或者是幽默的燒烤笑話，或者是嘲諷老鼠。
    語氣要像個燒烤攤老闆，稍微粗獷一點。
  `;

  try {
    // 修正: 依照指引為基礎文字任務選擇 gemini-3-flash-preview 模型
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // 修正: 直接存取 .text 屬性
    return response.text || "快點烤！別發呆！";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "主廚太忙了，沒空理你！(API Error)";
  }
};
