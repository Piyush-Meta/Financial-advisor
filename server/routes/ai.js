import express from 'express'
import OpenAI from 'openai'
import ChatHistory from '../models/ChatHistory.js'

const router = express.Router()
const apiKey = process.env.OPENAI_API_KEY
const client = apiKey ? new OpenAI({ apiKey }) : null

if (!apiKey) {
  console.warn('OPENAI_API_KEY is missing; /api/ai/chat will respond with an error until it is configured.')
}

router.post('/chat', async (req, res, next) => {
  try {
    if (!client) {
      return res.status(500).json({ error: 'OpenAI API key is not configured.' })
    }
    const { userId = 'demo-user', prompt, language = 'en' } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

    await ChatHistory.create({ userId, role: 'user', content: prompt })

    const systemMessage = `You are an empathetic rural financial coach for women in India. Answer simply, respectfully, and in ${language === 'od' ? 'Odia' : language === 'hi' ? 'Hindi' : 'English'}. Use examples from dairy, micro-investment, budgeting, and community support.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    })

    const answer = response.choices?.[0]?.message?.content?.trim() || 'I am sorry, I could not generate a response.'
    await ChatHistory.create({ userId, role: 'assistant', content: answer })

    res.json({ answer })
  } catch (error) {
    next(error)
  }
})

export default router
