---
tags: [ai-system-design, caching, rag]
aliases: [Embedding Caching]
---

# Embedding Cache

> [!success] 🟢 Junior Explanation
> **In plain words:** Save the embedding of a text so the same text is never converted twice.
>
> **Analogy:** Saving a contact in your phone instead of looking up the number every time.
>
> **Why interviewers ask:** Embedding is the most cacheable step in RAG.
>
> **Say it in one sentence:** "We cache embeddings keyed by text hash plus embedding model name and version."
>
> 🎯 **Junior must know:** why the model name/version must be in the key. · **Middle adds:** latency/cost impact (hundreds of ms → single-digit ms).

## Idea `[OS]`
Computing embeddings is itself expensive. Cache embeddings of common queries and documents in Redis / any KV store:
- **Key** = text (or its hash) **+ embedding model name + version**
- **Value** = embedding vector

> [!warning] Include model name/version in the key `[OS]`
> Same text → different vectors in different models. Mixing them **silently breaks search**.

Next time same text appears → read from cache, skip embedding model.

`[JAM]`: Redis/Memcached in front of the embedding service cuts latency **from hundreds of ms to single-digit ms** and dramatically reduces compute bill.

> [!question] Recall
> What three components make up a correct embedding-cache key, and why?

Related: [[Embeddings Pipeline]] · [[Caching in AI - Overview]]
