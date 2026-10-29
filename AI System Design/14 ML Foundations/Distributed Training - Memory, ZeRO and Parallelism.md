---
tags: [ai-system-design, ml-foundations, training]
aliases: [ZeRO, FSDP, Data Parallel, DDP, Training Memory, 16 bytes per parameter, Gradient Checkpointing, 3D Parallelism]
---

# Distributed Training — Memory, ZeRO and Parallelism

> [!success] 🟢 Junior Explanation
> **In plain words:** Training a model needs **~16 bytes per parameter** (weights + gradients + optimizer memory) — far more than inference (2 bytes). A 7B model needs ~112 GB just for these → doesn't fit one GPU. We split the work/memory across GPUs: **data parallel** (copies), **ZeRO/FSDP** (shard the state), **tensor/pipeline parallel** (split the model).
>
> **Analogy:** Moving a huge library: either every mover carries a full copy of the index (DDP), or each mover holds only a section and borrows pages when needed (ZeRO-3).
>
> **Say it in one sentence:** "Mixed-precision Adam costs ~16 bytes/param; ZeRO-1/2/3 shard optimizer states/gradients/parameters across data-parallel ranks; TP/PP split the model itself, combined as 3D parallelism."
>
> 🎯 **Junior must know:** training memory ≫ inference memory. · **Middle adds:** exact byte accounting, ZeRO stage formulas, TP/PP/DP trade-offs, checkpointing.

## 1. The 16-bytes-per-parameter rule `[WEB]`
Mixed-precision training with Adam, per parameter Ψ:
| Item | Bytes |
|---|---|
| BF16/FP16 weights | 2 |
| BF16/FP16 gradients | 2 |
| FP32 master weights | 4 |
| Adam momentum $m$ (FP32) | 4 |
| Adam variance $v$ (FP32) | 4 |
| **Model states total** | **16** (optimizer share K=12) |
Plus **activations** (depends on batch, sequence, layers) and buffers.
> 7B model → 7e9 × 16 = **112 GB** before activations. 70B → **1.12 TB**.

## 2. ZeRO stages (shard across $N_d$ data-parallel GPUs) `[WEB]`
| Stage | Shards | Per-GPU memory (model states) | Extra comm |
|---|---|---|---|
| DDP (baseline) | nothing | $16\Psi$ | all-reduce grads |
| **ZeRO-1** | optimizer states | $4\Psi+12\Psi/N_d$ | same as DDP |
| **ZeRO-2** | + gradients | $2\Psi+14\Psi/N_d$ | same as DDP |
| **ZeRO-3** | + parameters | $16\Psi/N_d$ | ~1.5× (gather params fwd/bwd) |
**FSDP** (PyTorch) full-shard ≈ ZeRO-3.

> [!example] 7B model, $N_d=8$
> Baseline 112 GB · ZeRO-1: 28 + 10.5 = **38.5 GB** · ZeRO-2: 14 + 12.25 = **26.25 GB** · ZeRO-3: **14 GB** (+ activations).
> (Paper's 7.5B / 64-GPU figures: 120 GB → 31.4 → 16.6 → 1.9 GB per GPU `[WEB]`, secondary reproduction.)

## 3. Parallelism menu
| Type | Splits | Comm | Typical use |
|---|---|---|---|
| **Data parallel (DP/DDP)** | batch | all-reduce gradients | Always (scale throughput) |
| **ZeRO / FSDP** | states across DP ranks | all-gather/reduce-scatter | Fit big models without model-code changes |
| **Tensor parallel (TP)** | weight matrices (Megatron: column-parallel then row-parallel) | all-reduce **per layer** (~2/layer) | Within a node (NVLink) |
| **Pipeline parallel (PP)** | layers into stages | point-to-point activations; pipeline **bubbles** | Across nodes |
| **Sequence/context parallel** | sequence dimension | all-gather/ring | Very long context |
| **Expert parallel (EP)** | MoE experts | **all-to-all** | MoE models |
**3D parallelism** = DP × TP × PP (+ EP/CP). Rule: **TP inside a node (fast NVLink), PP/DP across nodes** `[GEN]`.

### Megatron tensor parallelism (why 2 all-reduces/layer)
MLP: first matrix **column-parallel** (each GPU computes a slice of the wide hidden — no comm), second **row-parallel** (partial outputs) → **one all-reduce** to sum. Attention: Q/K/V column-parallel (each GPU owns some heads), output projection row-parallel → **one all-reduce**. Hence ≈ **2 forward all-reduces per layer** (attention + MLP); backward adds matching ones `[WEB]` (count is a synthesis — verify in Megatron source).

## 4. Pipeline bubbles
With $p$ stages and $m$ micro-batches, idle fraction ≈ $(p-1)/(m+p-1)$ `[GEN]` → use many micro-batches / interleaved schedules.

## 5. Activation memory tricks
- **Gradient (activation) checkpointing:** don't store all activations; recompute them in backward → ~+33% compute (one extra forward) for big memory savings `[GEN]`.
- **Mixed precision**, **FlashAttention** (no n² buffer), **offload** optimizer states to CPU/NVMe (ZeRO-Offload), smaller micro-batch + gradient accumulation.

## 6. Failure realities at scale `[GEN]`
Hardware failures are routine on thousands of GPUs → frequent **checkpointing**, elastic restart, straggler detection, loss-spike handling (skip batches, restart from earlier checkpoint).

> [!question] Recall
> 1. Break down 16 bytes/param.
> 2. Per-GPU memory of a 13B model with ZeRO-3 on 16 GPUs? (16·13/16 = 13 GB + activations)
> 3. Why is TP kept within a node?
> 4. What does gradient checkpointing trade?

**Sources:** [ZeRO paper (arXiv 1910.02054)](https://arxiv.org/pdf/1910.02054) · [ZeRO state sharding (APXML)](https://apxml.com/courses/designing-and-sizing-production-llm-infrastructure/chapter-5-fine-tuning-memory-mechanics/zero-state-sharding-principles) · [Tensor parallelism overview](https://www.zeroentropy.dev/concepts/tensor-parallelism/) · [AWS Neuron TP guide](https://awsdocs-neuron.readthedocs-hosted.com/en/latest/archive/nxd-training/nxd-training-tp-appnote.html) · [Dive into big model training](https://arxiv.org/pdf/2207.11912)

Related: [[Pretraining - Scaling Laws and Compute Math]] · [[Parallelism for Inference]] · [[Scaling LLMs - Vertical Horizontal Tensor Pipeline]]
