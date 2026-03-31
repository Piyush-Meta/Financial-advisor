import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { prompt, language = "en" } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt required"
      });
    }

    const systemPrompt = `
You are an expert Indian financial advisor helping rural women.
Give practical step-by-step business advice.
Focus on dairy, tailoring, savings and micro-investments.
Respond in ${language === "hi" ? "Hindi" : "English"}.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    res.json({ answer });

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({
      error: "AI response failed",
      details: error.message
    });
  }
});

export default router;