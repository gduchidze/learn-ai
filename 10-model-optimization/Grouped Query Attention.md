---
tags: [ai-system-design, optimization, attention]
aliases: [GQA, MQA, Multi-Query Attention, MLA]
---

# Grouped Query Attention (GQA)

> [!success] 🟢 Junior Explanation
> **In plain words:** Groups of attention heads share the same Keys and Values, so the KV cache gets much smaller.
>
> **Analogy:** Students sharing textbooks in groups instead of each buying one.
>
> **Why interviewers ask:** Smaller KV cache = more users per GPU.
>
> **Say it in one sentence:** "GQA shares K and V across head groups to shrink the KV cache with almost no quality loss."
>
> 🎯 **Junior must know:** it reduces memory. · **Middle adds:** MHA vs GQA vs MQA vs MLA; it must be chosen at training time.

## Problem `[OS]`
In **Multi-Head Attention** every head has its own Q, K, V → great quality but **huge KV cache** (64 heads × 100k-token context).

## Solution `[OS]`
Keep all Queries, but **groups of heads share one Key and one Value** → much smaller KV cache, quality very close to MHA.
- **MQA** — all heads share K/V (extreme).
- **MLA** (DeepSeek) — compressed vector per token; 10×+ saving.
GQA/MQA typically **4–8×** KV saving; **require training** with it (choose at model design time) `[OS]`.

**Why it matters in production** `[OS]`: smaller KV cache → same GPU serves **many more concurrent users with long contexts**.

## 🌐 Deeper Context `[WEB]`

- **Paper:** Ainslie et al., "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints" (EMNLP 2023).
- **Uptraining:** convert an existing multi-head checkpoint to MQA/GQA using about **5% of the original pre-training compute** — no need to train from scratch.
- **Result:** uptrained GQA reaches **quality close to multi-head attention** with **speed close to MQA**. MQA alone can **degrade quality**, which is why GQA (a middle ground: more than one, fewer than all K/V heads) became the standard choice.

```
MHA:  Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8      K/V heads: 8   (biggest KV cache)
GQA:  Q1 Q2 | Q3 Q4 | Q5 Q6 | Q7 Q8 K/V heads: 4   (groups share)
MQA:  Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8      K/V heads: 1   (smallest, may lose quality)
```

**Sources:** [GQA (arXiv 2305.13245)](https://arxiv.org/abs/2305.13245v2) · [ACL Anthology](https://aclanthology.org/2023.emnlp-main.298)


> [!question] Recall
> MHA vs GQA vs MQA: what's shared, KV size, can you retrofit it without retraining?

Related: [[KV Cache]] · [[Attention]]
