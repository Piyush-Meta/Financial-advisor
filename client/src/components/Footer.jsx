import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function Footer() {
  const { strings } = useLanguage()

  return (
    <footer className="mt-10 border-t border-white/20 px-4 py-6 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
      <p className="font-semibold text-slate-800">{strings.common.appName}</p>
      <p className="mt-1">{strings.footer.tagline}</p>
      <p className="mt-1 text-xs text-slate-500">{strings.footer.rights}</p>
    </footer>
  )
}
