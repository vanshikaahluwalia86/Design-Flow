import { NextRequest, NextResponse } from "next/server";
import { callGeminiFlash } from "@/lib/gemini";
import { FrictionItem } from "@/types";

interface BatchedSolutionsRequest {
  topProblems: FrictionItem[];
}

function generateFallbackSolutions(problems: FrictionItem[]): Record<string, string> {
  const defaults: Record<string, string> = {
    "friction-1": "Automated CAD-to-CFD Pipeline: Implement an AI-driven mesh repair agent (OpenFOAM + Pointwise API) that automatically seals Alias NURBS gaps, runs automated boundary layer voxelization, and surfaces drag coefficient heatmaps directly in the designer's viewport within 15 minutes.",
    "friction-2": "Multi-Illumination Neural PBR Synthesizer: Deploy a single-shot mobile capture tool trained on automotive textures that uses neural reflectance fields (NeRF) to instantly extract normal, roughness, and albedo maps with calibrated ASTM physical tolerances.",
    "friction-3": "Point-Cloud to Class-A Surface Auto-Matcher: Integrate an automated GOM scan reconciler using ICP (Iterative Closest Point) and bezier curve fitting to automatically generate editable deviation vectors against master CAD without manual slicing.",
    "friction-4": "Multi-Display Auto-Responsive Tokens: Build a custom Figma plugin hooked to automotive design token variables that dynamically calculates display aspect ratios, safe driver viewing frustums, and cluster-to-center console typography scaling with one click.",
    "friction-5": "Generative Packaging Clearance Inspector: Deploy a CATIA macro with bounding-box collision detection that calculates pedestrian impact clearance envelopes and warns styling teams of battery/inverter boundary violations in real time.",
  };

  const solutions: Record<string, string> = {};
  for (const p of problems) {
    if (defaults[p.id]) {
      solutions[p.id] = defaults[p.id];
    } else {
      solutions[p.id] = `AI Workflow Automation for ${p.task}: Implement a specialized micro-service combining visual LLM validation with headless CAD automation to automate the "${p.workaround}" workflow, cutting turnaround time by ~80%.`;
    }
  }
  return solutions;
}

export async function POST(req: NextRequest) {
  try {
    const body: BatchedSolutionsRequest = await req.json();
    const { topProblems } = body;

    if (!topProblems || !Array.isArray(topProblems) || topProblems.length === 0) {
      return NextResponse.json({ error: "topProblems array is required." }, { status: 400 });
    }

    const systemInstruction = `You are an elite Automotive AI Systems Architect and EV Design Automation Specialist.
Your objective is to provide high-impact, practical, engineering-feasible AI and automated tooling solutions for studio bottlenecks.
Respond strictly in JSON format as an object where keys are the problem IDs, and values are concise, 2-3 sentence actionable solutions detailing the proposed AI tool or automated workflow architecture.
Example format:
{
  "problem-id-1": "Proposed solution with specific tooling and architecture...",
  "problem-id-2": "..."
}`;

    const problemsSummary = topProblems
      .map(
        (p, idx) =>
          `[${idx + 1}] ID: "${p.id}" | Team: ${p.team} | Task: "${p.task}" | Description: "${p.description}" | Current Workaround: "${p.workaround}" | Hours Lost/Week: ${p.hoursLostPerWeek} | Impact Score: ${p.impactScore}`
      )
      .join("\n\n");

    const userPrompt = `Here are the top 5 highest-friction workflow bottlenecks reported by our EV design studio:

${problemsSummary}

In ONE batched analysis, provide a concrete, cutting-edge AI or automated tool solution for EACH of the 5 problems above.
Focus on automotive studio realities (Alias, CATIA, Blender, Unreal Engine, CFD, Figma, PBR materials).
Return ONLY a valid JSON dictionary mapping each ID to its proposed solution.`;

    try {
      const responseText = await callGeminiFlash(userPrompt, {
        systemInstruction,
        temperature: 0.6,
        responseMimeType: "application/json",
      });

      let cleaned = responseText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsed: Record<string, string> = JSON.parse(cleaned);
      return NextResponse.json({
        solutions: parsed,
        source: "gemini",
      });
    } catch (geminiError: unknown) {
      const err = geminiError instanceof Error ? geminiError : new Error(String(geminiError));
      console.warn("Gemini Batched Solutions fallback triggered:", err.message);

      const fallback = generateFallbackSolutions(topProblems);
      return NextResponse.json({
        solutions: fallback,
        source: "fallback",
        notice: err.message.includes("GEMINI_API_KEY_NOT_CONFIGURED")
          ? "Demo mode: Gemini API key not detected. Displaying synthesized automotive engineering solutions."
          : `Note: Switched to offline solutions synthesizer (${err.message}).`,
      });
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
