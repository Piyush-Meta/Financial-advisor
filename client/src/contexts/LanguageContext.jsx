import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { languageNames, translations } from '../i18n.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    return localStorage.getItem('sakhi-lang') || 'en'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sakhi-lang', language)
    }
  }, [language])

  const value = useMemo(
    () => ({ language, setLanguage, strings: translations[language], languageNames }),
    [language]
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
