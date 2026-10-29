---
tags: [ai-system-design, estimation, interview]
aliases: [Capacity Estimation, GPU Estimation, Token Estimation]
---

# Back-of-the-Envelope Estimation

> [!success] 🟢 Junior Explanation
> **In plain words:** Quick math to size the system: how many tokens per day, how many GPUs, how much money.
>
> **Analogy:** Planning a party: guests × slices per guest = pizzas to order × price = budget.
>
> **Why interviewers ask:** It shows you can turn requirements into numbers and spot cost problems early.
>
> **Say it in one sentence:** "Users × requests × tokens gives tokens per day; divide by per-GPU throughput for GPU count; multiply by price for cost."
>
> 🎯 **Junior must know:** token and cost math for a request and per day. · **Middle adds:** GPU count, peak factor, and API vs self-hosting comparison.

In AISD interviews estimate **tokens, GPUs, cost** (+ storage for vector DB, embeddings, logs) `[OS]`. Numbers are examples — **the method matters** `[OS]`.

## Worked example: ChatGPT-like product `[OS]`
Assumptions: **10M DAU**, **5 conversations/day**, **2,000 input + 500 output tokens** per conversation.

### Tokens
```
Input  = 10M * 5 * 2000 = 100 B tokens/day
Output = 10M * 5 * 500  =  25 B tokens/day
Total                    = 125 B tokens/day
```
### GPUs
Assume one H100 → **5,000 tokens/s** on a Llama-70B-class model.
```
Per H100/day = 5000 * 86,400 = 432 M tokens/day
Output GPUs  = 25 B / 432 M  ≈ 58 GPUs
```
Input needs fewer GPUs (processed in parallel). → **~60–100 H100s**.

### Cost
```
$3/hr * 60 GPUs * 24 h = $4,320/day  ≈ $130k/month   (inference only)
```
Storage, vector DB, observability add more.

## Template to reuse
1. DAU × sessions × tokens in/out → tokens/day (separate input/output).
2. Peak factor (e.g. 3× average — used in the [[Case - Real-Time Voice AI Agent|voice case]] `[OS]`).
3. Per-GPU token throughput → GPU count.
4. GPU $/hr × count × 24 → daily/monthly.
5. API alternative: tokens × $/M → compare with self-hosting (see [[Cost Optimization]]).
6. Storage: chunks × embedding dims × bytes (+ KV cache memory per user — see [[KV Cache]]).

> [!question] Practice
> 1M DAU, 3 chats/day, 1,500 in / 400 out. H100 = 5,000 tok/s, $3/hr. Compute output GPUs and monthly cost.
> *(Answer: 1.2 B output/day ÷ 432 M ≈ 3 GPUs; with headroom ~5–8 → ~$11–17k/month.)*

Related: [[Latency and Cost Metrics]] · [[Interview Framework - 8 Steps]]

➡️ **Go deeper:** [[Capacity Planning and Cost per Million Tokens]] · [[LLM Math Cheat Sheet]]
