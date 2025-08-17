import { Router } from 'express';
import { send_email, book_meeting, log_lead, lookup_kb } from '../tools';
import type { Lead } from '../tools';
import { emit } from '../ws';

const router = Router();

function getArgs(body: any) {
  if (!body) return {};
  return {
    ...(typeof body === 'object' ? body : {}),
    ...(body?.data || {}),
    ...(body?.input || {}),
    ...(body?.arguments || {}),
    ...(body?.args || {}),
    ...(body?.params || {}),
    ...(body?.payload || {}),
  };
}

function checkSecret(req: any) {
  const required = process.env.TOOL_SECRET;
  if (!required) return true;
  const got = req.header('x-tool-secret') || req.header('X-Tool-Secret');
  return got === required;
}

router.post('/_debug_echo', (req, res) => {
  res.json({ ok: true, raw: req.body, headers: req.headers });
});

router.post('/book_meeting', async (req, res) => {
  try {
    if (!checkSecret(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const { name, email, slotPref } = getArgs(req.body);
    const result = await book_meeting({ name, email, slotPref });
    emit({ kind: 'tool', name: 'book_meeting', url: result.url, at: Date.now() });
    res.json({ ok: true, ...result });
  } catch (e:any) {
    console.error('book_meeting error:', e?.message || e);
    res.status(400).json({ ok: false, error: e?.message || 'book_meeting failed' });
  }
});

router.post('/send_email', async (req, res) => {
  try {
    if (!checkSecret(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const { to, subject, text, html } = getArgs(req.body);
    if (!to || !subject) return res.status(400).json({ ok:false, error:'Missing "to" or "subject"' });
    const result = await send_email({ to, subject, text, html });
    emit({ kind: 'tool', name: 'send_email', to, subject, at: Date.now() });
    res.json({ ok: true, ...result });
  } catch (e:any) {
    console.error('send_email error:', e?.message || e);
    res.status(400).json({ ok: false, error: e?.message || 'send_email failed' });
  }
});


router.post('/log_lead', async (req, res) => {
  try {
    if (!checkSecret(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const a = getArgs(req.body);
    const lead: Lead = {
      name: a.name,
      company: a.company,
      role: a.role,
      phone_or_email: a.phone_or_email || a.phone || a.email,
      need: a.need,
      objections: a.objections,
      score: typeof a.score === 'number' ? a.score : (a.score ? Number(a.score) : undefined),
      next_step: a.next_step || a.nextStep,
    };
    const result = await log_lead(lead);
    emit({ kind: 'tool', name: 'log_lead', score: lead.score, at: Date.now() });
    res.json({ ok: true, ...result });
  } catch (e:any) {
    console.error('log_lead error:', e?.message || e);
    res.status(400).json({ ok: false, error: e?.message || 'log_lead failed' });
  }
});

router.post('/lookup_kb', async (req, res) => {
  try {
    if (!checkSecret(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const { query } = getArgs(req.body);
    if (!query) return res.status(400).json({ ok: false, error: 'Missing "query"' });
    const result = await lookup_kb({ query });
    emit({ kind: 'tool', name: 'lookup_kb', q: query, at: Date.now() });
    return res.json({ ok: true, ...result });
  } catch (e:any) {
    console.error('lookup_kb error:', e?.message || e);
    return res.status(400).json({ ok: false, error: e?.message || 'lookup_kb failed' });
  }
});

export default router;