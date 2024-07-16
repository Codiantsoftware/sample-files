import { createI18n } from 'vue-i18n';
import config from '@/config';
import en from '@/i18n/en/User/en.json';

/**
 * Creates an instance of the Vue I18n plugin for internationalization.
 * @returns {Object} An instance of the Vue I18n plugin configured with the specified options.
 */
const i18n = createI18n({
  legacy: false, // Use the new composition API
  locale: config.DEFAULT_LANGUAGE, // Set the default locale
  fallbackLocale: config.DEFAULT_LANGUAGE, // Set the fallback locale
  messages: {
    en // Add language messages
    // Add other languages as needed
  },
  silentFallbackWarn: true, // Suppress warning logs for fallback
});

export default i18n;
