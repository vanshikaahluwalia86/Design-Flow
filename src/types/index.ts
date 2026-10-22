export type TeamType = "Industrial" | "Vehicle" | "UI-UX" | "CMF";

export interface RenderingPrompt {
  id: string;
  name: string;
  subject: string;
  style: string;
  lighting: string;
  materials: string;
  cameraAngle: string;
  negativePrompt: string;
}

export interface StudioResponse {
  prompts: RenderingPrompt[];
  designIntentSummary: string;
  critiqueQuestions: string[];
}

export interface StudioHistoryItem {
  id: string;
  createdAt: string;
  conceptBrief: string;
  vehicleType: string;
  team: TeamType;
  moodKeywords: string;
  response: StudioResponse;
}

export interface FrictionItem {
  id: string;
  team: TeamType;
  task: string;
  description: string;
  hoursLostPerWeek: number;
  frequencyPerWeek: number;
  workaround: string;
  impactScore: number;
  isSample?: boolean;
  suggestedSolution?: string;
}
