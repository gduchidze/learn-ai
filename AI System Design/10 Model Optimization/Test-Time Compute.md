---
tags: [ai-system-design, optimization, reasoning]
aliases: [Inference-Time Scaling, Reasoning Models, LRM, Large Reasoning Models]
---

# Test-Time Compute (Inference-Time Scaling)

> [!success] 🟢 Junior Explanation
> **In plain words:** Reasoning models 'think' longer (many hidden tokens) before answering, which improves hard answers but costs more and is slower.
>
> **Analogy:** Giving a student more time on the hardest exam questions.
>
> **Why interviewers ask:** Reasoning models change cost and capacity planning.
>
> **Say it in one sentence:** "Test-time compute trades more tokens and latency for better answers, so we need token budgets and separate GPU pools."
>
> 🎯 **Junior must know:** reasoning tokens cost money and time. · **Middle adds:** sequential/parallel/hybrid patterns and serving implications.

## Idea `[OS]`
Until 2024 the only lever: bigger model, longer training. Second lever: **spend more compute at inference**. **Large Reasoning Models** (o1, o3, DeepSeek-R1) generate **10–100×** more tokens per query, mostly hidden **thinking tokens** → far better on math, code, science at same size.

## Patterns `[OS]`
| Pattern | How |
|---|---|
| **Sequential** | Think step-by-step longer before answering (reasoning models) |
| **Parallel** | Run many times, pick best / vote — best when answers are **verifiable** (tests, proofs) |
| **Hybrid** | Many long chains → most consistent wins |

## System design implications `[OS]`
- **Inference demand explodes** (vendors quote 100×+ vs training) → plan GPU capacity around inference.
- **Batching harder** — a 50,000-token reasoning request in same batch as 200-token chat kills throughput.
- **Two-tier hardware** — fast pool for chat, separate pool for reasoning.
- **Per-request token budgets** — quality grows with thinking, cost grows linearly → stop at budget.
- **UX** — 30 s to minutes → "Thinking…" spinner, stream visible answer when thinking ends.
- **Billing** — reasoning tokens billed though invisible ([[Latency and Cost Metrics]]).

> [!quote] `[OS]` The 2026 challenge: give each query more thinking time **without burning the monthly budget**.

> [!question] Recall
> Three scaling patterns; five design implications.

Related: [[Continuous Batching]] · [[Cost Optimization]]
