import { I18n } from 'i18n-js';
import { I18nManager } from "react-native";
import * as RNLocalize from "react-native-localize";

const translatedTexts = {
  "en": () => require("./en-GB.json"),
  "it": () => require("./it-IT.json"),
  "nb": () => require("./nb-NO.json"),
};

const fallback = { languageTag: "en", isRTL: false };
const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translatedTexts)) || fallback;

// update layout direction
I18nManager.forceRTL(isRTL);

// populate correct translated
let translations = {};
for(let languageTag of Object.keys(translatedTexts))
  translations[languageTag] = translatedTexts[languageTag]();

// configure i18n
const i18n = new I18n(translations);
i18n.translations = translations;
i18n.locale = languageTag;
i18n.enableFallback = true;
i18n.fallbackLanguage = fallback.languageTag;

export default i18n;