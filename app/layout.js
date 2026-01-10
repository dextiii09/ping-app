import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Ping | Where Creators Meet Brands',
  description: 'The #1 Platform for Influencer Marketing. Match, Chat, and Collaborate in real-time.',
  manifest: '/manifest.json',
  applicationName: 'Ping',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ping',
  },
};

export const viewport = {
  themeColor: '#8a2be2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
