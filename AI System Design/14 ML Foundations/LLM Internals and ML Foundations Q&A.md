---
tags: [ai-system-design, ml-foundations, interview]
aliases: [ML Foundation Interview Questions, LLM Internals Questions, ML Fundamentals Q&A]
---

# LLM Internals and ML Foundations — Q&A (50)

> [!success] 🟢 Junior Explanation
> Cover the answer, say yours out loud in ~30–60 s, then compare. Every answer = **what + why + one number/trade-off**.

## A. ML basics
**1. Overfitting — how to detect and fix?** Train error ≪ validation error. Fix: more data, regularization (weight decay, dropout), simpler model, early stopping, augmentation. → [[ML Basics - Learning, Generalization and Metrics]]
**2. Bias–variance?** Error = bias² + variance + noise. Simple models: high bias; complex: high variance; tune complexity/regularization.
**3. Why accuracy fails on imbalanced data?** 0.1% fraud: predict "no" → 99.9% accuracy, 0 recall. Use precision/recall, PR-AUC, cost-based thresholds.
**4. Precision vs recall — when each?** Precision when false alarms are costly; recall when misses are costly; F1 to balance; threshold is a business decision.
**5. What is data leakage? Example.** Info unavailable at prediction time leaks into training: random split of time-series, label-derived features, duplicates, benchmark contamination.
**6. L1 vs L2 regularization?** L1 → sparse weights; L2/weight decay → small weights. In AdamW weight decay is *decoupled* from the adaptive update (typical 0.1).
**7. Train/val/test purpose?** Fit / tune / unbiased final estimate (touch test once).
**8. When prefer gradient-boosted trees over deep nets?** Tabular data of small/medium size — strong, fast, interpretable.

## B. Training mechanics
**9. Gradient of softmax+cross-entropy wrt logits?** $p-y$ (predicted prob minus one-hot target). → [[Training Fundamentals - Loss, Gradients, Optimizers]]
**10. Cross-entropy and perplexity?** CE = −log p(correct token); perplexity = exp(avg CE) ≈ effective branching factor. Random over 50k vocab ≈ 10.8 nats.
**11. Explain backprop.** Chain rule through the computation graph; one backward pass reuses forward intermediates; cost ≈ 2× forward.
**12. Why is training ≈ 6ND FLOPs?** Forward 2N + backward 4N per token. `[WEB]`
**13. Adam in one breath?** Per-parameter step = momentum / √(running squared grads), with bias correction; AdamW decouples weight decay; LLM recipe β=(0.9,0.95), wd 0.1, clip 1.0.
**14. Why LR warmup?** Early second-moment estimates are noisy and gradients large → instability; ramp from ~0 over 1–10% of steps.
**15. bf16 vs fp16?** bf16 keeps fp32's exponent range (no loss scaling), less mantissa; fp16 needs loss scaling. Keep fp32 master weights.
**16. Loss spikes — what do you do?** Lower LR/clip grads, skip bad batch, restart from earlier checkpoint, check data/precision.
**17. Vanishing gradients and fixes?** Repeated small multiplications; fix with residuals, normalization, good init, better activations.
**18. Batch size effects?** Larger = smoother gradient + better hardware use, may need higher LR/warmup and can hurt generalization if too large.

## C. Transformer internals
**19. Walk through one decoder layer.** RMSNorm → attention (QKV, RoPE, causal softmax, GQA) → residual add → RMSNorm → SwiGLU FFN → residual add. → [[Transformer Architecture Deep Dive]]
**20. Why divide by √d_k?** Keeps dot-product variance ≈1 so softmax doesn't saturate (tiny gradients). `[WEB]`
**21. Self vs cross attention? Causal mask?** Self: Q,K,V from same sequence; cross: Q from decoder, K,V from encoder. Causal mask sets future logits to −∞ before softmax. `[WEB]`
**22. Why multi-head?** Different heads attend to different relations/subspaces; costs the same FLOPs as one big head.
**23. MHA vs GQA vs MQA vs MLA?** KV heads: all / groups / one / compressed latent. GQA ≈ quality of MHA with ~speed of MQA; DeepSeek-V2's MLA cut KV cache 93.3% vs DeepSeek 67B. `[WEB]` → [[Grouped Query Attention]]
**24. Count parameters of Llama-style 8B.** Attention (Wq,Wk,Wv,Wo with GQA) + 3·d·d_ff FFN per layer × L + embeddings (×2 if untied) ≈ 8.03B.
**25. Why is FFN most parameters but attention most long-context cost?** FFN $8d^2$-ish per layer vs attention $4d^2$ params; attention FLOPs/memory grow with $n$ (n² compute, KV O(n)).
**26. Complexity of attention? How does FlashAttention help?** O(n²d) compute, O(n²) memory naively; Flash tiles in SRAM + online softmax → O(n) memory, fewer HBM reads, same exact result. → [[Flash Attention]]
**27. RoPE vs sinusoidal vs ALiBi?** RoPE rotates Q/K pairs (relative by construction); sinusoidal adds absolute vectors (fails past train length); ALiBi adds linear distance bias to logits. → [[Positional Encodings - RoPE, ALiBi and Long Context]]
**28. Why do models fail beyond trained context? Fixes?** Unseen rotation angles → OOD attention; fix with interpolation/NTK/YaRN + short long-context fine-tune. `[WEB]`
**29. Pre-norm vs post-norm?** Pre-norm keeps clean residual path → stable deep training. → [[Neural Network Building Blocks]]
**30. RMSNorm vs LayerNorm?** RMSNorm drops mean-centering and bias — cheaper, similar quality.
**31. Why SwiGLU?** Gating improves quality per parameter; uses 3 matrices so hidden is ≈8/3·d to keep params equal.
**32. Why decoder-only?** One objective (next token) with parallel training, same weights for generation, scales well.

## D. Tokens & embeddings
**33. How does BPE work?** Start from bytes/chars, repeatedly merge the most frequent adjacent pair until vocab size. → [[Tokenization and Embeddings Internals]]
**34. Vocab size trade-off?** Larger → shorter sequences (cheaper attention/KV) but bigger embedding/LM-head (Llama-3-8B: ~525M per table).
**35. Why do non-English prompts cost more?** Tokenizer trained mostly on English splits other scripts into more tokens.
**36. Tied embeddings?** Output matrix = embeddingᵀ — saves V·d params, common in small models.

## E. Scaling & training at scale
**37. Chinchilla in one line?** Scale params and tokens together, ≈20 tokens/param; 70B/1.4T beat Gopher-280B at equal compute. `[WEB]` → [[Pretraining - Scaling Laws and Compute Math]]
**38. Why over-train small models?** Inference dominates lifetime cost; smaller model served billions of times is cheaper.
**39. 16 bytes/param?** 2 weights + 2 grads + 4 master + 4 m + 4 v. → [[Distributed Training - Memory, ZeRO and Parallelism]]
**40. ZeRO-1/2/3?** Shard optimizer / +gradients / +parameters across DP ranks: 4Ψ+12Ψ/N, 2Ψ+14Ψ/N, 16Ψ/N.
**41. TP vs PP vs DP?** TP splits matrices (per-layer all-reduce, needs NVLink), PP splits layers (bubbles, cross-node ok), DP replicates (grad all-reduce).
**42. What is gradient checkpointing?** Recompute activations in backward instead of storing → ~33% more compute, large memory saving.
**43. What is MFU?** Achieved model FLOPs/s ÷ hardware peak; 30–55% is typical for large dense runs.

## F. Post-training & decoding
**44. SFT → RLHF → DPO?** Demonstrations → reward model + PPO with KL → direct pairwise loss. → [[Post-Training - SFT, RLHF and DPO]]
**45. Why DPO needs no reward model?** Closed-form optimal policy lets reward = β·log(π/π_ref); partition function cancels in Bradley–Terry difference. `[WEB]`
**46. Reward hacking?** Policy exploits reward-model flaws; KL penalty and better data mitigate.
**47. Temperature, top-k, top-p?** Logits/T; keep k best / smallest mass ≥ p; sample. → [[Decoding and Sampling]]
**48. Why not always greedy?** Repetition/dull; sampling gives diversity; but low T for extraction/code.
**49. T=0 yet different outputs?** Non-associative float reductions + batch-dependent kernels flip near-ties.
**50. How does speculative decoding keep exact distribution?** Accept draft w.p. min(1, p/q), else resample from the residual distribution. `[WEB]` → [[Speculative Decoding]]

Related: [[ML Foundations Roadmap]] · [[Inference Engineer Interview Q&A]] · [[Interview Question Bank]]
