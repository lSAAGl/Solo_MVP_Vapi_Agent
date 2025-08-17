import { log_lead, type Lead } from '../tools';
import { Router } from 'express';
import { emit } from '../ws';
const router = Router();

// in-memory call sessions
const sessions = new Map<string, { startedAt:number; transcript:string; caller?: { number?: string; email?: string } }>();

/**
 * Enhanced Vapi webhook handler with session tracking and auto-lead logging.
 */
router.post('/vapi', async (req, res) => {
  try {
    const body: any = req.body || {};
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
        emit({ kind: 'call', event: 'started', callId, at: Date.now() });
        break;
      }
      
      case 'transcript.delta': {
        const sess = sessions.get(callId) || { startedAt: Date.now(), transcript: '', caller: {} };
        const delta = (body.text || body?.data?.text || body?.delta?.text || body?.data?.delta?.text || '').toString();
        sess.transcript = (sess.transcript ? (sess.transcript + ' ') : '') + delta.trim();
        sessions.set(callId, sess);
        emit({ kind: 'transcript', callId, delta, text: sess.transcript, at: Date.now() });
        break;
      }
      
      case 'call.ended': {
        const sess = sessions.get(callId) || { startedAt: Date.now(), transcript: '', caller: {} };
        const caller = sess.caller || {};
        const phone_or_email = caller.number || caller.email || body.to || body.from || '';
        
        const lead: Lead = {
          name: '',
          company: '',
          role: '',
          phone_or_email,
          need: sess.transcript ? sess.transcript.slice(0, 180) : '',
          objections: '',
          score: 50,
          next_step: 'Follow-up via email/SMS'
        };
        
        let result: any = null;
        let error: any = null;
        
        try {
          result = await log_lead(lead);
          emit({ kind: 'tool', name: 'log_lead', callId, at: Date.now(), ...result });
        } catch (e: any) {
          error = e?.message || String(e);
          console.error('log_lead failed on call.ended:', error);
        } finally {
          sessions.delete(callId);
        }
        
        return res.json({ ok: true, logged: Boolean(result), result, error });
      }
      
      default: {
        // Handle other events but still emit for debugging
        emit({ kind: 'call', event: type || 'unknown', callId, at: Date.now() });
        break;
      }
    }

    return res.json({ ok: true });
  } catch (e: any) {
    console.error('webhook error:', e?.message || e);
    return res.json({ ok: true, error: e?.message || 'webhook error' });
  }
});

export default router;