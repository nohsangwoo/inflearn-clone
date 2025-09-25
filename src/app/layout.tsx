import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import { JsonLd } from "@/components/json-ld";
import { WebViewBridgeInitializer } from "@/components/webview-bridge-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  return generateSeoMetadata({
    path: '/',
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const locale = hdrs.get("x-next-locale") ?? "ko";
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="링구스트" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <JsonLd type="website" locale={locale as 'ko' | 'en' | 'ja' | 'zh'} />
          <WebViewBridgeInitializer />
          <SiteHeader />
          <main className="min-h-[calc(100dvh-56px-64px)] pb-16">
            {children}
          </main>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
