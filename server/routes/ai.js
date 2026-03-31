import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { prompt, language = "en" } = req.body;

    const systemPrompt = `
You are a friendly Indian rural financial advisor helping women start small businesses.
Give simple, practical, step-by-step advice.
Focus on:
- dairy business
- tailoring
- small shop
- saving money
- micro investment

Respond in ${language === "hi" ? "Hindi" : "English"}.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI response failed",
    });
  }
});

export default router;