import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
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

await connectDB()

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Financial Advisor API' })
})

app.use('/api/ai', aiRoutes)
app.use('/api/budget', budgetRoutes)
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the process using that port or set PORT to a different value.`)
    process.exit(1)
  }
  console.error(err)
  process.exit(1)
})
