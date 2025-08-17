import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import dotenv from 'dotenv';
import { attachWSS } from './ws';
import webhooksRouter from './routes/webhooks';
import ingestRouter from './routes/ingest';
import toolsRouter from './routes/tools';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.redirect('/dashboard'));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

app.get('/config.js', (_req, res) => {
  const pub = process.env.VAPI_PUBLIC_KEY || '';
  const asst = process.env.VAPI_ASSISTANT_ID || '';
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`window.VAPI_PUBLIC_KEY=${JSON.stringify(pub)};window.VAPI_ASSISTANT_ID=${JSON.stringify(asst)};`);
});

app.use('/webhooks', webhooksRouter);
app.use('/ingest', ingestRouter);
app.use('/tools', toolsRouter);

const server = http.createServer(app);
attachWSS(server);
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on http://localhost:${process.env.PORT || 3000}`);
});