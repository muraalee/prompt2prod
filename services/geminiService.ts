
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. The user's environment should provide the key.
  console.warn("API_KEY is not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateTitle = async (content: string): Promise<string> => {
  if (!API_KEY) return "AI-Generated Title";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following blog content, generate a compelling and concise title. The title should be no more than 10 words. Content: "${content}" Respond only with title in proper grammar and punctuation and plain text. No markdown. `,
    });
    return response.text.trim().replace(/"/g, ''); // Clean up quotes
  } catch (error) {
    console.error("Error generating title:", error);
    throw new Error("Failed to generate title. Please try again.");
  }
};

export const generateContent = async (prompt: string): Promise<string> => {
  if (!API_KEY) return "This is some AI-generated blog content about the topic you requested.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Write a blog post about the following topic. The tone should be informative and engaging. Use paragraphs for readability. Topic: "${prompt}" Respond only with title in proper grammar and punctuation and plain text. No markdown.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    if (!API_KEY) return `https://picsum.photos/seed/${prompt}/1200/800`;
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A high-quality, visually appealing blog post header image representing: "${prompt}". Cinematic, photorealistic. Respond only with title in proper grammar and punctuation and plain text. No markdown.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};
