---
tags: [ai-system-design, inference-engineering, interview]
aliases: [Inference Engineer Questions, LLM Serving Interview, GPU Inference Questions]
---

# Inference Engineer Interview Q&A (35)

> [!success] 🟢 Junior Explanation
> Practice style `[WEB]`: **name the bottleneck** (compute / memory / communication / scheduler), **quantify the trade-off**, avoid vague claims ("quantization makes it faster" — *which* bottleneck, *how much*, *what accuracy risk*?). Answers are compressed; expand with numbers from [[LLM Math Cheat Sheet]].

## A. Fundamentals
**1. Why is decode memory-bound and prefill compute-bound?** Prefill processes T tokens per weight read (intensity ≈ T) → tensor cores saturate. Decode processes B tokens per full weight (+KV) read → intensity ≈ B ≪ ridge (≈295 on H100) → waiting on HBM. → [[Roofline and Performance Modeling]]
**2. What's the decode speed limit for one user?** Memory bandwidth ÷ bytes read per token ≈ BW/(N·b): 70B BF16 on 3.35 TB/s ≈ 24 tok/s.
**3. Why does batching raise throughput?** One weight read serves many tokens; until compute or KV traffic binds, cost per token falls ~1/B.
**4. Why does throughput plateau with batch size?** KV reads scale with B × context and don't amortize; memory capacity caps batch; scheduler/latency SLO caps it.
**5. KV-cache memory formula and example?** 2·L·h_kv·d_h·bytes per token; Llama 3 70B: 320 KB/token → 128k ctx ≈ 40 GiB/seq. → [[KV Cache]]
**6. What's the ridge point and how do you use it?** peak FLOPs/peak BW (H100 BF16 dense ≈ 295 FLOP/B); workloads below are memory-bound.
**7. MFU vs MBU?** Achieved FLOPs/s over peak vs achieved bytes/s over peak; MBU for decode, MFU for prefill/training.

## B. Memory & KV
**8. How does PagedAttention work and what does it buy?** KV in fixed blocks + block table; waste from 60–80% → <4%; enables bigger batches, sharing, copy-on-write. `[WEB]` → [[Inference Engine Internals]]
**9. GQA/MQA/MLA — trade-offs?** Shrink KV: GQA 4–8× with near-MHA quality (uptrain ~5% compute); MLA latent compression (V2: −93.3% KV vs 67B). Chosen at model-design time. → [[Long Context and KV Cache Engineering]]
**10. How would you serve 128k-context users cheaply?** GQA/MLA model, FP8 KV, prefix caching, chunked prefill, Flash-Decoding, limit contexts per tier, offload cold prefixes only if reuse high.
**11. Prefix caching internals?** Hash(block tokens + parent hash) → block; refcounts + LRU; only full-block, same-position matches; routing must be prefix-aware.
**12. Swap vs recompute preemption?** Swap = PCIe copy to CPU (needs host RAM); recompute = redo prefill (cheap with surviving prefix cache). Choose by size/bandwidth.

## C. Parallelism & communication
**13. TP vs PP vs replicas?** TP: lower latency + memory split, comm per layer (NVLink). PP: cross-node, adds latency. Replicas: linear throughput. Prefer smallest TP that fits weights+KV; replicate for throughput.
**14. How many all-reduces per layer in TP, and what limits them in decode?** ~2 per layer (attention+MLP); decode messages are tiny → latency-bound, not bandwidth-bound; NVIDIA saw ~23% of decode latency at 8-way TP. → [[Parallelism for Inference]]
**15. Why keep TP within a node?** NVLink (900 GB/s bidirectional on H100) ≫ network; all-reduce is on the critical path every layer.
**16. TP=2 vs TP=4 for 70B on A100-80GB?** TP=2 BF16 leaves ~2 GB for KV (unusable) → TP=4 (or FP8 + 2×TP=2). Compare latency, KV room, throughput per GPU.
**17. How does expert parallelism work and what's its cost?** Experts sharded across GPUs; all-to-all dispatch/combine per MoE layer; imbalance stragglers; helps by increasing tokens per expert. → [[MoE Serving and Expert Parallelism]]
**18. Why does MoE lose decode advantage at moderate batch?** Touched experts ≈ E[1−(1−k/E)^B] → Mixtral reads ~90% of experts by B=8.

## D. Kernels & systems
**19. Fusion vs CUDA graphs?** Fusion cuts HBM round-trips; graphs cut CPU launch overhead. Decode has hundreds of tiny kernels, so both matter. → [[Kernels, Fusion and CUDA Graphs]]
**20. CUDA-graph constraints in LLM serving?** Static shapes/addresses → capture per batch-size bucket, pad up; dynamic parts outside graph; memory per graph.
**21. How does FlashAttention work and why exact?** Tile Q/K/V in SRAM with online softmax (running max/sum); never materializes n×n; same math → exact. → [[Flash Attention]]
**22. What's Flash-Decoding?** Split KV into chunks processed in parallel for query-length-1 attention, then merge using log-sum-exp; fixes GPU underuse at small batch/long context (up to ~8×). `[WEB]`
**23. What is warp divergence / occupancy?** Divergent branches serialize within a 32-thread warp; occupancy = active warps/SM to hide latency. → [[GPU Architecture for Inference Engineers]]
**24. How would you speed up a slow decode step?** Profile first: gaps → graphs/async; memory-bound → quantize weights/KV, batch more, speculative decoding; comm-bound → fewer TP ranks/custom all-reduce; KV-bound → GQA/MLA/FP8 KV.

## E. Scheduling & serving
**25. How does continuous batching work?** Iteration-level scheduling: each step, admit/evict requests; refill finished slots immediately (Orca: 36.9× vs FasterTransformer on GPT-3 175B). → [[Continuous Batching]]
**26. What is chunked prefill and why?** Slice prompt prefill to a token budget and mix with decodes so long prompts don't stall streaming (Sarathi-Serve). Trade: slightly higher TTFT for that prompt.
**27. When use prefill-decode disaggregation?** Large scale, long prompts, strict TTFT+TPOT SLOs; need fast KV transfer (NVLink/RDMA); DistServe: up to 7.4× more requests or 12.6× tighter SLO. `[WEB]`
**28. How does max-batch-tokens affect latency?** Bigger → more throughput but longer steps → higher TPOT; smaller → lower TPOT, lower throughput.
**29. Speculative decoding: when does it pay?** Low/medium batch (spare compute), high acceptance, cheap draft; gain ≈ (1−α^{k+1})/((1−α)(1+kc)); less gain at high batch. → [[Speculative Decoding]]
**30. How do you handle structured output efficiently?** Compile schema to a grammar/FSM; mask logits per step; precompute token masks; CPU cost can bottleneck — overlap with GPU. → [[Structured Output]]

## F. Precision, benchmarking, cost
**31. FP8 vs INT4 weight-only — which bottleneck each helps?** FP8 W8A8: compute + memory (prefill and decode on Hopper); INT4 weight-only: decode bandwidth. → [[Low-Precision Inference]]
**32. MXFP4 vs NVFP4?** Block 32/E8M0 scale vs block 16/E4M3 scale + FP32 tensor scale → NVFP4 more accurate; Blackwell FP4 math 2–3× FP8.
**33. How do you benchmark an LLM server properly?** Open-loop Poisson load, realistic length/prefix distributions, sweep rate, percentiles, goodput under SLO, warmup, repeat, then profile at the knee. → [[Benchmarking and Profiling Methodology]]
**34. Compute $/M tokens and decide self-host vs API.** ($/GPU-hr)/(tok/s×3600)×1e6 at realistic utilization; compare with API plus ops cost; self-host if utilization is high or data can't leave. → [[Capacity Planning and Cost per Million Tokens]]
**35. Your GPUs show 100% util but throughput is low — why?** Util ≠ efficiency; check MBU/MFU, kernel gaps, tiny batches, comm time, KV thrash/preemption.

## Coding-round prep (not covered by notes — practice!)
- Implement **softmax, layer/RMSNorm, attention** in PyTorch/NumPy; then a **blocked/online softmax**.
- Write a **KV-cache allocator** with block tables and refcounts (+ copy-on-write).
- Implement **top-k/top-p sampling**, **beam search**, **BPE merges**.
- Toy **continuous-batching scheduler** with token budget and preemption.
- Triton: **vector add → softmax → matmul tile**.

Related: [[Inference Whiteboard Drills]] · [[LLM Internals and ML Foundations Q&A]] · [[Interview Question Bank]]
