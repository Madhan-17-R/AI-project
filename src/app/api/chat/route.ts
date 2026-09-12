// =============================================================================
// Marudam — AI Chatbot Route Handler
// =============================================================================
// POST /api/chat
// Accepts: { message, language, context }
// Returns: { reply }
//
// The chatbot:
//  - Answers in the farmer's selected language
//  - Uses structured field context (never arbitrary DB access)
//  - Distinguishes MEASURED / ESTIMATED / FORECAST / RECOMMENDED
//  - Never invents sensor readings or field data
//  - Gracefully handles missing data
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy-initialize OpenAI so missing key gives a clear error, not a build failure
function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === 'your_openai_api_key_here') return null;
  return new OpenAI({ apiKey: key });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { message, language = 'English', context = {} } = body as {
    message: string;
    language: string;
    context: Record<string, unknown>;
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json({
      reply: 'The AI assistant is not configured yet. Please set the OPENAI_API_KEY environment variable.',
    });
  }

  // ── Build system prompt ────────────────────────────────────────────────────
  const systemPrompt = `
You are Marudam, an agricultural field assistant for Indian farmers.
You answer questions about a farmer's specific field, using the structured context provided.

RULES YOU MUST ALWAYS FOLLOW:
1. Answer in ${language}. Always.
2. If the farmer writes in any language, still answer in ${language}.
3. Distinguish clearly between:
   - MEASURED data (actual sensor readings)
   - ESTIMATED data (root-zone estimate, not directly measured)
   - FORECAST data (weather prediction)
   - RECOMMENDED action (system suggestion, not a guaranteed outcome)
4. NEVER invent sensor readings, rainfall amounts, field events, or crop data.
5. If information is unavailable, say so clearly. Do not guess.
   Example: "I don't have current weather data for your area."
6. Be simple and farmer-friendly. Avoid technical jargon.
7. Keep answers concise — 2–5 sentences unless a detailed explanation is clearly needed.
8. Do not mention confidence numbers or model internals.
9. Only use the field context provided to you. Do not assume additional data.

FIELD CONTEXT (use this for all answers):
${JSON.stringify(context, null, 2)}

If the context has null/undefined values for a field the farmer asks about, say you don't have that information currently.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: message },
      ],
      max_tokens: 500,
      temperature: 0.4,
    });

    const reply = response.choices[0]?.message?.content?.trim() ?? 'I was unable to generate a response. Please try again.';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[Marudam Chat] OpenAI error:', err);
    return NextResponse.json({ error: 'AI request failed. Please try again.' }, { status: 500 });
  }
}
