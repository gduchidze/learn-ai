---
tags: [ai-system-design, meta, roadmap]
aliases: [Gap Analysis, What is Left, Interview Loop Map]
---

# Gap Analysis — What Was Missing for AI / Inference Engineer Roles

> [!success] 🟢 Junior Explanation
> **In plain words:** The first 106 notes teach you to **design AI systems** (RAG, agents, gateways, caches). Big-tech **AI Engineer** and **Inference Engineer** loops also test two more things: (1) **do you understand how the model works inside**, and (2) **do you understand how the GPU runs it**. This note shows what was missing and where it now lives.
>
> **Say it in one sentence:** "System design tells you what to build around the model; ML foundations tell you why the model behaves that way; inference engineering tells you why it's fast or slow on a GPU."

## The typical loop (indicative `[WEB]` `[GEN]`)
Prep guides for inference roles describe rounds like: **coding** (sometimes a small attention kernel or KV-cache allocator), **ML / LLM fundamentals**, **inference/system design**, and **behavioral**. Typical questions: *why is decode memory-bound and prefill compute-bound? how would you serve a 70B model on 4×A100-80GB? TP=2 vs TP=4? KV-cache memory formula? PagedAttention, GQA, quantized KV?* Senior roles may expect Triton/CUDA and **roofline** reasoning. Advice: name the bottleneck (compute / memory / communication / scheduler), quantify the trade-off, avoid vague claims like "quantization makes it faster".
> Caveat: these come from SEO-style prep sites and job posts — indicative, not verified company interviews.

## Coverage map
| Interview area | Before | Now |
|---|---|---|
| AI system design (RAG, agents, gateway, safety, eval, cost) | ✅ strong | ✅ [[AI System Design - Home]] |
| Classic ML system design (feature store, ranking, fraud) | ✅ | ✅ |
| **ML / DL fundamentals** (loss, gradients, optimizers, regularization, metrics) | ❌ | ✅ [[ML Basics - Learning, Generalization and Metrics]] · [[Training Fundamentals - Loss, Gradients, Optimizers]] · [[Neural Network Building Blocks]] |
| **LLM internals** (tokenizer, transformer shapes, params, positional encoding) | ⚠️ partial | ✅ [[Tokenization and Embeddings Internals]] · [[Transformer Architecture Deep Dive]] · [[Positional Encodings - RoPE, ALiBi and Long Context]] |
| **Training at scale** (scaling laws, 6ND, ZeRO/FSDP, parallelism) | ❌ | ✅ [[Pretraining - Scaling Laws and Compute Math]] · [[Distributed Training - Memory, ZeRO and Parallelism]] |
| **Post-training** (SFT, RLHF, DPO) | ⚠️ one paragraph | ✅ [[Post-Training - SFT, RLHF and DPO]] |
| **Decoding / sampling** | ⚠️ | ✅ [[Decoding and Sampling]] |
| **GPU architecture, roofline** | ⚠️ concept only | ✅ [[GPU Architecture for Inference Engineers]] · [[Roofline and Performance Modeling]] |
| **Parallelism for inference** (TP/PP/EP, all-reduce) | ⚠️ | ✅ [[Parallelism for Inference]] |
| **Kernels, fusion, CUDA graphs** | ❌ | ✅ [[Kernels, Fusion and CUDA Graphs]] |
| **Engine internals** (scheduler, block manager) | ❌ | ✅ [[Inference Engine Internals]] |
| **Low precision** (FP8, FP4, scales) | ⚠️ | ✅ [[Low-Precision Inference]] |
| **Long context / MLA / KV offload** | ⚠️ | ✅ [[Long Context and KV Cache Engineering]] |
| **MoE serving** | ⚠️ | ✅ [[MoE Serving and Expert Parallelism]] |
| **Benchmarking & profiling methodology** | ❌ | ✅ [[Benchmarking and Profiling Methodology]] |
| **Capacity planning, $/M tokens** | ⚠️ | ✅ [[Capacity Planning and Cost per Million Tokens]] |
| **Drills & Q&A** | ⚠️ | ✅ [[LLM Internals and ML Foundations Q&A]] · [[Inference Engineer Interview Q&A]] · [[Inference Whiteboard Drills]] · [[LLM Math Cheat Sheet]] |

## Still not covered (be honest about limits)
- **Writing real CUDA/Triton code** — notes explain the concepts; you must practice coding (matmul tiling, softmax, attention) on a GPU or in a notebook.
- **Company-specific loops** (exact questions change).
- **Training-infra deep dives** (fault tolerance at 16k GPUs, data pipelines) beyond the basics.
- **Multimodal/diffusion internals**, **speech models** internals.
- **Hands-on** profiling (Nsight) — only the methodology is here.

## Study order for an Inference Engineer
1. [[Transformer Architecture Deep Dive]] → [[LLM Math Cheat Sheet]]
2. [[GPU Architecture for Inference Engineers]] → [[Roofline and Performance Modeling]]
3. [[Prefill vs Decode]] → [[KV Cache]] → [[Long Context and KV Cache Engineering]]
4. [[Parallelism for Inference]] → [[MoE Serving and Expert Parallelism]]
5. [[Kernels, Fusion and CUDA Graphs]] → [[Inference Engine Internals]] → [[Low-Precision Inference]]
6. [[Benchmarking and Profiling Methodology]] → [[Capacity Planning and Cost per Million Tokens]]
7. Drill: [[Inference Whiteboard Drills]] → [[Inference Engineer Interview Q&A]]

## Study order for an AI Engineer (ML-foundation round)
1. [[ML Basics - Learning, Generalization and Metrics]] → [[Training Fundamentals - Loss, Gradients, Optimizers]] → [[Neural Network Building Blocks]]
2. [[Tokenization and Embeddings Internals]] → [[Transformer Architecture Deep Dive]] → [[Positional Encodings - RoPE, ALiBi and Long Context]]
3. [[Pretraining - Scaling Laws and Compute Math]] → [[Distributed Training - Memory, ZeRO and Parallelism]] → [[Post-Training - SFT, RLHF and DPO]] → [[Decoding and Sampling]]
4. Drill: [[LLM Internals and ML Foundations Q&A]]

**Sources:** [AI inference interview prep 2026](https://www.techinterview.org/post/3233475331/ai-inference-infrastructure-interview-prep-2026-vllm-triton/) · [Fireworks AI interview guide](https://www.techinterview.org/companies/fireworks-ai/?format=md) · [50 LLM & AI engineer questions](https://letsdatascience.com/blog/50-llm-and-ai-engineer-interview-questions-for-2026)

Back to [[AI System Design - Home]]
