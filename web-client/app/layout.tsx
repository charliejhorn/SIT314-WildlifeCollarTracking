import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "WildTrack",
  description: "Animal, collar, and geofence management",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-emerald-700">WildTrack</Link>
            <div className="flex gap-5 text-sm font-medium text-slate-600">
              <Link className="hover:text-emerald-700" href="/animals">Animals</Link>
              <Link className="hover:text-emerald-700" href="/collars">Collars</Link>
              <Link className="hover:text-emerald-700" href="/geofences">Geofences</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
