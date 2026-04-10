import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { HARUMI_SYSTEM_PROMPT } from '@/lib/ai/harumi-system-prompt';

export type HarumiChatTurn = { role: 'user' | 'assistant'; content: string };

export type LlmProvider = 'openai' | 'gemini' | 'mock';

function envModel(name: string, fallback: string): string {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : fallback;
}

export function resolveLlmProvider(): LlmProvider {
  const v = (process.env.LLM_PROVIDER ?? 'openai').toLowerCase().trim();
  if (v === 'gemini' || v === 'mock') return v;
  return 'openai';
}

/** True when the active provider has the credentials it needs (mock needs none). */
export function llmConfigured(provider: LlmProvider): boolean {
  if (provider === 'mock') return true;
  if (provider === 'gemini') return Boolean(process.env.GEMINI_API_KEY?.trim());
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

async function streamOpenAI(messages: HarumiChatTurn[]): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY!.trim();
  const model = envModel('OPENAI_MODEL', 'gpt-4o-mini');
  const openai = new OpenAI({ apiKey });
  const stream = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: HARUMI_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
    temperature: 0.65,
    max_tokens: 2048,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error('Harumi OpenAI stream error:', err);
        controller.error(err);
        return;
      }
      controller.close();
    },
  });
}

async function streamGemini(messages: HarumiChatTurn[]): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GEMINI_API_KEY!.trim();
  const modelName = envModel('GEMINI_MODEL', 'gemini-1.5-flash');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: HARUMI_SYSTEM_PROMPT,
  });

  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user') {
    throw new Error('Gemini: last message must be from user');
  }

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(last.content);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error('Harumi Gemini stream error:', err);
        controller.error(err);
        return;
      }
      controller.close();
    },
  });
}

function streamMock(): ReadableStream<Uint8Array> {
  const text =
    'はるみちゃんです！（Mock provider — no external API call.）\n\n今日も一緒にJLPTを頑張りましょう！';
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

export async function createHarumiLlmStream(
  provider: LlmProvider,
  messages: HarumiChatTurn[]
): Promise<ReadableStream<Uint8Array>> {
  switch (provider) {
    case 'mock':
      return streamMock();
    case 'gemini':
      return streamGemini(messages);
    default:
      return streamOpenAI(messages);
  }
}
