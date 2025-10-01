import { ref } from 'vue'
import { translations } from '../config/translation'

export function useLanguage() {
  const language = ref(localStorage.getItem('language') || 'zh')

  const t = (key) => {
    return translations[language.value]?.[key] ?? key
  }

  const toggleLanguage = () => {
    language.value = language.value === 'zh' ? 'en' : 'zh'
    localStorage.setItem('language', language.value)
  }

  return {
    language,
    t,
    toggleLanguage,
  }
}


