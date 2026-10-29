---
tags: [ai-system-design, ml-foundations, llm-internals, core]
aliases: [Transformer Internals, Parameter Count, Decoder-only Transformer, Llama Config, Tensor Shapes, GQA Shapes]
---

# Transformer Architecture Deep Dive

> [!success] 🟢 Junior Explanation
> **In plain words:** A modern LLM is the **same block repeated** (e.g. 32–80 times): attention (tokens look at each other) then a feed-forward network (each token is processed alone). Everything is matrix multiplication, so you can count parameters, FLOPs and memory with simple formulas.
>
> **Analogy:** An assembly line with identical stations; each station first lets workers talk (attention), then each worker thinks alone (FFN).
>
> **Say it in one sentence:** "A decoder-only transformer stacks L pre-norm blocks of GQA-attention + SwiGLU-FFN over a residual stream of width d; params ≈ L·(attn + ffn) + embeddings, and each generated token costs ≈ 2N FLOPs."
>
> 🎯 **Junior must know:** the block, "N params ⇒ N×bytes of memory". · **Middle adds:** exact parameter formulas, KV bytes/token, FLOPs, where memory goes.

## 1. Shapes (one sequence, $n$ tokens, width $d$)
```
tokens [n] → embedding → X [n, d]
 per layer:
   Q = X·Wq  [n, h·d_h]          h = query heads, d_h = d / h
   K = X·Wk  [n, h_kv·d_h]       h_kv = KV heads (GQA: h_kv < h)
   V = X·Wv  [n, h_kv·d_h]
   scores = softmax(Q Kᵀ / √d_h + causal mask)   [h, n, n]
   out = scores·V → concat heads [n, d] → ·Wo [n, d]
   FFN (SwiGLU): down( silu(X·Wgate) ⊙ (X·Wup) ),  Wgate,Wup: [d, d_ff], Wdown: [d_ff, d]
 final RMSNorm → X·W_out [n, V] logits
```
Verified architecture ingredients for Llama-style models: **RMSNorm pre-norm, RoPE, GQA, SwiGLU** `[WEB]`.

## 2. Parameter formulas
| Part | Params per layer |
|---|---|
| Attention | $d\cdot hd_h$ (Wq) $+ 2\,d\cdot h_{kv}d_h$ (Wk, Wv) $+ hd_h\cdot d$ (Wo) |
| MHA special case ($h_{kv}=h$) | $4d^2$ |
| SwiGLU FFN | $3\,d\,d_{ff}$ |
| Norms | $\approx 2d$ (negligible) |
| **Total model** | $L\,(\text{attn}+\text{ffn}) + V\,d\,(\times 2$ if untied$)$ |
Rule of thumb (classic FFN $4d$): **params ≈ $12\,L\,d^2$** `[GEN]` — a quick sanity check only.

### Worked example — Llama 3 8B (config: d=4096, L=32, h=32, h_kv=8, d_ff=14336, V=128,256 — released config, verify) `[GEN]`
| Item | Calc | Params |
|---|---|---|
| Wq | 4096·4096 | 16.78 M |
| Wk + Wv | 2·4096·1024 | 8.39 M |
| Wo | 4096·4096 | 16.78 M |
| **Attention / layer** | | **41.94 M** |
| **FFN / layer** | 3·4096·14336 | **176.16 M** |
| Layer total | | 218.10 M |
| × 32 layers | | 6.979 B |
| Embedding + untied head | 2·128,256·4096 | 1.051 B |
| **Total** | | **≈ 8.03 B ✓** |
Observations: **FFN ≈ 81% of per-layer params**; embeddings ≈ 13% of the model.

### Same for Llama 3 70B (d=8192, L=80, h=64, h_kv=8, d_ff=28672)
Attention 151.0 M + FFN 704.6 M = 855.6 M/layer × 80 = 68.45 B + embeddings 2.10 B ≈ **70.55 B ✓**

## 3. Memory
- **Weights:** $N\times$ bytes/param (BF16 = 2): 8B → 16 GB; 70B → 140 GB.
- **KV cache per token** $=2\cdot L\cdot h_{kv}\cdot d_h\cdot b$ `[OS]`:
  - Llama-2-7B-style MHA (32×32×128, b=2): **0.5 MB/token** `[OS]`
  - Llama 3 8B: 2·32·8·128·2 = **131,072 B = 128 KB/token** (GQA saves 4×) → 8k ctx = **1 GiB** per sequence
  - Llama 3 70B: 2·80·8·128·2 = **327,680 B = 320 KB/token** → 128k ctx ≈ **40 GiB** per sequence
- **Activations** (inference): small; (training): large — see [[Distributed Training - Memory, ZeRO and Parallelism]].

## 4. FLOPs
- **Per token, forward ≈ $2N$** (each param does one multiply + add) `[WEB]` — ignores attention-score cost.
- **Attention extra per token** ≈ $4\,L\,d\,n_{ctx}$ (QKᵀ and AV) — grows with context `[GEN]`.
- Prefill of $T$ tokens ≈ $2NT$ FLOPs → compute-bound; decode ≈ $2N$ per token but reads all weights → memory-bound → [[Roofline and Performance Modeling]].
> Example: 8B model, 2,048-token prompt: $2\cdot 8.03\text{e}9\cdot 2048\approx 33$ TFLOP ⇒ ~33 ms at the H100's 989 TFLOPS BF16 peak; ~65 ms at 50% utilization.

## 5. Variants you must be able to place
| Choice | Options | Why |
|---|---|---|
| Attention heads | MHA → **GQA** → MQA → MLA | KV cache size ([[Grouped Query Attention]], [[Long Context and KV Cache Engineering]]) |
| FFN | dense → **MoE** | More params, same active compute ([[Mixture of Experts]]) |
| Position | learned → sinusoidal → **RoPE** / ALiBi | Length generalization |
| Norm | LayerNorm → **RMSNorm** | Cheaper |
| Activation | GELU → **SwiGLU** | Quality per param |
| Architecture | encoder-only (BERT), encoder-decoder (T5), **decoder-only (GPT/Llama)** | LLMs are decoder-only: simple, scalable, natural for generation |

## 6. Complexity cheat table
| | Time | Memory |
|---|---|---|
| Naive attention | $O(n^2d)$ | $O(n^2)$ scores |
| FlashAttention | $O(n^2d)$ (same FLOPs) | $O(n)$ — never materializes the matrix → [[Flash Attention]] |
| KV cache | — | $O(n)$ per sequence |
| FFN | $O(n\,d\,d_{ff})$ | — |

## 7. Why decoder-only works for everything
Causal LM objective = predict next token at **every** position in one pass (parallel training); generation reuses the same weights autoregressively → [[LLM Recap - Tokens and Autoregression]].

> [!question] Recall
> 1. Count params of one GQA attention block for d=4096, h=32, h_kv=8.
> 2. KV bytes/token for L=40, h_kv=8, d_h=128, FP16? (= 163,840 B)
> 3. Why is FFN most of the parameters? Why is attention most of the *long-context* cost?
> 4. FLOPs for a 70B model generating one token? (~140 GFLOP)

**Sources:** [LLaMA primer](https://aman.ai/primers/ai/LLaMA/) · [Llama 2&3 deep dive](https://www.besthub.dev/articles/llama-2-3-deep-dive-architecture-innovations-rmsnorm-rope-gqa-and-post-training-pipeline-995d217b577e) · [Attention Is All You Need](https://arxiv.org/pdf/1706.03762) · [Scaling-law FLOP rules (Reconciling Kaplan & Chinchilla)](https://arxiv.org/pdf/2406.12907)

Related: [[Attention]] · [[KV Cache]] · [[Neural Network Building Blocks]] · [[LLM Math Cheat Sheet]]
