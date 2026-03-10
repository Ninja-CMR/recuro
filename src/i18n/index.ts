import { createI18n } from 'vue-i18n'

import fr from './locales/fr.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

const getBrowserLocale = () => {
    const navigatorLocale = window.navigator.language
    if (!navigatorLocale) return 'fr'

    if (navigatorLocale.startsWith('fr')) return 'fr'
    if (navigatorLocale.startsWith('ja')) return 'ja'
    return 'en' // default to english for other languages
}

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: getBrowserLocale(), // set locale dynamically
    fallbackLocale: 'fr', // set fallback locale
    messages: {
        fr,
        en,
        ja
    }
})

export default i18n
