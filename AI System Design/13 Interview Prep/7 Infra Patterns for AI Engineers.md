---
tags: [ai-system-design, interview, infra]
aliases: [7 Patterns, JAM 7 Patterns]
---

# 7 Infra Patterns for AI Engineers `[JAM]`

> [!success] 🟢 Junior Explanation
> Seven classic backend tools every AI answer should mention: **gateway, rate limiting, caching, queues, circuit breakers, load balancing, auto scaling.** New to them? Read [[Prerequisites - System Design Basics]] first.

> The question that separates offers: *"How would you deploy and scale this system in production?"* — not model architecture.

| #   | Pattern              | What                                                             | Why for AI                                                                                            | Interview trigger                                                              | Deep note                                |
| --- | -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| 1   | **API Gateway**      | Single entry: auth, routing, rate limiting, protocol translation | Abstracts embedding/retrieval/inference/post-processing services; enforce policy before any GPU cycle | "Walk me through a request flow" → start at gateway                            | [[API Gateway and AI Gateway]]           |
| 2   | **Rate Limiting**    | Cap requests per client per window                               | First financial defense; protects GPU availability across tenants                                     | "Prevent denial-of-wallet?" → within 30 s; RPM vs TPM                          | [[Rate Limiting]]                        |
| 3   | **Caching**          | Reuse prior computation                                          | Embedding = most cacheable layer; ms→single-digit ms; semantic caching                                | "Embedding API gets repeat queries" → cache + similarity thresholds            | [[Caching in AI - Overview]]             |
| 4   | **Message Queues**   | Async buffer producer↔consumer                                   | Batch summarization/doc processing; absorbs spikes; retry semantics                                   | "50,000 docs" → queue-backed worker pool                                       | [[Async Processing and Message Queues]]  |
| 5   | **Circuit Breakers** | Trip open on failure threshold                                   | Stops cascading failures in embedding→vector store→LLM chains                                         | "Vector DB down mid-query?" → closed/open/half-open + fallback                 | [[Fault Tolerance and Circuit Breakers]] |
| 6   | **Load Balancing**   | Spread across instances                                          | GPU nodes are the bottleneck; variable-cost requests break round-robin                                | "10,000 concurrent requests" → LB + rate limiting + autoscaling; health checks | [[Load Balancing for LLMs]]              |
| 7   | **Auto Scaling**     | Add/remove compute by metrics                                    | GPU nodes expensive; scale on GPU util / queue depth / latency, not CPU                               | "10× at 9am, ~0 at 3am" → GPU-aware + predictive (cold starts)                 | [[Auto Scaling and Warm Pools]]          |

## Whiteboard flow `[JAM]`
Traffic enters via **gateway** (auth, routing, provider failover, token-aware limits) → **rate limiting** (denial-of-wallet, RPM vs TPM) → **caching** in front of expensive ops (embeddings, repeated queries, semantic) → **queues** for heavy async work → **circuit breakers** (3 states + fallback) → **load balancing** across GPU nodes (inference-aware health checks; why round-robin fails) → **auto scaling** (GPU-aware metrics, cold-start latency).
Covers ~**90%** of what AI system design questions probe.

> [!quote] Commenter's note (JAM discussion)
> These are standard cloud/enterprise patterns — the skill is describing them **in the vernacular of AI** (tokens, GPUs, variable-cost requests).

Further reading `[JAM]`: Alex Xu *System Design Interview* Vol 1&2; Kleppmann *Designing Data-Intensive Applications*; Parandeh *Building Generative AI Services with FastAPI* (O'Reilly 2025).

Related: [[Interview Framework - 8 Steps]]
