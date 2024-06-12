/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en", "cn"],
    defaultLocale: "en",
    localeDetection: false,
  },

  //   env: {
  //     BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  //   },
};

export default nextConfig;
