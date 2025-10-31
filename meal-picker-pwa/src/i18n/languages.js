// Language definitions with native names and metadata

export const LANGUAGES = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '中文简体',
    flag: '🇨🇳',
    direction: 'ltr'
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Traditional Chinese',
    nativeName: '中文繁體',
    flag: '🇹🇼',
    direction: 'ltr'
  },
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr'
  },
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr'
  },
  'es': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr'
  },
  'fr': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr'
  },
  'de': {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr'
  },
  'th': {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    direction: 'ltr'
  },
  'vi': {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    direction: 'ltr'
  },
  'id': {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    direction: 'ltr'
  }
};

export const DEFAULT_LANGUAGE = 'zh-CN';
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES);

// Get language object by code
export const getLanguage = (code) => {
  return LANGUAGES[code] || LANGUAGES[DEFAULT_LANGUAGE];
};

// Get list of all languages for selector
export const getAllLanguages = () => {
  return SUPPORTED_LANGUAGES.map(code => LANGUAGES[code]);
};
