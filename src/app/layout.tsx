import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DesignFlow // AI Workflow Toolkit for EV Designers",
  description: "Next-generation generative rendering prompt studio and friction insight intelligence for electric vehicle industrial designers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>DesignFlow EV Studio Toolkit &bull; Built for Industrial, Vehicle, UI-UX &amp; CMF Designers</p>
            <p className="font-mono text-[11px] text-zinc-500">Gemini Flash &bull; App Router &bull; Vercel Ready</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
