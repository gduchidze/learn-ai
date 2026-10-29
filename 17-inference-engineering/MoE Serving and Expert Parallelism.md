---
tags: [ai-system-design, inference-engineering, moe]
aliases: [MoE Inference, Expert Parallelism, All-to-All, Expert Load Balancing, Shared Experts]
---

# MoE Serving and Expert Parallelism

> [!success] 🟢 Junior Explanation
> **In plain words:** An MoE model has many experts but each token uses only a few — so compute per token is small. But **all experts must sit in memory**, and when you serve many tokens at once, they collectively touch **almost every expert**. So MoE's "cheap" advantage shrinks for memory-bound decode at moderate batch sizes.
>
> **Analogy:** A hospital with 64 specialists. One patient sees 2 doctors. But a waiting room of 64 patients keeps nearly all doctors busy — and all must be on staff.
>
> **Say it in one sentence:** "MoE saves FLOPs, not memory or (at moderate batch) bandwidth: plan memory for total params, bandwidth for the experts actually touched, and use expert parallelism with all-to-all plus load balancing for big models."
>
> 🎯 **Junior must know:** total vs active params. · **Middle adds:** touched-experts formula, EP all-to-all, imbalance, shared experts, batching strategy.

## 1. Numbers `[WEB]`
| Model | Total | Active/token | Routing |
|---|---|---|---|
| **Mixtral 8x7B** | 46.7B | 12.9B | top-2 of 8 per layer |
| **DeepSeek-V3** | 671B (+14B MTP module → 685B on HF) | 37B | aux-loss-free load balancing |
Memory ∝ **total** ($46.7\text{B}\times2$ ≈ 93 GB BF16 for Mixtral); FLOPs/token ∝ **active**.

## 2. The batching insight (derive it)
With $E$ experts, top-$k$ routing, $B$ tokens per step, uniform routing, expected distinct experts read per layer:
$$\mathbb{E}[\text{touched}]=E\left[1-\left(1-\tfrac kE\right)^B\right]$$
| Model | B=1 | B=4 | B=8 | B=16 | B=64 |
|---|---|---|---|---|---|
| Mixtral (E=8,k=2) | 2.0 | 5.5 | **7.2** | 7.9 | 8.0 |
| E=256,k=8 (DeepSeek-V3-style, verify config) | 8 | 31 | 58 | 108 | **222** |
⇒ At B=1 you read ~k experts (fast, like the active size). At **B=8 Mixtral reads ~90% of expert weights** → decode bandwidth looks like the **dense 46.7B** model, while compute is only for 8 tokens. So MoE decode speed-up over a same-quality dense model is real mainly at **small batch** (latency) or in the **compute-bound** regime (prefill, very large batch) `[GEN]` → [[Roofline and Performance Modeling]].

## 3. Parallelism for MoE
| Strategy | How | Comms |
|---|---|---|
| **TP only** | Shard each expert's matrices | all-reduce per layer (as dense) — fine for small MoE in a node |
| **Expert parallel (EP)** | Different GPUs own different experts; tokens are sent to the GPU holding their expert | **All-to-all dispatch + combine per MoE layer** |
| **DP attention + EP FFN** `[GEN]` | Attention replicated/sharded per DP rank; MoE layers use EP across all GPUs | Big deployments (DeepSeek-style) to maximize expert batch size |
```mermaid
flowchart LR
    T[Tokens on each GPU] --> R[Router picks top-k experts]
    R --> D[All-to-all dispatch: tokens to expert GPUs]
    D --> E[Experts compute FFN]
    E --> C[All-to-all combine: results back]
    C --> W[Weighted sum + residual]
```
Why EP at scale: spreading experts over many GPUs makes each expert see **more tokens per step** → higher arithmetic intensity (weight reads amortized) → turns memory-bound expert GEMMs toward compute-bound.

## 4. Load imbalance
- Popular experts get more tokens → the slowest GPU gates each layer (stragglers). Training mitigations: auxiliary balancing loss + capacity factor (Switch: overflow tokens dropped, <1% in their runs) `[WEB]`; DeepSeek-V3 uses **auxiliary-loss-free** balancing to avoid quality loss `[WEB]` → [[Mixture of Experts]].
- Serving mitigations `[GEN]`: **expert replication** for hot experts, dynamic placement/rebalancing, **shared experts** (always-active, small) to absorb common knowledge, token-dropping off at inference.
- Monitor per-expert load histograms in production.

## 5. Practical capacity notes
| Concern | Guidance |
|---|---|
| Memory | Total params + KV; MoE often needs multi-GPU just for weights |
| Quantization | FP8/FP4 experts are attractive: weights dominate memory |
| Latency | All-to-all across nodes is costly → keep EP inside NVLink domain when possible; overlap comms with compute |
| Throughput | Needs **large aggregate batch** to amortize expert weight reads |
| Prefill vs decode | Different optimal parallelism → PD disaggregation `[GEN]` |
| Multi-LoRA | Adapters on experts get complex — check engine support |

> [!question] Recall
> 1. Derive expected touched experts and compute it for E=8,k=2,B=8.
> 2. Why does MoE lose its decode advantage at moderate batch?
> 3. What does expert parallelism communicate, and when is it worth it?
> 4. Two ways to handle hot experts at serving time.

**Sources:** [Mixtral of experts](https://mistral.ai/news/mixtral-of-experts/) · [DeepSeek-V3](https://github.com/deepseek-ai/deepseek-v3) · [Switch Transformers](https://arxiv.org/pdf/2101.03961) · [MoE token dropping explainer](https://dev.to/ji_ai/why-your-mixture-of-experts-model-silently-drops-tokens-be0)

Related: [[Mixture of Experts]] · [[Parallelism for Inference]] · [[Low-Precision Inference]]
