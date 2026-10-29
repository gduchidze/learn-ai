---
tags: [ai-system-design, interview]
aliases: [8-Step Framework, How to Solve Any AI System Design Problem]
---

# Interview Framework — 8 Steps `[OS]`

> [!success] 🟢 Junior Explanation
> Memorize the 8 steps like a checklist: **Requirements → Objective → Data → Architecture → Model & Prompt → Evaluation → Deployment → Monitoring.** See it in action in [[Mock Interview 1 - Support Chatbot]] and use phrases from [[How to Talk in the Interview]].

| # | Step | What to produce |
|---|---|---|
| 1 | **Requirements** | Clarifying questions → functional + non-functional reqs |
| 2 | **AI Objective** | Input → output; pick the pattern (RAG? agent? classifier?) |
| 3 | **Data Preparation** | Sources, cleaning, PII removal, **eval set** |
| 4 | **Architecture Design** | The heart: diagram + components |
| 5 | **Model Selection & Prompting** | LLM(s), embedding, reranker, routing, system prompt |
| 6 | **Evaluation** | Offline evals, judge, faithfulness, human review |
| 7 | **Deployment & Serving** | API vs self-host, gateway, rate limits, streaming, fallback, guardrails, canary |
| 8 | **Monitoring** | Latency, cost, quality, errors, cache, drift; alerts |

Worked example → [[Case - Customer Support Chatbot]].

## Step 1 question checklist (from all sources)
- Users/scale: DAU, requests/day, messages per session, peak factor `[OS]`
- Latency: TTFT target? p99? streaming? `[OS]` `[SDH]`
- Budget per month `[OS]`
- Data: types (text, images, transactions), volume, where it lives, freshness `[SDH]` `[OS]`
- Languages / modalities (voice?) `[OS]`
- Answer only vs take **actions** (agents, tool permissions) `[OS]`
- Failure behavior: escalate to human? `[OS]`
- Retraining frequency, feedback incorporation `[SDH]`
- Context window limits, **long-term memory** across sessions `[SDH]`
- Privacy/compliance: PII, region, HIPAA `[OS]`
- Multi-tenant? `[OS]`

## Alternate 6-step structure `[SDH]`
1. Clarify (data types, latency, scale) → 2. **Estimate scale** (users, requests, storage) → 3. High-level architecture (data, model, serving layers) → 4. Deep dive (caching, indexing, fault tolerance) → 5. **Trade-offs** → 6. Evolution (agentic capabilities, better MLOps).

## Infra walk-through order `[JAM]`
Outside → in: **Gateway → Rate limiting → Caching → Queues → Circuit breakers → Load balancing → Auto scaling.** See [[7 Infra Patterns for AI Engineers]].

## Golden rules
> [!tip]
> - Start with the **simplest design that works** (single LLM call); add complexity only when needed `[OS]`.
> - Watch **cost like latency**; put $ in every estimate `[OS]`.
> - Explicitly state **trade-offs** — signals seniority `[SDH]` → [[Trade-offs Cheat Sheet]].
> - Talk about failure modes, not just the happy path `[JAM]`.
> - Interviewers check that you **think beyond the model** `[JAM]`.

Related: [[Interview Question Bank]] · [[Back-of-the-Envelope Estimation]]
