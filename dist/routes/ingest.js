"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
function stripHtml(html) {
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
        }
        else if (url && typeof url === 'string') {
            const resp = await axios_1.default.get(url, { timeout: 15000 });
            const raw = resp.data || '';
            content = stripHtml(raw);
            source = url;
        }
        const cap = Math.max(1000, Math.min(Number(maxChars) || 20000, 100000));
        const body = content.slice(0, cap);
        const header = `# Knowledge (updated ${new Date().toISOString()})\n` +
            (source ? `**Source:** ${source}\n\n` : '\n');
        const out = header + body + '\n';
        const filePath = path_1.default.resolve(process.cwd(), 'knowledge.md');
        fs_1.default.writeFileSync(filePath, out, 'utf-8');
        return res.json({ ok: true, bytesWritten: Buffer.byteLength(out) });
    }
    catch (e) {
        console.error('ingest error:', e?.message || e);
        return res.status(400).json({ ok: false, error: e?.message || 'ingest failed' });
    }
});
exports.default = router;
//# sourceMappingURL=ingest.js.map