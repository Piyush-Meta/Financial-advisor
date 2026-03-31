import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  savingsGoal: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
  lineItems: [
    {
      category: String,
      amount: Number,
      type: { type: String, enum: ['income', 'expense'] },
      note: String,
    },
  ],
})

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema)
export default Budget
