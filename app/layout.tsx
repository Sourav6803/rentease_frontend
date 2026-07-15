import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers/Index";
import { Footer } from "@/components/layout/Footer";

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
    default: 'RentEase - Furniture & Appliance Rentals',
    template: '%s | RentEase'
  },
  description: 'Rent furniture and appliances on a monthly basis. Affordable, flexible, and convenient.',
  keywords: ['rental', 'furniture', 'appliances', 'monthly rent', 'home appliances'],
  authors: [{ name: 'RentEase' }],
  creator: 'RentEase',
  publisher: 'RentEase',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RentEase - Furniture & Appliance Rentals',
    description: 'Rent furniture and appliances on a monthly basis. Affordable, flexible, and convenient.',
    url: 'https://rentease.com',
    siteName: 'RentEase',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RentEase',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentEase - Furniture & Appliance Rentals',
    description: 'Rent furniture and appliances on a monthly basis. Affordable, flexible, and convenient.',
    images: ['/twitter-image.png'],
    creator: '@rentease',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
            {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
