import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function Business() {
  const { strings } = useLanguage()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{strings.business.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{strings.business.description}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {strings.business.ideas.map((item) => (
          <article key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{strings.business.guideTitle}</h2>
        <ol className="mt-4 space-y-3 pl-5 text-sm leading-7 text-slate-700">
          {strings.business.guideSteps.map((step, index) => (
            <li key={index}>{index + 1}. {step}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
