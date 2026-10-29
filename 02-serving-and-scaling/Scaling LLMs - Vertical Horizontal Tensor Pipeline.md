---
tags: [ai-system-design, scaling]
aliases: [Tensor Parallelism, Pipeline Parallelism, Horizontal Scaling, Vertical Scaling]
---

# Scaling LLMs — Vertical, Horizontal, Tensor, Pipeline

> [!success] 🟢 Junior Explanation
> **In plain words:** If traffic grows, run more copies of the model. If the model is too big for one GPU, split the model itself across several GPUs.
>
> **Analogy:** A giant puzzle: split each row between friends (tensor parallelism) or give each friend a section to finish in order (pipeline parallelism). More puzzle tables = horizontal scaling.
>
> **Why interviewers ask:** Big models (e.g. 70B = 140 GB) don't fit one 80 GB GPU, so you must know how to split them.
>
> **Say it in one sentence:** "If the model fits one GPU, add copies behind a load balancer; if it doesn't, split it with tensor or pipeline parallelism."
>
> 🎯 **Junior must know:** vertical vs horizontal scaling; some models don't fit one GPU. · **Middle adds:** tensor vs pipeline parallelism, NVLink, and the model-size × traffic decision table.

AI scaling has more flavors because LLMs are huge — Llama 70B doesn't even fit one GPU `[OS]`.

## 1. Vertical scaling `[OS]`
Bigger GPU: A100 (80 GB) → H100 (80 GB, faster) → H200 (141 GB). Limited ceiling; big models still don't fit.

## 2. Horizontal scaling `[OS]`
More GPU machines + load balancer. E.g. 4 servers, each Llama 8B on one A100. **Most common**; works perfectly when model fits one GPU.

## 3. Tensor parallelism `[OS]`
Split **each layer's weight matrices** across GPUs. Llama 70B @16-bit ≈ 140 GB > 80 GB A100 → split across 2 A100s. GPUs talk **inside every layer** over **NVLink** (direct GPU link, much faster than regular network).

## 4. Pipeline parallelism `[OS]`
Put **different layers** on different GPUs: layers 1–40 on GPU1, 41–80 on GPU2. Token passes through GPU1 then GPU2. Good for very deep models.

```
Tensor (split each layer)        Pipeline (split layers)
 [GPU1 half A | GPU2 half B] L1    GPU1: layers 1..40
 [GPU1  ...   | GPU2  ...  ] L2         |
                                   GPU2: layers 41..80
```
Both can be combined for very large models.

## How to choose `[OS]`
| Model | Traffic | Strategy |
|---|---|---|
| Small | Low | One GPU |
| Small | High | Horizontal + LB |
| Big | Low | Tensor parallelism in one machine |
| Big | High | Tensor parallelism + horizontal scaling |

## Classic data/compute scaling `[SDH]`
- **Data sharding** — partition data so no node is a bottleneck.
- **Distributed training** — data or model parallelism across GPU clusters.
- **Model compression** — e.g. FP16 → INT8 ([[Quantization]]).
- **Caching**, **load balancing** across replicas.
- Agentic systems: **parallelize independent sub-tasks** instead of strictly sequential agent steps → lower wall-clock time.

> [!question] Recall
> 1. Tensor vs pipeline parallelism — where do GPUs communicate in each?
> 2. 70B model, high traffic — what's your scaling plan?

Related: [[Auto Scaling and Warm Pools]] · [[Load Balancing for LLMs]] · [[Back-of-the-Envelope Estimation]]

➡️ **Go deeper:** [[Parallelism for Inference]]
