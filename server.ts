import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, type Content } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  text: string;
}

interface AssistantRequestBody {
  message?: unknown;
  history?: unknown;
  currentRoute?: unknown;
  hospitalContext?: unknown;
}

function buildSystemInstruction(currentRoute: string, hospitalContext: unknown): string {
  const safeContext =
    hospitalContext && typeof hospitalContext === 'object'
      ? JSON.stringify(hospitalContext).slice(0, 24000)
      : '{}';

  return [
    'You are the MediCore 3D Hospital Monitor & Operations Assistant embedded inside the MediCore 3D hospital management web application.',
    '',
    'PRIMARY RESPONSIBILITIES:',
    '1. Monitor and summarize live hospital operational state provided in the LIVE_HOSPITAL_CONTEXT below: patients, doctors & staff, appointments, department bed occupancy, payments & billing invoices, INR financial analytics, pharmacy stock/expiry alerts, unread notifications, and hospital settings.',
    '2. Proactively flag operational risks visible in the context (such as low/critical pharmacy stock, departments above 85% bed occupancy, pending/partially paid invoices, unread alerts, or upcoming appointments).',
    '3. Answer questions about how to use, navigate, or manage workflows inside MediCore 3D (Overview, Patients, Doctors & Staff, Appointments, Departments, Payments & Billing, Financial Analytics, Pharmacy & Inventory, Reports, Settings, and Android/iOS PWA installation).',
    '',
    'STRICT APP-ONLY SCOPE RULE:',
    '- You MUST ONLY answer questions that are directly related to MediCore 3D, its hospital data/monitoring metrics, or workflows inside this application.',
    '- If the user asks about ANY topic unrelated to MediCore 3D (for example: general trivia, external news/weather, coding tutorials, recipes, politics, entertainment, or unrelated medical advice for personal diagnosis), politely refuse in 1-2 sentences stating that you can only monitor MediCore 3D operations and answer questions related to this hospital application, and suggest 2-3 relevant MediCore 3D checks they can ask instead.',
    '- Do not fabricate patient records, invoice IDs, or rupee figures not present in LIVE_HOSPITAL_CONTEXT. Format all currency amounts in INR (₹) using Indian numbering.',
    '- Keep responses concise, structured with clear bullet points, and actionable for hospital administrators.',
    '',
    `CURRENT_APP_ROUTE: ${currentRoute || '/dashboard'}`,
    `LIVE_HOSPITAL_CONTEXT: ${safeContext}`,
  ].join('\n');
}

function extractGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err || 'Unknown error');
  const lower = raw.toLowerCase();

  if (lower.includes('free tier is not available') || lower.includes('billing')) {
    return {
      status: 403,
      message:
        'Gemini API requires a billing-enabled API key for this project. Select or attach a paid API key in Settings > Secrets.',
    };
  }
  if (
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('api key not valid') ||
    lower.includes('403')
  ) {
    return {
      status: 403,
      message:
        'Gemini API access was rejected. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return {
      status: 429,
      message:
        'Gemini API quota limit reached. Please wait briefly or verify your key plan in Settings > Secrets.',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 502,
      message: 'Configured Gemini model was unavailable. Please retry in a moment.',
    };
  }
  return {
    status: 502,
    message: 'Unable to reach the MediCore assistant service right now. Please try again.',
  };
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    res.json({
      ok: true,
      assistantConfigured: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    });
  });

  app.post('/api/assistant', async (req: Request, res: Response) => {
    const body = (req.body || {}) as AssistantRequestBody;
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

    if (!rawMessage) {
      res.status(400).json({ error: 'Please enter a question about MediCore 3D.' });
      return;
    }
    if (rawMessage.length > 2000) {
      res.status(400).json({ error: 'Question must be 2,000 characters or fewer.' });
      return;
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error:
          'Gemini API key is not configured yet. Please add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const currentRoute =
      typeof body.currentRoute === 'string' ? body.currentRoute.slice(0, 120) : '/dashboard';

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const validatedHistory: ChatHistoryEntry[] = rawHistory
      .filter(
        (item): item is ChatHistoryEntry =>
          Boolean(item) &&
          typeof item === 'object' &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.text === 'string' &&
          item.text.trim().length > 0
      )
      .slice(-12)
      .map((item) => ({
        role: item.role,
        text: item.text.trim().slice(0, 2000),
      }));

    const geminiHistory: Content[] = validatedHistory.map((entry) => ({
      role: entry.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: entry.text }],
    }));

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = buildSystemInstruction(currentRoute, body.hospitalContext);
      let reply = '';
      let lastErr: unknown = null;

      for (const modelName of ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']) {
        try {
          const chat = ai.chats.create({
            model: modelName,
            config: { systemInstruction },
            history: geminiHistory,
          });
          const response = await chat.sendMessage({ message: rawMessage });
          reply = (response.text || '').trim();
          if (reply) break;
        } catch (modelErr) {
          lastErr = modelErr;
        }
      }

      if (!reply) {
        if (lastErr) throw lastErr;
        res.status(502).json({
          error: 'Assistant returned an empty response. Please rephrase your question.',
        });
        return;
      }

      res.json({ reply });
    } catch (err) {
      const mapped = extractGeminiError(err);
      if (mapped.status >= 500) {
        console.error('[MediCore Assistant] Upstream error:', mapped.message);
      }
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediCore 3D server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MediCore 3D server:', err);
  process.exit(1);
});
