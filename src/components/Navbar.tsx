"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles, BarChart3, BookOpen, Layers } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/studio", label: "Prompt Studio", icon: Sparkles },
    { href: "/insights", label: "Friction & Insights", icon: BarChart3 },
    { href: "/docs", label: "Studio Docs", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold transition-transform group-hover:scale-105 shadow-md">
            <Layers className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 text-base">
                DesignFlow
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                EV Studio
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 -mt-0.5 hidden sm:inline-block">
              AI Workflow Toolkit for Vehicle Designers
            </span>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700/80"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-500 dark:text-emerald-400" : ""}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side tools */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
