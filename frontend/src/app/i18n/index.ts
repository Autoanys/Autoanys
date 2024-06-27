import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./lang-resource";

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  preload: ["en", "cn"],
  ns: ["common", "sidebar"],
  interpolation: {
    escapeValue: false,
  },
  parseMissingKeyHandler: () => {
    return "";
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
