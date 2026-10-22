"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  PlusCircle,
  Download,
  RotateCcw,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Clock,
  Flame,
  Layers,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { FrictionItem, TeamType } from "@/types";
import { TeamImpactChart } from "@/components/TeamImpactChart";
import initialSeedData from "@/data/seed-insights.json";

const TEAMS: TeamType[] = ["Industrial", "Vehicle", "UI-UX", "CMF"];

const TEAM_BADGE_CLASSES: Record<TeamType, string> = {
  Industrial: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Vehicle: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  "UI-UX": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  CMF: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export default function InsightsPage() {
  const [items, setItems] = useState<FrictionItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("All");

  // Form states
  const [team, setTeam] = useState<TeamType>("Industrial");
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [hoursLost, setHoursLost] = useState<number | "">("");
  const [frequency, setFrequency] = useState<number | "">("");
  const [workaround, setWorkaround] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // AI Solutions state
  const [aiSolutions, setAiSolutions] = useState<Record<string, string>>({});
  const [generatingSolutions, setGeneratingSolutions] = useState(false);
  const [solutionNotice, setSolutionNotice] = useState<string | null>(null);
  const [solutionError, setSolutionError] = useState<string | null>(null);

  // Initialize from localStorage or seed
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("designflow_friction_items");
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(initialSeedData as FrictionItem[]);
        localStorage.setItem("designflow_friction_items", JSON.stringify(initialSeedData));
      }

      const storedSolutions = localStorage.getItem("designflow_ai_solutions");
      if (storedSolutions) {
        setAiSolutions(JSON.parse(storedSolutions));
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
      setItems(initialSeedData as FrictionItem[]);
    }
  }, []);

  const saveItems = (newItems: FrictionItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("designflow_friction_items", JSON.stringify(newItems));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleResetSeed = () => {
    if (confirm("Reset all friction data to the 20 EV studio sample entries?")) {
      saveItems(initialSeedData as FrictionItem[]);
      setAiSolutions({});
      localStorage.removeItem("designflow_ai_solutions");
      setSolutionNotice(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    saveItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setFormError("Task title is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Please enter a short description of the friction bottleneck.");
      return;
    }
    const h = Number(hoursLost);
    const f = Number(frequency);
    if (!h || h <= 0) {
      setFormError("Hours lost per week must be greater than 0.");
      return;
    }
    if (!f || f <= 0) {
      setFormError("Frequency per week must be greater than 0.");
      return;
    }

    const calculatedImpact = Math.round(h * f);
    const newItem: FrictionItem = {
      id: "friction-" + Date.now(),
      team,
      task: task.trim(),
      description: description.trim(),
      hoursLostPerWeek: h,
      frequencyPerWeek: f,
      workaround: workaround.trim() || "No documented workaround",
      impactScore: calculatedImpact,
      isSample: false,
    };

    saveItems([newItem, ...items]);
    setTask("");
    setDescription("");
    setHoursLost("");
    setFrequency("");
    setWorkaround("");
    setFormError(null);
    setShowForm(false);
  };

  // Top 5 problems sorted by Impact Score descending
  const top5Problems = useMemo(() => {
    return [...items].sort((a, b) => b.impactScore - a.impactScore).slice(0, 5);
  }, [items]);

  // Aggregated data for Recharts
  const chartData = useMemo(() => {
    return TEAMS.map((t) => {
      const teamItems = items.filter((item) => item.team === t);
      const totalImpact = teamItems.reduce((acc, curr) => acc + curr.impactScore, 0);
      const totalHoursLost = teamItems.reduce((acc, curr) => acc + curr.hoursLostPerWeek, 0);
      return {
        team: t,
        totalImpact,
        totalHoursLost,
        itemCount: teamItems.length,
      };
    });
  }, [items]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalLostHours = items.reduce((acc, curr) => acc + curr.hoursLostPerWeek, 0);
    const totalImpact = items.reduce((acc, curr) => acc + curr.impactScore, 0);
    const highestTeam = [...chartData].sort((a, b) => b.totalImpact - a.totalImpact)[0]?.team || "N/A";
    return { totalLostHours, totalImpact, highestTeam, totalCount: items.length };
  }, [items, chartData]);

  // Filtered items list
  const filteredItems = useMemo(() => {
    if (selectedTeamFilter === "All") return items;
    return items.filter((i) => i.team === selectedTeamFilter);
  }, [items, selectedTeamFilter]);

  // Trigger Batched Gemini API call for Top 5
  const handleGenerateSolutions = async () => {
    if (top5Problems.length === 0) return;

    setGeneratingSolutions(true);
    setSolutionError(null);
    setSolutionNotice(null);

    try {
      const res = await fetch("/api/insights/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topProblems: top5Problems }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI solutions.");
      }

      setAiSolutions((prev) => {
        const merged = { ...prev, ...data.solutions };
        try {
          localStorage.setItem("designflow_ai_solutions", JSON.stringify(merged));
        } catch (e) {
          console.warn(e);
        }
        return merged;
      });

      if (data.notice) {
        setSolutionNotice(data.notice);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating solutions.";
      setSolutionError(msg);
    } finally {
      setGeneratingSolutions(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (items.length === 0) return;

    const headers = [
      "ID",
      "Team",
      "Task",
      "Description",
      "Hours Lost Per Week",
      "Frequency Per Week",
      "Impact Score (Freq x Hours)",
      "Current Workaround",
      "Data Type",
      "Suggested AI Solution",
    ];

    const rows = items.map((i) => {
      const solution = aiSolutions[i.id] || "";
      const escape = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
      return [
        escape(i.id),
        escape(i.team),
        escape(i.task),
        escape(i.description),
        i.hoursLostPerWeek,
        i.frequencyPerWeek,
        i.impactScore,
        escape(i.workaround),
        i.isSample ? "Sample Data" : "Custom Entry",
        escape(solution),
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `designflow-friction-insights-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full mb-2 border border-sky-500/20">
            <BarChart3 className="w-3 h-3" />
            <span>STUDIO METRICS &amp; AUTOMATION ROADMAP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Friction Log &amp; Studio Insights
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Audit workflow bottlenecks across EV design disciplines. Quantify friction impact scores, rank top blockers, and synthesize AI automation roadmaps with Gemini Flash.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>{showForm ? "Close Form" : "Log New Friction"}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleResetSeed}
            title="Reset to 20 realistic EV sample entries"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block mb-1">
            Total Logged Items
          </span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Layers className="w-5 h-5 text-zinc-400" />
            <span>{metrics.totalCount}</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Active studio bottlenecks</span>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block mb-1">
            Weekly Hours Lost
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            <span>{metrics.totalLostHours} hrs</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Cumulative studio drag / wk</span>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block mb-1">
            Total Impact Score
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>{metrics.totalImpact} pts</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">&Sigma; (Hours &times; Frequency)</span>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block mb-1">
            Highest Impact Team
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>{metrics.highestTeam}</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Prime candidate for tooling</span>
        </div>
      </div>

      {/* Log New Friction Form (Expandable) */}
      {showForm && (
        <div className="p-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>Log Studio Friction Entry</span>
            </h3>
            <span className="text-xs text-zinc-400">Formula: Impact = Frequency &times; Hours Lost</span>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Discipline / Team
                </label>
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value as TeamType)}
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {t} Design
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g. Aero vortex mesh repair for CFD"
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Description of Bottleneck <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the detailed friction, CAD/tooling constraints, software gaps..."
                className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Hours Lost / Week <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hoursLost}
                  onChange={(e) => setHoursLost(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 6"
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Frequency / Week <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 3"
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Calculated Impact Score
                </label>
                <div className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-2 text-zinc-800 dark:text-zinc-200 font-mono font-bold flex items-center justify-between">
                  <span>Impact:</span>
                  <span className="text-emerald-500 text-sm">
                    {Number(hoursLost || 0) * Number(frequency || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Current Workaround
              </label>
              <input
                type="text"
                value={workaround}
                onChange={(e) => setWorkaround(e.target.value)}
                placeholder="What manual steps are currently taken? (e.g. Photoshop batch scripts, overnight manual stitching)"
                className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {formError && (
              <p className="text-xs text-rose-500 font-medium">{formError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Add Friction Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recharts Bar Chart of Impact by Team (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-500" />
                <span>Cumulative Impact by Team</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Recharts</span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Bar chart aggregating impact scores (&Sigma; frequency &times; hours lost) across each EV studio discipline.
            </p>
          </div>

          <TeamImpactChart data={chartData} />

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
            {chartData.map((d) => (
              <div key={d.team} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60">
                <span className="font-medium text-zinc-600 dark:text-zinc-400">{d.team}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{d.totalImpact} pts ({d.totalHoursLost}h)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top 5 Problems to Automate & Gemini Batched AI Solutions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Ranked Top 5 Problems to Automate
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Highest Priority
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Top 5 bottlenecks ranked by cumulative impact score.
                </p>
              </div>

              {/* Batched AI Solutions Trigger */}
              <button
                onClick={handleGenerateSolutions}
                disabled={generatingSolutions || top5Problems.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {generatingSolutions ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Top 5 with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate AI Tool Solutions (1 Call)</span>
                  </>
                )}
              </button>
            </div>

            {solutionNotice && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
                {solutionNotice}
              </div>
            )}

            {solutionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{solutionError}</span>
              </div>
            )}

            {/* Top 5 Ranked List */}
            <div className="space-y-4">
              {top5Problems.map((p, idx) => {
                const solution = aiSolutions[p.id];
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-col gap-2.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-mono font-bold text-xs flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                          #{idx + 1}
                        </span>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${TEAM_BADGE_CLASSES[p.team]}`}>
                          {p.team}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {p.task}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {p.impactScore} pts
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="text-[11px] text-zinc-500 bg-white dark:bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span><strong className="text-zinc-700 dark:text-zinc-300">Current Workaround:</strong> {p.workaround}</span>
                      <span className="font-mono text-zinc-400 shrink-0">
                        {p.hoursLostPerWeek}h/wk &times; {p.frequencyPerWeek}x/wk
                      </span>
                    </div>

                    {/* Gemini AI Suggested Solution Block */}
                    {solution ? (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                        <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Gemini Suggested AI / Tool Solution:</span>
                        </span>
                        <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          {solution}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-400 italic flex items-center gap-1.5 py-1">
                        <Sparkles className="w-3 h-3 text-zinc-400" />
                        <span>Click &ldquo;Generate AI Tool Solutions&rdquo; above to synthesize an automated solution with Gemini Flash.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full Friction Log Table Section */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Full Studio Friction Database ({filteredItems.length} items)</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Comprehensive list of all logged studio bottlenecks with individual impact metrics.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-zinc-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {["All", ...TEAMS].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedTeamFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedTeamFilter === f
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3">Task &amp; Description</th>
                <th className="py-2.5 px-3 text-right">Lost/Wk</th>
                <th className="py-2.5 px-3 text-right">Freq/Wk</th>
                <th className="py-2.5 px-3 text-right">Impact</th>
                <th className="py-2.5 px-3">Workaround</th>
                <th className="py-2.5 px-3 text-center">Type</th>
                <th className="py-2.5 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <span className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${TEAM_BADGE_CLASSES[item.team]}`}>
                      {item.team}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top max-w-xs sm:max-w-md">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                      {item.task}
                    </div>
                    <div className="text-[11px] text-zinc-500 line-clamp-2">
                      {item.description}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {item.hoursLostPerWeek}h
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {item.frequencyPerWeek}x
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {item.impactScore}
                  </td>
                  <td className="py-3 px-3 align-top text-zinc-600 dark:text-zinc-400 text-[11px] max-w-xs">
                    {item.workaround}
                  </td>
                  <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                    {item.isSample ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                        sample data
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        custom
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 align-top text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete item"
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
