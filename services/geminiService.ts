
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const enhanceTaskDescription = async (title: string, currentDesc: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Enhance the following task description to be more professional and actionable. 
      Task Title: ${title}
      Current Description: ${currentDesc || 'None'}
      
      Return only the enhanced text, keep it concise (1-2 sentences).`,
    });
    return response.text?.trim() || currentDesc;
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentDesc;
  }
};

export const suggestSubtasks = async (title: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 simple subtasks for the task: "${title}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const text = response.text?.trim();
    return JSON.parse(text || "[]") as string[];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};
