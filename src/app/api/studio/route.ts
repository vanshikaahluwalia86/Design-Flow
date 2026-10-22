import { NextRequest, NextResponse } from "next/server";
import { callGeminiFlash } from "@/lib/gemini";
import { StudioResponse, TeamType } from "@/types";

interface StudioRequestBody {
  conceptBrief: string;
  vehicleType: string;
  team: TeamType;
  moodKeywords: string;
}

function generateFallbackStudioResponse(body: StudioRequestBody): StudioResponse {
  const { conceptBrief, vehicleType, team, moodKeywords } = body;
  const mood = moodKeywords || "aerodynamic minimalism, futuristic, sculpted";

  return {
    designIntentSummary: `A forward-looking ${vehicleType || "Electric Vehicle"} concept engineered by the ${team || "Vehicle"} team, uniting ${mood} with hyper-efficient aerodynamic surfacing.
The architecture balances bold monolithic exterior tension with sustainable lightweight materials and driver-centric intuitive ergonomics.`,
    prompts: [
      {
        id: "p1",
        name: "Hero Exterior 3/4 Dynamic Angle",
        subject: `Hero 3/4 front dynamic track view of a next-generation ${vehicleType || "EV concept"}, displaying sculpted aero-chiseled bodywork, continuous signature lightbar, flush aeroblade active wheel covers, and low-slung stance. Brief: ${conceptBrief.slice(0, 150)}`,
        style: "Industrial design concept rendering, photorealistic 8K, sleek OEM automotive studio aesthetic, Unreal Engine 5 octane render style",
        lighting: "Diffused horizon rim lighting, dramatic high-contrast golden hour dusk reflections along the shoulder line, subtle neon cyan ground reflection",
        materials: "Matte forged carbon-fiber aero splitters, liquid titanium satin body panels, tinted electrochromic panoramic glass roof, anodized copper brake caliper accents",
        cameraAngle: "Low-angle 3/4 tracking shot, 35mm lens, f/2.8 shallow depth of field, ground level asphalt tarmac perspective",
        negativePrompt: "blurry, low quality, warped wheel arches, cartoon, CGI plastic toy look, deformed headlights, oversaturated artifacts, watermark, text",
      },
      {
        id: "p2",
        name: "Interior Cockpit & CMF Architectural View",
        subject: `Driver-centric minimalist cabin of an advanced ${vehicleType || "EV"}, showing floating curved pillar-to-pillar micro-LED display, yoke steering with haptic glass controls, seamless hidden HVAC vents, and ergonomic zero-gravity bucket seating. Concept context: ${conceptBrief.slice(0, 150)}`,
        style: "Scandinavian architectural minimalism meets high-performance automotive luxury, architectural digest photography",
        lighting: "Soft ambient diffused ceiling illumination, hidden 2700K warm LED light-pipes beneath open-pore trim, natural zenith daylight through glass canopy",
        materials: "Recycled bio-composite hemp door trim, laser-perforated vegan Alcantara seat bolsters, brushed aerospace-grade aluminum switchgear, seamless OLED glass panels",
        cameraAngle: "Eye-level interior wide-angle 24mm view looking through driver door frame into center stack and instrument binnacle",
        negativePrompt: "cluttered buttons, conventional analog gauges, fingerprint smudges on glass, plastic gloss, distorted steering geometry, low-res textures",
      },
      {
        id: "p3",
        name: "Aero Surfacing & Flow Detail Study",
        subject: `Macro telephoto detail study highlighting the active aerodynamic side channel, integrated air-curtain intake, and flush camera winglet mirror of the ${vehicleType || "EV"}. Mood: ${mood}`,
        style: "Automotive engineering portfolio macro photography, crisp high-definition specular surface curvature highlights",
        lighting: "Twin overhead continuous softbox strip lights accentuating zero-tolerance panel shut lines and zebra-stripe reflection curves",
        materials: "Liquid silver pearlescent paint with subtle blue-shift interference coat, micro-perforated aerodynamic vortex generators in exposed raw matte carbon",
        cameraAngle: "Close-up 85mm macro lens, 45-degree angled down towards the rear wheel arch haul and active aero blade",
        negativePrompt: "orange peel paint texture, jagged edge topology, misaligned seams, excessive noise, pixelated reflections",
      },
    ],
    critiqueQuestions: [
      `How does the aero-drag coefficient (Cd) benefit from the aggressive roofline taper without sacrificing rear passenger 95th percentile headroom?`,
      `Are the active lighting elements and aerodynamic intake blades compliant with global UNECE pedestrian impact safety regulations?`,
      `How seamlessly will the proposed ${mood} CMF palette transition across different global markets (e.g. extreme UV sunlight in Arizona vs. freezing salt spray in Norway)?`,
      `What is the optical glare index on the panoramic glass canopy during midday driving, and will an electrochromic tint layer be required as standard equipment?`,
      `Can the complex body curvature transitions be stamped in single-draw aluminum sheet, or will they necessitate multi-piece structural casting?`,
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: StudioRequestBody = await req.json();

    if (!body.conceptBrief || body.conceptBrief.trim().length === 0) {
      return NextResponse.json(
        { error: "Concept brief is required." },
        { status: 400 }
      );
    }

    const systemInstruction = `You are an elite Chief Automotive and Industrial Design AI Director at an advanced Electric Vehicle (EV) hyper-growth company.
Your job is to translate concept briefs into production-grade generative rendering prompts, high-level design summaries, and rigorous industrial critique questions.
Always respond strictly with a valid JSON object matching this structure:
{
  "designIntentSummary": "A concise 2-line summary of design intent.",
  "prompts": [
    {
      "id": "p1",
      "name": "Concise Prompt Title (e.g., Hero 3/4 Exterior Shot)",
      "subject": "Detailed physical subject description...",
      "style": "Rendering engine, art direction, and aesthetic fidelity...",
      "lighting": "Precise lighting scheme, studio vs natural, reflections...",
      "materials": "Specific automotive materials, PBR textures, CMF finishes...",
      "cameraAngle": "Focal length, lens, camera positioning, depth of field...",
      "negativePrompt": "Specific unwanted artifacts and distortions to avoid..."
    },
    ... (exactly 3 prompts total)
  ],
  "critiqueQuestions": [
    "Critique question 1 focusing on aerodynamics, packaging, or manufacturing feasibility",
    "Critique question 2 focusing on ergonomics, UI-UX, or driver human factors",
    "Critique question 3 focusing on CMF sustainability, solar resistance, or durability",
    "Critique question 4 focusing on regulatory safety or lighting standards",
    "Critique question 5 focusing on brand identity or emotional silhouette tension"
  ]
}`;

    const userPrompt = `Generate a structured EV design package based on:
- Concept Brief: "${body.conceptBrief}"
- Vehicle Type: "${body.vehicleType || "Electric Vehicle"}"
- Design Discipline / Team: "${body.team || "Vehicle"}"
- Mood / Aesthetic Keywords: "${body.moodKeywords || "aerodynamic minimalism, high tech"}"

Deliver:
1) Exactly 3 structured rendering prompts (with subject, style, lighting, materials, cameraAngle, negativePrompt).
2) A crisp 2-line design-intent summary.
3) Exactly 5 sharp critique questions for the senior design review.
Return ONLY valid JSON.`;

    try {
      const responseText = await callGeminiFlash(userPrompt, {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      });

      // Parse JSON from Gemini
      let cleaned = responseText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsed: StudioResponse = JSON.parse(cleaned);

      // Validate structure
      if (parsed.prompts && parsed.designIntentSummary && parsed.critiqueQuestions) {
        return NextResponse.json({
          ...parsed,
          source: "gemini",
        });
      }

      throw new Error("Invalid response format received from Gemini.");
    } catch (geminiError: unknown) {
      const err = geminiError instanceof Error ? geminiError : new Error(String(geminiError));
      console.warn("Gemini Studio Route fallback triggered:", err.message);

      // Fallback gracefully so designer always gets high-quality output
      const fallback = generateFallbackStudioResponse(body);
      return NextResponse.json({
        ...fallback,
        source: "fallback",
        notice: err.message.includes("GEMINI_API_KEY_NOT_CONFIGURED")
          ? "Demo mode: Gemini API key not detected in environment. Displaying synthesized studio response."
          : `Note: Switched to offline studio synthesizer (${err.message}).`,
      });
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
