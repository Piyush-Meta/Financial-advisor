import express from 'express'
import User from '../models/User.js'

const router = express.Router()

router.post('/profile', async (req, res, next) => {
  try {
    const { name, language } = req.body
    const user = await User.create({ name, language })
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    next(error)
  }
})

export default router
