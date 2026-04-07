import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { languageNames, resolveTranslation, rtlLanguages } from '../i18n.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('hi')

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Force Hindi on startup so stale persisted values never override default locale.
    if (language !== 'hi') {
      setLanguage('hi')
      return
    }
    localStorage.setItem('sakhi-lang', 'hi')
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sakhi-lang', language)
      document.documentElement.lang = language
      document.documentElement.dir = rtlLanguages.has(language) ? 'rtl' : 'ltr'
    }
  }, [language])

  const strings = useMemo(() => resolveTranslation(language), [language])

  const value = useMemo(
    () => ({ language, setLanguage, strings, t: strings, languageNames }),
    [language, strings]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
