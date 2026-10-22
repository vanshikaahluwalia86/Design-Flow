import Link from "next/link";
import { Sparkles, BarChart3, BookOpen, ArrowRight, ShieldCheck, Zap, Compass, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-8 sm:p-12 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>EV STUDIO ACCELERATOR &bull; POWERED BY GEMINI FLASH</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl leading-[1.15]">
          Supercharge Industrial &amp; Vehicle Design at Scale.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
          DesignFlow equips EV design teams with purpose-built AI workflows: translate raw concept briefs into production-grade rendering prompts, and unblock studio throughput with data-backed friction intelligence.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>Launch Prompt Studio</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-sky-500" />
            <span>Explore Friction Insights</span>
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium text-sm hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read Studio Docs</span>
          </Link>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Prompt Studio */}
        <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
              Generative Visuals
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Brief to Prompt Studio
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
              Turn unstructured free-text design briefs into 3 camera-ready, structured Midjourney/Flux rendering prompts, a 2-line design-intent summary, and 5 senior critique review questions.
            </p>
          </div>
          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Friction Log */}
        <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-sky-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold mb-1">
              Operations &amp; Prioritization
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Friction Log &amp; Insights
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
              Audit studio roadblocks across Industrial, Vehicle, UI-UX, and CMF teams. Analyze team impact via dynamic bar charts, rank top bottlenecks, and generate automated AI solutions.
            </p>
          </div>
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <span>View Insights Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Docs */}
        <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-1">
              Field Guide
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Designer Documentation
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
              Practical guides for non-technical designers: prompt formulation guides, camera angles, surfacing keywords, negative prompt templates, and FAQ.
            </p>
          </div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>Explore Documentation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* EV Design Pillars Section */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/30 p-6 sm:p-8">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-4 font-semibold">
          Architected for EV Studio Disciplines
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>Industrial</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Ergonomics, charging hardware, steering systems, and cabin hardpoints.</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              <Cpu className="w-4 h-4 text-sky-500" />
              <span>Vehicle</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Aero surfacing, proportions, clay scanning, frunk packaging, drag metrics.</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>UI / UX</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pillar-to-pillar HUDs, drive mode choreography, dark-mode night glare.</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>CMF</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Sustainable vegan bio-materials, solar-shift coatings, PBR shader maps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
