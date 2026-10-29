---
tags: [ai-system-design, optimization, attention]
aliases: [FlashAttention, Online Softmax, Tiling]
---

# Flash Attention

> [!success] 🟢 Junior Explanation
> **In plain words:** The same attention math, done in small blocks inside the GPU's fast memory so less data moves around.
>
> **Analogy:** Cooking at your desk with small batches of ingredients instead of walking to the store for each step.
>
> **Why interviewers ask:** Explains how long contexts became affordable.
>
> **Say it in one sentence:** "Flash Attention tiles attention into fast on-chip memory and never stores the full matrix, giving 2–4× speed with identical results."
>
> 🎯 **Junior must know:** what it achieves (faster, same result). · **Middle adds:** tiling and online softmax.

**Same attention, computed smarter on the GPU.** Doesn't change the math or result; changes **how** it's computed `[OS]`.

## GPU memory `[OS]`
- **HBM** — large (tens of GB), slower.
- **SRAM** — on-chip, ~**10–20× faster**, only a few hundred KB.
Analogy: HBM = huge library on another floor; SRAM = small desk in front of you.

## Problem `[OS]`
Standard attention writes the giant **N×N score matrix** to HBM, reads it back, writes, reads again (softmax, then × V). GPU isn't slow at math — it **waits for data**.

## Fix `[OS]`
- **Tiling** — compute attention in small blocks that fit in SRAM; **never write the full matrix** to HBM.
- **Online softmax** — compute softmax block-by-block with a **running max and running sum**; same final result.

Numbers (4,000 tokens): standard ≈ **64M** entries moved HBM↔SRAM vs Flash ≈ **17M** → ~4× less, gap grows with length. Typically **2–4× faster** on long sequences, **no quality loss**. Enables today's long context windows. FlashAttention 2/3 push utilization further on modern hardware.

> [!tip] Same lesson as [[AI Hardware - GPU TPU LPU]]: memory-bound → **move data less**.

## 🌐 Deeper Context `[WEB]`

| Version | Result |
|---|---|
| **FlashAttention-2** on H100 | Only ~**35%** of the GPU's theoretical FLOPs used |
| **FlashAttention-3** (Shah, Dao et al., 2024) — preprint | Up to **740 TFLOPs/s (~75%)** in FP16 on H100 |
| FlashAttention-3 — NeurIPS 2024 version | Up to **840 TFLOPs/s (~85%)** in BF16; FP8 ≈ **1.3 PFLOPs/s** |
| How FA3 gets there | Exploits **asynchrony** on Hopper GPUs (overlap data movement and math, warp specialization) and **low precision** (FP8) |

Takeaway: the same "move data less, keep math units busy" idea keeps paying off on each new GPU generation.

**Sources:** [FlashAttention-3 (Tri Dao blog)](https://tridao.me/blog/2024/flash3/) · [Together AI announcement](https://together.ai/blog/flashattention-3) · [FA3 paper (arXiv 2407.08608)](https://arxiv.org/html/2407.08608v1) · [NeurIPS 2024 version](https://proceedings.neurips.cc/paper_files/paper/2024/file/7ede97c3e082c6df10a8d6103a2eebd2-Paper-Conference.pdf)


> [!question] Recall
> Explain tiling + online softmax; why is the result exact?

Related: [[Attention]] · [[Inference Optimization - Overview]]

➡️ **Go deeper:** [[Kernels, Fusion and CUDA Graphs]]
