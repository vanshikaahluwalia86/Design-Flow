"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  BarChart3,
  Lightbulb,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Zap,
  CheckCircle2,
  Terminal,
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "Do I need technical or prompt-engineering experience to use DesignFlow?",
    a: "Not at all. DesignFlow was engineered specifically for vehicle, industrial, UI-UX, and CMF designers. You simply type your natural design brief (e.g., 'sculpted aero hypercar with active diffuser'), and Gemini Flash structures it into camera focal lengths, PBR shader physics, and lighting rigs.",
  },
  {
    q: "Where do I paste the generated prompts?",
    a: "The structured prompts can be directly pasted into leading generative image synthesis tools such as Midjourney (v6), Flux.1 (Schnell or Dev), Stable Diffusion XL, or Magnific AI. Each prompt includes camera focal lengths, lighting setups, materials, and a curated negative prompt (--no) tailored for automotive concept art.",
  },
  {
    q: "Is my proprietary design data kept private?",
    a: "Yes. All design briefs and friction records are stored exclusively in your browser's localStorage. The Gemini API requests are dispatched server-side over HTTPS directly to Google's API route without intermediary cloud databases or persistent third-party storage.",
  },
  {
    q: "How is the Friction Impact Score calculated?",
    a: "Impact Score = Frequency per Week × Hours Lost per Occurrence. For example, if clay-to-CAD scan alignment takes 7 hours and occurs 3 times per week, its Impact Score is 21. This gives studio directors an objective, quantitative benchmark to prioritize where automation will unlock the highest throughput.",
  },
  {
    q: "Can I export data for management review or roadmap planning?",
    a: "Yes! On the Insights dashboard, click 'Export CSV' to download a complete spreadsheet containing all logged bottlenecks, teams, impact scores, current workarounds, and Gemini-suggested AI tooling solutions.",
  },
];

export default function DocsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full mb-2 border border-purple-500/20">
          <BookOpen className="w-3 h-3" />
          <span>STUDIO FIELD GUIDE</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          DesignFlow Documentation
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
          Quick-start guide, prompting methodologies, and operational playbooks designed for EV design studios.
        </p>
      </div>

      {/* Quick Start Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-500" />
          <span>Quick-Start: Up and Running in 60 Seconds</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Define Concept Brief
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Open the <strong>Prompt Studio</strong>, choose your vehicle archetype, and write your raw design vision or click a preset chip.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col gap-2">
            <span className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Synthesize Prompts
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Click Generate. Review the 3 structured rendering prompts, design-intent statement, and 5 critique questions. Copy prompts into your render tool.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Quantify Studio Friction
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Visit <strong>Friction Log</strong> to log team bottlenecks. Inspect the impact chart and click &ldquo;Generate AI Tool Solutions&rdquo; for an actionable automation plan.
            </p>
          </div>
        </div>
      </section>

      {/* Tool 1 Guide */}
      <section className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Tool 1: Brief to Prompt Studio Guide
          </h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The Prompt Studio eliminates the guesswork of styling generative AI automotive renders by decomposing creative concepts into six structural pillars:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-500 shrink-0">Subject:</span>
            <span className="text-zinc-700 dark:text-zinc-300">Specifies aerodynamic volumes, rake angle, greenhouse proportions, wheel stance, and signature lighting blades.</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <span className="font-mono font-bold text-sky-500 shrink-0">Style:</span>
            <span className="text-zinc-700 dark:text-zinc-300">Establishes the rendering fidelity (e.g., Octane Render, Unreal Engine 5 raytraced studio look, commercial OEM photography).</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <span className="font-mono font-bold text-amber-500 shrink-0">Lighting:</span>
            <span className="text-zinc-700 dark:text-zinc-300">Controls specular highlight curves along body panels (horizon rim light, dusk reflections, softbox overhead sweeps).</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <span className="font-mono font-bold text-purple-500 shrink-0">Materials:</span>
            <span className="text-zinc-700 dark:text-zinc-300">Grounds the concept in realistic automotive CMF (forged carbon-fiber, iridescent pearl coats, bio-composites, brushed titanium).</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <span className="font-mono font-bold text-rose-500 shrink-0">Camera Angle:</span>
            <span className="text-zinc-700 dark:text-zinc-300">Employs true automotive focal lengths (low-angle 3/4 tracking shot with 35mm lens, or 85mm macro lens for surfacing).</span>
          </div>
        </div>
      </section>

      {/* Pro-Tips for EV Prompt Engineering */}
      <section className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Pro-Tips for Writing High-Fidelity EV Renders
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Use Specific Automotive Vocabulary</span>
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Instead of &ldquo;cool sports car&rdquo;, use terms like <em>&ldquo;cab-forward packaging&rdquo;</em>, <em>&ldquo;active aero diffuser&rdquo;</em>, <em>&ldquo;flush glass-to-body shutlines&rdquo;</em>, and <em>&ldquo;negative-camber rear haunches&rdquo;</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Always Define Lighting Rig Type</span>
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Automotive surfacing relies on zebra-line reflections. Request <em>&ldquo;linear overhead softbox strip lighting&rdquo;</em> or <em>&ldquo;golden hour desert tarmac rim light&rdquo;</em> to reveal class-A surface curvature.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Specify CMF &amp; PBR Shader Layers</span>
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Name actual finishes: <em>&ldquo;tinted liquid titanium clearcoat&rdquo;</em>, <em>&ldquo;recycled ocean-bound polymer door cards&rdquo;</em>, or <em>&ldquo;laser-cut perforated micro-suede&rdquo;</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Keep Rigorous Negative Prompts</span>
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Always exclude distorted wheels, plastic toy shine, deformed tire treads, extra exhaust pipes (crucial for EVs!), and low-resolution artifacting.
            </p>
          </div>
        </div>
      </section>

      {/* Tool 2 Guide */}
      <section className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Tool 2: Studio Friction Log &amp; Impact Matrix
          </h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Design studio bottlenecks often hide in repetitive manual workarounds: converting clay scan points into NURBS, stitching mesh for aero CFD, or recalculating glass tint solar heat gain.
        </p>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs space-y-2">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">The 3-Step Friction Triaging Protocol:</p>
          <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
            <li><strong>Capture:</strong> Record the bottleneck with estimated weekly hours and weekly frequency.</li>
            <li><strong>Rank:</strong> DesignFlow calculates the Impact Score and elevates the Top 5 blockers.</li>
            <li><strong>Synthesize:</strong> Click &ldquo;Generate AI Tool Solutions&rdquo; to query Gemini Flash in a single batched call for actionable, engineering-viable tooling roadmaps.</li>
          </ol>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  {faq.q}
                </span>
                {openFaq === idx ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Next Step Callout */}
      <div className="p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div>
          <h3 className="text-base font-bold">Ready to streamline your studio workflow?</h3>
          <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">Jump directly into the Brief to Prompt Studio to craft your first vehicle package.</p>
        </div>
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shrink-0 shadow-sm"
        >
          <span>Open Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
