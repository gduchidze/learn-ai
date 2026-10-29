---
tags: [ai-system-design, ml-foundations, cheatsheet, inference-engineering]
aliases: [LLM Formulas, Formula Sheet, Math Cheat Sheet]
---

# LLM Math Cheat Sheet

> [!success] 🟢 Junior Explanation
> One page of formulas that answer ~80% of back-of-the-envelope questions. Memorize the **bold** ones. Tags: `[WEB]` verified this session, `[OS]` from your guide, `[GEN]` standard derivations.

## Sizes & memory
| Quantity | Formula | Example |
|---|---|---|
| **Weights bytes** | $N\times b$ ($b$=2 BF16, 1 FP8/INT8, 0.5 INT4) | 70B BF16 = 140 GB; 4-bit = 35 GB `[OS]` |
| **KV bytes/token** | $2\,L\,h_{kv}\,d_h\,b$ | Llama-3-8B: 128 KB; 70B: 320 KB `[GEN]` |
| KV per sequence | KV/token × context | 70B @128k ≈ 40 GiB |
| Max concurrent seqs | (GPU mem × util − weights − activations) / KV per seq | 80 GB, 8B, 2k ctx → ~200 |
| **Training bytes** | **16 B/param** (2+2+4+4+4) + activations `[WEB]` | 7B → 112 GB |
| ZeRO-3 per GPU | $16\Psi/N_d$ `[WEB]` | 7B/8 GPUs → 14 GB |
| Params (dense) | $L(\text{attn}+3\,d\,d_{ff})+Vd(\times2)$ | Llama 3 8B ≈ 8.03B |
| Rule of thumb | $12\,L\,d^2$ | ±10% |

## Compute
| Quantity | Formula |
|---|---|
| **Forward / token** | $\approx 2N$ FLOPs `[WEB]` |
| **Training** | $C\approx 6ND$ `[WEB]` |
| Attention extra / token | $\approx 4\,L\,d\,n_{ctx}$ `[GEN]` |
| **Prefill time (ideal)** | $2NT/\text{peak FLOPs}$ |
| **Chinchilla optimal** | $D\approx 20N$, $N=\sqrt{C/120}$ `[WEB]` |
| MFU | achieved FLOPs/s ÷ peak |
| MBU | achieved bytes/s ÷ peak bandwidth |

## Decode / roofline
| Quantity | Formula |
|---|---|
| **Decode step time (≥)** | $(\text{weights bytes}+B\cdot\text{KV bytes})/\text{BW}$ |
| **Single-stream ceiling** | $\text{BW}/(N\,b)$ tokens/s — 70B BF16 on 3.35 TB/s: ≈ 24 tok/s `[WEB]` |
| Arithmetic intensity (weights) | $\approx 2B/b$ FLOP/byte → ≈ $B$ for BF16 |
| **Ridge point** | peak FLOPs / peak BW — H100 BF16 dense: 989e12/3.35e12 ≈ **295 FLOP/B** (the ~591 figure uses the *sparse* 1,979 TFLOPS) `[WEB]` |
| Prefill vs decode | prefill compute-bound ($T$ tokens/weight read); decode memory-bound |

## Communication
| Quantity | Formula |
|---|---|
| **Ring all-reduce traffic/GPU** | $2\frac{P-1}{P}S$ `[WEB]` |
| Time ≈ | startup $\alpha\cdot 2(P-1)$ + traffic/BW; tiny decode messages are **latency-bound** `[WEB]` |
| TP all-reduces | ≈ 2 per layer (attention + MLP) `[WEB]` |
| Pipeline bubble | $(p-1)/(m+p-1)$ `[GEN]` |

## Cost
| Quantity | Formula |
|---|---|
| **$/M tokens** | $\dfrac{\$/\text{GPU-hr}}{\text{tokens/s}\times 3600}\times10^6$ — $3 / 5000 tok/s → **$0.167/M** (100% util) |
| Request cost | $(T_{in}/10^6)p_{in}+(T_{out}/10^6)p_{out}$ `[OS]` |
| GPUs needed | tokens/s required ÷ tokens/s per GPU (+ headroom 1.3–2×) |

## MoE
Expected distinct experts touched by $B$ tokens, top-$k$ of $E$ (uniform routing): $E\,[1-(1-k/E)^B]$ `[GEN]` → [[MoE Serving and Expert Parallelism]].

## Quick constants `[WEB]` `[GEN]`
- H100 SXM: 80 GB HBM3, **3.35 TB/s**, **989 TFLOPS BF16 dense**, 1,979 FP8 dense, NVLink 900 GB/s bidirectional (450/dir), 132 SMs, 700 W.
- H200: 141 GB HBM3e, 4.8 TB/s.
- A100-80GB: ~2.0 TB/s, 312 TFLOPS BF16 dense, NVLink 600 GB/s `[GEN]`.
- 1 token ≈ 4 chars `[OS]`.

Related: [[Transformer Architecture Deep Dive]] · [[Roofline and Performance Modeling]] · [[Key Numbers Cheat Sheet]] · [[Inference Whiteboard Drills]]
