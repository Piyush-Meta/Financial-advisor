import { useEffect, useMemo, useState } from 'react'
import { fetchBudget, saveBudget } from '../api/ap.js'
import { sendAiChat } from '../api/ap.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'

const initialItems = [
  
  { category: 'Milk income', amount: 0, type: 'income', note: 'Daily sales' },
  { category: 'Feed cost', amount: 0, type: 'expense', note: 'Cattle feed' },
  { category: 'Savings', amount: 0, type: 'expense', note: 'Emergency fund' },
]

export default function Budget() {
  const { strings, language } = useLanguage()
  const [budget, setBudget] = useState({ income: 0, expenses: 0, savingsGoal: 0, lineItems: initialItems, history: [] })
  const [status, setStatus] = useState('')
  const [advice, setAdvice] = useState('')
  const [adviceLoading, setAdviceLoading] = useState(false)
  const [businessPlan, setBusinessPlan] = useState('')
  const [businessPlanLoading, setBusinessPlanLoading] = useState(false)
  const userId = 'demo-user'

  useEffect(() => {
    fetchBudget(userId).then((response) => {
      if (response.data) {
        setBudget((current) => ({
          ...current,
          ...response.data,
          lineItems: response.data?.lineItems?.length ? response.data.lineItems : initialItems,
          history: Array.isArray(response.data?.history) ? response.data.history : [],
        }))
      }
    })
  }, [])

  const remainingBalance = useMemo(() => budget.income - budget.expenses - budget.savingsGoal, [budget])
  const planIsFeasible = remainingBalance >= 0

  const chartData = useMemo(() => {
    const rows = Array.isArray(budget.history) ? [...budget.history] : []
    return rows
      .sort((a, b) => String(a.monthKey || '').localeCompare(String(b.monthKey || '')))
      .slice(-6)
  }, [budget.history])

  const maxChartValue = useMemo(() => {
    const values = chartData.flatMap((item) => [item.income || 0, item.expenses || 0, item.savingsGoal || 0])
    return Math.max(...values, 1)
  }, [chartData])

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
      const response = await saveBudget({ userId, ...budget })
      if (response?.data) {
        setBudget((current) => ({
          ...current,
          ...response.data,
          lineItems: response.data?.lineItems?.length ? response.data.lineItems : current.lineItems,
          history: Array.isArray(response.data?.history) ? response.data.history : current.history,
        }))
      }
      setStatus(strings.budget.savedStatus)
    } catch (error) {
      setStatus(strings.budget.errorStatus)
    }
  }

  const buildFallbackAdvice = () => {
    const highestExpense = budget.lineItems
      .filter((item) => item.type === 'expense')
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))[0]

    const lines = [
      '1. Keep savings first: transfer your savings goal amount at the beginning of each month.',
      `2. Current remaining after savings is ₹${remainingBalance}. ${planIsFeasible ? 'Your plan is feasible.' : 'Your plan needs adjustment.'}`,
    ]

    if (highestExpense) {
      lines.push(`3. Your largest expense is ${highestExpense.category} (₹${highestExpense.amount || 0}). Try reducing this by 10%.`)
    }

    lines.push('4. Increase income by adding one small weekly upsell offer in your business (for example, add-on dairy products).')
    return lines.join('\n')
  }

  const buildFallbackBusinessPlan = () => {
    const monthlyBreakEven = budget.expenses + budget.savingsGoal
    const dailyTarget = Math.ceil(monthlyBreakEven / 30)
    const profitOrLoss = budget.income - budget.expenses
    const sustainable = remainingBalance >= 0

    return [
      `Break-even point (monthly): ₹${monthlyBreakEven}`,
      `Daily target (30-day): ₹${dailyTarget}`,
      `Saving strategy: Keep aside ₹${Math.ceil((budget.savingsGoal || 0) / 30)} per day before optional spending.`,
      '',
      `1. Profit or loss analysis: ${profitOrLoss >= 0 ? `Profit of ₹${profitOrLoss}` : `Loss of ₹${Math.abs(profitOrLoss)}`}`,
      `2. Is business sustainable?: ${sustainable ? 'Yes, currently sustainable if this pattern continues.' : 'Not yet. Expenses + savings exceed current income.'}`,
      '3. How to increase profit: raise weekly sales target, improve product mix, and add one high-margin item.',
      '4. How to reduce cost: cut top expense categories by 5-10%, negotiate feed/vendor rates, and reduce wastage.',
      '5. Saving suggestion: automate savings immediately after income, and protect at least one month of expenses as emergency fund.',
    ].join('\n')
  }

  const handleGenerateAdvice = async () => {
    setAdviceLoading(true)
    setAdvice('')

    const prompt = [
      'Analyze this monthly budget and provide practical finance/business suggestions.',
      `Income: ₹${budget.income}`,
      `Expenses: ₹${budget.expenses}`,
      `Savings Goal: ₹${budget.savingsGoal}`,
      `Remaining after savings: ₹${remainingBalance}`,
      'Line Items:',
      ...budget.lineItems.map((item) => `- ${item.category}: ₹${item.amount || 0} (${item.type})`),
      'Give 5 very clear actions with cut-cost and increase-income ideas.',
    ].join('\n')

    try {
      const response = await sendAiChat({ userId, prompt, language })
      const answer = response.data?.answer?.trim()
      setAdvice(answer || buildFallbackAdvice())
    } catch {
      setAdvice(buildFallbackAdvice())
    } finally {
      setAdviceLoading(false)
    }
  }

  const handleGenerateBusinessPlan = async () => {
    setBusinessPlanLoading(true)
    setBusinessPlan('')

    const monthlyBreakEven = budget.expenses + budget.savingsGoal
    const dailyTarget = Math.ceil(monthlyBreakEven / 30)

    const prompt = [
      'Create a practical monthly business plan from this budget data.',
      `Income: ₹${budget.income}`,
      `Expenses: ₹${budget.expenses}`,
      `Savings Goal: ₹${budget.savingsGoal}`,
      `Remaining after savings: ₹${remainingBalance}`,
      `Break-even baseline (expenses + savings): ₹${monthlyBreakEven}`,
      `Daily target baseline (30-day): ₹${dailyTarget}`,
      'Line Items:',
      ...budget.lineItems.map((item) => `- ${item.category}: ₹${item.amount || 0} (${item.type})`),
      'Return the response with these exact headings and concise actionable points:',
      'Break-even point (monthly):',
      'Daily target (30-day):',
      'Saving strategy:',
      '1. Profit or loss analysis',
      '2. Is business sustainable?',
      '3. How to increase profit',
      '4. How to reduce cost',
      '5. Saving suggestion',
    ].join('\n')

    try {
      const response = await sendAiChat({ userId, prompt, language })
      const answer = response.data?.answer?.trim()
      setBusinessPlan(answer || buildFallbackBusinessPlan())
    } catch {
      setBusinessPlan(buildFallbackBusinessPlan())
    } finally {
      setBusinessPlanLoading(false)
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
          <div className={`rounded-3xl p-4 ${planIsFeasible ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <p className="text-sm text-slate-500">Remaining after savings</p>
            <p className={`mt-2 text-3xl font-semibold ${planIsFeasible ? 'text-emerald-700' : 'text-rose-700'}`}>
              ₹{remainingBalance}
            </p>
          </div>
        </div>
        {!planIsFeasible && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Your current plan is not feasible. Reduce expenses or savings goal, or increase income.
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Monthly history (last 6 saves)</h2>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Income vs expenses vs savings</span>
        </div>

        {chartData.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Save your budget to start seeing history trends.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <div className="flex min-w-[640px] items-end gap-6 pb-2">
              {chartData.map((item, index) => {
                const monthLabel = item.monthKey || `Entry ${index + 1}`
                const incomeHeight = Math.max(((item.income || 0) / maxChartValue) * 120, 4)
                const expenseHeight = Math.max(((item.expenses || 0) / maxChartValue) * 120, 4)
                const savingsHeight = Math.max(((item.savingsGoal || 0) / maxChartValue) * 120, 4)

                return (
                  <div key={`${monthLabel}-${index}`} className="w-24">
                    <div className="flex h-36 items-end justify-center gap-2 rounded-2xl bg-slate-50 px-2 py-3">
                      <div className="w-4 rounded bg-emerald-500" style={{ height: `${incomeHeight}px` }} title={`Income: ₹${item.income || 0}`} />
                      <div className="w-4 rounded bg-rose-500" style={{ height: `${expenseHeight}px` }} title={`Expenses: ₹${item.expenses || 0}`} />
                      <div className="w-4 rounded bg-sky-500" style={{ height: `${savingsHeight}px` }} title={`Savings: ₹${item.savingsGoal || 0}`} />
                    </div>
                    <p className="mt-2 truncate text-center text-xs font-medium text-slate-600">{monthLabel}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-500" />Income</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-rose-500" />Expenses</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-sky-500" />Savings goal</span>
            </div>
          </div>
        )}
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
        <div className="mt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateAdvice}
              className="inline-flex items-center justify-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-5 py-2 text-sm font-semibold text-fuchsia-700 transition hover:bg-fuchsia-100"
            >
              {adviceLoading ? 'Generating suggestions...' : 'Get AI suggestions for this budget'}
            </button>
            <button
              type="button"
              onClick={handleGenerateBusinessPlan}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              {businessPlanLoading ? 'Generating business plan...' : 'Generate Business Plan'}
            </button>
          </div>
        </div>
        {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}
        {advice && (
          <div className="mt-4 rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">
            {advice}
          </div>
        )}
        {businessPlan && (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">
            {businessPlan}
          </div>
        )}
      </section>
    </div>
  )
}
