import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Unbounded } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NashDom — Недвижимость в Казахстане",
  description:
    "Найдите дом, который чувствуете своим. Квартиры, дома, коммерция и аренда по всему Казахстану.",
  keywords: "недвижимость, квартиры, дома, участки, аренда, продажа, Казахстан",
  openGraph: {
    title: "NashDom — Недвижимость в Казахстане",
    description: "Найдите дом, который чувствуете своим.",
    type: "website",
    locale: "ru_RU",
  },
};

const themeInitScript = `(function(){try{var k='nashdom-theme';var s=localStorage.getItem(k)||'system';var d=s==='dark'||(s==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className={`${manrope.variable} ${unbounded.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
