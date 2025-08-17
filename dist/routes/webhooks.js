"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("../tools");
const express_1 = require("express");
const ws_1 = require("../ws");
const router = (0, express_1.Router)();
// in-memory call sessions
const sessions = new Map();
/**
 * Enhanced Vapi webhook handler with session tracking and auto-lead logging.
 */
router.post('/vapi', async (req, res) => {
    try {
        const body = req.body || {};
        const type = body.type || body.event || body.eventType || body?.data?.type || '';
        const callId = body.callId || body?.data?.callId || body?.data?.call?.id || body.call_id || body.id || 'unknown';
        if (!callId || callId === 'unknown') {
            return res.json({ ok: true, note: 'no callId' });
        }
        switch (type) {
            case 'call.started': {
                sessions.set(callId, {
                    startedAt: Date.now(),
                    transcript: '',
                    caller: body.caller || body.from || body?.data?.caller || {}
                });
                (0, ws_1.emit)({ kind: 'call', event: 'started', callId, at: Date.now() });
                break;
            }
            case 'transcript.delta': {
                const sess = sessions.get(callId) || { startedAt: Date.now(), transcript: '', caller: {} };
                const delta = (body.text || body?.data?.text || body?.delta?.text || body?.data?.delta?.text || '').toString();
                sess.transcript = (sess.transcript ? (sess.transcript + ' ') : '') + delta.trim();
                sessions.set(callId, sess);
                (0, ws_1.emit)({ kind: 'transcript', callId, delta, text: sess.transcript, at: Date.now() });
                break;
            }
            case 'call.ended': {
                const sess = sessions.get(callId) || { startedAt: Date.now(), transcript: '', caller: {} };
                const caller = sess.caller || {};
                const phone_or_email = caller.number || caller.email || body.to || body.from || '';
                const lead = {
                    name: '',
                    company: '',
                    role: '',
                    phone_or_email,
                    need: sess.transcript ? sess.transcript.slice(0, 180) : '',
                    objections: '',
                    score: 50,
                    next_step: 'Follow-up via email/SMS'
                };
                let result = null;
                let error = null;
                try {
                    result = await (0, tools_1.log_lead)(lead);
                    (0, ws_1.emit)({ kind: 'tool', name: 'log_lead', callId, at: Date.now(), ...result });
                }
                catch (e) {
                    error = e?.message || String(e);
                    console.error('log_lead failed on call.ended:', error);
                }
                finally {
                    sessions.delete(callId);
                }
                return res.json({ ok: true, logged: Boolean(result), result, error });
            }
            default: {
                // Handle other events but still emit for debugging
                (0, ws_1.emit)({ kind: 'call', event: type || 'unknown', callId, at: Date.now() });
                break;
            }
        }
        return res.json({ ok: true });
    }
    catch (e) {
        console.error('webhook error:', e?.message || e);
        return res.json({ ok: true, error: e?.message || 'webhook error' });
    }
});
exports.default = router;
//# sourceMappingURL=webhooks.js.map