import axios from 'axios';
import { appendLead } from './google/sheets';

export type Lead = {
  name?: string;
  company?: string;
  role?: string;
  phone_or_email?: string;
  need?: string;
  objections?: string;
  score?: number;
  next_step?: string;
};

export async function book_meeting(payload: { name?: string; email?: string; slotPref?: string }): Promise<{ url: string }> {
  const url = process.env.CAL_PUBLIC_BOOKING_URL;
  if (!url) throw new Error('CAL_PUBLIC_BOOKING_URL missing');
  return { url };
}

export async function send_email({ to, subject, text, html }:{
  to: string; subject: string; text?: string; html?: string
}): Promise<{ id:string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'PitchPilot <onboarding@resend.dev>';
  if (!key) throw new Error('RESEND_API_KEY missing');
  try {
    const { data } = await axios.post('https://api.resend.com/emails',
      { from, to, subject, html: html ?? `<pre>${text ?? ''}</pre>` },
      { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } }
    );
    return { id: data?.id || 'unknown' };
  } catch (e:any) {
    throw new Error(e?.response?.data?.message || e?.message || 'send_email failed');
  }
}

export async function send_sms(): Promise<void> {
  // TODO: Implement SMS sending functionality
}

export async function create_payment_link(): Promise<void> {
  // TODO: Implement payment link creation functionality
}

export async function log_lead(lead: Lead): Promise<{ updatedRange: string; rowNumber?: number }> {
  return await appendLead(lead);
}

export async function lookup_kb({ query }: { query: string }): Promise<{ snippets: Array<{ text: string; score: number }> }> {
  const fs = await import('fs');
  const path = await import('path');
  if (!query || !query.trim()) throw new Error('query is required');

  const filePath = path.resolve(process.cwd(), 'knowledge.md');
  if (!fs.existsSync(filePath)) return { snippets: [] };

  const raw = fs.readFileSync(filePath, 'utf-8');
  const normalized = raw.replace(/\r\n/g, '\n');

  // Split by headings or blank lines into chunks
  const chunks: string[] = normalized
    .split(/\n(?=#+\s)|\n{2,}/g)
    .map(c => c.trim())
    .filter(Boolean);

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  function scoreChunk(c: string): number {
    const lc = c.toLowerCase();
    let score = 0;
    for (const t of terms) {
      const m = lc.match(new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'));
      score += m ? m.length : 0;
    }
    return score;
  }

  const scored = chunks.map(c => ({ text: c.slice(0, 400), score: scoreChunk(c) }))
                      .filter(x => x.score > 0)
                      .sort((a,b) => b.score - a.score)
                      .slice(0, 3);

  return { snippets: scored };
}