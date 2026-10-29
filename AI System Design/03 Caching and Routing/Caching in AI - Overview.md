---
tags: [ai-system-design, caching]
aliases: [Caching in AI, AI Caching]
---

# Caching in AI — Overview

> [!success] 🟢 Junior Explanation
> **In plain words:** Don't redo expensive work. AI has four caches: KV cache, prompt cache, semantic cache, embedding cache.
>
> **Analogy:** Keeping a sheet of answers you already worked out, so you don't redo the homework.
>
> **Why interviewers ask:** A cache miss in AI costs seconds and real money, so caching is a top lever.
>
> **Say it in one sentence:** "KV cache speeds up one request, prompt cache reuses a shared prefix, semantic cache skips the LLM for same-meaning questions, embedding cache skips re-embedding."
>
> 🎯 **Junior must know:** the 4 cache names and what each skips. · **Middle adds:** freshness/invalidation and tenant isolation.

## Basic shape `[OS]`
Check cache first → **hit**: return without LLM; **miss**: call LLM, store, return.
The win = gap between hit and miss. In AI that gap is **huge**: hit = few ms in Redis; miss = full LLM call (seconds + tokens).

## Four AI caches `[OS]`
| Cache | Scope | Saves |
|---|---|---|
| [[KV Cache]] | Inside one request | Next-token generation (no recompute of past K/V) |
| [[Prompt Cache]] | Across requests sharing exact prefix | Prefill work, TTFT, input cost (up to 90%) |
| [[Semantic Cache]] | Across similar questions | Entire LLM call |
| [[Embedding Cache]] | Across repeated texts | Embedding model call |

## Classic ML caches `[SDH]`
- **Feature cache** — computed features reused across sessions.
- **Model cache** — weights resident in GPU memory → avoid cold starts.
- **Prediction cache** — outputs for frequent queries.

## Trade-off `[SDH]`
Speed vs **freshness**. Serving fast risks outdated predictions → need proper **invalidation**.

## Interview signal `[JAM]`
*"Your embedding API gets the same queries repeatedly — optimize it."* → caching (Redis/Memcached in front of embedding service: hundreds of ms → single-digit ms), bonus: **semantic similarity thresholds** for near-duplicates. Embedding generation = **most cacheable layer** in any RAG pipeline (200 users searching "how to reset my password" → compute once).

> [!warning] Multi-tenant leak risk `[OS]`
> Caches are shared → one customer's data can leak into another's response. Isolate per tenant. See [[Multi-Tenancy]].

> [!question] Recall
> Name the 4 AI caches, what each skips, and which operates *within* vs *across* requests.

Related: [[Cost Optimization]] · [[API Gateway and AI Gateway]]
