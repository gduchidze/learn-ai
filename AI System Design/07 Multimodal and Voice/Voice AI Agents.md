---
tags: [ai-system-design, voice]
aliases: [Voice AI, Realtime API, Voice-to-Voice Latency, Barge-in, Turn Detection, VAD, Cascaded vs Speech-to-Speech]
---

# Voice AI Agents

> [!success] 🟢 Junior Explanation
> **In plain words:** A voice bot listens (speech-to-text), thinks (LLM), and speaks (text-to-speech) — all streaming at the same time to feel natural.
>
> **Analogy:** A phone call: more than a second of silence feels broken.
>
> **Why interviewers ask:** Voice agent design is one of the most-asked AI system design problems.
>
> **Say it in one sentence:** "I stream STT → LLM → TTS and overlap them to hit under ~800 ms voice-to-voice, with turn detection and barge-in handling."
>
> 🎯 **Junior must know:** the pipeline and the 800 ms target. · **Middle adds:** the latency budget table, barge-in, cascaded vs speech-to-speech.

## Pipeline `[OS]`
**STT** (speech→text) → **LLM** → **TTS** (text→speech). Naive sequential → seconds of silence → feels broken.
Production: **bidirectional streaming** — STT streams partial text, LLM thinks on partial input, TTS streams audio as soon as first words ready.
Transport: **WebRTC** (browser-native real-time), **WebSocket**, **SIP** (phone networks). Plain HTTP can't keep up.
Realtime APIs bundling all three: OpenAI Realtime API, Amazon Polly Bidirectional Streaming, Deepgram Voice Agent, Inworld, Soniox, x.ai Voice.

## Latency targets `[OS]`
End-to-end speech-to-speech **< 800 ms feels conversational; > 1.5 s feels broken.**
**Voice-to-Voice Latency** = user stops speaking → user hears first sound of reply. **Most important metric.**

### Latency budget (target 800 ms, cascaded) `[OS]`
| Stage | Target |
|---|---|
| Network user→server | 30–80 ms |
| Turn detection wait | 150–300 ms |
| STT final transcript | 50–150 ms |
| LLM TTFT | 150–300 ms |
| LLM first sentence complete | 100–200 ms |
| TTS time-to-first-audio-byte | 80–200 ms |
| Network server→user | 30–80 ms |
| **Total** | **600–1,300 ms** (target p50 800 ms, p95 < 1.2 s) |
No single stage can be ignored.

### Rules `[OS]`
- **Stream everything** (never wait for full transcript / reply / audio).
- **Overlap stages** — TTS speaks sentence 1 while LLM writes sentence 2 (**sentence chunking**).
- **Co-locate** orchestrator, STT, LLM, TTS in one DC (each hop +10–50 ms).
- **Warm connections** to STT/TTS before call starts.
- **Pre-generate greeting** audio.
- **Fillers** ("Sure, let me check") hide 2-s tool calls; progress updates during long waits.
- **Speculative LLM generation** — send words to LLM before end-of-turn confirmed; hide reply in buffer; play only if final words match.
- TTS with small lookahead starts speaking before full sentence arrives.
- Measure with a **two-channel recording**; track **p50 & p95**. Users feel only the silence before the first sound (**time-to-first-audio** > total time).

## Voice-specific concerns `[OS]`
- **VAD / turn detection (endpointing)** — silence timer + word-based and voice-based detectors; fixed silence timeout fails; semantic turn detection reads words + voice tone. Backchannels.
- **Barge-in (interruption)** — cancel LLM + TTS streams, tell client to drop buffered unplayed audio, **truncate the agent's last turn in history to words actually heard** (else LLM thinks user heard things they didn't). Echo cancellation; avoid false barge-ins.
- **Diarization** — who said what.
- **Noise & accent robustness** — STT quality drops fast.

## Cascaded vs Speech-to-Speech `[OS]`
| | Cascaded (STT→LLM→TTS) | Speech-to-Speech |
|---|---|---|
| V2V latency | 700 ms–1.2 s (optimized) | 300–600 ms |
| Emotion/tone | Lost in text | Preserved |
| Control of what's said | Full (text checkable) | Limited |
| Guardrails/redaction | Easy | Hard |
| Tool calling | Mature | Less mature |
| Debug/eval | Easy (transcripts) | Hard |
| Cost/min | Lower | Higher |
| Best for | Support, banking, healthcare | Companions, tutors, casual |
Cascaded = default for business (control, compliance, tools, cost). Half-cascade = middle path.

Voice privacy: one call can leak a spoken card number into ~9 systems → redact at **every** stage → [[Data Privacy and Compliance]].

Full design → [[Case - Real-Time Voice AI Agent]].

## 🌐 Deeper Context `[WEB]`

- **Why the latency target is so strict:** Stivers et al. (*PNAS*, 2009) studied conversation in **10 languages** and found all of them **avoid overlapping talk and keep the silence between turns to a minimum**, with only small differences across languages. Humans everywhere expect fast turn-taking — so a voice agent that waits 1.5 s feels broken, while chat users tolerate seconds.
- Design consequence: every millisecond in the `[OS]` latency budget table matters; overlap and stream everything.

**Sources:** [Stivers et al., Universals and cultural variation in turn-taking](https://www.pnas.org/doi/10.1073/pnas.0903616106) · [MPI summary](https://forms.mpi.nl/node/50939) · [Cognition & Culture write-up](https://cognitionandculture.net/blogs/icci-blog/universals-in-turn-taking-in-conversation-pnas-paper/index.html)


> [!question] Recall
> 1. Recite the latency budget table.
> 2. Barge-in: 3 actions on interruption.
> 3. Cascaded vs S2S for a bank's phone line? For an AI companion?

Related: [[Streaming Responses]] · [[Multimodal Systems]]
