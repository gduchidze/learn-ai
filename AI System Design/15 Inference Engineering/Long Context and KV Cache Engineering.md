---
tags: [ai-system-design, inference-engineering, kv-cache]
aliases: [Long Context Serving, MLA, KV Offload, Sliding Window Serving, Ring Attention, Prefix Cache Engineering, KV Eviction]
---

# Long Context and KV Cache Engineering

> [!success] 🟢 Junior Explanation
> **In plain words:** Long prompts make the **KV cache** huge — often bigger than the model itself — and attention slower. Engineers fight this with smaller KV per token (**GQA/MLA**, **quantization**), **not storing** everything (**sliding window**, eviction), **reusing** it (**prefix caching**), or **moving it** to cheaper memory (CPU/NVMe offload).
>
> **Analogy:** A growing pile of meeting notes: shrink each note (compression), keep only recent pages (window), reuse notes from previous meetings (prefix cache), or archive old ones to a cabinet (offload).
>
> **Say it in one sentence:** "KV bytes/token = 2·L·h_kv·d_h·b; I reduce it with GQA/MLA/FP8, bound it with windows/eviction, reuse it with prefix caching, and spill cold KV to CPU/NVMe — then size concurrency from the remaining memory."
>
> 🎯 **Junior must know:** KV grows with context × users. · **Middle adds:** exact sizing, MLA numbers, attention-cost split, split-KV decode, offload trade-offs.

## 1. Sizing (always start here)
$$\text{KV}_{tok}=2\,L\,h_{kv}\,d_h\,b$$
| Model | KV/token | 8k ctx | 128k ctx |
|---|---|---|---|
| Llama-2-7B style (MHA 32×32×128, FP16) `[OS]` | 0.5 MB | 4 GiB | 64 GiB |
| Llama 3 8B (L=32, h_kv=8) | 128 KB | **1 GiB** | 16 GiB |
| Llama 3 70B (L=80, h_kv=8) | 320 KB | 2.5 GiB | **~40 GiB** |
Concurrency limit $=\dfrac{\text{GPU mem}\times u-\text{weights}-\text{act}}{\text{KV}_{tok}\times n_{ctx}}$ → [[Roofline and Performance Modeling]].
**Long-context costs split:** *memory* (KV, linear in $n$), *decode bandwidth* (re-read KV every step, linear in $n$), *prefill compute* (attention $O(n^2)$ + linear layers), *TTFT* (long prefill).

## 2. Make each token's KV smaller
| Technique | Mechanism | Numbers |
|---|---|---|
| **GQA / MQA** | Share K/V across head groups | 4–8× vs MHA `[OS]`; GQA uptrain with ~5% pretraining compute `[WEB]` |
| **MLA** (DeepSeek-V2) | Compress K and V jointly into a **low-rank latent** per token; re-expand in attention | **KV cache −93.3%** vs DeepSeek 67B, max generation throughput **5.76×**, 42.5% less training cost `[WEB]`; MLA reported ≥ MHA quality |
| **KV quantization** | FP8/INT8/INT4 KV | 2–4× `[OS]` (KIVI-style) |
| Fewer layers/heads at design time | Architecture | — |
> MLA detail `[GEN]` (verify in paper): cache per token per layer ≈ $d_c+d_h^R$ = 512 + 64 = **576 values** vs MHA's $2\,n_h d_h$ = 32,768 for 128 heads — equivalent to a GQA with ~2.25 groups; stores the latent, not per-head K/V.

## 3. Store fewer tokens
- **Sliding-window attention:** each token attends to last $w$ tokens → KV bounded by $w$ per sliding layer (some models mix local + global layers) `[OS]`.
- **Attention sinks (StreamingLLM):** keep first few tokens + recent window → endless streaming at fixed cache.
- **Token eviction (H2O etc.):** drop low-attention tokens — **loses exact recall**; don't use when you need to retrieve arbitrary facts `[OS]`.
- Context management at the app layer: compaction/summarization → [[Context Engineering]].

## 4. Reuse KV
- **Prefix caching:** shared system prompts / documents / conversation history → skip prefill; hash-block or radix-tree `[WEB]` → [[Inference Engine Internals]]. Because RoPE is baked into cached K, reuse requires **identical position offsets** (same prefix at the same positions) → [[Positional Encodings - RoPE, ALiBi and Long Context]].
- **Prefix-aware routing / sticky sessions** to keep caches warm → [[Load Balancing for LLMs]].
- **Cross-request radix reuse** (SGLang) for multi-turn/agents `[WEB]`.

## 5. Offload hierarchy `[GEN]`
```
GPU HBM (3–5 TB/s)  →  CPU DRAM (~50–100 GB/s per GPU over PCIe)  →  NVMe/remote KV store
```
- Evict cold prefix blocks to CPU/NVMe instead of dropping; **reload cost** (e.g. 10 GiB over PCIe 5 ≈ 0.2–0.4 s) vs **recompute cost** (prefill of those tokens) — offload wins when recompute is long (big prefixes) and reuse probability is high.
- Disaggregated prefill/decode ships KV over NVLink/RDMA → [[Prefill vs Decode]].

## 6. Faster attention at long context
- **FlashAttention** for prefill (O(n) memory) → [[Flash Attention]].
- **Flash-Decoding / split-KV** for decode (query length 1): split KV into chunks processed in parallel across SMs, merge with log-sum-exp; up to ~8× faster at very long sequences `[WEB]` → [[Kernels, Fusion and CUDA Graphs]].
- **Context/sequence parallelism (ring attention):** shard the sequence across GPUs; KV blocks circulate around a ring `[GEN]` — for prompts too long for one GPU's memory.
- **Chunked prefill** so a 100k-token prompt doesn't stall everyone → [[Prefill vs Decode]].

## 7. Quality side
Models degrade with length (context rot, lost in the middle) `[WEB]` → [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]]; extension methods (YaRN) need validation on your task; effective context < advertised.

## 8. Design checklist
1. Compute KV/token & per-sequence KV for target contexts.
2. Pick model with **GQA/MLA**; consider **FP8 KV**.
3. Enable **prefix caching** + prefix-aware routing.
4. Chunked prefill + token budget; limit max context per tier.
5. Plan **offload** only if reuse is high.
6. Evaluate **quality at length** (needle + task evals).

> [!question] Recall
> 1. Compute KV for L=64, h_kv=8, d_h=128, FP8 at 100k tokens. (2·64·8·128·1 = 131,072 B/token → 13.1 GB)
> 2. How does MLA cut cache and what did DeepSeek-V2 report?
> 3. When is offload better than recompute?
> 4. Why does RoPE complicate prefix reuse?

**Sources:** [DeepSeek-V2 paper](https://arxiv.org/pdf/2405.04434) · [PagedAttention](https://arxiv.org/abs/2309.06180) · [Flash-Decoding (CRFM)](https://crfm.stanford.edu/2023/10/12/flashdecoding.html) · [LeanAttention](https://export.arxiv.org/pdf/2405.10480) · [GQA paper](https://arxiv.org/abs/2305.13245v2) · [SGLang RadixAttention](https://lmsys.org/blog/2024-01-17-sglang)

Related: [[KV Cache]] · [[Grouped Query Attention]] · [[Case - ChatGPT-Scale Chat Assistant]]
