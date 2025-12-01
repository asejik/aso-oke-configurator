import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Segment } from "../types";
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const generatePattern = async (prompt: string): Promise<{ timeline: Segment[], loomWidth: number }> => {
  try {
    // UPDATED: Using the model version that works for you
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // Note: If "gemini-2.5-flash" is what worked for you specifically, please keep that string!
    // I put "gemini-1.5-pro" here as it is often more robust for logic than flash,
    // but feel free to swap this specific string back to exactly what you tested successfully.

    const systemPrompt = `
      You are an expert Aso Oke weaver. Convert the user's description into a JSON pattern.

      CRITICAL RULES:
      1. Loom Width: MUST be exactly 6.5, 20, or 25.
         - If the user implies a narrow strip, use 6.5.
         - If the user implies a wide cloth, use 25.
         - Default to 20 if unsure.

      2. Width Units (Stripes):
         - "Hairline" = 0.5
         - "Fine" = 1
         - "Medium" = 2
         - "Thick" = 3
         - "Heavy" = 4
         - "Wide" = 6

      JSON SCHEMA:
      {
        "loomWidth": number,
        "timeline": [
          {
            "type": "group",
            "repeatCount": number,
            "items": [ { "color": string, "widthUnit": number } ]
          }
        ]
      }
      Return ONLY raw JSON.
    `;

    const result = await model.generateContent([systemPrompt, `User Request: ${prompt}`]);
    const response = result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    // LOGIC FIX: Enforce Standard Widths
    // If AI returns a weird number, snap it to valid ones.
    let finalWidth = data.loomWidth || 20;
    if (![6.5, 20, 25].includes(finalWidth)) {
        // Simple logic: if less than 10, go 6.5. If more than 22, go 25. Else 20.
        if (finalWidth < 10) finalWidth = 6.5;
        else if (finalWidth > 22) finalWidth = 25;
        else finalWidth = 20;
    }

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
      loomWidth: finalWidth
    };

  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate pattern.");
  }
};