---
tags: [ai-system-design, caching]
aliases: [Semantic Caching]
---

# Semantic Cache

> [!success] 🟢 Junior Explanation
> **In plain words:** Reuse an earlier answer when a new question means the same thing, even with different words.
>
> **Analogy:** A librarian who remembers: 'I answered this yesterday, just worded differently.'
>
> **Why interviewers ask:** Big cost saving, but easy to get wrong (wrong answers, data leaks).
>
> **Say it in one sentence:** "We embed the question, look up similar past questions, and return the saved answer if similarity passes a tuned threshold."
>
> 🎯 **Junior must know:** threshold idea (~0.85–0.95) and never share personal answers across users. · **Middle adds:** threshold tuning on real data, invalidation, per-tenant isolation.

## Idea `[OS]` `[SDH]`
"What is the capital of France?" vs "Tell me the capital city of France." — different strings, same meaning. Regular cache = 2 LLM calls.
Semantic cache: **embed query → search vector store of past queries → if close match, return cached response**. `[SDH]` example: "shoe store" ≈ "footwear shop". Large-scale LLM systems use it to save significant GPU compute `[SDH]`.

## Threshold tuning `[OS]`
| Threshold | Effect |
|---|---|
| Too high (0.99) | Almost nothing matches; lose benefit |
| Too low (0.50) | "Capital of France" matches "Capital of Germany" → **wrong answer** |
| **~0.85–0.95** | Works for many apps — **test with real user questions** |
High = fewer matches, safer. Low = more matches, more wrong answers.

> [!danger] Never share across tenants/users for private data `[OS]`
> "What is my account balance?" must never be served from someone else's entry. See [[Multi-Tenancy]].

Also needs **invalidation** for freshness `[SDH]`. Usually lives in the [[API Gateway and AI Gateway|AI Gateway]].

> [!question] Recall
> 1. How does a semantic cache lookup work step-by-step?
> 2. What happens at threshold 0.5? At 0.99?
> 3. Which queries must bypass the shared semantic cache?

Related: [[Embeddings and Embedding Models]] · [[Caching in AI - Overview]]
