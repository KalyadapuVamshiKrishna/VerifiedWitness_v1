import { GoogleGenAI } from '@google/genai'
import { SYSTEM_INSTRUCTION, AI_RESPONSE_SCHEMA, USER_PROMPT } from './prompts'

// gemini-2.5-flash is restricted for some API key tiers ("no longer available to new
// users") despite appearing in the models list. gemini-2.0-flash-001 hit a separate
// account-level quota=0 block. Confirmed directly callable with real quota on the
// current key — pin the concrete version, not the "-latest" alias, so behavior/audit
// trail stay stable if the alias is repointed later.
export const GEMINI_MODEL = 'gemini-3.5-flash'

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (client) return client
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY
  if (!apiKey) {
    throw new Error(
      'GOOGLE_AI_STUDIO_KEY is not set. Add it to .env.local and the Vercel project env vars before running the AI Visual Investigation stage.'
    )
  }
  client = new GoogleGenAI({ apiKey })
  return client
}

/**
 * Server-only call to Gemini for structured visual observations. The response is forced into
 * JSON matching AI_RESPONSE_SCHEMA — see prompts.ts for the hard constraint that Gemini never
 * emits a score or verdict, only per-observation confidence. lib/pipeline/ai/parse.ts is the
 * second line of defense that validates/strips the raw text before it becomes AiFindings.
 */
export async function callGeminiVisualInvestigation(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; modelVersion: string }> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ inlineData: { mimeType, data: buffer.toString('base64') } }, { text: USER_PROMPT }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: AI_RESPONSE_SCHEMA,
    },
  })

  const text = response.text
  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  // Prefer the model version Gemini actually reports over the requested constant —
  // more accurate for the audit trail if the requested name is ever a floating alias.
  return { text, modelVersion: response.modelVersion ?? GEMINI_MODEL }
}
