// Main i18n export - import this to initialize i18n in your app

import i18n from './config.js';

export default i18n;

// Re-export language utilities for convenience
export { LANGUAGES, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getLanguage, getAllLanguages } from './languages.js';
