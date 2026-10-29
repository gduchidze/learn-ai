---
tags: [ai-system-design, case-study, rag]
aliases: [Customer Support Chatbot Design]
---

# Case — Customer Support Chatbot (8-step walkthrough) `[OS]`

> [!success] 🟢 Junior Explanation
> This is the most important case. First read the dialogue version [[Mock Interview 1 - Support Chatbot]], then use this note as the technical reference. Idea in one line: **RAG chatbot = search your help center, give the best 5 pieces to a small model, stream the answer, escalate when unsure.**

**Problem:** Design an AI system for a SaaS company's customer support chatbot. Uses [[Interview Framework - 8 Steps]].

## 1. Requirements (clarifying Q&A)
| Question | Answer |
|---|---|
| Question types? | Product usage, billing, account |
| Languages? | English only |
| Scale? | 100k users, 50k chats/day, ~5 msgs/chat |
| Latency? | First token < 1 s |
| Budget? | $5,000/month |
| Docs? | Help center, ~500 articles |
| Actions? | Answer only, no actions |
| Unknown answer? | Escalate to human |
| History? | 1 year of human support chats |

> [!example] Quick estimate (derived)
> 50k × 5 = 250k messages/day. If ~3k input (system + 5 chunks + question) and ~300 output tokens on a Haiku-class model, the token bill must stay well under $5k/month → prompt caching + semantic cache + small default model are mandatory, not optional.

## 2. AI Objective
Grounded answer from the help center, **or** escalate when not confident. Input: question + history. Output: grounded answer or "escalate" signal. → Q&A on private data ⇒ **RAG**.

## 3. Data Preparation
- Help center (500 articles, ~200k words) → index in vector DB.
- Past chats → **evaluation** + finding common questions.
- User/account data → personalization ("Your current plan is…").
- **Eval set**: 200 hand-picked Q + expected answers.
- Cleaning: remove deprecated articles; strip HTML/ads/nav; normalize headings; **remove PII** from past chats.

## 4. Architecture
```
User -> Backend -> Embedding Model -> Vector DB (top 50)
     -> Reranker (top 5) -> LLM (system prompt + chunks + question) -> Streamed response
```
- Chunker: recursive, 500 tokens, 50 overlap.
- Small fast embedding model.
- **PostgreSQL + pgvector** (no dedicated vector DB at this scale).
- **Hybrid search** (vector + BM25).
- Reranker: Cohere Rerank / BGE.
- LLM: small chat model; route hard queries to bigger model.
- Caching: prompt cache (system prompt), semantic cache (repeated Qs).
- Streaming: SSE. Storage: Postgres (users, conversations, feedback). No async needed.

## 5. Model Selection & Prompting
- Main: **Haiku 4.5** (90% of queries). Fallback: **Sonnet 4.6** when main says "I do not know".
- Small cheap embedding model; Cohere Rerank.
- System prompt → see [[Prompt Management and DSPy]] ("Use only the context… reply 'I do not know'… do not make up facts").

## 6. Evaluation
LLM-as-judge vs expected · **faithfulness** (Ragas) · **refusal accuracy** · retrieval quality · human review of 50 conversations/week. Re-run on every prompt/model/chunking/retrieval change.

## 7. Deployment & Serving
- Model **API** (no self-hosted GPU at this scale; provider auto-scales).
- API Gateway; rate limits **50 msgs/day/user, 10,000 TPM**.
- SSE with **5-min** LB timeout (default 30 s breaks it).
- Fallback model on outage.
- Guardrails: input (PII, injection), output (off-topic, PII leak).
- Never log raw prompts/responses (redact PII first).
- **Canary to 10%**, then 100% if quality holds.

## 8. Monitoring
Track latency (TTFT, total, TPS), cost (per user/day/feature), quality (👍/👎, escalation rate, faithfulness), errors (timeouts, empty, broken streams, retries), cache hit rates, drift, retrieval health.
Alerts: cost > **$200/day**, latency > **3 s**, 👍 < **80%**, faithfulness < **90%**, escalation rate spike → investigate, fix, re-run evals.

> [!warning] `[OS]` Don't over-engineer. Start with a single LLM call; add vector DB / agents only when needed.

## 🌐 Deeper Context `[WEB]`

### Real-world: DoorDash Dasher support bot (2024)
| What they did | Maps to this case |
|---|---|
| Replaced a **flow-based** support system with a **RAG** chatbot over the knowledge base and **historical resolved cases** | Steps 3–4 (data + architecture) |
| First **condenses the multi-message conversation into one clear issue**, then retrieves | Query rewriting before retrieval → [[Hybrid Search, HyDE, Reranking, ColBERT]] |
| **LLM Guardrail** validates each response online before it's sent | Output guardrail → [[Guardrails]] |
| **LLM Judge** monitors quality offline | Step 6/8 → [[Case - LLM Evaluation and Monitoring Pipeline]] |
| Reported (secondary): ~**90% fewer hallucinations**, ~**99% fewer compliance issues**; human agents freed for complex cases | Why guardrails + judges are worth it |

### Real-world: LinkedIn's GenAI assistant lesson
Got ~**80%** of the experience in the first month, then ~**4 more months** to reach ~**95%** → budget most of your effort for evals and quality, not the first demo.

**Sources:** [DoorDash engineering post](https://careersatdoordash.com/?p=12568) · [ZenML summary](https://zenml.io/llmops-database/building-a-high-quality-rag-based-support-system-with-llm-guardrails-and-quality-monitoring) · [The New Stack: LinkedIn lessons](https://thenewstack.io/5-lessons-from-linkedins-first-foray-into-genai-development/)


Related: [[RAG Fundamentals]] · [[Hybrid Search, HyDE, Reranking, ColBERT]] · [[Guardrails]]
