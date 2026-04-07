import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage, languageNames, strings } = useLanguage()

  return (
    <label className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white ${className}`}>
      <span>{strings.common.language}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-900 outline-none"
      >
        {Object.entries(languageNames).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
