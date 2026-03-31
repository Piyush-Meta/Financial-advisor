import { useEffect, useState } from 'react'
import { fetchBudget, saveBudget } from '../api/ap.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'

const initialItems = [
  { category: 'Milk income', amount: 0, type: 'income', note: 'Daily sales' },
  { category: 'Feed cost', amount: 0, type: 'expense', note: 'Cattle feed' },
  { category: 'Savings', amount: 0, type: 'expense', note: 'Emergency fund' },
]

export default function Budget() {
  const { strings } = useLanguage()
  const [budget, setBudget] = useState({ income: 0, expenses: 0, savingsGoal: 0, lineItems: initialItems })
  const [status, setStatus] = useState('')
  const userId = 'demo-user'

  useEffect(() => {
    fetchBudget(userId).then((response) => {
      if (response.data?.lineItems?.length) {
        setBudget(response.data)
      }
    })
  }, [])

  const handleChange = (index, field, value) => {
    setBudget((current) => {
      const items = [...current.lineItems]
      items[index] = { ...items[index], [field]: field === 'amount' ? Number(value) : value }
      return {
        ...current,
        lineItems: items,
        income: items.filter((item) => item.type === 'income').reduce((sum, item) => sum + (item.amount || 0), 0),
        expenses: items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + (item.amount || 0), 0),
      }
    })
  }

  const handleSave = async () => {
    setStatus(strings.budget.savingStatus)
    try {
      await saveBudget({ userId, ...budget })
      setStatus(strings.budget.savedStatus)
    } catch (error) {
      setStatus(strings.budget.errorStatus)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{strings.budget.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{strings.budget.description}</p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{strings.budget.incomeLabel}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">₹{budget.income}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{strings.budget.expensesLabel}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">₹{budget.expenses}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{strings.budget.savingsLabel}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">₹{budget.savingsGoal}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {budget.lineItems.map((item, index) => (
            <div key={index} className="grid gap-4 rounded-3xl border border-slate-200 p-4 sm:grid-cols-[1.5fr_1fr_1fr]">
              <div>
                <label className="text-sm font-medium text-slate-700">{strings.budget.categoryLabel}</label>
                <input
                  value={item.category}
                  onChange={(event) => handleChange(index, 'category', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{strings.budget.amountLabel}</label>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(event) => handleChange(index, 'amount', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{strings.budget.noteLabel}</label>
                <input
                  value={item.note}
                  onChange={(event) => handleChange(index, 'note', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr]">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{strings.budget.savingsLabel}</span>
            <input
              type="number"
              value={budget.savingsGoal}
              onChange={(event) => setBudget((current) => ({ ...current, savingsGoal: Number(event.target.value) }))}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
            />
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            {strings.budget.saveButton}
          </button>
        </div>
        {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}
      </section>
    </div>
  )
}
