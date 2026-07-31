import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomNavigation } from "@/components/bottom-navigation";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import { JsonLd } from "@/components/json-ld";
import { WebViewBridgeInitializer } from "@/components/webview-bridge-initializer";
import { brand } from "@/lib/brand";

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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={brand.name} />
        <meta name="theme-color" content="#ff385c" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <JsonLd type="website" locale={locale as 'ko' | 'en' | 'ja' | 'zh'} />
          <WebViewBridgeInitializer />
          <SiteHeader />
          <div id="main-content" className="min-h-[calc(100dvh-72px-64px)] pb-16 md:pb-0">
            {children}
          </div>
          <SiteFooter />
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
