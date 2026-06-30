import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    console.log("Gemini Key Exists:", !!process.env.GEMINI_API_KEY);
    console.log(
    "Gemini Key Prefix:",
    process.env.GEMINI_API_KEY?.substring(0, 8)
    );
    
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    return res.status(200).json({
      text,
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      error: "Failed to generate response",
    });
  }
}