---
tags: [ai-system-design, interview, cheatsheet]
aliases: [Trade-offs]
---

# Trade-offs Cheat Sheet

> [!success] 🟢 Junior Explanation
> A trade-off = 'you gain X but pay Y'. In interviews, for every component you add, say one trade-off out loud. Start with the first table only.

## Classic AI trade-offs `[SDH]`
| Concern | Trade-off |
|---|---|
| Accuracy vs Latency | Large transformers more accurate but slower, pricier |
| Batch vs Real-time | Batch cheaper/easier, but stale |
| Complexity vs Maintainability | Microservice agent architectures flexible, harder to debug than monoliths |
| Cost vs Redundancy | More replicas → reliability, cost scales linearly |
| Autonomy vs Control | Agents powerful but unpredictable; guardrails reduce capability, increase safety |
| Speed vs Freshness (cache) | Fast cached answers may be outdated → invalidation |

## LLM-serving trade-offs `[OS]`
| Decision | Option A | Option B |
|---|---|---|
| Batching | Bigger batch → throughput ↑ | TTFT ↑ |
| Serving topology | Co-located: simple | Disaggregated: TTFT & TPOT tuned separately, needs fast interconnect |
| Speculative decoding | Great at low/medium batch | Gains shrink at high batch |
| Quantization | Memory/speed ↑ | Small quality ↓ |
| KV token eviction | Fixed memory | Loses exact recall |
| Semantic cache threshold | High: safe, few hits | Low: more hits, wrong answers |
| Router | Cheap rules: brittle | LLM-as-router: flexible, +1 call |
| Cascade routing | Cheapest on average | Slow on hard queries |
| Model size | Small: fast, cheap | Big: accurate, slow, pricey |

## Retrieval trade-offs `[OS]`
| Decision | A | B |
|---|---|---|
| Chunk size | Small: precise, loses context | Large: context, noisy |
| HyDE | Better recall on vague Qs | +1 LLM call |
| Reranker | Big quality jump | Added latency |
| ColBERT | Accurate + fast | ~100× storage |
| Standard vs Agentic RAG | Fast, cheap, single-hop | Multi-hop, slower, costlier, harder to debug |
| Vector vs GraphRAG | Cheap indexing | Relationships; expensive indexing, hard updates |
| Vector vs Vectorless RAG | Scales to millions, cheap | Explainable, handles negation/codes; slower |
| pgvector vs dedicated DB | Simple, enough for most | Scale/features |

## Agent trade-offs `[OS]`
| Decision | A | B |
|---|---|---|
| Workflow vs Agent | Predictable, cheap, debuggable | Handles unknown steps |
| Loop vs Graph engineering | Flexible, hard to test | Deterministic, testable per node |
| Single vs Multi-agent | Simple, cheap | Specialization, parallelism, higher cost |
| Full history vs summary memory | Honest, expensive | Cheap, may lose detail |
| MCP | Reuse, standard, security boundary | Overkill for 1–2 custom tools |

## Voice `[OS]`
Cascaded (control, compliance, tools, cheap) vs Speech-to-Speech (300–600 ms, emotion, less control).

## Deployment `[OS]`
API (no GPU ops, per-token cost) vs Self-host (fixed GPU cost cheaper at high volume, ops burden). Cloud vs On-device (privacy, offline vs capability).

Related: [[Interview Framework - 8 Steps]] · [[Key Numbers Cheat Sheet]]
