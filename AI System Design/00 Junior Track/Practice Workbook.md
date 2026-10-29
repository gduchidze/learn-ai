---
tags: [ai-system-design, junior, practice]
aliases: [Workbook, Exercises]
---

# Practice Workbook

Answers are hidden — click the folded box to open. Try first!

## Part 1 — Math warm-ups

**1.1** How many tokens is a 2,000-character English text?
> [!example]- Answer
> ~2,000 / 4 = **~500 tokens** (1 token ≈ 4 chars) `[OS]`.

**1.2** Cost of one request: 2,000 input tokens, 800 output tokens, at $3 / $15 per million.
> [!example]- Answer
> 2,000/1M × 3 = $0.006; 800/1M × 15 = $0.012 → **$0.018** `[OS]`.

**1.3** Does a 13B-parameter model fit on one 24 GB GPU at 16-bit? At 4-bit?
> [!example]- Answer
> 16-bit = 2 bytes → 26 GB → **no**. 4-bit = 0.5 bytes → 6.5 GB → **yes** (plus room for KV cache). Formula: params × bytes per param.

**1.4** KV cache for one user with a 6,000-token chat on a Llama-2-like model (0.5 MB/token)?
> [!example]- Answer
> 6,000 × 0.5 MB = **3 GB** for one user `[OS]`. 10 such users = 30 GB → this is why long chats limit concurrency.

**1.5** 2M daily users × 4 chats × 500 output tokens. One H100 makes 432M tokens/day. How many GPUs for output?
> [!example]- Answer
> 2M × 4 × 500 = 4B tokens/day; 4B / 432M ≈ **9.3 → ~10 GPUs** (+ headroom for peaks → ~15–20) `[OS]` method.

**1.6** A model streams at 40 tokens/second. TPOT? Time for a 600-token answer?
> [!example]- Answer
> TPOT = 1/40 s = **25 ms**; 600 / 40 = **15 s** after the first token → you must stream `[OS]`.

## Part 2 — Pick the right tool

**2.1** Users search "Order 88123" and the RAG bot returns unrelated chunks.
> [!example]- Answer
> Vector search is weak on exact IDs → add **BM25 keyword search** = hybrid search `[OS]`.

**2.2** Every request includes the same 4,000-token system prompt. Input cost is high and TTFT slow.
> [!example]- Answer
> **Prompt caching** (keep the fixed prompt first) — up to 90% cheaper input, faster TTFT `[OS]`.

**2.3** 70% of questions are "hi", "thanks", "what are your hours?" but go to the biggest model.
> [!example]- Answer
> **LLM routing / cascade**: cheap model first; also a **semantic cache** for repeated FAQs `[OS]`.

**2.4** A user's long paste makes everyone else's streaming freeze for a second.
> [!example]- Answer
> **Chunked prefill** (or prefill-decode disaggregation at large scale) `[OS]`.

**2.5** Question: "What was the Q4 revenue of the company that acquired Acme?" RAG fails.
> [!example]- Answer
> Multi-hop → **Agentic RAG** (search, then search again) or **GraphRAG** (follow relationships) `[OS]`.

**2.6** 100,000 product reviews must be classified by tomorrow morning.
> [!example]- Answer
> **Queue + workers** and a **batch API** (~50% cheaper); small/cheap model since the task is simple `[OS]` `[JAM]`.

**2.7** The agent sometimes loops forever calling search.
> [!example]- Answer
> **Step limit**, trim observations, clearer goal / "done" condition, better tool descriptions `[OS]`.

**2.8** The bot must respect "insurance clause 14.2.b does NOT cover dental".
> [!example]- Answer
> Vector similarity is weak on codes and negation → **Vectorless RAG** (navigate the document structure) or at least hybrid search + reranker `[OS]`.

**2.9** Your GPU nodes show 15% CPU but users wait a long time.
> [!example]- Answer
> Autoscale on **GPU utilization / queue depth / latency**, not CPU `[JAM]`.

**2.10** Two-person team, simple FAQ bot. Teammate proposes 4 agents (researcher, writer, critic, orchestrator).
> [!example]- Answer
> Over-engineering. **Single LLM call + RAG**. Start simple; add agents only when needed `[OS]`.

## Part 3 — Spot the bug in the design

**3.1** "We cache all answers in one global semantic cache to save money, including 'what's my balance?'."
> [!example]- Answer
> **Data leak** across users. Personal questions must bypass or be isolated per user/tenant `[OS]`.

**3.2** "The system prompt starts with today's date and the user's name, then the rules."
> [!example]- Answer
> Changing text at the **start** breaks prompt caching. Put fixed rules first, variable parts last `[OS]`.

**3.3** "Our agent can delete files. We told it in the prompt to never delete important files."
> [!example]- Answer
> Prompt rules can be bypassed (prompt injection). Use **least privilege**, code-level checks, sandboxing, and **human approval** for destructive actions `[OS]`.

**3.4** "We switched embedding models last week but only new documents use the new model."
> [!example]- Answer
> Old and new vectors aren't comparable → search silently breaks. **Re-embed everything** `[OS]`.

**3.5** "Our load balancer has a 30-second timeout and we stream answers."
> [!example]- Answer
> Long answers get cut. Increase timeout (e.g. 5 min) and handle disconnects `[OS]`.

**3.6** "We log every prompt and answer in plain text for debugging."
> [!example]- Answer
> Privacy/compliance risk — **redact PII** before logging; keep audit logs per regulation `[OS]`.

## Part 4 — Explain to a 10-year-old (one sentence each)
Try: token · embedding · RAG · KV cache · semantic cache · agent · prompt injection · guardrail · eval · streaming.
> [!example]- Sample answers
> - **Token**: a small piece of a word that the AI reads and writes.
> - **Embedding**: a secret address on a "meaning map" where similar words live close together.
> - **RAG**: letting the AI look in the book before answering, like an open-book test.
> - **KV cache**: notes the AI keeps so it doesn't reread the whole conversation for every new word.
> - **Semantic cache**: remembering answers to questions that *mean* the same thing.
> - **Agent**: an AI that can use tools, check results, and keep going until the job is done.
> - **Prompt injection**: hiding a sneaky instruction in a message so the AI obeys the wrong person.
> - **Guardrail**: a safety fence that checks what goes into and comes out of the AI.
> - **Eval**: a test exam for the AI, checked many times because its answers can change.
> - **Streaming**: showing the answer word by word as it is written.

## Part 5 — Full design drills (use [[Interview Framework - 8 Steps]])
1. Perplexity-like AI search engine
2. AI coding assistant
3. Voice bot for restaurant reservations
4. Semantic cache service for a company
5. On-device note-summarizer app
Check yourself with [[Interview Question Bank]] hints.
