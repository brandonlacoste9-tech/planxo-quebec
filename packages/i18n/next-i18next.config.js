const config = {
  i18n: {
    defaultLocale: "fr",
    locales: [
      "ar", "az", "bg", "bn", "ca", "cs", "da", "de", "el", "en", "es", "es-419", 
      "eu", "et", "fi", "fr-CA", "he", "hu", "it", "ja", "km", "ko", "nl", "no", 
      "pl", "pt-BR", "pt", "ro", "ru", "sk-SK", "sr", "sv", "tr", "uk", "vi", 
      "zh-CN", "zh-TW", "fr"
    ],
  },
  fallbackLng: {
    default: ["fr", "en"],
    "fr-CA": ["fr", "en"],
    zh: ["zh-CN"],
  },
  reloadOnPrerender: process.env.NODE_ENV !== "production",
  localePath: "./locales",
};

export default config;
