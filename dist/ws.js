"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachWSS = attachWSS;
exports.emit = emit;
const ws_1 = require("ws");
let wss = null;
function attachWSS(server) {
    wss = new ws_1.WebSocketServer({ server, path: '/ws' });
}
function emit(msg) {
    if (!wss)
        return;
    const data = JSON.stringify(msg);
    for (const client of wss.clients) {
        try {
            client.send(data);
        }
        catch { }
    }
}
//# sourceMappingURL=ws.js.map