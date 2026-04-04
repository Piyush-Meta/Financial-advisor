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

  const budgetBreakdown = useMemo(() => {
    const income = Math.max(budget.income || 0, 0)
    const expenses = Math.max(budget.expenses || 0, 0)
    const savings = Math.max(budget.savingsGoal || 0, 0)
    const total = Math.max(income + expenses + savings, 1)

    return {
      income,
      expenses,
      savings,
      total,
      segments: [
        {
          label: 'Income',
          value: income,
          color: '#22c55e',
          percent: Math.round((income / total) * 100),
        },
        {
          label: 'Expenses',
          value: expenses,
          color: '#ef4444',
          percent: Math.round((expenses / total) * 100),
        },
        {
          label: 'Savings',
          value: savings,
          color: '#3b82f6',
          percent: Math.round((savings / total) * 100),
        },
      ],
    }
  }, [budget.expenses, budget.income, budget.savingsGoal])

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

  const buildFallbackSmartAdvice = () => {
    const profitOrLoss = budget.income - budget.expenses
    const status = remainingBalance >= 0 ? 'Profitable' : 'Loss'
    return [
      'Summary:',
      `- Income: ₹${budget.income}`,
      `- Expenses: ₹${budget.expenses}`,
      `- Profit/Loss: ₹${profitOrLoss}`,
      '',
      'Status:',
      `- ${status}`,
      '',
      'Top 3 Suggestions:',
      '1. Cut the biggest expense first.',
      '2. Save a fixed amount daily before spending.',
      '3. Increase one small daily sales activity.',
      '',
      `Daily Target:\n₹${Math.ceil((budget.expenses + budget.savingsGoal) / 30)} per day`,
      '',
      'Savings Tip:',
      'Keep savings automatic and separate from spending money.',
    ].join('\n')
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
      'You are a simple financial advisor for small rural businesses.',
      'Analyze this budget and respond in SHORT format.',
      'Return ONLY in this structure:',
      'Summary:',
      '- Income: ₹___',
      '- Expenses: ₹___',
      '- Profit/Loss: ₹___',
      'Status:',
      '- (Profitable / Loss)',
      'Top 3 Suggestions:',
      '1. ...',
      '2. ...',
      '3. ...',
      'Daily Target:',
      '₹___ per day',
      'Savings Tip:',
      '...',
      'Keep response short.',
      'Use bullet points only.',
      'Max 8 lines.',
      'No long explanations.',
      '',
      `Income: ₹${budget.income}`,
      `Expenses: ₹${budget.expenses}`,
      `Savings Goal: ₹${budget.savingsGoal}`,
      `Remaining after savings: ₹${remainingBalance}`,
      'Line Items:',
      ...budget.lineItems.map((item) => `- ${item.category}: ₹${item.amount || 0} (${item.type})`),
      'Return a concise budget advice response only.',
    ].join('\n')

    try {
      const response = await sendAiChat({ userId, prompt, language })
      const answer = response.data?.answer?.trim()
      setAdvice(answer || buildFallbackSmartAdvice())
    } catch {
      setAdvice(buildFallbackSmartAdvice())
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
      'You are a simple financial advisor for small rural businesses.',
      'Analyze this budget and respond in SHORT format.',
      'Return ONLY in this structure:',
      'Break-even point:',
      'Daily target:',
      'Saving strategy:',
      '1. Profit or loss analysis',
      '2. Is business sustainable?',
      '3. How to increase profit',
      '4. How to reduce cost',
      '5. Saving suggestion',
      'Keep response short.',
      'Use bullet points only.',
      'Max 8 lines.',
      'No long explanations.',
      '',
      `Income: ₹${budget.income}`,
      `Expenses: ₹${budget.expenses}`,
      `Savings Goal: ₹${budget.savingsGoal}`,
      `Remaining after savings: ₹${remainingBalance}`,
      `Break-even baseline (expenses + savings): ₹${monthlyBreakEven}`,
      `Daily target baseline (30-day): ₹${dailyTarget}`,
      'Line Items:',
      ...budget.lineItems.map((item) => `- ${item.category}: ₹${item.amount || 0} (${item.type})`),
      'Return a concise business plan response only.',
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

  const pieGradient = useMemo(() => {
    const [incomeSegment, expenseSegment, savingsSegment] = budgetBreakdown.segments
    return `conic-gradient(${incomeSegment.color} 0% ${incomeSegment.percent}%, ${expenseSegment.color} ${incomeSegment.percent}% ${incomeSegment.percent + expenseSegment.percent}%, ${savingsSegment.color} ${incomeSegment.percent + expenseSegment.percent}% 100%)`
  }, [budgetBreakdown.segments])

  const pieCenterLabel = useMemo(() => {
    return `${budgetBreakdown.total === 0 ? 0 : Math.round((budgetBreakdown.income / budgetBreakdown.total) * 100)}% income share`
  }, [budgetBreakdown.income, budgetBreakdown.total])

  return (
    <div className="min-h-[calc(100vh-96px)] bg-linear-to-br from-fuchsia-50 via-white to-violet-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-4xl bg-white/95 shadow-[0_24px_80px_rgba(124,58,237,0.12)] ring-1 ring-fuchsia-100">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-600 to-violet-600 text-xl text-white shadow-lg">
                💹
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-600">Budget builder</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950">Create a budget</h1>
                <p className="mt-1 text-sm text-slate-500">Track income, savings and expenses in one clean view.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-violet-500 hover:to-fuchsia-500"
            >
              Save budget
            </button>
          </div>

          <div className="px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Income', active: true },
                { label: 'Savings', active: true },
                { label: 'Expenses', active: true },
              ].map((step, index) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${step.active ? 'bg-violet-600' : 'bg-slate-300'}`}>
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                      <p className="text-xs text-slate-500">Step {index + 1}</p>
                    </div>
                  </div>
                  {index < 2 && <div className="h-px flex-1 bg-linear-to-r from-violet-300 to-fuchsia-300" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6 rounded-4xl bg-white/95 p-6 shadow-[0_24px_80px_rgba(124,58,237,0.10)] ring-1 ring-fuchsia-100">
            <div className="rounded-3xl bg-linear-to-r from-fuchsia-950 via-violet-950 to-indigo-950 px-6 py-5 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200">Step 3</p>
              <h2 className="mt-2 text-xl font-semibold">Enter your monthly budget details</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">Keep the plan simple. Your totals update automatically as you edit each row.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Income total</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">₹{budget.income}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Expenses total</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">₹{budget.expenses}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Savings goal</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">₹{budget.savingsGoal}</p>
              </div>
            </div>

            <div className="space-y-4">
              {budget.lineItems.map((item, index) => (
                <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        {item.type === 'income' ? 'Income' : 'Expense'}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.category}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.type}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.2fr_0.7fr_1fr]">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Category</span>
                      <input
                        value={item.category}
                        onChange={(event) => handleChange(index, 'category', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Amount</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(event) => handleChange(index, 'amount', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Note</span>
                      <input
                        value={item.note}
                        onChange={(event) => handleChange(index, 'note', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Savings goal</span>
                <input
                  type="number"
                  value={budget.savingsGoal}
                  onChange={(event) => setBudget((current) => ({ ...current, savingsGoal: Number(event.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                />
              </label>

              <div className="flex flex-col justify-end gap-3 sm:min-w-65">
                <button
                  type="button"
                  onClick={handleGenerateAdvice}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-fuchsia-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-fuchsia-500 hover:to-violet-500"
                >
                  <span className="text-base">✨</span>
                  {adviceLoading ? 'Smart Budget Advice...' : 'Smart Budget Advice'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateBusinessPlan}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-500 hover:to-teal-500"
                >
                  <span className="text-base">📊</span>
                  {businessPlanLoading ? 'Creating Plan...' : 'Create Business Plan'}
                </button>
              </div>
            </div>

            {status && <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{status}</p>}

            {advice && (
              <div className="rounded-3xl border border-fuchsia-100 bg-fuchsia-50 p-5 text-sm leading-7 text-slate-700 whitespace-pre-line shadow-sm">
                {advice}
              </div>
            )}

            {businessPlan && (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-7 text-slate-700 whitespace-pre-line shadow-sm">
                {businessPlan}
              </div>
            )}
          </div>

          <aside className="space-y-6 rounded-4xl bg-white/95 p-6 shadow-[0_24px_80px_rgba(124,58,237,0.10)] ring-1 ring-fuchsia-100">
            <div className="rounded-3xl bg-linear-to-br from-violet-950 via-fuchsia-950 to-slate-900 p-5 text-white shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200">Pie chart</p>
                  <h2 className="mt-2 text-xl font-semibold">Income / Expenses / Savings</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">◔</div>
              </div>

              <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-white/5 p-3">
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-slate-950/95 shadow-inner">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundImage: pieGradient }}
                  />
                  <div className="absolute inset-7 rounded-full bg-slate-950" />
                  <div className="relative text-center text-white">
                    <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200">Budget share</p>
                    <p className="mt-2 text-2xl font-bold">₹{budgetBreakdown.total}</p>
                    <p className="mt-1 text-xs text-slate-300">{pieCenterLabel}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-[1.25rem] bg-white/10 p-4 text-sm">
                {budgetBreakdown.segments.map((segment) => (
                  <div key={segment.label} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
                      <span className="font-semibold text-white">{segment.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">₹{segment.value}</p>
                      <p className="text-xs text-slate-300">{segment.percent}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-3xl p-5 ${planIsFeasible ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Plan status</p>
              <p className={`mt-3 text-3xl font-semibold ${planIsFeasible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {planIsFeasible ? 'Profitable' : 'Loss'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Remaining after savings: ₹{remainingBalance}
              </p>
            </div>

            {!planIsFeasible && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                Your current plan is not feasible. Reduce expenses or savings goal, or increase income.
              </div>
            )}
          </aside>
        </section>

        <section className="rounded-4xl bg-white/95 p-6 shadow-[0_24px_80px_rgba(124,58,237,0.08)] ring-1 ring-fuchsia-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Monthly history (last 6 saves)</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Income vs expenses vs savings</span>
          </div>

          {chartData.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Save your budget to start seeing history trends.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div className="flex min-w-160 items-end gap-6 pb-2">
                {chartData.map((item, index) => {
                  const monthLabel = item.monthKey || `Entry ${index + 1}`
                  const incomeHeight = Math.max(((item.income || 0) / maxChartValue) * 120, 4)
                  const expenseHeight = Math.max(((item.expenses || 0) / maxChartValue) * 120, 4)
                  const savingsHeight = Math.max(((item.savingsGoal || 0) / maxChartValue) * 120, 4)

                  return (
                    <div key={`${monthLabel}-${index}`} className="w-24">
                      <div className="flex h-36 items-end justify-center gap-2 rounded-[1.25rem] bg-slate-50 px-2 py-3">
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
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-sky-500" />Savings</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
