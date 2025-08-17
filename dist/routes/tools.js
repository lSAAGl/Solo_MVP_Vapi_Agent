"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tools_1 = require("../tools");
const ws_1 = require("../ws");
const router = (0, express_1.Router)();
function getArgs(body) {
    if (!body)
        return {};
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
function checkSecret(req) {
    const required = process.env.TOOL_SECRET;
    if (!required)
        return true;
    const got = req.header('x-tool-secret') || req.header('X-Tool-Secret');
    return got === required;
}
router.post('/_debug_echo', (req, res) => {
    res.json({ ok: true, raw: req.body, headers: req.headers });
});
router.post('/book_meeting', async (req, res) => {
    try {
        if (!checkSecret(req))
            return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const { name, email, slotPref } = getArgs(req.body);
        const result = await (0, tools_1.book_meeting)({ name, email, slotPref });
        (0, ws_1.emit)({ kind: 'tool', name: 'book_meeting', url: result.url, at: Date.now() });
        res.json({ ok: true, ...result });
    }
    catch (e) {
        console.error('book_meeting error:', e?.message || e);
        res.status(400).json({ ok: false, error: e?.message || 'book_meeting failed' });
    }
});
router.post('/send_email', async (req, res) => {
    try {
        if (!checkSecret(req))
            return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const { to, subject, text, html } = getArgs(req.body);
        if (!to || !subject)
            return res.status(400).json({ ok: false, error: 'Missing "to" or "subject"' });
        const result = await (0, tools_1.send_email)({ to, subject, text, html });
        (0, ws_1.emit)({ kind: 'tool', name: 'send_email', to, subject, at: Date.now() });
        res.json({ ok: true, ...result });
    }
    catch (e) {
        console.error('send_email error:', e?.message || e);
        res.status(400).json({ ok: false, error: e?.message || 'send_email failed' });
    }
});
router.post('/log_lead', async (req, res) => {
    try {
        if (!checkSecret(req))
            return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const a = getArgs(req.body);
        const lead = {
            name: a.name,
            company: a.company,
            role: a.role,
            phone_or_email: a.phone_or_email || a.phone || a.email,
            need: a.need,
            objections: a.objections,
            score: typeof a.score === 'number' ? a.score : (a.score ? Number(a.score) : undefined),
            next_step: a.next_step || a.nextStep,
        };
        const result = await (0, tools_1.log_lead)(lead);
        (0, ws_1.emit)({ kind: 'tool', name: 'log_lead', score: lead.score, at: Date.now() });
        res.json({ ok: true, ...result });
    }
    catch (e) {
        console.error('log_lead error:', e?.message || e);
        res.status(400).json({ ok: false, error: e?.message || 'log_lead failed' });
    }
});
router.post('/lookup_kb', async (req, res) => {
    try {
        if (!checkSecret(req))
            return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const { query } = getArgs(req.body);
        if (!query)
            return res.status(400).json({ ok: false, error: 'Missing "query"' });
        const result = await (0, tools_1.lookup_kb)({ query });
        (0, ws_1.emit)({ kind: 'tool', name: 'lookup_kb', q: query, at: Date.now() });
        return res.json({ ok: true, ...result });
    }
    catch (e) {
        console.error('lookup_kb error:', e?.message || e);
        return res.status(400).json({ ok: false, error: e?.message || 'lookup_kb failed' });
    }
});
exports.default = router;
//# sourceMappingURL=tools.js.map