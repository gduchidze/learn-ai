---
tags: [ai-system-design, interview]
aliases: [AI System Design Interview Questions, Question Bank]
---

# Interview Question Bank

> [!success] 🟢 Junior Explanation
> Start with section B (short follow-up questions) and [[60-Second Answers]]. Then try full designs in section A with the [[Interview Framework - 8 Steps]].

Use [[Interview Framework - 8 Steps]] for each. Hints = building blocks that matter most `[OS]`.

## A. Full design questions `[OS]` (+ `[SDH]`)
| # | Question | Must-hit blocks |
|---|---|---|
| 1 | Customer support chatbot on company docs | RAG, hybrid search, reranking, prompt caching, guardrails, human escalation, LLM-as-judge evals → [[Case - Customer Support Chatbot]] |
| 2 | ChatGPT at scale | Inference servers, prefill/decode, continuous batching, SSE, routing, context mgmt, memory, GPU estimation → [[Case - ChatGPT-Scale Chat Assistant]] |
| 3 | Perplexity-like AI search | Web retrieval, hybrid search, reranking, **citations**, semantic cache, streaming → [[Case - Perplexity-Style AI Search Engine]] |
| 4 | AI coding agent (Claude Code / Cursor) | Agent loop, tool calling, codebase RAG, **sandboxing**, permissions, SubAgents, compaction, test verification → [[Case - Claude Code]], [[Case - Cursor]] |
| 5 | Real-time voice AI agent | Streaming STT/LLM/TTS, latency budget, turn detection, barge-in, telephony, tools → [[Case - Real-Time Voice AI Agent]] |
| 6 | Multi-agent research assistant | Orchestrator/workers, SubAgents, parallel coordination, shared memory, cost limits, tracing → [[Case - Multi-Agent Research Assistant]] |
| 7 | LLM inference platform for many teams | vLLM/SGLang, GPU autoscaling w/ warm pools, least-outstanding-tokens LB, prefix-aware routing, PD disaggregation, multi-tenancy → [[Case - LLM Inference Platform for Many Teams]] |
| 8 | AI Gateway for a company | Multi-provider failover, token/cost rate limits, caching, guardrails, audit logs, observability → [[Case - Enterprise AI Gateway]] |
| 9 | Document QA for long legal contracts | Parsing, structure-aware chunking, **Vectorless RAG or GraphRAG**, faithfulness evals → [[Case - Legal Contract Q&A]] |
| 10 | Semantic cache for LLM responses | Embeddings, vector search, threshold, **per-tenant isolation**, invalidation → [[Case - Enterprise AI Gateway]] |
| 11 | On-device AI assistant | SLMs, quantization, distillation, hybrid device/cloud routing → [[Case - On-Device AI Assistant]] |
| 12 | Eval & monitoring pipeline for an LLM product | Eval sets, LLM-as-judge, agent trajectory eval, traces/spans, cost & quality alerts → [[Case - LLM Evaluation and Monitoring Pipeline]] |
| 13 | AI recommendation engine `[SDH]` | Kafka, two-tower retrieval + ranking, Redis cache, feedback stream → [[Case - Recommendation Engine]] |
| 14 | AI fraud detection `[SDH]` | Real-time features, ms-latency inference, historical data, fallback → [[Case - Real-Time Fraud Detection]] |

## B. Probing / follow-up questions
| Question | Answer sketch | Source |
|---|---|---|
| Walk me through a request flow | Start at gateway → rate limit → cache → model … | `[JAM]` |
| Prevent denial-of-wallet? | Token/cost-aware rate limits, quotas, budgets | `[JAM]` |
| Embedding API gets repeat queries? | Embedding cache + semantic cache w/ threshold | `[JAM]` |
| Process 50,000 docs? | Queue + worker pool, retries | `[JAM]` |
| Vector DB goes down mid-query? | Circuit breaker (3 states) + fallback | `[JAM]` |
| 10,000 concurrent LLM requests? | LB (not round-robin) + rate limiting + autoscaling | `[JAM]` |
| 10× traffic at 9am, ~0 at 3am? | GPU-aware + predictive autoscaling, warm pools | `[JAM]` `[OS]` |
| Why is first token slow on long prompts? | Prefill compute-bound; prompt cache, chunked prefill | `[OS]` |
| Streams stutter when someone pastes a doc? | Chunked prefill / disaggregation | `[OS]` |
| GPU OOM with many long chats? | KV cache size → PagedAttention, KV quantization, GQA | `[OS]` |
| RAG answers miss exact IDs? | Hybrid search (BM25) | `[OS]` |
| RAG answer is in the middle of 50 chunks, ignored? | Lost in the middle → rerank, top-5, place at edges | `[OS]` |
| Multi-hop question fails? | Agentic RAG / GraphRAG | `[OS]` |
| RAG vs fine-tuning? | Knowledge vs behavior | `[OS]` |
| Workflow or agent? | Fixed if steps known; agent only for open-ended | `[OS]` |
| How protect agent from prompt injection? | Least privilege, code gates, human approval, allowlists, dual LLM, logging, red teaming | `[OS]` |
| How reduce cost? | 7 levers → [[Cost Optimization]] | `[OS]` |
| How reduce latency? | Stream, prompt cache, smaller model, short prompt, spec decoding, quantization, deploy near users | `[OS]` |
| MCP vs A2A vs Skills? | Tools/data vs agents vs know-how | `[OS]` |
| Training–serving skew? | Unified feature store | `[SDH]` |
| How deploy new model safely? | Canary, shadow, A/B, registry rollback | `[SDH]` |
| Predictive vs generative constraints? | Latency/cost profiles differ | `[SDH]` |

## C. Core-track conceptual questions
- Explain Q, K, V and why only K/V are cached. → [[Attention]], [[KV Cache]]
- Compute KV cache size for N tokens. → [[KV Cache]]
- How does speculative decoding preserve output quality? → [[Speculative Decoding]]
- Quantize 70B to fit one GPU — math? → [[Quantization]]
- LoRA vs full fine-tuning? → [[Fine-Tuning and LoRA]]
- MoE: memory vs compute? → [[Mixture of Experts]]
- Write the agent loop. → [[Agent Loop]]
- Tool definition fields & security boundary? → [[Tool Calling]]
- What goes into context and in what order? → [[Context Engineering]]
- Memory lifecycle? → [[Agent Memory]]
- Static vs dynamic plans, replanning? → [[Planning and Task Decomposition]]

> [!tip] Practice protocol
> Timebox 45 min: 5 min requirements, 5 estimation, 15 architecture, 10 deep dive, 5 trade-offs, 5 monitoring/evolution. Record yourself; check against the case notes.


## D. Foundation & inference rounds (new)
- **ML/LLM fundamentals (50 Q&A):** [[LLM Internals and ML Foundations Q&A]]
- **Inference Engineer (35 Q&A):** [[Inference Engineer Interview Q&A]]
- **Numeric drills with solutions:** [[Inference Whiteboard Drills]]
- **Formula sheet:** [[LLM Math Cheat Sheet]]
