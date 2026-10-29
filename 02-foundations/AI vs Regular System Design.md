---
tags: [ai-system-design, foundations]
aliases: [What is AI System Design]
---

# AI vs Regular System Design

> [!success] 🟢 Junior Explanation
> **In plain words:** An AI product is a normal web system with one new box in the middle: the LLM. That box is slow, expensive, a bit random, and answers word by word, so everything around it must adapt.
>
> **Analogy:** A normal restaurant hires one celebrity chef who is slow, charges per dish, and cooks a bit differently every time. The whole restaurant reorganizes around him.
>
> **Why interviewers ask:** To check you understand what is really new, not just 'call the API'.
>
> **Say it in one sentence:** "AI system design is regular system design plus designing around the LLM's constraints: GPUs, tokens, streaming, randomness, and a cost on every request."
>
> 🎯 **Junior must know:** the 6 new constraints (GPU, tokens, long requests, streaming, non-determinism, cost). · **Middle adds:** predictive vs generative AI and the core objectives (accuracy, scalability, latency, adaptability, observability).

## Definition `[OS]`
**AI System Design** = designing the complete system around an AI model (especially an LLM) so it serves real users **fast, cheap, reliable, safe, and measurable**.

> **AI System Design = System Design + the new constraints of AI models.**

Example `[OS]`: calling an LLM API in a script = 10 lines. Serving 100,000 users with an answer that starts in < 1 s, stays grounded in our documents, never leaks private data, and fits a monthly budget = AI System Design.

## The new constraints `[OS]`
| Constraint | Why it changes design |
|---|---|
| **GPUs** | LLMs run on GPUs, not CPUs. Expensive and limited. |
| **Tokens** | Models work in tokens; input and output are billed per token. |
| **Long requests** | One call can take 30 s to minutes (regular APIs: ms). |
| **Streaming** | Responses stream token-by-token, not one big payload. |
| **Non-deterministic output** | Same input → different outputs. Cannot unit-test like regular code → need [[Evaluation - LLM and Agent\|evals]]. |
| **Cost per request** | Every call costs money. A bug in a loop can burn thousands of dollars overnight. |

All classic building blocks (load balancers, caches, queues, DBs) still apply — **but used differently** because the workload is different `[OS]`.

## The big picture `[OS]`
An AI system is a regular system with **one new component in the middle: the LLM**, plus smarter caching, streaming, cost tracking, safety, and evals built around it. Keep this in mind and every architecture decision becomes easy to reason about.

```
Client -> Backend Server -> Inference Server (GPU) -> LLM
```

## Predictive vs Generative/Agentic `[SDH]`
> [!tip] Interview tip `[SDH]`
> Distinguish **Predictive AI** (ranking, classification) from **Generative / Agentic AI** (content creation, autonomous tasks). Latency and cost constraints differ significantly.

- Predictive → see [[ML System Architecture - Data Model Serving Layers]], [[Case - Recommendation Engine]]
- Generative/agentic → most of this wiki.

## Core objectives `[SDH]`
- **Accuracy** — reliable predictions; for generative models also fewer hallucinations / unsafe outputs.
- **Scalability** — growing data + request volume (distributed training, sharding).
- **Latency** — e.g. p99 < 200 ms for ranking, or streaming tokens for LLMs.
- **Adaptability** — learns from new data (feedback loops, online learning).
- **Observability** — audit, explainability, drift and bias tracking.

## Why "a single API call" isn't enough `[OS]`
Real world: millions of users, long prompts, streamed responses, slow models, expensive GPUs, fast-growing cost, hallucinations, strict latency. A single call handles none of this.

> [!question] Recall
> 1. State the AISD formula and list the 6 new constraints.
> 2. Why can't we unit-test an LLM feature the normal way?
> 3. Predictive vs generative AI — how do their constraints differ?

Related: [[LLM Recap - Tokens and Autoregression]] · [[Latency and Cost Metrics]] · [[Interview Framework - 8 Steps]]
