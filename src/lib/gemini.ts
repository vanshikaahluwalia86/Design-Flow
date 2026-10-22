/**
 * Server-only Gemini API integration for DesignFlow
 * NEVER import this file in client components.
 */

interface GeminiGenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}

export async function callGeminiFlash(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  // Support modern Flash models with automatic fallback
  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody: Record<string, unknown> = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
        },
      };

      if (options.systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: options.systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        // 25 second timeout
        signal: AbortSignal.timeout(25000),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const status = res.status;
        const msg = (errorData as { error?: { message?: string } })?.error?.message || `HTTP ${status}`;

        if (status === 429) {
          throw new Error(`RATE_LIMIT_EXCEEDED: ${msg}`);
        }
        if (status === 404) {
          // Try next model if 404
          continue;
        }
        throw new Error(`GEMINI_API_ERROR: ${msg}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("EMPTY_GEMINI_RESPONSE");
      }

      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message.includes("RATE_LIMIT") || lastError.message.includes("GEMINI_API_KEY_NOT_CONFIGURED")) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Failed to communicate with Gemini API.");
}
