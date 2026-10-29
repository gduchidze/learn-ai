---
tags: [ai-system-design, case-study, classic-ml]
aliases: [Recommendation Engine Design, Two-Tower]
---

# Case — AI-Powered Recommendation Engine `[SDH]`

> [!success] 🟢 Junior Explanation
> Idea in one line: **quickly pick ~1,000 candidate products, then carefully rank them and show the top few**; cache popular results; feedback updates features. Like a shop assistant who first grabs a pile of possible items, then picks the best for you.

## 1. Requirements
Personalized product recs, **near-real-time** updates as behavior changes, served **< 200 ms**, accurate, scalable, reliable.

## 2. Architecture
| Function  | Choice                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Ingestion | Clickstream + purchases via **Kafka**                                                                        |
| Storage   | Raw logs in **S3**; user profiles in **Cassandra**                                                           |
| Training  | **Two-Tower** (User Tower + Item Tower) for **retrieval**, then **ranking** model (XGBoost or deep learning) |
| Serving   | TensorFlow Serving or FastAPI                                                                                |
| Caching   | Frequent recs in **Redis**                                                                                   |

## 3. Workflow
1. User logs in.
2. Fetch **cached** recs; on miss → retrieval layer picks **1,000 candidates via vector search**.
3. Ranking layer scores candidates with costlier model → **top N**.
4. Feedback streamed via **Kafka** → **asynchronously** updates features.

## Concepts exercised
Retrieval → ranking funnel (same shape as [[Hybrid Search, HyDE, Reranking, ColBERT|retrieve-then-rerank]]), [[Feature Store and Offline vs Online]], freshness via streaming, caching + invalidation, privacy/compliance.

> [!question] Drill
> Why two stages (retrieval then ranking)? Where would training–serving skew bite here?

Related: [[ML System Architecture - Data Model Serving Layers]] · [[Classic ML Components]]
