---
tags: [ai-system-design, junior, interview]
aliases: [Junior vs Middle Expectations]
---

# Junior vs Middle — What Interviewers Expect

> [!info] Note
> This is guidance built from the three sources' interview advice (`[OS]` 8-step framework, `[SDH]` structure & trade-offs, `[JAM]` infra patterns). Companies differ; use it as a target, not a law.

| Area | Junior should… | Middle should also… |
|---|---|---|
| **Requirements** | Ask about users, latency, budget, data | Turn answers into numbers (QPS, tokens/day, $/month) [[Back-of-the-Envelope Estimation]] |
| **Architecture** | Draw: client → gateway → backend → LLM API (+ vector DB if RAG) | Add cache layers, queue, routing, fallback, multi-region thoughts |
| **LLM basics** | Explain tokens, TTFT, streaming, why GPUs | Explain prefill vs decode, KV cache memory, batching |
| **RAG** | Explain chunk → embed → store → search → prompt | Hybrid search, reranking, chunk size trade-offs, eval faithfulness |
| **Agents** | Explain the loop + tool calling + step limit | Memory layers, planning, multi-agent trade-offs, MCP |
| **Infra** | Name rate limiting, caching, load balancer, queue | Token-aware limits, least-outstanding-tokens LB, GPU-aware autoscaling, circuit breaker states |
| **Safety** | Mention guardrails + prompt injection | Code gates, least privilege, PII redaction, data residency |
| **Quality** | "We test with evals, not unit tests" | LLM-as-judge biases, agent trajectory eval, canary rollout |
| **Cost** | "Tokens cost money; cache and use smaller models" | Do the cost math; 7 levers [[Cost Optimization]] |
| **Trade-offs** | Name at least one per decision | Compare options with pros/cons and pick based on requirements |

## The 5 things that make a junior stand out
1. **Ask questions before drawing** `[OS]`.
2. **Start simple** — one LLM call, then add pieces only when needed `[OS]`.
3. **Say the cost out loud** — "this adds one more LLM call, so cost and latency go up" `[OS]`.
4. **Talk about failure** — "if the vector DB is down, I return a fallback" `[JAM]`.
5. **Mention evaluation** — "how do we know the answer is good?" `[OS]`.

## Red flags (avoid)
- Jumping straight to "I'll fine-tune a model" `[OS]`.
- Using multi-agent systems for a simple FAQ bot `[OS]`.
- Sending 50,000 documents to the LLM in a for-loop `[JAM]`.
- Never mentioning cost, rate limits, or what happens when things fail `[JAM]`.
