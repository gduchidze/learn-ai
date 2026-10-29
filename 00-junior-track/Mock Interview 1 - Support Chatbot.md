---
tags: [ai-system-design, junior, mock-interview]
aliases: [Mock Interview Chatbot]
---

# Mock Interview 1 — Support Chatbot (full dialogue)

> [!info] Based on the `[OS]` case study → technical reference: [[Case - Customer Support Chatbot]]. Read once, then **play the candidate role out loud** with a timer (35 min).

---

**Interviewer:** Design an AI chatbot for customer support of a SaaS company.

**Candidate:** Sure. Before designing, may I ask a few questions?
1. What kinds of questions do users ask?
2. How many users and chats per day?
3. What latency do we need?
4. Do we have documentation I can use?
5. Should the bot only answer, or also do actions like cancel subscriptions?
6. What if the bot doesn't know the answer?
7. What's the monthly budget? Any privacy rules?

**Interviewer:** Product, billing, account questions. English only. 100k users, about 50k chats per day, ~5 messages each. First word in under 1 second. ~500 help-center articles and 1 year of past human chats. Answer only, no actions. If unsure, escalate to a human. Budget $5,000/month.

> [!tip] Why this is good
> The candidate didn't draw anything yet. Every answer will drive a later decision.

---

**Candidate (objective):** So the goal: given a question and the chat history, return an answer **grounded in our help center**, or escalate. The knowledge is private and changes over time, so I'll use **RAG** instead of fine-tuning — RAG gives knowledge, fine-tuning gives behavior. `[OS]`

**Candidate (estimate):** 50k × 5 = 250k LLM calls/day ≈ 3 per second average, maybe ~10 at peak. That's small, so I'll use a **model API** rather than running our own GPUs — no GPU operations to manage, and the provider scales. The $5k budget means I must control tokens: prompt caching, a semantic cache, and a small default model. `[OS]`

---

**Candidate (simple version first):**
```
User -> Backend -> LLM API -> streamed answer
```
This alone would hallucinate company policies. So let me add retrieval.

**Candidate (data prep / offline indexing):**
- Clean the 500 articles: remove old ones, strip HTML and menus.
- Split into ~500-token chunks with ~50-token overlap.
- Embed each chunk, store in **PostgreSQL with pgvector** — at 500 articles we don't need a separate vector database.
- From past chats, remove personal data, and build an **eval set** of ~200 real questions with expected answers. `[OS]`

**Candidate (online flow):**
```
User -> Gateway (auth, rate limit) -> input guardrail -> semantic cache?
     -> embed question -> hybrid search (vector + BM25) top 50
     -> reranker top 5 -> prompt -> small LLM -> output guardrail -> SSE stream
```

**Interviewer:** Why both vector and keyword search?

**Candidate:** Vector search understands meaning — "get my money back" matches "refund". But it's weak at exact things like an invoice number or "Section 4.2". BM25 keyword search is good at those. I merge both lists with Reciprocal Rank Fusion. `[OS]`

**Interviewer:** And the reranker?

**Candidate:** First-stage search is fast but rough. A cross-encoder reranker reads the question and each chunk together and scores them precisely, so I keep only the best 5. Fewer, better chunks also avoid the "lost in the middle" problem and reduce cost. The trade-off is a bit of extra latency. `[OS]`

---

**Interviewer:** Which model? What does the prompt look like?

**Candidate:** A small, fast model like Haiku for most questions. If it answers "I do not know", I can escalate to a bigger model like Sonnet, and if that also doesn't know, hand off to a human. The prompt:
```
You are a customer support assistant for [Company].
Use only the context below to answer.
If the context does not have the answer, reply "I do not know"
and suggest contacting human support. Do not make up facts.
Context: {chunks}
Question: {question}
```
The system prompt is identical for everyone and placed first, so **prompt caching** can cut input cost by up to 90% and improve TTFT. `[OS]`

**Interviewer:** How do you meet the 1-second first-token target?

**Candidate:** Stream with SSE so the first token shows immediately; prompt caching shortens prefill; a small model has fast TTFT; and the semantic cache answers repeated questions in milliseconds. I'd also raise the load balancer timeout to a few minutes so streams aren't cut at 30 seconds. `[OS]`

---

**Interviewer:** How do you know the bot is good?

**Candidate:** Before launch, run the 200-question eval set:
- an **LLM judge** compares answers to expected answers,
- **faithfulness** — is the answer supported by the retrieved chunks (e.g. Ragas),
- **refusal accuracy** — says "I don't know" when it should, and not when it shouldn't,
- **retrieval quality** — were the right chunks in the top 5,
- plus a support agent reviews ~50 random conversations weekly.
I rerun evals on every prompt, model, or chunking change. `[OS]`

---

**Interviewer:** What about safety and privacy?

**Candidate:** Input guardrail: detect personal data and prompt-injection attempts. Output guardrail: block off-topic answers and leaked personal data. I don't log raw prompts — I redact PII first. Rate limits per user, e.g. 50 messages/day and 10,000 tokens/minute, to protect the budget. `[OS]`

**Interviewer:** And if the LLM provider goes down?

**Candidate:** Timeouts and retries with backoff, then the gateway switches to a fallback model from another provider. If everything fails, graceful degradation: "Our assistant is unavailable — here's how to contact support." If the vector DB fails, a circuit breaker stops calling it and we escalate instead of hanging. `[OS]` `[JAM]`

---

**Interviewer:** How do you launch and monitor it?

**Candidate:** Canary to 10% of users first. Monitor TTFT, cost per day, thumbs-up rate, escalation rate, faithfulness on sampled chats, cache hit rate, and errors. Alerts if cost > $200/day, latency > 3 s, thumbs-up < 80%, or faithfulness < 90%. If an alert fires: investigate, fix, re-run evals, redeploy. `[OS]`

**Candidate (summary):** RAG chatbot with hybrid search + reranking, small model with escalation, prompt and semantic caching for cost, streaming for latency, guardrails and PII redaction for safety, evals before and monitoring after launch. Next improvements: query rewriting for follow-up questions and contextual retrieval for better chunks. `[OS]`

---

> [!check] Scorecard — did you…
> - [ ] Ask requirements before drawing?
> - [ ] Justify RAG vs fine-tuning?
> - [ ] Estimate load and choose API vs self-host?
> - [ ] Start simple, then add pieces with reasons?
> - [ ] Explain hybrid search + reranker?
> - [ ] Hit the latency target with streaming + caching?
> - [ ] Describe evals (faithfulness, refusal)?
> - [ ] Cover guardrails, PII, rate limits?
> - [ ] Cover failures (fallback, breaker, degradation)?
> - [ ] Canary + monitoring + alerts?
