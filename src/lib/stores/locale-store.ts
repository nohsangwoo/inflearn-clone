import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'ko' | 'en' | 'ja' | 'vi' | 'ru' | 'zh' | 'zh-CN' | 'zh-TW' |
  'fr' | 'de' | 'es' | 'pt' | 'it' | 'id' | 'th' | 'hi' | 'ar' | 'tr' | 'pl' | 'uk'

interface LocaleStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'ko', // 기본값
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage', // localStorage key
      partialize: (state) => ({ locale: state.locale }), // 저장할 데이터만 선택
    }
  )
)