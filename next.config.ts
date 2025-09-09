import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: [
      "ko",
      "en",
      "ja",
      "vi",
      "ru",
      "zh",
      "zh-CN",
      "zh-TW",
      "fr",
      "de",
      "es",
      "pt",
      "it",
      "id",
      "th",
      "hi",
      "ar",
      "tr",
      "pl",
      "uk",
    ],
    defaultLocale: "ko",
    localeDetection: true,
  },
};

export default nextConfig;
