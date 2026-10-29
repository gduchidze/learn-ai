---
tags: [ai-system-design, ml-foundations, decoding]
aliases: [Temperature, Top-k, Top-p, Nucleus Sampling, Greedy, Beam Search, Sampling, Logit Processors]
---

# Decoding and Sampling

> [!success] 🟢 Junior Explanation
> **In plain words:** At each step the model gives a score (logit) to every token. **Decoding** is how we pick one: always the highest (greedy), or randomly by probability. **Temperature** makes it more/less random; **top-k / top-p** cut off unlikely tokens.
>
> **Analogy:** Choosing a restaurant: always the top-rated (greedy), or roll a die weighted by ratings (sampling). Temperature = how adventurous you feel.
>
> **Say it in one sentence:** "Divide logits by temperature, keep the top-k or the top-p mass, renormalize, then sample — greedy is the T→0 limit."
>
> 🎯 **Junior must know:** temperature, why outputs vary. · **Middle adds:** implementation, interaction with speculative decoding/structured output, determinism.

## 1. From logits to token
$$p_i=\frac{e^{z_i/T}}{\sum_j e^{z_j/T}}$$
| $T$ | Effect |
|---|---|
| →0 | Greedy (argmax), deterministic-ish |
| 1 | Model's native distribution |
| >1 | Flatter, more random/creative, more errors |

## 2. Methods
| Method                                | How                                           | Notes                                                |
| ------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| **Greedy**                            | argmax                                        | Repetitive; best for extraction/code with low T      |
| **Beam search**                       | Keep top-B sequences by cumulative log-prob   | Good for translation; dull for chat; B× compute & KV |
| **Top-k**                             | Sample among k highest                        | Fixed k ignores distribution shape                   |
| **Top-p (nucleus)**                   | Smallest set with cumulative prob ≥ p         | Adapts to confidence                                 |
| **Min-p**                             | Keep tokens with $p_i\ge \alpha\cdot p_{max}$ | Robust at high T `[GEN]`                             |
| **Repetition/frequency penalties**    | Subtract from logits of seen tokens           | Reduces loops                                        |
| **Logit bias / constrained decoding** | Mask illegal tokens (e.g. JSON grammar)       | → [[Structured Output]]                              |

## 3. Reference implementation `[GEN]`
```python
import numpy as np

def sample(logits, temperature=1.0, top_k=0, top_p=1.0, rng=np.random.default_rng()):
    if temperature == 0:                       # greedy
        return int(np.argmax(logits))
    z = logits / temperature
    if top_k > 0:                              # keep k highest
        kth = np.sort(z)[-top_k]
        z = np.where(z < kth, -np.inf, z)
    p = np.exp(z - z.max()); p /= p.sum()      # softmax (stable)
    if top_p < 1.0:                            # nucleus
        order = np.argsort(-p)
        cum = np.cumsum(p[order])
        cutoff = np.searchsorted(cum, top_p) + 1
        keep = order[:cutoff]
        mask = np.zeros_like(p); mask[keep] = 1
        p = p * mask; p /= p.sum()
    return int(rng.choice(len(p), p=p))
```
Order commonly: penalties → temperature → top-k → top-p → sample.

## 4. Why outputs still vary at T=0
Floating-point **non-associativity** (parallel reductions in different orders), **batch-dependent kernels** (different batch composition changes reduction order), MoE routing ties → tiny logit differences flip near-ties. "Deterministic" serving requires fixed batch-invariant kernels `[GEN]` → matters for evals and caching.

## 5. Systems interactions
| Topic | Interaction |
|---|---|
| **Speculative decoding** | With sampling, accept draft token with prob $\min(1,p_{target}/q_{draft})$ (rejection sampling) so output distribution equals the target's `[WEB]` → [[Speculative Decoding]] |
| **Structured output** | Compile schema to a grammar; mask logits each step; adds per-step CPU cost → [[Structured Output]] |
| **Beam search / n>1** | Multiple sequences share prefix KV (copy-on-write in PagedAttention) → [[KV Cache]] |
| **Streaming & stop sequences** | Detokenize incrementally; stop strings can span tokens |
| **Logprobs** | Return token log-probs for evals, confidence, routing ([[LLM Routing]] cascades) |
| **Reasoning models** | Often recommend specific T/top-p; hidden thinking tokens billed → [[Test-Time Compute]] |

## 6. Choosing settings
| Task | Suggestion |
|---|---|
| Extraction, classification, JSON | T=0–0.2 |
| Code | T≈0–0.3 |
| Chat | T≈0.5–0.8, top-p≈0.9 |
| Creative | T≈0.8–1.1, top-p 0.95 |
| Majority voting / self-consistency | T>0 with n samples → pick most common |

> [!question] Recall
> 1. Show that temperature→0 gives greedy.
> 2. Top-k vs top-p — when does top-k fail?
> 3. Why can T=0 outputs differ between runs?
> 4. How does speculative decoding preserve the sampling distribution?

Related: [[LLM Recap - Tokens and Autoregression]] · [[Latency and Cost Metrics]]
