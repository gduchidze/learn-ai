---
tags: [ai-system-design, ml-foundations, training]
aliases: [Scaling Laws, Chinchilla, 6ND, MFU, Compute Optimal, Over-training]
---

# Pretraining — Scaling Laws and Compute Math

> [!success] 🟢 Junior Explanation
> **In plain words:** Bigger models trained on more data get predictably better. Two simple rules let you estimate cost: **training FLOPs ≈ 6 × parameters × tokens**, and the compute-optimal ratio is **≈ 20 tokens per parameter** (Chinchilla). Labs often train **far beyond** that because a smaller, longer-trained model is cheaper to *serve*.
>
> **Analogy:** Studying: more pages read (data) and a bigger brain (params) both help — but there's a best balance for a fixed study time.
>
> **Say it in one sentence:** "Training cost ≈ 6ND FLOPs; Chinchilla says scale N and D together (~20 tokens/param), but when inference dominates cost you over-train smaller models."
>
> 🎯 **Junior must know:** more data + params = better; training is expensive. · **Middle adds:** 6ND derivation, Chinchilla vs Kaplan, MFU, over-training rationale.

## 1. The 6ND rule `[WEB]`
- Forward ≈ $2N$ FLOPs/token; backward ≈ $4N$ (≈ 2× forward) → **≈ $6N$ per token** → total **$C\approx 6ND$**.
- Caveats: ignores attention-score FLOPs (accurate to ~2×), activation recomputation, optimizer overhead; Kaplan counts **non-embedding** params, Chinchilla counts **total** `[WEB]`.

## 2. Scaling laws
| Paper | Finding |
|---|---|
| Kaplan et al. (2020) | Loss falls as a power law in N, D, C; suggested spending extra compute mostly on **bigger models** (≈ N^0.73) |
| **Chinchilla** (Hoffmann et al., 2022) | Refit with 400+ runs: **scale parameters and tokens ≈ equally**; ≈ **20 tokens per parameter** |
| Chinchilla result | **70B on 1.4T tokens** beat **Gopher 280B** at the *same* compute `[WEB]` |

### Derive Chinchilla-optimal size
$C=6ND,\ D=20N\Rightarrow C=120N^2\Rightarrow N=\sqrt{C/120}$.
For $C\approx5.9\times10^{23}$ FLOPs: $N=\sqrt{4.9\times10^{21}}\approx 7.0\times10^{10}$ → **70B** ✓, $D=1.4$T ✓.

## 3. Over-training (why Llama 3 8B saw ~15T tokens)
Compute-optimal minimizes **training** compute for a target loss. If the model will serve **billions of requests**, lifetime cost is dominated by inference ($2N$ per token served), so you spend extra training compute to get a **smaller** model with the same quality.
- Llama 3 8B: tokens/params ≈ **1,900×** vs the 20× optimum `[WEB]` (source states D/N ≈ 1900; ~15T tokens is the commonly reported figure).
- Rule: **smaller N ⇒ cheaper serving**; extra D is a one-time cost.

## 4. Compute budget worked example
8B model, 15T tokens: $C=6\cdot 8\text{e}9\cdot 15\text{e}12=7.2\times10^{23}$ FLOPs.
| MFU assumption | GPU-hours on H100 (989 TFLOPS BF16 peak) |
|---|---|
| 40% (396 TFLOPS eff.) | $7.2\text{e}23/3.96\text{e}14=1.82\text{e}9$ s ≈ **505k GPU-hours** |
| 20% (198 TFLOPS eff.) | ≈ **1.0M GPU-hours** |
Real runs commonly land below ideal (communication, stragglers, restarts) — treat as a lower bound.
**MFU** (Model FLOPs Utilization) = achieved model FLOPs/s ÷ hardware peak. Large dense runs often report 30–55% `[GEN]`.

## 5. Data matters as much as quantity
Quality filtering, deduplication, mixture (web/code/math/multilingual), **epochs** (a few repeats OK; many repeats overfit), **contamination** checks against eval sets `[GEN]`. After pretraining → [[Post-Training - SFT, RLHF and DPO]].

## 6. Emergent behavior & test-time compute
Capabilities appear with scale; additional lever is **test-time compute** (reasoning tokens) → [[Test-Time Compute]].

> [!question] Recall
> 1. Why is training ≈ 3× forward cost ⇒ 6N?
> 2. Chinchilla-optimal N for C = 10²⁴ FLOPs? ($\sqrt{10^{24}/120}\approx 9.1\times10^{10}$ → ~91B, ~1.8T tokens)
> 3. Why do labs over-train small models?
> 4. What is MFU and what's a good value?

**Sources:** [Scaling laws explainer](https://www.zeroentropy.dev/concepts/scaling-laws/) · [Chinchilla notes](https://theorempath.com/papers/chinchilla) · [Reconciling Kaplan and Chinchilla](https://arxiv.org/pdf/2406.12907) · [Pre-training at scale](https://platform.commit.tu-berlin.de/en/book/sci-python/chapter/ch35/section/s02)

Related: [[Distributed Training - Memory, ZeRO and Parallelism]] · [[LLM Math Cheat Sheet]] · [[Back-of-the-Envelope Estimation]]
