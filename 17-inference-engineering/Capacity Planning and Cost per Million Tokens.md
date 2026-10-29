---
tags: [ai-system-design, inference-engineering, capacity-planning, cost]
aliases: [Capacity Planning, GPU Sizing, Cost per Million Tokens, Little's Law, Self-hosting vs API]
---

# Capacity Planning and Cost per Million Tokens

> [!success] 🟢 Junior Explanation
> **In plain words:** To know how many GPUs you need, convert traffic into **tokens per second**, divide by **tokens/s per GPU** (measured, not guessed), add headroom for peaks and failures, then multiply by price. Prefill (reading prompts) and decode (writing answers) are sized **separately**.
>
> **Analogy:** Staffing a call center: calls per hour × minutes per call ÷ minutes each agent can work, plus spare agents for rush hour.
>
> **Say it in one sentence:** "I size decode from output tokens/s ÷ per-GPU decode throughput, size prefill from input tokens/s ÷ per-GPU prefill rate, check KV memory with Little's law, add 1.3–2× headroom, then compute $/M tokens and compare with API prices."
>
> 🎯 **Junior must know:** tokens/day → GPUs → $ . · **Middle adds:** prefill/decode split, Little's law, utilization effects, break-even vs API.

## 1. Step-by-step
1. **Workload:** requests/s (avg & peak), input and output token distributions, context length, cache hit rate.
2. **SLO:** TTFT p95, TPOT p95 → sets max batch/concurrency per GPU.
3. **Per-GPU capacity (benchmark it!)** → [[Benchmarking and Profiling Methodology]]; for planning use the roofline model → [[Roofline and Performance Modeling]].
4. **Decode GPUs** = output tokens/s ÷ decode tokens/s/GPU.
5. **Prefill GPUs** = uncached input tokens/s ÷ prefill tokens/s/GPU.
6. **Memory check** (Little's law below).
7. **Headroom:** peak factor (e.g. 3×), N+1/N+2 redundancy, deployment slack, target utilization ≤ 60–70% for latency SLOs.
8. **Cost:** GPUs × $/hr × hours; $/M tokens.

## 2. Little's law (concurrency & KV memory)
$$L=\lambda\cdot W$$ (in-flight requests = arrival rate × time in system).
> 200 req/s × 8 s average latency = **1,600 concurrent requests**. Each holds KV for (input+output so far) tokens → total KV = 1,600 × ~2,400 × KV/token. For an 8B model (128 KB/token) = **~491 GB** across the fleet → ~31 GB per GPU on 16 GPUs ✓. For 70B (320 KB/token) = ~1.2 TB → plan more GPUs for **memory**, not compute.

## 3. $/M tokens
$$\$/\text{M tok}=\frac{\$/\text{GPU-hr}}{\text{tokens/s}\times3600}\times10^6$$
| Assumption | Result |
|---|---|
| $3/hr, 5,000 tok/s, 100% util `[OS]` | **$0.167 / M** |
| same, 60% util | **$0.278 / M** |
| $3/hr, 2,000 tok/s, 60% util | $0.694 / M |
Utilization is the biggest hidden lever: **idle GPUs cost the same as busy ones** → [[Auto Scaling and Warm Pools]].

## 4. Worked example (extends `[OS]` ChatGPT-like estimate)
10M DAU, 5 conv/day, 2,000 in + 500 out → **100B input, 25B output tokens/day** `[OS]`.
- Output: 25B/86,400 = **289k tok/s avg**; peak 3× = **868k**. At **5,000 decode tok/s/GPU** (`[OS]` example; achievable on 70B-class only with FP8/TP and short contexts) → **58 GPUs avg, 174 at peak**.
- Cost avg: 58 × $3 × 24 = **$4.2k/day** (`[OS]`: $4,320) → ~$130k/month; provisioning for peak 24/7 = $12.5k/day → autoscale/blend reserved + on-demand/spot.

### ⚠️ Reality check on input tokens (derived `[GEN]`)
`[OS]` says input needs fewer GPUs. Check with FLOPs: prefill ≈ $2N$ FLOPs/token. 70B → 140 GFLOP/token; H100 at 50% MFU (494 TFLOPS BF16) ≈ **3,500 prefill tok/s/GPU** (≈7,000 with FP8).
100B input tokens/day = 1.16M tok/s → **~330 H100-equivalents (BF16) / ~165 (FP8)** at 100% duty — *more* than the output side! Why? Prefill per token is cheap but inputs are 4× more numerous. What actually saves you: **prefix/prompt caching** (system prompts, history), **smaller/routed models**, FP8, and not re-sending context. → [[Prompt Cache]] · [[LLM Routing]].
**Lesson:** always size prefill separately; RAG/agent workloads (long inputs) are often prefill-bound.

## 5. Self-host vs API break-even
| Factor | API | Self-host |
|---|---|---|
| Cost shape | Per token, zero idle | Fixed per GPU-hour; cheap only at **high utilization** |
| Ops | None | Engine tuning, autoscaling, on-call |
| Data control | Provider terms (no-train, BAA) | Full |
| Latency control | Provider variability | Full (but you own SLOs) |
Break-even: self-host $/M (at realistic utilization) vs API list price **including** your engineering/on-call cost. Rule of thumb: self-host when sustained volume keeps GPUs ≥ 50–60% busy, or data can't leave `[GEN]` → [[Cost Optimization]].

## 6. Headroom & reliability
- Keep ≥ N+1 replicas per pool; one node failure shouldn't breach SLO.
- Warm pool for cold starts (1–10 min model load) `[OS]`.
- Separate pools for **interactive vs batch** and **reasoning vs chat** → [[Case - LLM Inference Platform for Many Teams]].
- Re-measure after every engine/model/quantization change.

> [!question] Recall
> 1. Size decode GPUs for 80k output tok/s at 5k tok/s/GPU with 2× headroom. (32)
> 2. Use Little's law for 500 req/s at 6 s latency, 3k tokens in flight each, 128 KB/token. (3,000 × 3,000 × 128 KB ≈ 1.15 TB)
> 3. Why can input tokens dominate GPU needs for RAG workloads?
> 4. Cost/M at $2.5/hr, 3,000 tok/s, 70% util? (≈ $0.33)

Related: [[Back-of-the-Envelope Estimation]] · [[LLM Math Cheat Sheet]] · [[Inference Whiteboard Drills]]
