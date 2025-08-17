"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.book_meeting = book_meeting;
exports.send_email = send_email;
exports.send_sms = send_sms;
exports.create_payment_link = create_payment_link;
exports.log_lead = log_lead;
exports.lookup_kb = lookup_kb;
const axios_1 = __importDefault(require("axios"));
const sheets_1 = require("./google/sheets");
async function book_meeting(payload) {
    const url = process.env.CAL_PUBLIC_BOOKING_URL;
    if (!url)
        throw new Error('CAL_PUBLIC_BOOKING_URL missing');
    return { url };
}
async function send_email({ to, subject, text, html }) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || 'PitchPilot <onboarding@resend.dev>';
    if (!key)
        throw new Error('RESEND_API_KEY missing');
    try {
        const { data } = await axios_1.default.post('https://api.resend.com/emails', { from, to, subject, html: html ?? `<pre>${text ?? ''}</pre>` }, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
        return { id: data?.id || 'unknown' };
    }
    catch (e) {
        throw new Error(e?.response?.data?.message || e?.message || 'send_email failed');
    }
}
async function send_sms() {
    // TODO: Implement SMS sending functionality
}
async function create_payment_link() {
    // TODO: Implement payment link creation functionality
}
async function log_lead(lead) {
    return await (0, sheets_1.appendLead)(lead);
}
async function lookup_kb({ query }) {
    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
    const path = await Promise.resolve().then(() => __importStar(require('path')));
    if (!query || !query.trim())
        throw new Error('query is required');
    const filePath = path.resolve(process.cwd(), 'knowledge.md');
    if (!fs.existsSync(filePath))
        return { snippets: [] };
    const raw = fs.readFileSync(filePath, 'utf-8');
    const normalized = raw.replace(/\r\n/g, '\n');
    // Split by headings or blank lines into chunks
    const chunks = normalized
        .split(/\n(?=#+\s)|\n{2,}/g)
        .map(c => c.trim())
        .filter(Boolean);
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    function scoreChunk(c) {
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
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    return { snippets: scored };
}
//# sourceMappingURL=tools.js.map