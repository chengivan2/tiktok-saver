import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TikTok Saver — Download TikTok Videos",
  description: "Download TikTok videos without watermark instantly using TikTok Saver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#010101]`}
      >
        <div className="flex-1">{children}</div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-8 px-4">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
            {/* Logo + Brand */}
            <div className="flex items-center gap-3">
              <Image
                src="/logos/tiktoksaverlogo.png"
                alt="TikTok Saver Logo"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="font-black text-xl uppercase tracking-tight">
                TikTok{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#fe0979]">
                  Saver
                </span>
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xs text-gray-600 text-center">
              Download TikTok videos without watermark — fast, free &amp; easy.
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Copyright */}
            <p className="text-xs text-gray-700">
              © {new Date().getFullYear()} TikTok Saver. Not affiliated with TikTok.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
