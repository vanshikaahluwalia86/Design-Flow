"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Check,
  History,
  Trash2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Camera,
  Layers,
  Lightbulb,
  Palette,
  Eye,
  Sliders,
  Compass,
} from "lucide-react";
import { TeamType, RenderingPrompt, StudioResponse, StudioHistoryItem } from "@/types";

const VEHICLE_TYPES = [
  "Electric Hypercar",
  "Urban Commuter EV",
  "Autonomous Shuttle / Pod",
  "Long-Haul Electric Semi",
  "Luxury Grand Tourer EV",
  "Rugged Adventure SUV",
  "Next-Gen Crossover EV",
];

const TEAMS: TeamType[] = ["Industrial", "Vehicle", "UI-UX", "CMF"];

const PRESET_BRIEFS = [
  {
    title: "Aero Hypercar",
    brief: "Low-slung solid-state battery electric hypercar with active vortex-channeling side tunnels, continuous blade taillight, and exposed forged composite aero splitters.",
    vehicleType: "Electric Hypercar",
    team: "Vehicle" as TeamType,
    moodKeywords: "aerodynamic precision, monolithic titanium, stealth, race-bred",
  },
  {
    title: "Autonomous Fleet Pod",
    brief: "Symmetrical bi-directional autonomous urban delivery and passenger pod with expansive electrochromic glass dome, perimeter LiDAR crown, and zero-overhang wheelbase.",
    vehicleType: "Autonomous Shuttle / Pod",
    team: "Industrial" as TeamType,
    moodKeywords: "biophilic minimalism, soft architectural volumes, warm Scandinavian, accessible",
  },
  {
    title: "Next-Gen Luxury EV Sedan",
    brief: "Ultra-aerodynamic fastback luxury EV sedan featuring floating pillar-to-pillar holographic cluster HUD, capacitive bamboo armrest controls, and dusk-reactive iridescent paintwork.",
    vehicleType: "Luxury Grand Tourer EV",
    team: "UI-UX" as TeamType,
    moodKeywords: "cybernetic elegance, liquid metal, ambient twilight, haptic luxury",
  },
];

const SUGGESTED_KEYWORDS = [
  "aerodynamic tension",
  "monolithic titanium",
  "biophilic organic",
  "cybernetic precision",
  "sculpted negative space",
  "dusk-reactive iridescent",
  "recycled matte carbon",
  "subtle neon illumination",
];

export default function StudioPage() {
  const [conceptBrief, setConceptBrief] = useState("");
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [team, setTeam] = useState<TeamType>("Vehicle");
  const [moodKeywords, setMoodKeywords] = useState("aerodynamic tension, sculpted minimalism, sleek futuristic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<StudioResponse | null>(null);
  const [history, setHistory] = useState<StudioHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("designflow_studio_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load history from localStorage:", e);
    }
  }, []);

  const saveToHistory = (newResponse: StudioResponse) => {
    const newItem: StudioHistoryItem = {
      id: "hist-" + Date.now(),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      conceptBrief,
      vehicleType,
      team,
      moodKeywords,
      response: newResponse,
    };
    const updated = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    try {
      localStorage.setItem("designflow_studio_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save history to localStorage:", e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("designflow_studio_history");
    } catch (e) {
      console.warn(e);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_BRIEFS[0]) => {
    setConceptBrief(preset.brief);
    setVehicleType(preset.vehicleType);
    setTeam(preset.team);
    setMoodKeywords(preset.moodKeywords);
    setError(null);
  };

  const handleToggleKeyword = (kw: string) => {
    if (moodKeywords.includes(kw)) {
      setMoodKeywords((prev) =>
        prev
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== kw)
          .join(", ")
      );
    } else {
      setMoodKeywords((prev) => (prev ? `${prev}, ${kw}` : kw));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptBrief.trim()) {
      setError("Please provide a concept brief before generating prompts.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptBrief,
          vehicleType,
          team,
          moodKeywords,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate studio prompts.");
      }

      setResult(data);
      if (data.notice) {
        setNotice(data.notice);
      }
      saveToHistory(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const formatFullPromptString = (p: RenderingPrompt) => {
    return `${p.subject}. Style: ${p.style}. Lighting: ${p.lighting}. Materials & CMF: ${p.materials}. Camera angle: ${p.cameraAngle} --no ${p.negativePrompt}`;
  };

  const formatEntirePackage = (resp: StudioResponse) => {
    return `DESIGN INTENT SUMMARY:\n${resp.designIntentSummary}\n\n` +
      `RENDER PROMPT 1: ${resp.prompts[0].name}\n${formatFullPromptString(resp.prompts[0])}\n\n` +
      `RENDER PROMPT 2: ${resp.prompts[1].name}\n${formatFullPromptString(resp.prompts[1])}\n\n` +
      `RENDER PROMPT 3: ${resp.prompts[2].name}\n${formatFullPromptString(resp.prompts[2])}\n\n` +
      `CRITIQUE QUESTIONS:\n` +
      resp.critiqueQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mb-2 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            <span>STUDIO GENERATOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Brief to Prompt Studio
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Translate industrial vehicle concept briefs into high-fidelity structured rendering prompts, design-intent summaries, and senior design review critique questions.
          </p>
        </div>

        {/* Tab switch between Generator & History */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "generator"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "history"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        /* History View */
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Saved Prompt Generations
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
              <History className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No saved history yet</p>
              <p className="text-xs text-zinc-500 mt-1">Generations submitted in the studio will automatically be saved locally.</p>
              <button
                onClick={() => setActiveTab("generator")}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:underline"
              >
                Go to Generator &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                        {item.team}
                      </span>
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 font-semibold">
                        {item.vehicleType}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">{item.createdAt}</span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 italic line-clamp-2">
                    &ldquo;{item.conceptBrief}&rdquo;
                  </p>

                  <div className="text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
                      Intent Summary:
                    </span>
                    {item.response.designIntentSummary}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setResult(item.response);
                        setConceptBrief(item.conceptBrief);
                        setVehicleType(item.vehicleType);
                        setTeam(item.team);
                        setMoodKeywords(item.moodKeywords);
                        setActiveTab("generator");
                      }}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reload into Studio</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(formatEntirePackage(item.response), item.id)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                    >
                      {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === item.id ? "Copied Package" : "Copy All Prompts"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Generator View: Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>Design Parameters</span>
                </h2>
                <span className="text-[11px] font-mono text-zinc-400">Step 1 of 2</span>
              </div>

              {/* Sample Presets */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Quick Load Preset Briefs:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BRIEFS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-emerald-500/50 hover:text-emerald-500 transition-all text-zinc-700 dark:text-zinc-300"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Concept Brief */}
                <div>
                  <label htmlFor="conceptBrief" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Concept Brief <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="conceptBrief"
                    rows={4}
                    value={conceptBrief}
                    onChange={(e) => setConceptBrief(e.target.value)}
                    placeholder="Describe vehicle silhouette, aerodynamic cues, proportions, packaging goals, target customer..."
                    className="w-full text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Vehicle Type & Team */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="vehicleType" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Vehicle Type
                    </label>
                    <select
                      id="vehicleType"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      {VEHICLE_TYPES.map((vt) => (
                        <option key={vt} value={vt}>
                          {vt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="team" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Studio Discipline
                    </label>
                    <select
                      id="team"
                      value={team}
                      onChange={(e) => setTeam(e.target.value as TeamType)}
                      className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      {TEAMS.map((t) => (
                        <option key={t} value={t}>
                          {t} Design
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mood Keywords */}
                <div>
                  <label htmlFor="moodKeywords" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Aesthetic &amp; Mood Keywords
                  </label>
                  <input
                    id="moodKeywords"
                    type="text"
                    value={moodKeywords}
                    onChange={(e) => setMoodKeywords(e.target.value)}
                    placeholder="e.g. aerodynamic tension, titanium, cyberpunk"
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {SUGGESTED_KEYWORDS.map((kw) => {
                      const isSelected = moodKeywords.includes(kw);
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleToggleKeyword(kw)}
                          className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                          }`}
                        >
                          +{kw}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Generation Error</p>
                      <p className="mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 font-semibold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 dark:text-zinc-950" />
                      <span>Synthesizing Studio Prompts...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-400 dark:text-zinc-950" />
                      <span>Generate Prompts &amp; Critique</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Output View (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {notice && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
                <span>{notice}</span>
                <button
                  onClick={() => setNotice(null)}
                  className="text-[11px] underline font-medium hover:opacity-80"
                >
                  Dismiss
                </button>
              </div>
            )}

            {!result && !loading && (
              <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Ready to Synthesize Design Package
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 leading-relaxed">
                  Enter a concept brief on the left or click one of the quick presets to generate 3 structured prompts, a design-intent summary, and 5 critique questions.
                </p>
              </div>
            )}

            {loading && (
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col gap-6 animate-pulse">
                <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-16 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl" />
                <div className="space-y-4">
                  <div className="h-32 w-full bg-zinc-100 dark:bg-zinc-800/40 rounded-xl" />
                  <div className="h-32 w-full bg-zinc-100 dark:bg-zinc-800/40 rounded-xl" />
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="flex flex-col gap-6">
                {/* 2-line Design-Intent Summary */}
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Design-Intent Summary</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.designIntentSummary, "intent-summary")}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      {copiedId === "intent-summary" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === "intent-summary" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    {result.designIntentSummary}
                  </p>
                </div>

                {/* Full Package Copy Button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                    Structured Rendering Prompts (3)
                  </h3>
                  <button
                    onClick={() => copyToClipboard(formatEntirePackage(result), "all-package")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-sm"
                  >
                    {copiedId === "all-package" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "all-package" ? "Entire Package Copied!" : "Copy Full Studio Package"}</span>
                  </button>
                </div>

                {/* 3 Structured Rendering Prompts */}
                <div className="flex flex-col gap-5">
                  {result.prompts.map((prompt, index) => {
                    const fullText = formatFullPromptString(prompt);
                    const isCopied = copiedId === prompt.id;

                    return (
                      <div
                        key={prompt.id || index}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                      >
                        {/* Prompt Header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {prompt.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => copyToClipboard(fullText, prompt.id)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? "Prompt Copied!" : "Copy Prompt"}</span>
                          </button>
                        </div>

                        {/* Structured Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                          <div className="sm:col-span-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/80">
                            <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold block mb-1">
                              Subject
                            </span>
                            <span className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                              {prompt.subject}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/80">
                            <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold flex items-center gap-1 mb-1">
                              <Palette className="w-3 h-3 text-emerald-500" /> Style &amp; Engine
                            </span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {prompt.style}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/80">
                            <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold flex items-center gap-1 mb-1">
                              <Eye className="w-3 h-3 text-sky-500" /> Lighting
                            </span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {prompt.lighting}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/80">
                            <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold flex items-center gap-1 mb-1">
                              <Layers className="w-3 h-3 text-purple-500" /> Materials &amp; CMF
                            </span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {prompt.materials}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/80">
                            <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold flex items-center gap-1 mb-1">
                              <Camera className="w-3 h-3 text-amber-500" /> Camera Angle &amp; Lens
                            </span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {prompt.cameraAngle}
                            </span>
                          </div>

                          <div className="sm:col-span-2 p-2.5 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 text-rose-700 dark:text-rose-300">
                            <span className="font-mono text-[10px] uppercase text-rose-500 font-bold block mb-1">
                              Negative Prompt (--no)
                            </span>
                            <span className="font-mono text-[11px]">
                              {prompt.negativePrompt}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 5 Critique Questions */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-500" />
                      <span>Senior Design Review &bull; 5 Critique Questions</span>
                    </h4>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          result.critiqueQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
                          "critique-copy"
                        )
                      }
                      className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline inline-flex items-center gap-1"
                    >
                      {copiedId === "critique-copy" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === "critique-copy" ? "Copied" : "Copy Questions"}</span>
                    </button>
                  </div>

                  <ul className="space-y-2.5">
                    {result.critiqueQuestions.map((question, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed"
                      >
                        <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
