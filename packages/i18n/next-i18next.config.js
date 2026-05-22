const path = require("node:path");
const i18n = require("../../i18n.json");

/** @type {import("next-i18next").UserConfig} */
const config = {
  i18n: {
    defaultLocale: "fr",
    locales: i18n.locale.targets.concat(["fr"]),
  },
  fallbackLng: {
    default: ["fr", "en"],
    "fr-CA": ["fr", "en"],
    zh: ["zh-CN"],
  },
  reloadOnPrerender: process.env.NODE_ENV !== "production",
  localePath: path.resolve(__dirname, "./locales"),
};

module.exports = config;
