import { Router } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = Router();

function stripHtml(html: string): string {
  // naive but fine for hackathon: remove tags, collapse spaces
  const noScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const text = noScripts.replace(/<[^>]+>/g, ' ');
  return text.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

router.post('/', async (req, res) => {
  try {
    const { url, markdown, maxChars } = req.body || {};
    if (!url && !markdown) {
      return res.status(400).json({ ok: false, error: 'Provide either "url" or "markdown".' });
    }

    let content = '';
    let source = '';
    if (markdown && typeof markdown === 'string') {
      content = markdown;
      source = 'manual';
    } else if (url && typeof url === 'string') {
      const resp = await axios.get<string>(url, { timeout: 15000 });
      const raw = resp.data || '';
      content = stripHtml(raw);
      source = url;
    }

    const cap = Math.max(1000, Math.min(Number(maxChars) || 20000, 100000));
    const body = content.slice(0, cap);

    const header =
      `# Knowledge (updated ${new Date().toISOString()})\n` +
      (source ? `**Source:** ${source}\n\n` : '\n');

    const out = header + body + '\n';
    const filePath = path.resolve(process.cwd(), 'knowledge.md');
    fs.writeFileSync(filePath, out, 'utf-8');
    return res.json({ ok: true, bytesWritten: Buffer.byteLength(out) });
  } catch (e:any) {
    console.error('ingest error:', e?.message || e);
    return res.status(400).json({ ok: false, error: e?.message || 'ingest failed' });
  }
});

export default router;
