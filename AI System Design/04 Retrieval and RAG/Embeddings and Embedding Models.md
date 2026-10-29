---
tags: [ai-system-design, rag, embeddings]
aliases: [Embeddings, Embedding Model, Matryoshka Embeddings]
---

# Embeddings and Embedding Models

> [!success] 🟢 Junior Explanation
> **In plain words:** An embedding turns text into a list of numbers that captures its meaning. Similar meanings = numbers close together.
>
> **Analogy:** GPS coordinates on a 'meaning map': 'dog' lives near 'puppy', far from 'invoice'.
>
> **Why interviewers ask:** Embeddings power search, RAG, semantic cache and routing.
>
> **Say it in one sentence:** "Embeddings map text to vectors so we can search by meaning using cosine similarity."
>
> 🎯 **Junior must know:** what an embedding is and cosine similarity. · **Middle adds:** choosing a model (task, language, cost, privacy), Matryoshka, re-embedding cost of switching.

## Embedding `[OS]`
A long list of numbers (typically **768, 1024, 1536, or 3072** dims) representing text so that **similar meanings sit close together** → enables **semantic search** (by meaning, not exact words). Images can be embedded too.

Similarity: **cosine similarity** (do vectors point the same direction) or **dot product** (multiply & sum). Both give one sortable score `[OS]`.

## Choosing an embedding model (2026) `[OS]`
| Model | Strength |
|---|---|
| **Voyage 4 Large** | Near top of leaderboard for English RAG; MoE architecture → lower serving cost. Teams move here when quality > cost. |
| **OpenAI text-embedding-3-small/large** | Cheap, simple, good enough. 3-small = **$0.02 / M tokens**. |
| **Cohere embed-v4** | 100+ languages; multimodal (text+images); task-typed embeddings (query/document/classification/clustering); Matryoshka support. |
| **Gemini Embedding 2** | Natively multimodal (text, image, video, audio, PDF) in one space; default 3072-dim, truncatable to 768/1536. |
| **BGE-M3 / Jina v5** (open source) | Self-host / data privacy. |

Choose by **task type, language, budget, privacy** `[OS]`.

> [!warning] Decision has gravity `[OS]`
> Switching embedding model = **re-embed everything**.

## Matryoshka embeddings `[OS]`
Trained so you can **truncate** to a smaller dimension without retraining. Store full 3072-d once; first-pass search with first 256/512 dims; re-rank with full vector. Memory-vs-quality knob without maintaining two models. Supported by OpenAI text-embedding-3 and Cohere.

> [!question] Recall
> 1. Cosine vs dot product?
> 2. Pick an embedding model: multilingual support bot; on-prem healthcare; best English RAG quality.
> 3. How do Matryoshka embeddings enable two-stage search?

Related: [[Vector Databases and Indexes]] · [[Embedding Cache]] · [[Embeddings Pipeline]]
