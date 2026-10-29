---
tags: [ai-system-design, junior, interview]
aliases: [Junior Mistakes]
---

# Common Junior Mistakes (and what to say instead)

| ❌ Mistake | Why it hurts | ✅ Do this instead |
|---|---|---|
| Start drawing immediately | You may design the wrong thing | Ask 5–7 requirement questions first `[OS]` |
| "I'll fine-tune a model" for company docs | Knowledge problem, not behavior; expensive, slow to update | Use RAG; fine-tune only for behavior/format `[OS]` |
| Multi-agent system for a FAQ bot | Over-engineering: cost, latency, debugging | Single LLM call + RAG; add agents only when needed `[OS]` |
| Dump all documents / 50 chunks into the prompt | Lost in the middle, high cost, slow TTFT | Retrieve → rerank → top 5 `[OS]` |
| For-loop calling the LLM 50,000 times synchronously | Timeouts, no retries, overload | Queue + worker pool `[JAM]` |
| No rate limiting | One user can burn thousands of dollars | Token + request + cost limits `[JAM]` |
| Round-robin load balancing for LLMs | Long requests pile up | Least outstanding tokens / prefix-aware `[OS]` |
| Autoscale on CPU | GPU node can be 10% CPU, 95% GPU | Scale on GPU util, queue depth, latency `[JAM]` |
| "We'll unit test the output" | Output is non-deterministic | Eval set + LLM judge + human review `[OS]` |
| Never mention cost | Every request costs money | Estimate tokens → $/month `[OS]` |
| Trust the model to follow "don't do X" | Prompt injection bypasses it | Hard rules in code, least privilege `[OS]` |
| Ignore failures | Real systems break | Timeouts, retries, fallback model, circuit breaker `[OS]` `[JAM]` |
| No streaming in a chat app | Blank screen for 10 s | SSE streaming `[OS]` |
| Changing text at the start of the prompt | Breaks prompt caching | Fixed parts first, user message last `[OS]` |
| Shared semantic cache for personal questions | Leaks other users' data | Per-user/tenant isolation `[OS]` |
| Log raw prompts with personal data | Privacy/compliance violation | Redact PII before logging `[OS]` |
| Switch embedding model casually | All vectors must be recomputed | Choose carefully; plan re-embedding `[OS]` |
| Agent with no step limit | Infinite loop, runaway cost | Max steps + budget `[OS]` |
| Silence when unsure | Interviewer can't see your thinking | Reason out loud from cost/latency/failure |
