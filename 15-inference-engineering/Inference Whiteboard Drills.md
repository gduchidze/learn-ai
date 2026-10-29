---
tags: [ai-system-design, inference-engineering, drills, interview]
aliases: [Inference Drills, Whiteboard Math, Numeric Drills]
---

# Inference Whiteboard Drills

> [!success] 🟢 Junior Explanation
> Interviewers love "do the math out loud". Each drill: try first (5 min), then open the answer. Always **state assumptions**, **name the bottleneck**, and **sanity-check units**. Constants: H100 = 80 GB, 3.35 TB/s, 989 TFLOPS BF16 / 1,979 FP8 dense · A100-80GB = ~2.0 TB/s, 312 TFLOPS · [[LLM Math Cheat Sheet]].

## Drill 1 — Single-stream ceiling
13B model, BF16, one H100. Max tokens/s for one request?
> [!example]- Answer
> Weights = 13e9×2 = 26 GB. Step ≥ 26/3,350 GB/s = 7.76 ms → **≈129 tok/s** ceiling (real ~60–80% → ~80–100). With FP8 weights: ~258 tok/s ceiling.

## Drill 2 — KV size
L=40, h_kv=8, d_h=128, FP16 KV. Bytes/token? 32k context per sequence? With FP8 KV?
> [!example]- Answer
> 2·40·8·128·2 = **163,840 B/token**. ×32,768 = 5.37e9 B ≈ **5.0 GiB**. FP8 KV: **2.5 GiB**.

## Drill 3 — Concurrency
Llama 3 8B BF16 on H100-80GB, 90% usable memory, 4k context per sequence, ignore activations. Max concurrent sequences?
> [!example]- Answer
> Usable 72 GB − weights 16.06 GB = 55.9 GB. KV/seq = 128 KB × 4,096 = 0.537 GB. → **~104 sequences**. (With FP8 KV: ~208.)

## Drill 4 — Prefill TTFT
70B on TP=2 H100, FP8 weights+activations, 8k-token prompt, assume 40% MFU. TTFT floor?
> [!example]- Answer
> FLOPs ≈ 2·70e9·8,192 = 1.15e15. Peak = 2×1,979 TFLOPS = 3,958 TFLOPS; ×0.4 = 1,583 TFLOPS → **≈0.72 s**, plus attention extra (n² term) and queueing. Mention chunked prefill/prefix cache to cut it.

## Drill 5 — $/M tokens
GPU $2.50/hr, 3,000 tok/s at full load, running 70% utilized. $/M output tokens?
> [!example]- Answer
> Effective 2,100 tok/s → 7.56M tok/hr → $2.50/7.56 = **$0.33/M**. At 100%: $0.23/M.

## Drill 6 — Speculative decoding speedup
Acceptance rate α=0.8 per token, k=4 draft tokens, draft costs c=0.1 of a target step. Expected speedup?
> [!example]- Answer
> Expected tokens per target pass = (1−α^{k+1})/(1−α) = (1−0.328)/0.2 = **3.36**. Round cost = 1 + k·c = 1.4 target-steps. Speedup ≈ 3.36/1.4 = **2.4×** `[GEN]` (Leviathan et al. analysis). Lower α or costly draft → gain shrinks; at high batch the GPU is already busy → less gain → [[Speculative Decoding]].

## Drill 7 — MoE touched experts
Mixtral (E=8, k=2) at B=8; and E=256, k=8 at B=64. Experts touched per layer?
> [!example]- Answer
> 8·[1−(0.75)^8] = 8·0.900 = **7.2**. 256·[1−(1−1/32)^64] = 256·(1−0.131) = **≈222**. Conclusion: bandwidth ≈ near-dense at modest batch → [[MoE Serving and Expert Parallelism]].

## Drill 8 — TP communication
80-layer model, TP=8, decode batch 32, d=8192, BF16. All-reduces per step? Message size? Latency- or bandwidth-bound?
> [!example]- Answer
> ≈2 per layer → **160 all-reduces/step**. Message = 32·8,192·2 B = **512 KB**. Ring traffic/GPU = 2·7/8·0.5 MB ≈ 0.9 MB → ~2 µs at 450 GB/s, but **per-collective startup latency (~µs × 14 hops)** dominates → **latency-bound**. (NVIDIA saw all-reduce ≈ 23% of decode latency at 8-way TP `[WEB]`.) Mitigate: one-shot custom all-reduce, fewer TP ranks, overlap, CUDA graphs.

## Drill 9 — Training memory
13B model, AdamW mixed precision, 16 GPUs, ZeRO-3. Model-state memory/GPU? And ZeRO-1?
> [!example]- Answer
> ZeRO-3: 16×13/16 = **13 GB**/GPU. ZeRO-1: 4Ψ + 12Ψ/N = 52 + 9.75 = **61.75 GB**. Plus activations.

## Drill 10 — Fleet sizing with Little's law
Chat service: 200 req/s peak, avg 400 output tokens, p50 latency 8 s, 8B model (128 KB/token), avg 2,000 input tokens. Per-GPU decode 5,000 tok/s, prefill 20,000 tok/s (8B, FP8). GPUs? KV memory?
> [!example]- Answer
> Decode: 200×400 = 80k tok/s ÷ 5k = **16 GPUs**. Prefill: 200×2,000 = 400k tok/s ÷ 20k = **20 GPUs** (prefill-bound!) unless prefix cache hits cut input (e.g. 70% hit → 6 GPUs). Concurrency = 200×8 = **1,600** in flight × 2,400 tokens × 128 KB = **~491 GB** → 31 GB/GPU on 16 GPUs ✓ (check also 20-GPU case). Add 1.5–2× headroom → ~30–40 GPUs. Use PD split to scale prefill/decode independently → [[Prefill vs Decode]].

## Drill 11 — "Serve 70B on 4×A100-80GB"
Give two designs and trade-offs.
> [!example]- Answer
> (a) **TP=4 BF16:** 35 GB weights/GPU, ~37 GB/GPU for KV (usable 72) → ~148 GB KV ≈ 460k tokens (320 KB/token) ≈ 230 seqs of 2k. Lowest latency, single replica. (b) **FP8 weights, 2 replicas × TP=2:** 35 GB/GPU weights, same KV room per replica, **2× throughput**, similar per-request latency, slight quality risk (eval). (c) TP=2 BF16 ✗ (70 GB weights, ~2 GB left). Choose by SLO and traffic → [[Parallelism for Inference]].

## Drill 12 — Why is my GPU "100% utilized" but throughput low?
> [!example]- Answer
> nvidia-smi util only means a kernel was resident. Check **MBU** (decode), **MFU** (prefill), DCGM tensor/DRAM active, gaps in Nsight timeline (launch overhead → CUDA graphs), NCCL time, tiny batch (increase concurrency), KV thrash/preemptions → [[Benchmarking and Profiling Methodology]].

Related: [[Roofline and Performance Modeling]] · [[Inference Engineer Interview Q&A]] · [[Capacity Planning and Cost per Million Tokens]]
