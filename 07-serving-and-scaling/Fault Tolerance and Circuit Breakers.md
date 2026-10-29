---
tags: [ai-system-design, reliability]
aliases: [Circuit Breaker, Fallback Models, Retries, Graceful Degradation, Fault Tolerance]
---

# Fault Tolerance and Circuit Breakers

> [!success] 🟢 Junior Explanation
> **In plain words:** Assume things will break and plan for it: timeouts, retries, a backup model, and a circuit breaker that stops calling a broken service.
>
> **Analogy:** The fuse box in your house: it cuts one circuit so a problem doesn't burn the whole house.
>
> **Why interviewers ask:** Senior engineers talk about failure, not only the happy path.
>
> **Say it in one sentence:** "I use timeouts, retries with backoff, fallback models, graceful degradation and circuit breakers with closed/open/half-open states."
>
> 🎯 **Junior must know:** fallback model, retries, the 3 breaker states. · **Middle adds:** the cascading-failure story and output validation (broken JSON).

## New AI failure modes `[OS]`
Provider outage · GPU OOM mid-generation · unexpected format (broken JSON) · slow vector DB · long agent loop timeout.

## Toolkit `[OS]` `[SDH]`
| Technique | What |
|---|---|
| **Timeouts** | Every LLM call has one; kill then fail or retry `[OS]` |
| **Retries with exponential backoff** | On transient errors (rate limits, 5xx) `[OS]` `[SDH]` |
| **Fallback models** | Primary down/timeout → secondary (e.g. frontier model → smaller 7–8B model `[SDH]`; GPT → Claude `[OS]`) |
| **Graceful degradation** | App doesn't crash: "AI is currently unavailable…" `[OS]` |
| **Output validation** | Asked for JSON, got junk → retry with stricter prompt `[OS]` |
| **Redundancy** | Replicate critical services across nodes; even one GPU failure must not bring service down `[SDH]` |
| **Circuit breakers** | Isolate failing components to prevent cascading outages `[SDH]` `[JAM]` |

Tools: LiteLLM, LangChain, Helicone, Portkey `[OS]`.

## Circuit breakers in depth `[JAM]`
RAG chain: embedding service → vector store → LLM. If vector store times out and there's no breaker: requests back up → connection pool exhausted → embedding service down → everything down.
Breaker detects failures early, trips, returns a **fast fallback**.

**Three states:**
1. **Closed** — normal traffic.
2. **Open** — all calls blocked, return fallback.
3. **Half-open** — let a few test requests through; close if recovered.

> [!example] Interview signal `[JAM]`
> *"What happens when your vector DB goes down mid-query?"* → circuit breaker, name the 3 states, propose fallback (e.g. answer without retrieval + disclaimer, cached answer, or escalate to human).

> [!question] Recall
> 1. Walk the cascading-failure story and how a breaker stops it.
> 2. Name 5 AI-specific fault-tolerance techniques.

Related: [[API Gateway and AI Gateway]] · [[7 Infra Patterns for AI Engineers]] · [[Structured Output]]
