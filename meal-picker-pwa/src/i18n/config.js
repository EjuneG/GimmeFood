// i18next configuration for multi-language support

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages.js';

// Import translation files for all namespaces and languages
// We'll organize by namespace for better code splitting

// Simplified Chinese (zh-CN)
import zhCNCommon from '../locales/zh-CN/common.json';
import zhCNMain from '../locales/zh-CN/main.json';
import zhCNNutrition from '../locales/zh-CN/nutrition.json';
import zhCNRestaurant from '../locales/zh-CN/restaurant.json';
import zhCNSettings from '../locales/zh-CN/settings.json';
import zhCNFeedback from '../locales/zh-CN/feedback.json';

// Traditional Chinese (zh-TW)
import zhTWCommon from '../locales/zh-TW/common.json';
import zhTWMain from '../locales/zh-TW/main.json';
import zhTWNutrition from '../locales/zh-TW/nutrition.json';
import zhTWRestaurant from '../locales/zh-TW/restaurant.json';
import zhTWSettings from '../locales/zh-TW/settings.json';
import zhTWFeedback from '../locales/zh-TW/feedback.json';

// English
import enCommon from '../locales/en/common.json';
import enMain from '../locales/en/main.json';
import enNutrition from '../locales/en/nutrition.json';
import enRestaurant from '../locales/en/restaurant.json';
import enSettings from '../locales/en/settings.json';
import enFeedback from '../locales/en/feedback.json';

// Japanese
import jaCommon from '../locales/ja/common.json';
import jaMain from '../locales/ja/main.json';
import jaNutrition from '../locales/ja/nutrition.json';
import jaRestaurant from '../locales/ja/restaurant.json';
import jaSettings from '../locales/ja/settings.json';
import jaFeedback from '../locales/ja/feedback.json';

// Korean
import koCommon from '../locales/ko/common.json';
import koMain from '../locales/ko/main.json';
import koNutrition from '../locales/ko/nutrition.json';
import koRestaurant from '../locales/ko/restaurant.json';
import koSettings from '../locales/ko/settings.json';
import koFeedback from '../locales/ko/feedback.json';

// Spanish
import esCommon from '../locales/es/common.json';
import esMain from '../locales/es/main.json';
import esNutrition from '../locales/es/nutrition.json';
import esRestaurant from '../locales/es/restaurant.json';
import esSettings from '../locales/es/settings.json';
import esFeedback from '../locales/es/feedback.json';

// French
import frCommon from '../locales/fr/common.json';
import frMain from '../locales/fr/main.json';
import frNutrition from '../locales/fr/nutrition.json';
import frRestaurant from '../locales/fr/restaurant.json';
import frSettings from '../locales/fr/settings.json';
import frFeedback from '../locales/fr/feedback.json';

// German
import deCommon from '../locales/de/common.json';
import deMain from '../locales/de/main.json';
import deNutrition from '../locales/de/nutrition.json';
import deRestaurant from '../locales/de/restaurant.json';
import deSettings from '../locales/de/settings.json';
import deFeedback from '../locales/de/feedback.json';

// Thai
import thCommon from '../locales/th/common.json';
import thMain from '../locales/th/main.json';
import thNutrition from '../locales/th/nutrition.json';
import thRestaurant from '../locales/th/restaurant.json';
import thSettings from '../locales/th/settings.json';
import thFeedback from '../locales/th/feedback.json';

// Vietnamese
import viCommon from '../locales/vi/common.json';
import viMain from '../locales/vi/main.json';
import viNutrition from '../locales/vi/nutrition.json';
import viRestaurant from '../locales/vi/restaurant.json';
import viSettings from '../locales/vi/settings.json';
import viFeedback from '../locales/vi/feedback.json';

// Indonesian
import idCommon from '../locales/id/common.json';
import idMain from '../locales/id/main.json';
import idNutrition from '../locales/id/nutrition.json';
import idRestaurant from '../locales/id/restaurant.json';
import idSettings from '../locales/id/settings.json';
import idFeedback from '../locales/id/feedback.json';

// Organize resources by language and namespace
const resources = {
  'zh-CN': {
    common: zhCNCommon,
    main: zhCNMain,
    nutrition: zhCNNutrition,
    restaurant: zhCNRestaurant,
    settings: zhCNSettings,
    feedback: zhCNFeedback
  },
  'zh-TW': {
    common: zhTWCommon,
    main: zhTWMain,
    nutrition: zhTWNutrition,
    restaurant: zhTWRestaurant,
    settings: zhTWSettings,
    feedback: zhTWFeedback
  },
  en: {
    common: enCommon,
    main: enMain,
    nutrition: enNutrition,
    restaurant: enRestaurant,
    settings: enSettings,
    feedback: enFeedback
  },
  ja: {
    common: jaCommon,
    main: jaMain,
    nutrition: jaNutrition,
    restaurant: jaRestaurant,
    settings: jaSettings,
    feedback: jaFeedback
  },
  ko: {
    common: koCommon,
    main: koMain,
    nutrition: koNutrition,
    restaurant: koRestaurant,
    settings: koSettings,
    feedback: koFeedback
  },
  es: {
    common: esCommon,
    main: esMain,
    nutrition: esNutrition,
    restaurant: esRestaurant,
    settings: esSettings,
    feedback: esFeedback
  },
  fr: {
    common: frCommon,
    main: frMain,
    nutrition: frNutrition,
    restaurant: frRestaurant,
    settings: frSettings,
    feedback: frFeedback
  },
  de: {
    common: deCommon,
    main: deMain,
    nutrition: deNutrition,
    restaurant: deRestaurant,
    settings: deSettings,
    feedback: deFeedback
  },
  th: {
    common: thCommon,
    main: thMain,
    nutrition: thNutrition,
    restaurant: thRestaurant,
    settings: thSettings,
    feedback: thFeedback
  },
  vi: {
    common: viCommon,
    main: viMain,
    nutrition: viNutrition,
    restaurant: viRestaurant,
    settings: viSettings,
    feedback: viFeedback
  },
  id: {
    common: idCommon,
    main: idMain,
    nutrition: idNutrition,
    restaurant: idRestaurant,
    settings: idSettings,
    feedback: idFeedback
  }
};

// Language detection configuration
const detectionOptions = {
  // Order of detection methods
  order: ['localStorage', 'navigator', 'htmlTag'],

  // Keys for localStorage
  lookupLocalStorage: 'gimme-food-language',

  // Cache user language selection
  caches: ['localStorage'],

  // Don't check cookies (not used in PWA)
  excludeCacheFor: ['cimode']
};

// Initialize i18next
i18n
  .use(LanguageDetector) // Browser language detection
  .use(initReactI18next) // React bindings
  .init({
    resources,

    // Default and fallback language
    fallbackLng: DEFAULT_LANGUAGE,

    // Supported languages
    supportedLngs: SUPPORTED_LANGUAGES,

    // Default namespace
    defaultNS: 'common',

    // Namespace separation
    ns: ['common', 'main', 'nutrition', 'restaurant', 'settings', 'feedback'],

    // Detection options
    detection: detectionOptions,

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ','
    },

    // React specific options
    react: {
      useSuspense: true, // Use Suspense for async loading
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    },

    // Debug mode (set to false in production)
    debug: false,

    // Load all namespaces on init (for better offline support)
    load: 'currentOnly',

    // Return empty string for missing keys instead of key name
    returnEmptyString: false,

    // Don't return objects for missing translations
    returnObjects: false,

    // Key separator (allows nested keys like "common.buttons.confirm")
    keySeparator: '.',

    // Namespace separator
    nsSeparator: ':',

    // Plural suffix
    pluralSeparator: '_',

    // Context separator
    contextSeparator: '_'
  });

export default i18n;
