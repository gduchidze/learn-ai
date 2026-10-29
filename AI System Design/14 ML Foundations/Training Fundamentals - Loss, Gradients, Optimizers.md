---
tags: [ai-system-design, ml-foundations, training]
aliases: [Backpropagation, Gradient Descent, Cross-Entropy, Adam, AdamW, Learning Rate Schedule, Softmax Gradient]
---

# Training Fundamentals — Loss, Gradients, Optimizers

> [!success] 🟢 Junior Explanation
> **In plain words:** Training = repeat: (1) predict, (2) measure how wrong (loss), (3) compute which way to nudge each weight to be less wrong (gradient — via backprop), (4) nudge by a small step (optimizer).
>
> **Analogy:** Walking downhill in fog: feel the slope under your feet (gradient), take a step (learning rate), repeat.
>
> **Say it in one sentence:** "I minimize cross-entropy with AdamW, using warmup + decay on the learning rate, gradient clipping, and mixed precision."
>
> 🎯 **Junior must know:** loss, gradient, learning rate, epoch/batch. · **Middle adds:** softmax+CE gradient, Adam update, warmup, clipping, why bf16.

## 1. Loss for language models
Next-token prediction: model outputs logits $z\in\mathbb{R}^V$; probabilities via softmax:
$$p_i=\frac{e^{z_i}}{\sum_j e^{z_j}},\qquad L=-\log p_{y}$$
(**cross-entropy** with one-hot target $y$ = −log probability of the correct token).
- Random guess over vocab $V=50{,}000$: $L=\ln 50000\approx 10.8$ nats.
- **Perplexity** $=e^{L}$ ≈ "effective number of equally likely choices".
- Training objective is averaged over all positions (teacher forcing: every position predicts the next token in parallel).

## 2. The key gradient (whiteboard classic)
For softmax + cross-entropy, the gradient wrt logits is beautifully simple:
$$\frac{\partial L}{\partial z_i}=p_i-y_i$$
"Predicted probability minus target." Wrong-class logits get pushed down by $p_i$; the correct-class logit pushed up by $1-p_y$.

## 3. Backprop = chain rule
For $y=f(g(x))$: $\frac{dy}{dx}=f'(g(x))\,g'(x)$. A network is a long composition; backprop computes all gradients in **one backward pass** by reusing intermediate results.
- Cost: backward ≈ **2×** forward FLOPs → training ≈ **3×** forward = **6ND** `[WEB]` → [[Pretraining - Scaling Laws and Compute Math]].
- Memory: must store **activations** from the forward pass → **gradient checkpointing** trades recompute for memory → [[Distributed Training - Memory, ZeRO and Parallelism]].
- **Vanishing/exploding gradients:** repeated multiplication shrinks/blows up signals; fixes: residual connections, normalization, good init, gradient clipping.

## 4. Gradient descent family
$$\theta \leftarrow \theta-\eta\,\nabla_\theta L$$
| Variant | Notes |
|---|---|
| Batch GD | Whole dataset per step — too slow |
| **Mini-batch SGD** | Standard; noise helps escape sharp minima |
| Momentum | Smooths direction using running average of gradients |
| **Adam** | Per-parameter adaptive step: momentum (m) + running squared-gradient (v) |
| **AdamW** | Adam with **decoupled weight decay** — default for LLMs `[WEB]` |

### Adam update
$$m_t=\beta_1 m_{t-1}+(1-\beta_1)g_t,\quad v_t=\beta_2 v_{t-1}+(1-\beta_2)g_t^2$$
$$\hat m_t=\frac{m_t}{1-\beta_1^t},\ \hat v_t=\frac{v_t}{1-\beta_2^t},\quad \theta\leftarrow\theta-\eta\,\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon}$$
Typical LLM recipe `[WEB]`: **β₁=0.9, β₂=0.95, weight decay 0.1, grad-clip norm 1.0**.
Memory cost: Adam keeps **two extra fp32 tensors (m, v)** per parameter → big part of the **16 bytes/param** → [[Distributed Training - Memory, ZeRO and Parallelism]].

## 5. Learning-rate schedule
```
LR
peak |      ____
     |     /    \____
     |    /          \____        cosine decay
     |   /                \___
 0   |__/ warmup (1–10% of steps)   → min LR
     +------------------------------> steps
```
- **Warmup** avoids early instability (Adam's v estimate is noisy at first).
- **Cosine decay** or **WSD (warmup–stable–decay)** are both used `[WEB]`.
- **Batch size ↔ LR:** larger batch usually allows larger LR (rough linear/√ scaling heuristics `[GEN]`).

## 6. Mixed precision
Forward/backward in **bf16** (same exponent range as fp32, fewer mantissa bits → no loss scaling needed), keep **fp32 master weights** and optimizer states. fp16 has smaller range → needs loss scaling. FP8 training exists on H100 (E4M3 forward, E5M2 gradients) `[WEB]` → [[Low-Precision Inference]].

## 7. Initialization & normalization (why training doesn't explode)
Keep activation variance stable across layers (Xavier/He init); LayerNorm/RMSNorm re-center/scale activations → [[Neural Network Building Blocks]].

## 8. Debug checklist `[GEN]`
| Symptom | Likely cause |
|---|---|
| Loss = NaN | LR too high, fp16 overflow, bad data, no clipping |
| Loss flat | LR too low, dead activations, bug in labels |
| Train ↓ val ↑ | Overfitting → more data / regularization |
| Loss spikes | LR too high at peak, bad batch, optimizer state issue → clip, lower LR, skip batch |

> [!question] Recall
> 1. Derive $\partial L/\partial z_i=p_i-y_i$.
> 2. Why does Adam need bias correction?
> 3. Why warmup? Why bf16 over fp16?
> 4. Why is training ≈ 3× the cost of a forward pass?

**Sources:** [Optimization fundamentals for LLMs](https://pub.towardsai.net/optimization-fundamentals-for-training-large-language-models-c1eb2a61a88a) · [GradPower paper (recipe β₁=0.9, β₂=0.95, wd 0.1)](https://arxiv.org/pdf/2505.24275) · [Optimizer benchmark (W&B)](https://wandb.ai/semenov-andrei-v/llm-optimizer-benchmark/reports/Benchmarking-Optimizers-for-Large-Language-Model-Pretraining--VmlldzoxNDc1NDM0Ng)

Related: [[ML Basics - Learning, Generalization and Metrics]] · [[Neural Network Building Blocks]]
