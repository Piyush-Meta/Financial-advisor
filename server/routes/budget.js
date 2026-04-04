import express from 'express'
import Budget from '../models/Budget.js'

const router = express.Router()

router.get('/:userId', async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ userId: req.params.userId })
    if (!budget) return res.json({ userId: req.params.userId, income: 0, expenses: 0, savingsGoal: 0, lineItems: [] })
    res.json(budget)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { userId, income, expenses, savingsGoal, lineItems } = req.body

    const monthKey = new Date().toISOString().slice(0, 7)
    const snapshot = {
      monthKey,
      income,
      expenses,
      savingsGoal,
      savedAt: new Date(),
    }

    const existing = await Budget.findOne({ userId })
    const previousHistory = Array.isArray(existing?.history) ? existing.history : []
    const historyWithoutCurrentMonth = previousHistory.filter((item) => item.monthKey !== monthKey)
    const history = [snapshot, ...historyWithoutCurrentMonth].slice(0, 12)

    const budget = await Budget.findOneAndUpdate(
      { userId },
      { income, expenses, savingsGoal, lineItems, history, updatedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.status(201).json(budget)
  } catch (error) {
    next(error)
  }
})

export default router
