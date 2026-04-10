import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import {
  createHarumiLlmStream,
  llmConfigured,
  resolveLlmProvider,
} from '@/lib/ai/harumi-llm-stream';
import { userCanAccessPremiumMockTests } from '@/lib/mock-test/mock-test-access';
import { takeRateLimitToken } from '@/lib/rate-limit';

function envPositiveInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Per-user cap (sliding window); tune via env in production if needed. */
const AI_CHAT_MAX = envPositiveInt('AI_CHAT_RATE_LIMIT_MAX', 24);
const AI_CHAT_WINDOW_MS = envPositiveInt('AI_CHAT_RATE_LIMIT_WINDOW_MS', 60_000);

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(12000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(36),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const okPlan = userCanAccessPremiumMockTests(
    session.user.planTier,
    session.user.planExpiresAt
  );
  if (!okPlan) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
  }

  if (
    !takeRateLimitToken(`ai-chat:${session.user.id}`, AI_CHAT_MAX, AI_CHAT_WINDOW_MS)
  ) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  const provider = resolveLlmProvider();
  if (!llmConfigured(provider)) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { messages } = parsed.data;

  try {
    const readable = await createHarumiLlmStream(provider, messages);
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Harumi LLM error:', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
  }
}
