//next-i18next.config.js

/**
 * @type {import('next-i18next').UserConfig}
 */

const path = require("path");
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "cn"],
    localePath: path.resolve("./public/locales"),
  },
};
