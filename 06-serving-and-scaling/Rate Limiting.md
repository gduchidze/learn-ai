---
tags: [ai-system-design, serving, security]
aliases: [TPM, RPM, Denial of Wallet, Token Rate Limiting]
---

# Rate Limiting in AI

> [!success] 🟢 Junior Explanation
> **In plain words:** Limit how much each user can use: requests, tokens, parallel requests, and money.
>
> **Analogy:** An all-you-can-eat buffet that counts both how many plates you take and how full each plate is.
>
> **Why interviewers ask:** One misbehaving client can burn thousands of dollars in minutes (denial-of-wallet).
>
> **Say it in one sentence:** "I rate-limit on requests, tokens per minute, concurrency, and cost, usually at the gateway."
>
> 🎯 **Junior must know:** RPM vs TPM and denial-of-wallet. · **Middle adds:** concurrency and cost caps, per-tenant limits.

## Why requests/sec isn't enough `[OS]`
One request can be 100 tokens, another 100,000. Rate-limit on **multiple dimensions**:

| Dimension | What |
|---|---|
| **TPM** (Tokens Per Minute) | Tokens a user consumed last minute |
| **RPM** (Requests Per Minute) | Classic, in addition to TPM |
| **Concurrent requests** | Matters because LLM requests are long-running |
| **Cost-based** | Track $ per user; apply cost cap |

Tools: **Kong, Tyk, Portkey** `[OS]`.

## Why it matters `[JAM]`
- **First financial defense.** A single completion can cost cents; a bad actor or misconfigured client can rack up **thousands of dollars in minutes**.
- **Protects availability**: one tenant's burst of heavy prompts can't starve others of GPU time.

> [!example] Interview signal `[JAM]`
> *"How would you prevent a **denial-of-wallet** attack on your inference API?"* — if rate limiting isn't mentioned in the first 30 s, you've lost points. Distinguish **RPM vs TPM** limits.

Example config from case study `[OS]`: 50 messages/day per user, 10,000 tokens/min.

Lives centrally in the [[API Gateway and AI Gateway|AI Gateway]]; per-tenant limits → [[Multi-Tenancy]].

## 🌐 Deeper Context `[WEB]`

- OWASP's 2025 list names this risk **LLM10: Unbounded Consumption** — uncontrolled inference leading to denial of service, runaway cost ("denial of wallet"), or model extraction. Citing it makes your rate-limiting answer sound grounded.
- Practical stack: per-user **RPM + TPM** at the gateway, **max_tokens** caps per request, **step/token budgets** for agents, **monthly cost caps** per tenant, and alerts on spend spikes.

**Sources:** [OWASP 2025 list (AppScan)](https://help.hcl-software.com/appscan/Enterprise/10.10.0/topics/r_owasp_top_10_for_llm.html) · [Invicti: OWASP LLM 2025](https://www.invicti.com/blog/web-security/owasp-top-10-risks-llm-security-2025)


> [!question] Recall
> 1. Name the 4 rate-limit dimensions for LLMs.
> 2. What is denial-of-wallet?

Related: [[7 Infra Patterns for AI Engineers]] · [[Cost Optimization]]
