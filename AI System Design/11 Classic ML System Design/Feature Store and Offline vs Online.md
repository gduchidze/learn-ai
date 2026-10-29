---
tags: [ai-system-design, classic-ml]
aliases: [Feature Store, Offline vs Online, Lambda Architecture, Kappa Architecture, Batch vs Stream]
---

# Feature Store and Offline vs Online

> [!success] 🟢 Junior Explanation
> **In plain words:** A feature store keeps the same input features for training and for live predictions.
>
> **Analogy:** One shared pantry for the test kitchen and the real restaurant, so dishes taste the same.
>
> **Why interviewers ask:** Prevents the classic training-serving skew bug.
>
> **Say it in one sentence:** "A feature store gives consistent features offline (batch) and online (real-time)."
>
> 🎯 **Junior must know:** why it exists. · **Middle adds:** offline vs online priorities, Lambda/Kappa hybrids.

## Feature store `[SDH]`
Processed data → features models can use; **same features for training and live predictions** → solves the **offline–online consistency** problem (training–serving skew).
Tools: **Feast**, online store **Redis**, offline warehouse **BigQuery**.

## Offline vs online `[SDH]`
| Offline (batch) | Online (real-time) |
|---|---|
| Train on large datasets at intervals | Serve predictions with pre-trained models at minimal latency |
| Compute heavy features (matrix factorization, document embeddings) | Update feature values dynamically from real-time actions |
| Store results in feature store | Instant suggestions, personalized recs |
| Prioritize **throughput & model quality** | Prioritize **latency** |

Typeahead example: offline builds **prefix indexes**; online serves suggestions from **cache**.

> [!tip] Batch–stream hybrid `[SDH]`
> **Lambda / Kappa-style** architectures merge batch and streaming views → historical depth + real-time freshness.

Trade-off `[SDH]`: batch is cheaper/easier but **stale**.

> [!question] Recall
> 1. What problem does a feature store solve?
> 2. Offline vs online priorities.

Related: [[ML System Architecture - Data Model Serving Layers]] · [[Case - Recommendation Engine]]
