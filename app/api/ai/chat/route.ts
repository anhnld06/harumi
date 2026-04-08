import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { HARUMI_SYSTEM_PROMPT } from '@/lib/ai/harumi-system-prompt';
import { userCanAccessPremiumMockTests } from '@/lib/mock-test/mock-test-access';

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
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

  const openai = new OpenAI({ apiKey });

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: HARUMI_SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
      temperature: 0.65,
      max_tokens: 2048,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error('Harumi stream error:', err);
          controller.error(err);
          return;
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('OpenAI chat error:', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
  }
}
