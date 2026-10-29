---
tags: [ai-system-design, optimization]
aliases: [Inference Optimization, LLM Inference Optimization]
---

# Inference Optimization — Overview

> [!success] 🟢 Junior Explanation
> **In plain words:** A list of tricks that make models faster and cheaper, and which phase each one helps.
>
> **Analogy:** Tuning a car: some upgrades help acceleration (first word), others top speed (streaming).
>
> **Why interviewers ask:** Middle-level interviews ask 'how would you make inference faster?'.
>
> **Say it in one sentence:** "For faster first token, optimize prefill (prompt cache, chunked prefill); for faster streaming and more users, optimize decode (batching, speculative decoding, quantization)."
>
> 🎯 **Junior must know:** the names of the main techniques. · **Middle adds:** the technique → phase table.

## Which technique helps which phase `[OS]`
| Technique | Main target | Improves |
|---|---|---|
| [[KV Cache]] | Decode | Fast decode, no recompute |
| [[Continuous Batching]] | Both | Throughput |
| Chunked prefill ([[Prefill vs Decode]]) | Other users' smoothness | Long prefills don't stall streams |
| Prefix caching ([[Prompt Cache]]) | Prefill | TTFT |
| Disaggregated serving ([[Prefill vs Decode]]) | Both | TTFT & TPOT independently at scale |
| [[Speculative Decoding]] | Decode | TPOT |
| PagedAttention ([[KV Cache]]) | KV memory | Throughput (bigger batches) |

> [!tip] `[OS]` Want a **faster first word** → look at prefill side. Want **faster streaming / more users** → decode side.

## Model-level techniques `[OS]`
[[Quantization]] · [[Continuous Batching]] · [[Speculative Decoding]] · [[Test-Time Compute]] · [[Flash Attention]] · [[Mixture of Experts]] · [[Model Distillation]] · [[Grouped Query Attention]]
Together → modern servers can serve **1M-token contexts** at reasonable cost/latency `[OS]`.

## FAQ: reduce latency `[OS]`
Stream · prompt caching (TTFT) · smaller/faster model · short prompt · speculative decoding + quantization (self-hosted) · deploy close to users · voice: stream & overlap every stage.

> [!question] Recall
> Fill the technique → phase table from memory.

Related: [[Prefill vs Decode]] · [[AI Hardware - GPU TPU LPU]]
