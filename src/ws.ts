import { WebSocketServer } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer | null = null;

export function attachWSS(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });
}

export function emit(msg: any) {
  if (!wss) return;
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    try { client.send(data); } catch {}
  }
}