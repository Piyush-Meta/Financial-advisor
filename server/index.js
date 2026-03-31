import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

import aiRoutes from './routes/ai.js'
import budgetRoutes from './routes/budget.js'
import userRoutes from './routes/user.js'
import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Financial Advisor API running'
  })
})

/* routes */
app.use('/api/ai', aiRoutes)
// app.use('/api/budget', budgetRoutes)
// app.use('/api/users', userRoutes)
// app.use('/api/auth', authRoutes)

/* error handler */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err)
  res.status(500).json({ error: err.message })
})

/* IMPORTANT: render compatible listen */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})