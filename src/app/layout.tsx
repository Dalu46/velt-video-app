import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import VeltProviderWrapper from './VeltProviderWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frame.io style video demo with Velt SDK",
  description: "This is a demo of the Velt SDK in action. It is a simple video player that allows you to add frame.io style comments in your application.",
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
        {/* <VeltProviderWrapper> */}
          {children}
        {/* </VeltProviderWrapper> */}
      </body>
    </html>
  );
}
