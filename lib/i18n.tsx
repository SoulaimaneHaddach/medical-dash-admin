/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react'
import en from '../locales/en.json'
import ar from '../locales/ar.json'
import fr from '../locales/fr.json'

export type LocaleKey = 'en' | 'ar' | 'fr'

const translations: Record<LocaleKey, any> = {
  en,
  ar,
  fr,
}

interface I18nContextValue {
  locale: LocaleKey
  setLocale: (l: LocaleKey) => void
  t: (key: string, params?: Record<string, any>) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function lookup(obj: any, key: string) {
  return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Use a stable default for SSR and the initial client render to avoid
  // hydration mismatches. Load the persisted locale on the client after mount.
  const [locale, setLocaleState] = useState<LocaleKey>('en')

  const setLocale = (l: LocaleKey) => {
    setLocaleState(l)
    try {
      if (typeof window !== 'undefined') localStorage.setItem('locale', l)
    } catch {}
  }

  // On client hydrate, read persisted locale and apply it. This runs only
  // after the first paint so the initial server/client render stay consistent.
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('locale') as LocaleKey | null
      if (stored && stored !== locale) setLocaleState(stored)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => {
    const t = (key: string, params?: Record<string, any>) => {
      const dict = translations[locale] || {}
      const value = lookup(dict, key)
      let str = typeof value === 'string' ? value : key
      if (params) {
        Object.keys(params).forEach((p) => {
          str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), String(params[p]))
        })
      }
      return str
    }
    return { locale, setLocale, t }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}

// Synchronous lookup for non-React modules (e.g. API helpers)
export function tSync(key: string, locale: LocaleKey = 'en', params?: Record<string, any>) {
  const dict = translations[locale] || {}
  const value = lookup(dict, key)
  let str = typeof value === 'string' ? value : key
  if (params) {
    Object.keys(params).forEach((p) => {
      str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), String(params[p]))
    })
  }
  return str
}

export default I18nProvider
