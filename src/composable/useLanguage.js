import { ref } from 'vue'
import { translations } from '../config/translation'

export function useLanguage(initial = 'zh') {
  const language = ref(initial)

  const t = (key) => {
    return translations[language.value]?.[key] ?? key
  }

  const toggleLanguage = () => {
    language.value = language.value === 'zh' ? 'en' : 'zh'
  }

  return {
    language,
    t,
    toggleLanguage,
  }
}


