// import i18nConfig from "./next-i18next.config.js";

// const { i18n } = i18nConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ["en", "cn"],
    defaultLocale: "en",
  },
};

export default nextConfig;
