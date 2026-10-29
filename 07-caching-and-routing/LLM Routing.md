---
tags: [ai-system-design, routing, cost]
aliases: [Model Routing, Cascade Routing, LLM Router]
---

# LLM Routing (Model Routing)

> [!success] 🟢 Junior Explanation
> **In plain words:** Send easy questions to a cheap fast model and hard ones to a big model.
>
> **Analogy:** A hospital triage nurse: a cold goes to the GP, chest pain to the cardiologist.
>
> **Why interviewers ask:** It can cut cost 50–70% — a favorite cost question.
>
> **Say it in one sentence:** "A router picks the model per query; a cascade tries the cheapest model first and escalates only when it's not confident."
>
> 🎯 **Junior must know:** why routing saves money. · **Middle adds:** the 5 strategies, cascade code, router latency < 10% of LLM latency, routing ≠ MoE.

## Definition `[OS]`
Choosing the **right LLM for each query** instead of sending everything to one model. Production rarely uses one model:
- Small (e.g. Haiku 4.5): cheap, fast, less accurate
- Medium (e.g. Sonnet 4.6): balanced
- Big (e.g. Opus 4.8): expensive, slow, most accurate

"Hi, how are you?" → small. "Write a long detailed business plan" → big. Saves **50–70% cost** without hurting quality much `[OS]`.

> [!tip] Router latency budget `[OS]`
> Keep router latency **< 10% of the chosen LLM's latency** (1 s LLM → ≤ 100 ms router).

## Five strategies `[OS]`
| Strategy | How | Speed | Cost | Flexibility | Training |
|---|---|---|---|---|---|
| Rule-based | Keywords, length, patterns | Very fast | Very low | Low (brittle) | No |
| Classifier-based | Small model on (query, best-LLM) pairs | Fast | Low | Medium | **Yes** |
| Embedding-based | Nearest reference embedding per LLM | Fast | Low | Medium | No |
| LLM-as-Router | Small LLM picks target | Medium | Medium | High | No |
| **Cascade** | Cheapest first, escalate if low confidence | Slow on hard queries | **Lowest on average** | High | No |

```python
def cascade(query: str) -> str:
    answer = small_llm(query)
    if is_confident(answer):
        return answer
    answer = mid_llm(query)
    if is_confident(answer):
        return answer
    return frontier_llm(query)
```
`is_confident` = self-rating, verifier model, or heuristic ("I do not know") `[OS]`.

No clear winner: few clear query types → rule-based; large mixed product → cascade or LLM-as-router.

## Common mistakes `[OS]`
- Router too heavy (frontier LLM as router can cost more than it saves).
- No fallback path when chosen LLM fails.
- Routing on wrong signal — "Prove the Riemann hypothesis" is short but hard; route on **intent & difficulty**, not length.
- No observability — log which LLM, cost, latency, quality.

> [!note] Not Mixture of Experts `[OS]`
> Routing picks **one full LLM per query, outside** the model. [[Mixture of Experts|MoE]] picks **expert sub-networks per token, inside** one model.

Tool: OpenRouter. Case: Cursor routes by job → [[Case - Cursor]].

## 🌐 Deeper Context `[WEB]`

| Finding | Why it matters |
|---|---|
| **RouteLLM** (Ong et al., ICLR 2025) trains routers on **Chatbot Arena human preference data** to choose between a strong model (GPT-4) and a weak one (Mixtral-8x7B) | Real evidence for "classifier-based routing" |
| Reported **>2× cost reduction in certain cases** without hurting response quality; routers kept working when the model pair was swapped at test time | Routing savings are real but **workload-dependent** — always measure |
| Anthropic lists **routing** as a core workflow: classify input → send to a specialized handler; examples: support queries by type, **easy questions → smaller model, hard → larger model** | Ties routing to the agent-pattern vocabulary → [[Agentic Workflow Patterns]] |

**Sources:** [RouteLLM (arXiv 2406.18665)](https://arxiv.org/abs/2406.18665v4) · [RouteLLM at ICLR 2025](https://iclr.cc/virtual/2025/poster/30737) · [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)


> [!question] Recall
> 1. Write the cascade in pseudocode. Why is it cheapest on average?
> 2. Router vs MoE difference?
> 3. 4 routing mistakes.

Related: [[Cost Optimization]] · [[API Gateway and AI Gateway]]
