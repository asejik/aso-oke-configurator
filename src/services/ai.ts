import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Segment } from "../types";
import { v4 as uuidv4 } from 'uuid';

// Initialize the API with your key
// Ensure VITE_GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const generatePattern = async (prompt: string): Promise<{ timeline: Segment[], loomWidth: number }> => {
  try {
    // We use the flash model for speed and structured JSON capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5 Flash as the current viable endpoint for this behavior

    const systemPrompt = `
      You are an expert Aso Oke weaver and textile engineer.
      Your goal is to convert natural language descriptions of fabric patterns into a precise JSON structure.

      The user will describe a pattern. You must output a JSON object containing a "loomWidth" (number) and a "timeline" (array of Segments).

      RULES FOR WEAVING:
      1. Width Units:
         - "Hairline", "Thinnest" = 0.5 (0.25")
         - "Fine", "Thin" = 1 (0.5")
         - "Medium", "Standard" = 2 (1.0")
         - "Thick", "Bold" = 3 (1.5")
         - "Heavy", "Very Thick" = 4 (2.0")
         - "Wide", "Block" = 6 (3.0")
      2. Colors: Convert color names to accurate Hex codes (e.g., "Royal Blue" -> "#4169E1").
      3. Structure:
         - A "Segment" is a block of stripes.
         - "repeatCount" determines how many times that block repeats.

      JSON SCHEMA:
      {
        "loomWidth": number,
        "timeline": [
          {
            "type": "group",
            "repeatCount": number,
            "items": [
               { "color": string, "widthUnit": number }
            ]
          }
        ]
      }

      Generate ONLY valid JSON. No markdown formatting.
    `;

    const result = await model.generateContent([systemPrompt, `User Request: ${prompt}`]);
    const response = result.response;
    const text = response.text();

    // Clean up potential markdown code blocks if the AI adds them
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(cleanJson);

    // Post-process to add UUIDs (AI doesn't generate reliable UUIDs)
    const processedTimeline = data.timeline.map((seg: any) => ({
      ...seg,
      id: uuidv4(),
      items: seg.items.map((item: any) => ({
        ...item,
        id: uuidv4()
      }))
    }));

    return {
      timeline: processedTimeline,
      loomWidth: data.loomWidth || 20
    };

  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate pattern. Please try again.");
  }
};