---
tags: [ai-system-design, inference-engineering, parallelism]
aliases: [Tensor Parallel Inference, TP vs PP, Expert Parallel, All-Reduce, NCCL, NVLink, Context Parallel, Data Parallel Replicas]
---

# Parallelism for Inference

> [!success] 🟢 Junior Explanation
> **In plain words:** If a model doesn't fit one GPU — or one GPU is too slow — you split it. **Tensor parallel (TP)** splits every layer across GPUs (GPUs talk constantly → needs NVLink). **Pipeline parallel (PP)** gives each GPU a few layers (talks less, adds latency). **Data parallel / replicas** run separate copies for more traffic. **Expert parallel (EP)** spreads MoE experts.
>
> **Analogy:** Many cooks on one dish (TP: fast but they shout to each other all the time) vs a kitchen assembly line (PP: each cook does their station) vs several identical kitchens (replicas).
>
> **Say it in one sentence:** "I use TP within a node for latency and memory, PP across nodes only if needed, EP for MoE, and replicas for throughput — choosing the smallest TP that fits weights + KV."
>
> 🎯 **Junior must know:** TP vs PP vs replicas. · **Middle adds:** all-reduce cost math, latency-bound decode comms, TP degree choice, serving 70B on 4×A100.

## 1. The menu
| Strategy | Splits | Comms | Latency effect | Throughput effect |
|---|---|---|---|---|
| **Replicas (DP)** | Nothing (full copies) | None | Same | **Linear** scale |
| **TP** | Each layer's matrices | **All-reduce ×2 per layer** | **Lower** (more bandwidth + compute per token) | More KV room, but comm overhead |
| **PP** | Layers into stages | P2P activations between stages | **Higher** per request (sequential stages) | Good for big models across nodes |
| **EP** | MoE experts | **All-to-all** per MoE layer | Neutral/↑ | Needed for huge MoE |
| **CP / sequence parallel** | Sequence dim (ring attention) | KV passes between ranks | Enables very long context | Niche |
→ background [[Scaling LLMs - Vertical Horizontal Tensor Pipeline]]; training analogs in [[Distributed Training - Memory, ZeRO and Parallelism]].

## 2. Megatron-style TP `[WEB]`
- MLP: **column-parallel** up/gate (each GPU computes a slice, no comm) → **row-parallel** down (partial sums) → **1 all-reduce**.
- Attention: Q/K/V **column-parallel** (each GPU owns a subset of heads) → output proj **row-parallel** → **1 all-reduce**.
⇒ **≈2 all-reduces per layer** (synthesis from the pattern; verify in Megatron source). 70B (80 layers) → **~160 all-reduces per decode step**.
KV cache is also sharded by heads → **per-GPU KV = total/TP** (watch GQA: with $h_{kv}=8$, TP>8 means replicating KV heads).

## 3. Cost of an all-reduce `[WEB]`
Ring all-reduce traffic per GPU $=2\frac{P-1}{P}S$ (reduce-scatter + all-gather). $P=8$: 1.75 S.
Time ≈ $\alpha\cdot2(P-1)$ (startup, ring) + traffic/BW.
- **Prefill/large batch:** big messages → bandwidth-bound; NVLink (450 GB/s/direction on H100) handles it.
- **Decode:** message = $B\cdot d\cdot b$ bytes — e.g. B=1, d=8192, BF16 = **16 KB** → **latency-bound**, not bandwidth-bound. NVIDIA measured all-reduce ≈ **23% of decode latency** for 8-way TP on H100/NVLink and used a one-shot custom kernel to cut it (ring adds up to ~2× latency on small messages) `[WEB]`.
- Rule: more TP → less compute/mem per GPU but **more fixed comm per layer** → diminishing returns; **TP=8 within a node** is the usual ceiling.
- Tree/double-binary-tree algorithms give log-latency in NCCL ≥2.4; ring is bandwidth-optimal but linear latency `[WEB]`.

## 4. Choosing the TP degree (procedure) `[GEN]`
1. **Weights fit?** $N\cdot b/\text{TP}<\text{GPU mem}\times 0.9$ minus KV budget.
2. **KV budget:** need room for target concurrency × context.
3. **Latency target:** step time ≈ (weights/TP + KV)/BW + comm; raise TP until comm stops paying.
4. **Cost:** per-token cost = GPU-hours/tokens; TP=2 with 2× GPUs only wins if tokens/s per GPU holds up.
5. Prefer **fewer GPUs per replica + more replicas** for throughput; use bigger TP only for latency or memory.

### Interview classic: serve a 70B model on 4×A100-80GB
- BF16 weights = 140 GB. **TP=2** puts 70 GB on each GPU; with ~72 GB usable per A100-80GB (90% utilization), only **~2 GB** remains for KV/activations → unusable.
- **TP=4**: 35 GB weights/GPU → ~**37 GB/GPU** free for KV ≈ 148 GB total ≈ at 320 KB/token ≈ **460k tokens** ≈ ~230 sequences of 2k.
- Or **FP8/INT8 weights** (70 GB): TP=2 → 35 GB weights/GPU → comfortable KV; two TP=2 replicas on 4 GPUs.
- Trade-off: TP=4 = lower latency per token, one replica; 2×TP=2 FP8 = 2× throughput and each request still fast. Pick by SLO.

## 5. Pipeline parallelism for inference
- Splits layers; request latency = sum of stages + inter-stage transfers → **worse TPOT**; throughput improved only with enough in-flight micro-batches.
- Use when the model doesn't fit within one NVLink domain (multi-node), or to avoid slow cross-node all-reduce. Prefer **TP within node + PP across nodes** `[GEN]`.

## 6. Data/expert/context parallel notes
- **Replicas** behind a load balancer (least outstanding tokens, prefix-aware) → [[Load Balancing for LLMs]].
- **EP** details → [[MoE Serving and Expert Parallelism]].
- **Disaggregated prefill/decode** can use *different* TP degrees per phase (compute-heavy prefill vs memory-heavy decode) → [[Prefill vs Decode]].

> [!question] Recall
> 1. Why are decode all-reduces latency-bound? What did NVIDIA do about it?
> 2. How many all-reduces per decode step for an 80-layer model under TP? (~160)
> 3. TP=2 vs TP=4 for 70B on A100-80GB — compare memory and latency.
> 4. When do you choose PP over TP?

**Sources:** [NVIDIA: low-latency communication in inference](https://developer.nvidia.com/blog/optimizing-for-low-latency-communication-in-inference-workloads-with-jax-and-xla) · [Beyond NCCL: all-reduce for decode (UMD)](https://pssg.cs.umd.edu/blog/2025/beyond-nccl/) · [NCCL NVLink bandwidth notes](https://wayne.is-a.dev/blog/nccl-nvlink-bandwidth/) · [Tensor vs pipeline parallelism](https://petronellatech.com/hardware/tensor-vs-pipeline-parallelism/) · [Tensor parallelism overview](https://www.zeroentropy.dev/concepts/tensor-parallelism/) · [AI inference interview prep 2026](https://www.techinterview.org/post/3233475331/ai-inference-infrastructure-interview-prep-2026-vllm-triton/)

Related: [[Roofline and Performance Modeling]] · [[Case - LLM Inference Platform for Many Teams]]
