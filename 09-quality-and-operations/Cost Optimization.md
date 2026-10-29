---
tags: [ai-system-design, cost]
aliases: [LLM Cost Optimization, Reduce LLM Cost]
---

# Cost Optimization

> [!success] 🟢 Junior Explanation
> **In plain words:** Ways to spend less on AI without hurting quality.
>
> **Analogy:** Cutting household bills: cheaper plan, reuse things, buy in bulk.
>
> **Why interviewers ask:** Cost is a top concern in every AI design.
>
> **Say it in one sentence:** "I cut cost with routing, prompt and semantic caching, shorter outputs, batch APIs, better retrieval, and small self-hosted models."
>
> 🎯 **Junior must know:** routing, caching, short outputs. · **Middle adds:** batch APIs, self-hosting math, the full 7 levers.

AI is expensive; cost optimization is a **daily habit**, not a one-time task `[OS]`.

## Seven levers `[OS]`
| # | Lever | Detail |
|---|---|---|
| 1 | **Cheaper model when possible** | Route easy → Haiku, hard → Opus ([[LLM Routing]]; 50–70% savings) |
| 2 | **Prompt caching** | Long system prompts → up to **90%** input cost cut ([[Prompt Cache]]) |
| 3 | **Semantic cache** | Repeated questions skip LLM ([[Semantic Cache]]) |
| 4 | **Shorter outputs** | "Answer in 2 sentences", `max_tokens`; output **4–5×** pricier than input |
| 5 | **Self-host smaller models** | High-volume, low-difficulty (classification, short summarization); fixed GPU cost < per-token API at scale |
| 6 | **Batch inference** | OpenAI/Anthropic batch APIs ~**50% cheaper** for non-urgent jobs |
| 7 | **Better retrieval** | Fewer, relevant chunks → less to read |

Plus: [[Quantization]], [[Model Distillation]], [[Edge AI and On-Device Inference|on-device]], [[Auto Scaling and Warm Pools|GPU-aware autoscaling]] `[JAM]`, [[Rate Limiting|rate limits / cost caps]], reasoning-token budgets ([[Test-Time Compute]]).

## Trade-offs `[SDH]`
- Accuracy vs latency — large transformers slower, pricier.
- Batch vs real-time — batch cheaper but stale.
- Cost vs redundancy — replicas improve reliability but cost scales linearly.
- Autonomy vs cost — agentic systems burn more tokens.

## FAQ answer `[OS]`
"How reduce cost?" → route easy queries to cheaper models, prompt caching, semantic cache, short outputs, batch APIs, retrieve fewer/better chunks, self-host small models for high-volume simple tasks.

> [!question] Recall
> Recite the 7 levers with one number each where available.

Related: [[Back-of-the-Envelope Estimation]] · [[Latency and Cost Metrics]] · [[Trade-offs Cheat Sheet]]
