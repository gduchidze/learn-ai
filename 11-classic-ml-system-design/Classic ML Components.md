---
tags: [ai-system-design, classic-ml, mlops]
aliases: [Model Registry, Training Pipeline, Real-time Inference Pipeline, Key Components of an AI System]
---

# Classic ML Components

> [!success] 🟢 Junior Explanation
> **In plain words:** The standard building blocks of an ML pipeline: ingestion, feature store, training, registry, serving, monitoring.
>
> **Analogy:** Stations on a factory floor.
>
> **Why interviewers ask:** Lets you name concrete tools in classic ML designs.
>
> **Say it in one sentence:** "An ML system needs ingestion, a feature store, a training pipeline, a model registry, serving, and monitoring with feedback."
>
> 🎯 **Junior must know:** the six component names. · **Middle adds:** tools per component and the real-time hot path.

`[SDH]` building blocks of the end-to-end pipeline:

| Component | Purpose | Tools |
|---|---|---|
| **Data ingestion & preprocessing** | Collect; handle missing values, outliers, standardize; tokenize text | Kafka, Airflow, Spark |
| **Feature store** | Consistent offline/online features | Feast, Redis, BigQuery |
| **Training pipeline** | Train at scale on GPUs/TPUs; backprop; distributed | TensorFlow, PyTorch, Ray, Kubeflow |
| **Model registry** | Versions + metadata, hyperparameters, lineage → easy **rollback** | MLflow, SageMaker Model Registry |
| **Serving & inference** | Deploy, scale, route; agents may call tools | TF Serving, FastAPI, ONNX Runtime |
| **Monitoring & feedback** | Performance, drift, bias; feedback improves models | Prometheus, Grafana, Evidently AI |

## Real-time inference pipeline (hot path) `[SDH]`
```
Client -> Inference API -> Feature Store (+ caches) -> Model Server -> prediction -> cache -> Client
```
**Micro-batching** processes several requests together without much added latency.
Example: fraud detection — payment arrives, fetch customer history, run model, approve/flag **within milliseconds**.

> [!question] Recall
> Name the six components with one tool each; trace the fraud-detection hot path.

Related: [[ML System Architecture - Data Model Serving Layers]] · [[Model Deployment Strategies]] · [[Fine-Tuning and LoRA]]
