import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are Healio, a professional AI healthcare assistant. 
Your primary goal is to help users analyze their symptoms and provide preliminary medical guidance.

Guidelines:
1. Analyze symptoms reported by the user.
2. Provide a "Symptom Analysis" section explaining potential causes.
3. Provide "Recommended Steps" for immediate care.
4. Provide a "Guide & Cure" section with general advice (not a definitive medical diagnosis).
5. ALWAYS include a disclaimer: "I am an AI, not a doctor. Please consult a healthcare professional for serious concerns."
6. Be empathetic, professional, and clear.
7. Use Markdown for formatting.`;

export async function analyzeSymptoms(
  message: string,
  history: { role: 'user' | 'model'; content: string }[] = []
) {
  // ✅ USES YOUR GEMINI API KEY FROM .env
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env file');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-1.5-flash";

  try {
    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: chatHistory,
    });

    const response = await chat.sendMessage({ message });

    return response.text || "I'm sorry, I couldn't analyze that. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to analyze symptoms: ${error.message}`);
  }
}

export async function getSymptomReport(message: string, analysis: string) {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env file');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-1.5-flash";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Based on the user's message: "${message}" and the AI analysis: "${analysis}", extract a structured symptom report.`,
      config: {
        systemInstruction: "Extract a structured symptom report in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of symptoms mentioned by the user.",
            },
            analysis: {
              type: Type.STRING,
              description: "A brief summary of the analysis.",
            },
            recommendations: {
              type: Type.STRING,
              description: "Key recommendations.",
            },
            severity: {
              type: Type.STRING,
              enum: ["low", "medium", "high"],
              description: "The estimated severity of the symptoms.",
            },
          },
          required: ["symptoms", "analysis", "severity"],
        },
      },
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json\n?|```/g, "").trim();
    const report = JSON.parse(cleanedText);
    return report;
  } catch (error) {
    console.error("Gemini API Error (Report Extraction):", error);
    return null;
  }
}
