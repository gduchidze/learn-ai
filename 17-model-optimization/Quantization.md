---
tags: [ai-system-design, optimization, core-track]
aliases: ["04 Quantization", Model Quantization, INT8, FP8, AWQ, GPTQ, GGUF, QLoRA]
---

# 04 · Quantization

> [!success] 🟢 Junior Explanation
> **In plain words:** Store the model's numbers with fewer bits so it's smaller and faster, with a small quality loss.
>
> **Analogy:** Saving a photo as a smaller JPEG: a bit less detail, much smaller file.
>
> **Why interviewers ask:** Common answer to 'the model doesn't fit' or 'make it cheaper'.
>
> **Say it in one sentence:** "Quantization lowers precision (e.g. 16→4-bit), shrinking a 70B model from 140 GB to 35 GB and speeding up decode."
>
> 🎯 **Junior must know:** the memory math (params × bytes). · **Middle adds:** why decode gets faster, formats, KV quantization, PTQ vs QAT.

> Core track #04 — Storing weights in fewer bits, scale and zero point, PTQ vs QAT, GPTQ / AWQ / SmoothQuant, effect on inference and the KV cache.

## Definition `[OS]`
**Model quantization** = storing and computing a model's numbers at **lower precision** (16/32-bit floats → **8-bit or 4-bit**) → smaller, faster, small quality drop.

Example `[OS]`: **Llama 70B @16-bit = 140 GB → @4-bit = 35 GB** → fits **one** A100 instead of two.
`[SDH]`: e.g. **FP16 → INT8** reduces memory and speeds inference.

## Why it speeds up decode `[OS]`
Decode is **memory-bandwidth-bound** — every token streams all weights. Smaller weights ⇒ **less data moved per token** ⇒ faster decode.

## Formats `[OS]`
**INT8, FP8, AWQ, GPTQ, GGUF** (GGUF = llama.cpp single-file format, common for local/edge).

## KV cache quantization `[OS]`
Fewer bits per cached number → **2–4×** KV memory saving, no retraining, very little quality loss (e.g. **KIVI**). Quick win for existing models → [[KV Cache]].

## Edge `[OS]`
SLMs (1B–8B) quantized to **4-bit or even 2-bit** for phones/laptops → [[Edge AI and On-Device Inference]].

## QLoRA `[OS]`
LoRA fine-tuning variant on a quantized base → [[Fine-Tuning and LoRA]].

## Quantization vs distillation `[OS]`
Quantization keeps the **same model**, shrinks precision. Distillation creates a **new smaller model** → [[Model Distillation]].

> [!note] Beyond the sources — mechanics & methods
> - **Scale & zero point**: map float range → integer range: `q = round(x / scale) + zero_point`, `x ≈ (q − zero_point) · scale`. Symmetric quantization uses zero_point = 0.
> - **PTQ (Post-Training Quantization)**: quantize an already-trained model with a small calibration set — cheap, most common for LLMs.
> - **QAT (Quantization-Aware Training)**: simulate quantization during training so the model adapts — better quality at very low bits, costs training.
> - **GPTQ**: PTQ that quantizes weights layer-by-layer, compensating error using second-order info.
> - **AWQ** (Activation-aware Weight Quantization): protects the small set of weights most important to activations.
> - **SmoothQuant**: shifts activation outliers into weights so both weights and activations can be INT8 (W8A8).

## Trade-offs
- ✅ Memory, cost, decode speed, fits fewer GPUs `[OS]`.
- ❌ Small quality drop; more at 2–4 bits `[OS]`.

## 🌐 Deeper Context `[WEB]`

The "Beyond the sources" methods above, now **web-checked**:

| Method | What is quantized | Typical bits | Core idea | Use when |
|---|---|---|---|---|
| **GPTQ** | Weights only | 3–4 bit | Quantize layer by layer, compensate error with **second-order** information (can overfit the calibration set) | Fast weight-only 4-bit for GPU serving |
| **AWQ** | Weights only | 4 bit | Find the **~1% salient channels** using activation magnitudes and protect them; needs little calibration data; often matches/beats GPTQ at int4 | Weight-only 4-bit with robust quality |
| **SmoothQuant** | Weights **and** activations (W8A8) | 8 bit | Activations have **outliers**; "smooth" them by migrating the difficulty into the weights (tunable α) | Use INT8 math kernels end-to-end (reported up to ~1.56× speedup, 2× memory saving) |
| **QLoRA / NF4** | Base weights for fine-tuning | 4 bit | **NF4** data type for normally-distributed weights + **double quantization** + **paged optimizers** | Fine-tune huge models on one GPU |

> [!example] QLoRA in numbers
> Full 16-bit fine-tuning of LLaMA-65B needs **> 780 GB** of GPU memory. QLoRA fine-tunes a **65B model on a single 48 GB GPU** while matching 16-bit fine-tuning quality (Dettmers et al., NeurIPS 2023).

**Sources:** [Quantization for inference: GPTQ, AWQ, SmoothQuant, FP8](https://www.generalcompute.com/blog/quantization-for-inference-gptq-awq-smoothquant-fp8) · [BentoML quantization guide](https://bentoml.com/llm/getting-started/llm-quantization) · [SmoothQuant+ paper](https://arxiv.org/pdf/2312.03788) · [QLoRA (NeurIPS 2023)](https://proceedings.neurips.cc/paper_files/paper/2023/hash/1feb87871436031bdc0f2beaa62a049b-Abstract.html) · [HF: 4-bit & QLoRA](https://huggingface.co/blog/4bit-transformers-bitsandbytes)


> [!question] Recall
> 1. Compute memory: 13B model at FP16 vs 4-bit. (26 GB → 6.5 GB)
> 2. Why does quantization speed decode specifically?
> 3. PTQ vs QAT; GPTQ vs AWQ (beyond sources).
> 4. KV quantization vs weight quantization.

Related: [[Inference Optimization - Overview]] · [[Prefill vs Decode]]

➡️ **Go deeper:** [[Low-Precision Inference]]
