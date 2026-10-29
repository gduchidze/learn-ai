---
tags: [ai-system-design, case-study, voice]
aliases: [Voice Agent Design, Design a Real-Time Voice AI Agent]
---

# Case — Real-Time Voice AI Agent `[OS]`

> [!success] 🟢 Junior Explanation
> Idea in one line: **stream speech-to-text → LLM → text-to-speech all at once, so the bot answers in under ~800 ms.** Read [[Voice AI Agents]] first.

One of the most-asked AISD problems: combines streaming, orchestration, tool calling, latency budgets, telephony.

## Architecture
```
User (Phone / App / Browser)
   | audio both ways: SIP/RTP (phone), WebRTC (app/browser)
Media Gateway (edge): call setup, codecs, echo cancellation, jitter buffer
   | clean 20 ms audio chunks
Voice Agent Orchestrator (one session per call):
   VAD · Turn detection · streaming STT -> STT service (GPU)
   LLM + tools (streaming)            -> LLM service (GPU)
   streaming TTS                      -> TTS service (GPU)
   Interruption handling
   |-> Tools/APIs (order DB, booking, CRM)
   |-> Storage (recordings, transcripts, logs, metrics)
```
STT/LLM/TTS services run on GPUs, **shared across calls**.

## Scale estimate
1M calls/day × 5 min avg → **~12 calls/s**; concurrent ≈ 12 × 300 s = **~3,600**; peak 3× ≈ **10,000 concurrent calls**, each needing streaming STT + LLM + TTS sessions → cost is mainly **GPU** → small fast models wherever possible.

## Must-cover talking points
- Latency budget (target **800 ms** p50, < 1.2 s p95) → [[Voice AI Agents]]
- Turn detection / endpointing, barge-in, fillers, speculative generation
- Cascaded vs speech-to-speech choice
- Tool calls hidden with fillers/progress updates
- Redaction at every stage, recordings retention ([[Data Privacy and Compliance]])
- Co-location, warm connections, pre-generated greeting

Related: [[Voice AI Agents]] · [[Streaming Responses]] · [[Back-of-the-Envelope Estimation]]
