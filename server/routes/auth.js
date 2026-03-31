import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'sakhi-secret'
const JWT_EXPIRES = '7d'

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, language } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(409).json({ error: 'User already exists.' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword, language })
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' })

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) return res.status(401).json({ error: 'Invalid credentials.' })

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
