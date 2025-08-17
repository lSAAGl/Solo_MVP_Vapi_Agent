#!/usr/bin/env bash
set -e

if [ -z "$TUNNEL" ]; then
  echo "Set TUNNEL to your Cloudflare URL (e.g., https://xxx.trycloudflare.com)"; exit 1;
fi

SECRET_HEADER=()
if [ -n "$TOOL_SECRET" ]; then
  SECRET_HEADER=(-H "x-tool-secret: $TOOL_SECRET")
fi

echo "== echo raw =="
curl -s -X POST "$TUNNEL/tools/_debug_echo" -H "Content-Type: application/json" "${SECRET_HEADER[@]}" -d '{"hello":"world","data":{"nested":true}}' | jq

echo "== book_meeting =="
curl -s -X POST "$TUNNEL/tools/book_meeting" -H "Content-Type: application/json" "${SECRET_HEADER[@]}" -d '{"name":"Tester","email":"me@example.com","slotPref":"next Tue AM"}' | jq

echo "== send_email (to delivered@resend.dev) =="
curl -s -X POST "$TUNNEL/tools/send_email" -H "Content-Type: application/json" "${SECRET_HEADER[@]}" -d '{"to":"delivered@resend.dev","subject":"PitchPilot tunnel test","text":"Hi from PitchPilot!"}' | jq