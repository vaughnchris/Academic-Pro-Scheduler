import { GoogleGenAI } from "@google/genai";
import { ClassSection, FacultyRequest } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askScheduleAssistant = async (
  question: string,
  schedule: ClassSection[],
  requests: FacultyRequest[]
): Promise<string> => {
  
  // Construct context
  const context = `
    You are an expert Academic Scheduler Assistant helping a college professor.
    
    Here is the current Department Schedule (JSON format):
    ${JSON.stringify(schedule)}

    Here are the Faculty Requests (JSON format):
    ${JSON.stringify(requests)}

    Answer the user's question based on this data. 
    If they ask about conflicts, look for overlapping times in the same room or same professor.
    If they ask for recommendations, suggest assignments based on faculty preferences matching the course title.
    
    Keep answers concise and helpful. Format lists clearly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: context }] },
        { role: 'user', parts: [{ text: question }] }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error checking the schedule. Please check your API key.";
  }
};