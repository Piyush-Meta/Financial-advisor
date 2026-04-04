import express from "express";

const router = express.Router();

const languageLabels = {
  en: "English",
  hi: "Hindi",
  od: "Odia",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
  ur: "Urdu",
};

router.post("/chat", async (req, res) => {
  try {
    const { prompt, language = "en" } = req.body;

    const targetLanguage = language === "auto"
      ? "the same language as the user message"
      : (languageLabels[language] || "English");

    const systemPrompt = `
You are an expert Indian financial advisor helping rural women.
Give simple step-by-step business and finance advice.
Focus on dairy, tailoring, small shop, savings, loans, and budgeting.
If the user asks unrelated questions, gently bring the conversation back to business/finance.
Respond in ${targetLanguage}.
If the response language is not English, write in the native script of that language (not Romanized text).
Use short, practical action points.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate response.";

    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI response failed",
    });
  }
});

export default router;