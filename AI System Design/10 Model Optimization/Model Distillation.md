---
tags: [ai-system-design, optimization]
aliases: [Knowledge Distillation, Distillation, Teacher Student]
---

# Model Distillation

> [!success] 🟢 Junior Explanation
> **In plain words:** Train a small 'student' model to copy a big 'teacher' model on a specific task.
>
> **Analogy:** An apprentice learning one dish perfectly from a master chef.
>
> **Why interviewers ask:** Cost and edge-deployment questions.
>
> **Say it in one sentence:** "Distillation creates a smaller, cheaper model that matches the teacher on narrow tasks."
>
> 🎯 **Junior must know:** the teacher/student idea. · **Middle adds:** distillation vs quantization and when it fails (general tasks).

## Idea `[OS]`
Train a small **student** to imitate a big **teacher**.
1. Pick teacher (e.g. GPT-5.5, Claude Opus 4.8).
2. Feed many prompts; capture **answers and soft probabilities**.
3. Train student to produce same outputs on same inputs.
4. Deploy student.
Student often **10–100× smaller**, cheaper, faster; on **narrow tasks** can match/approach teacher. DeepSeek-R1 distilled variants approached GPT-4-class reasoning on many benchmarks in laptop-sized models.

## vs Quantization `[OS]`
Quantization = same model, lower precision. Distillation = **brand-new smaller model**.

## When `[OS]`
High-volume narrow task (classification, summarization, extraction) · big model too costly per token · edge devices · predictable low latency.
**Catch**: small student can't match teacher across the full range; for general intelligence keep the big model.

> [!question] Recall
> When distill vs quantize vs route?

Related: [[Edge AI and On-Device Inference]] · [[Quantization]] · [[Cost Optimization]]
