---
tags: [ai-system-design, rag, pipeline]
aliases: [Embedding Pipeline, Re-embedding, Indexing Pipeline]
---

# Embeddings Pipeline

> [!success] 🟢 Junior Explanation
> **In plain words:** A background job that chunks and embeds all documents and keeps them updated.
>
> **Analogy:** A factory line: documents in one end, searchable vectors out the other.
>
> **Why interviewers ask:** Millions of chunks can't be embedded on request.
>
> **Say it in one sentence:** "An incremental batch pipeline embeds only new or changed chunks, and re-embeds everything when the model changes."
>
> 🎯 **Junior must know:** incremental processing. · **Middle adds:** tools by data size (script, Celery/BullMQ, Spark/Dask).

1M documents × 10 chunks = **10M embeddings** → a big batch job `[OS]`.

```
Source Data (S3, DB, web) -> Chunker -> Embedding Model -> Vector DB (+ metadata)
```

## Tooling by scale `[OS]`
| Data size | Tool |
|---|---|
| Very large | Apache **Spark** or **Dask** (distributed) |
| Medium | Worker queue: **Celery** (Python), **BullMQ** (Node) |
| Small | Simple script |

## Re-embedding `[OS]`
- Source document changes → re-embed **changed chunks**.
- Embedding model changes → re-embed **everything**.
> [!tip] Good pipeline is **incremental** — only process new/changed data `[OS]`.

Run it behind a queue for uploads → [[Async Processing and Message Queues]]. Cache vectors → [[Embedding Cache]]. Classic analog: offline batch computes embeddings and stores in feature store `[SDH]` → [[Feature Store and Offline vs Online]].

> [!question] Recall
> 1. What triggers partial vs full re-embedding?
> 2. Which tool for 50k docs vs 500M docs?

Related: [[Document Parsing and Chunking]] · [[Embeddings and Embedding Models]]
