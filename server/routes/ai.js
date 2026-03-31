import express from "express";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { prompt, language = "en" } = req.body;

    const systemPrompt = `
You are an expert Indian financial advisor helping rural women.
Give simple step-by-step business advice.
Focus on dairy, tailoring, small shop, savings.
Respond in ${language === "hi" ? "Hindi" : "English"}.
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