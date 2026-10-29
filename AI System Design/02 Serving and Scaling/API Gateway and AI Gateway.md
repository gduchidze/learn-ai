---
tags: [ai-system-design, serving]
aliases: [AI Gateway, LLM Gateway, API Gateway]
---

# API Gateway and AI Gateway

> [!success] 🟢 Junior Explanation
> **In plain words:** One front door that every LLM call passes through: checks identity, applies limits, picks the model/provider, logs cost.
>
> **Analogy:** Hotel reception: checks your ID, tells you which room, and keeps your bill.
>
> **Why interviewers ask:** 'Walk me through a request' should start here, not at the model.
>
> **Say it in one sentence:** "An AI gateway centralizes routing, provider failover, rate limits, caching, guardrails, cost tracking and logs for all LLM calls."
>
> 🎯 **Junior must know:** auth, routing, rate limiting at the gateway. · **Middle adds:** provider failover, streaming pass-through, <10 ms overhead, multi-region.

## API Gateway `[JAM]`
Single entry point: **authentication, routing, rate limiting, protocol translation**, request validation — before a single GPU cycle is spent. In an LLM app with separate embedding / retrieval / inference / post-processing services, clients don't need to know every service address.
> [!example] Interview signal `[JAM]`
> *"Walk me through how a request flows through your system."* → **start with the gateway**, don't jump straight to the model.

## AI Gateway (LLM Gateway) `[OS]`
A **reverse proxy specialized for LLM traffic** — understands tokens, prompts, streaming, cost. Single point every LLM call in the company flows through. `[OS]` recommends it as **one of the first pieces of infra to build**.

```
App -> AI Gateway -> OpenAI / Claude / Gemini / Llama / self-hosted vLLM
```

### What it gives `[OS]`
- **Single endpoint, many models** — model switch = config change, not code change.
- **Multi-provider failover** — OpenAI down → Anthropic, app unaware.
- **Centralized cost tracking** — tag by user, team, feature, request ID.
- **Centralized rate limits & quotas** (TPM, RPM, concurrency, cost).
- **Centralized caching** ([[Prompt Cache]], [[Semantic Cache]]).
- **Centralized guardrails** as policies.
- **Audit logs** for debugging + compliance.
- **Observability** — latency, tokens, errors, cache hit rate.

Tools: Portkey, LiteLLM, Kong AI Gateway, Envoy AI Gateway, TrueFoundry, AWS Bedrock `[OS]`.

### Design gotchas `[OS]`
- **Pass-through streaming** — never buffer full response (kills SSE).
- **Low overhead** — target **< 10 ms** added latency.
- **Circuit breakers** — if gateway unhealthy, app falls back to direct provider call.
- **Multi-region** deployment; route users to nearest.

`[JAM]` "How to use in interview": mention auth, routing, **provider failover**, and **token-aware rate limiting** at the gateway.

> [!question] Recall
> 1. List 6 things an AI Gateway centralizes.
> 2. What breaks if the gateway buffers responses?

Related: [[Rate Limiting]] · [[Multi-Tenancy]] · [[Guardrails]] · [[Fault Tolerance and Circuit Breakers]]
