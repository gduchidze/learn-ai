---
tags: [ai-system-design, junior, interview]
aliases: [Interview Phrases, Interview Templates]
---

# How to Talk in the Interview

Good engineers **think out loud**. Use these phrases. They are built on the [[Interview Framework - 8 Steps]] `[OS]`.

## 0. Opening (first 30 seconds)
> "Before I design anything, I'd like to ask a few questions to understand the requirements. Then I'll estimate the scale, draw a simple version, and improve it step by step."

## 1. Requirements — question template
- "**Who** are the users and **how many**? Daily active users? Peak traffic?"
- "**What** do users ask? Is it Q&A, or should the system also **take actions**?"
- "What **latency** is acceptable? Should the first word appear in under a second?"
- "Do we have **our own data** (docs, past chats)? How often does it change?"
- "What is the **budget** per month?"
- "Any **privacy** rules — personal data, health data, region?"
- "What should happen when the bot **doesn't know**? Escalate to a human?"

## 2. Objective
> "So the goal is: given a user question, return a **grounded** answer from our docs, or escalate. Because the knowledge is private and changes, I'll use **RAG**, not fine-tuning."

## 3. Estimation
> "Let me estimate. 50k chats a day × 5 messages = 250k LLM calls a day, about 3 per second on average, maybe 10 at peak. That's small enough to use a **model API** instead of hosting our own GPUs."

## 4. Simple design first
> "Let me start with the simplest version: client → backend → LLM API. Then I'll add retrieval, caching, and safety."

## 5. Adding a component — always say WHY + COST
> "I'll add a **reranker**. **Why**: the first search is fast but not precise. **Cost**: it adds some latency, but answers get much better."
Pattern: **I'll add X → because Y → the trade-off is Z.**

## 6. Failure talk
> "What can break? If the LLM provider is down, the gateway **falls back** to another model. If the vector DB is slow, a **circuit breaker** opens and we escalate to a human instead of hanging."

## 7. Quality talk
> "LLM output isn't deterministic, so I'd build an **eval set** of ~200 real questions with expected answers, and run it on every prompt or model change. I'd check **faithfulness** — is the answer supported by the retrieved docs?"

## 8. Monitoring talk
> "In production I'd track TTFT, cost per day, thumbs-up rate, escalation rate, and cache hit rate, with alerts if cost or latency jumps."

## 9. Closing
> "To summarize: [3 sentences]. If I had more time, I'd improve [X] and [Y]."

## When you don't know something
> "I'm not 100% sure about the internals of X, but here's how I'd reason about it…" — then reason from basics (cost, latency, what breaks). This is **much** better than silence or guessing.

## When the interviewer pushes back
> "Good point. The trade-off is A vs B. Given our requirement of [low latency / low budget], I'd choose A — but if [condition] changes, B is better."

## Words that sound senior (use correctly!)
TTFT · streaming (SSE) · prompt caching · semantic cache · hybrid search · reranker · faithfulness · guardrails · fallback model · circuit breaker · token-aware rate limiting · canary rollout · eval set · trade-off.
