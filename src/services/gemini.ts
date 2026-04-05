import { GoogleGenAI, Type } from '@google/genai';

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

/**
 * Analyze symptoms using Google Gemini AI
 * @param message User's symptom description
 * @param history Chat history for context
 * @returns Analysis from AI
 */
export async function analyzeSymptoms(
  message: string,
  history: Array<{ role: 'user' | 'model'; content: string }> = []
): Promise<string> {
  try {
    // Validate inputs
    if (!message || message.trim().length === 0) {
      throw new Error('Please describe your symptoms');
    }

    // Get API key from environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file');
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-1.5-flash';

    // Format chat history
    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Create chat session
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: chatHistory,
    });

    // Send message and get response
    const response = await chat.sendMessage({ message });

    return (
      response.text ||
      "I'm sorry, I couldn't analyze that. Please try again."
    );
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('Network')) {
        return 'Network error. Please check your internet connection and try again.';
      }
      // API key errors
      if (error.message.includes('API key')) {
        return error.message;
      }
      // Other known errors
      return `Error: ${error.message}`;
    }
    
    return 'An error occurred while analyzing your symptoms. Please check your connection or try again later.';
  }
}

/**
 * Generate a structured symptom report
 * @param message Original user message
 * @param analysis AI analysis result
 * @returns Structured report
 */
export async function getSymptomReport(
  message: string,
  analysis: string
): Promise<{
  symptoms: string[];
  analysis: string;
  recommendations: string;
  severity: 'low' | 'medium' | 'high';
} | null> {
  try {
    // Validate inputs
    if (!message || !analysis) {
      throw new Error('Message and analysis are required');
    }

    // Get API key from environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-1.5-flash';

    // Generate structured report
    const response = await ai.models.generateContent({
      model,
      contents: `Based on the user's message: "${message}" and the AI analysis: "${analysis}", extract a structured symptom report.`,
      config: {
        systemInstruction:
          'Extract a structured symptom report in JSON format.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of symptoms mentioned by the user.',
            },
            analysis: {
              type: Type.STRING,
              description: 'A brief summary of the analysis.',
            },
            recommendations: {
              type: Type.STRING,
              description: 'Key recommendations.',
            },
            severity: {
              type: Type.STRING,
              enum: ['low', 'medium', 'high'],
              description: 'The estimated severity of the symptoms.',
            },
          },
          required: ['symptoms', 'analysis', 'severity'],
        },
      },
    });

    // Parse response
    const text = response.text || '{}';
    const cleanedText = text
      .replace(/```json\n?|```/g, '')
      .trim();
    
    const report = JSON.parse(cleanedText);
    
    return {
      symptoms: report.symptoms || [],
      analysis: report.analysis || '',
      recommendations: report.recommendations || '',
      severity: report.severity || 'medium',
    };
  } catch (error) {
    console.error('Gemini API Error (Report Extraction):', error);
    return null;
  }
}
