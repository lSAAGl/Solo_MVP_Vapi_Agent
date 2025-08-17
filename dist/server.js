"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = require("./ws");
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const ingest_1 = __importDefault(require("./routes/ingest"));
const tools_1 = __importDefault(require("./routes/tools"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.get('/', (_req, res) => res.redirect('/dashboard'));
app.get('/health', (req, res) => {
    res.json({ ok: true });
});
app.get('/dashboard', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'dashboard', 'index.html'));
});
app.get('/config.js', (_req, res) => {
    const pub = process.env.VAPI_PUBLIC_KEY || '';
    const asst = process.env.VAPI_ASSISTANT_ID || '';
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store');
    res.send(`window.VAPI_PUBLIC_KEY=${JSON.stringify(pub)};window.VAPI_ASSISTANT_ID=${JSON.stringify(asst)};`);
});
app.use('/webhooks', webhooks_1.default);
app.use('/ingest', ingest_1.default);
app.use('/tools', tools_1.default);
const server = http_1.default.createServer(app);
(0, ws_1.attachWSS)(server);
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on http://localhost:${process.env.PORT || 3000}`);
});
//# sourceMappingURL=server.js.map