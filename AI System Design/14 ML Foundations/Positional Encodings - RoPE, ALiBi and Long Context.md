---
tags: [ai-system-design, ml-foundations, llm-internals]
aliases: [RoPE, Rotary Position Embedding, ALiBi, YaRN, Positional Encoding, Context Extension]
---

# Positional Encodings — RoPE, ALiBi and Long Context

> [!success] 🟢 Junior Explanation
> **In plain words:** Attention alone treats a sentence like a bag of words — "dog bites man" = "man bites dog". Positional encoding tells the model **where** each token is. **RoPE** does it by rotating the Query/Key vectors by an angle that depends on position.
>
> **Analogy:** Each word gets a clock hand; the *angle between two hands* tells how far apart the words are.
>
> **Say it in one sentence:** "RoPE rotates pairs of Q/K dimensions by position-dependent angles so the attention score depends only on relative distance; models fail past their trained length unless the rotation is rescaled (e.g. YaRN)."
>
> 🎯 **Junior must know:** why position info is needed. · **Middle adds:** RoPE math, ALiBi, extrapolation, context-extension methods.

## 1. Why needed
Self-attention is **permutation-equivariant**: without position signals, reordering tokens only reorders outputs. Causal masking gives *some* implicit order, but explicit encodings work much better `[GEN]`.

## 2. Families
| Method | How | Notes |
|---|---|---|
| **Sinusoidal absolute** (original) | Add fixed sin/cos vector to embeddings | **Collapses beyond training length** `[WEB]` |
| **Learned absolute** (GPT-2) | Trainable table [max_len, d] | Hard max length |
| **RoPE** (Su et al., 2021, RoFormer) | **Rotate** consecutive dim pairs of Q and K by angle ∝ position | Relative by construction; standard in Llama-style models `[WEB]` |
| **ALiBi** | Add a **linear bias** $-m\cdot|i-j|$ to attention logits; no embeddings | Extrapolates well; modifies logits, not vectors `[WEB]` |

## 3. RoPE math `[GEN]` (verified description: rotates pairs by angle ∝ position `[WEB]`)
Split a head vector into $d_h/2$ pairs; for position $m$ rotate pair $i$ by angle $m\theta_i$, with $\theta_i=\text{base}^{-2i/d_h}$ (base 10,000 originally):
$$R_m=\begin{pmatrix}\cos m\theta&-\sin m\theta\\ \sin m\theta&\cos m\theta\end{pmatrix},\qquad q_m=R_m q,\ k_n=R_n k$$
$$q_m^\top k_n=q^\top R_m^\top R_n k=q^\top R_{n-m}k\ \Rightarrow\ \text{depends only on } n-m$$
- **Low-index pairs** rotate fast (high frequency, local detail); **high-index pairs** rotate slowly (low frequency, long range).
- Applied to **Q and K only** (not V) at every layer; nothing added to the residual stream.
- KV cache stores **already-rotated K** — position baked in (matters for prefix caching and KV reuse).

## 4. Why models fail past training length
Positions beyond training produce rotation angles the model never saw → attention scores go out-of-distribution (especially for the slow-rotating dims). → context rot/quality collapse `[WEB]` → [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]].

## 5. Context-extension methods
| Method | Idea |
|---|---|
| **Position interpolation** | Compress positions $m\to m\cdot L_{train}/L_{new}$ so angles stay in range; short fine-tune |
| **NTK-aware / dynamic scaling** | Change the RoPE **base** so high frequencies are preserved, low ones stretched |
| **YaRN** | Frequency-dependent interpolation + attention temperature; needs **~10× fewer tokens and 2.5× fewer training steps** than earlier methods; with Dynamic Scaling >2× extension without fine-tuning `[WEB]` |
| **ALiBi-style** | Built-in recency bias, extrapolates by design |
| Beyond ~10× | Needs additional long-context training `[WEB]` |
Serving consequence: longer context = more KV cache + quadratic attention compute → [[Long Context and KV Cache Engineering]].

## 6. Sliding-window & sinks (connection)
Sliding-window attention limits each token to the last $w$ tokens (bounded KV); **attention sinks** keep the first few tokens as stable anchors → streaming inference `[OS]` ([[KV Cache]]).

> [!question] Recall
> 1. Prove $q_m^\top k_n$ depends only on $n-m$ under RoPE.
> 2. RoPE vs ALiBi — what does each modify?
> 3. Why must you re-think prefix caching if positions are baked into K?
> 4. How does YaRN extend context cheaply?

**Sources:** [YaRN paper](https://arxiv.org/html/2309.00071v3) · [RoPE vs ALiBi](https://metricgate.com/blogs/rope-vs-alibi-positional-encoding/) · [RoPE glossary](https://ai-solutions.daviesmeyer.com/en/glossary/rotary-position-embedding)

Related: [[Transformer Architecture Deep Dive]] · [[Attention]]
