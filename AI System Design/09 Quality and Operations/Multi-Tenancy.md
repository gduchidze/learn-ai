---
tags: [ai-system-design, multi-tenancy]
aliases: [Multi-tenant AI]
---

# Multi-Tenancy

> [!success] 🟢 Junior Explanation
> **In plain words:** Many customers share the same system, so keep their data, limits and costs separate.
>
> **Analogy:** An apartment building: shared walls and elevator, but each apartment is locked.
>
> **Why interviewers ask:** Data leaks between customers are a serious failure.
>
> **Say it in one sentence:** "Each tenant gets its own limits, quotas, cost tracking and isolated data — especially in caches."
>
> 🎯 **Junior must know:** data isolation. · **Middle adds:** per-tenant limits via the gateway, cache leak risks.

Most AI products serve many customers, each with own data, prompts, budget `[OS]`.

## Requirements `[OS]`
- **Per-tenant rate limits** — A can't eat all tokens.
- **Per-tenant quotas** — A pays for X tokens/month.
- **Per-tenant cost tracking**.
- **Per-tenant data isolation** — A's RAG docs never returned to B.
- **Per-tenant prompt customization**.

> [!danger] Why it's hard `[OS]`
> Everything is shared: GPU, inference server, **caches**. Data can leak across tenants — especially via [[Semantic Cache]] ("What is my account balance?").

The [[API Gateway and AI Gateway|AI Gateway]] makes it a **single configuration** instead of code scattered everywhere `[OS]`. `[JAM]`: rate limiting stops one tenant's heavy-prompt burst from starving others of GPU time.

> [!question] Recall
> 5 per-tenant requirements; where does leakage most likely occur?

Related: [[Rate Limiting]] · [[Data Privacy and Compliance]]
