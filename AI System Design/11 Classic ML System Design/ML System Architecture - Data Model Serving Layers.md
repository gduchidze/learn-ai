---
tags: [ai-system-design, classic-ml]
aliases: [ML System Architecture, Data Layer, Model Layer, Serving Layer, ML Data Flow]
---

# ML System Architecture — Data, Model, Serving Layers

> [!success] 🟢 Junior Explanation
> **In plain words:** Classic ML systems have three layers: data (collect, clean), model (train, evaluate), serving (answer requests), plus a feedback loop.
>
> **Analogy:** Farm (data) → kitchen (model) → restaurant (serving), with customer feedback improving the recipes.
>
> **Why interviewers ask:** Some interviews are classic ML (recommendations, fraud), not LLMs.
>
> **Say it in one sentence:** "Data flows from ingestion to features, training, validation, deployment and monitoring, and feedback becomes new training data."
>
> 🎯 **Junior must know:** the three layers and the data flow. · **Middle adds:** training-serving skew, freshness, feedback loops.

`[SDH]` view: interviews focus on how you architect **data ingestion, training, deployment, inference** for scalability, efficiency, fault tolerance — infrastructure for **continuous learning, high-throughput processing, low-latency inference**.

## Three (+1) layers `[SDH]`
| Layer | Role |
|---|---|
| **Data** | Collection, storage, preprocessing; raw → features; consistent serving via **feature store** |
| **Model** | Train, validate, update; feature engineering, algorithm selection, evaluation, distributed training (e.g. MoE) |
| **Serving** | Real-time inference via APIs; monitoring, logging, feedback loops; may implement **MCP** for agents |
| *(Orchestration)* | Multi-agent workflows & tool use in advanced setups |

```
Sources -> Ingestion -> Feature Store -> Offline Training -> Registry/Eval -> Serving (API) -> Users
                ^                                                              |
                +------------------ monitoring & feedback loop ----------------+
```

## End-to-end data flow `[SDH]`
1. **Ingestion** — user logs, sensors.
2. **Preprocessing** — clean, extract features.
3. **Storage** — data lakes, vector databases.
4. **Training** — distributed computation.
5. **Validation** — on unseen data.
6. **Deployment** — inference API.
7. **Monitoring** — accuracy, drift.
8. **Feedback loop** — new data → retraining.
Be able to articulate how a raw event → prediction → **next model's training example**.

> [!warning] Training–serving skew `[SDH]`
> Training code ≠ real-time inference code → silent quality loss. Emphasize a **unified feature store**.

## Requirements to clarify `[SDH]`
Data types (images, text, transactions), latency for predictions, retraining frequency, how feedback is incorporated; for LLM apps: **context window limits** and need for **long-term memory** across sessions.

## Data freshness `[SDH]`
Stale features reduce relevance. **Streaming updates** refresh immediately; **micro-batching** = near-real-time alternative; **versioned datasets** recover from corruption.

> [!question] Recall
> 1. Three layers and their roles.
> 2. 8-step data flow.
> 3. What is training–serving skew and its fix?

Related: [[Feature Store and Offline vs Online]] · [[Classic ML Components]] · [[Case - Recommendation Engine]]
