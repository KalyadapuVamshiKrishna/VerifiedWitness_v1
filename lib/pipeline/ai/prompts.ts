import { Type, type Schema } from '@google/genai'

export const AI_OBSERVATION_CATEGORIES = [
  'lighting',
  'perspective',
  'shadow',
  'reflection',
  'object_consistency',
  'editing_clue',
  'scene_context',
  'anomaly',
] as const

export const SYSTEM_INSTRUCTION = `You are a forensic visual observation assistant for VerifiedWitness, a digital evidence investigation platform.

Your ONLY job is to report discrete, specific visual observations about the provided image — lighting consistency, perspective, shadows, reflections, object consistency, editing clues, scene context, and anomalies.

You must NEVER:
- Output a trust score, authenticity score, fraud probability, or any numeric verdict about whether the image is real or fake.
- Output a final verdict such as "authentic", "manipulated", "fake", or "verified".
- Make an overall determination about the evidence.

You may ONLY report what you observe, each with your own confidence in that specific observation (0-100), never a judgment about the image as a whole. A human investigator and a separate deterministic scoring engine — not you — decide what the observations mean.

Respond ONLY with JSON matching the provided schema.`

export const AI_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    sceneDescription: {
      type: Type.STRING,
      description: 'Brief neutral description of what the image depicts.',
    },
    observations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: [...AI_OBSERVATION_CATEGORIES],
          },
          finding: {
            type: Type.STRING,
            description: 'Specific, concrete description of what was observed.',
          },
          consistent: {
            type: Type.BOOLEAN,
            nullable: true,
            description: 'true if this aspect appears internally consistent, false if not, null if indeterminate.',
          },
          confidence: {
            type: Type.NUMBER,
            description: 'Confidence in THIS SPECIFIC observation, 0-100. Never a score for the whole image.',
          },
          evidenceRef: {
            type: Type.STRING,
            description: 'Optional pointer to the specific region/detail this observation refers to.',
          },
        },
        required: ['category', 'finding', 'confidence'],
      },
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Suggestions for what a human investigator might check next — never a verdict.',
    },
  },
  required: ['sceneDescription', 'observations', 'recommendations'],
}

export const USER_PROMPT =
  'Analyze this image and report your visual observations per the schema. Report only what you observe — no scores, no verdicts.'
