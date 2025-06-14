import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WhatsApp CRM - AI-Powered Customer Management",
    template: "%s | WhatsApp CRM"
  },
  description: "Advanced WhatsApp AI Chatbot with comprehensive CRM, campaign management, and analytics. Built by Rian Infotech.",
  keywords: ["WhatsApp", "CRM", "AI Chatbot", "Customer Management", "Campaigns", "Analytics"],
  authors: [{ name: "Rian Infotech" }],
  creator: "Rian Infotech",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "WhatsApp CRM - AI-Powered Customer Management",
    description: "Advanced WhatsApp AI Chatbot with comprehensive CRM, campaign management, and analytics.",
    siteName: "WhatsApp CRM",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp CRM - AI-Powered Customer Management",
    description: "Advanced WhatsApp AI Chatbot with comprehensive CRM, campaign management, and analytics.",
    creator: "@rianinfotech",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
