import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "legix.net",
  description: "Generated by create next app",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NO "use client" here—this file is a Server Component.
  // That lets us export `metadata`.

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 
          Wrap all pages in a separate Client Component 
          that handles React context providers.
        */}
        <Providers>
          {children}
          <div id="modal" />
        </Providers>
      </body>
    </html>
  );
}
