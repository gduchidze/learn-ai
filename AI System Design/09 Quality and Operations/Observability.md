---
tags: [ai-system-design, observability]
aliases: [AI Observability, Agent Observability, Traces and Spans, Monitoring]
---

# Observability

> [!success] 🟢 Junior Explanation
> **In plain words:** Record what happens in the system: speed, tokens, cost, quality, tool calls.
>
> **Analogy:** An airplane's black box.
>
> **Why interviewers ask:** Without it you can't debug hallucinations or cost spikes.
>
> **Say it in one sentence:** "We log every LLM call with prompt, response, latency and cost, and use traces and spans for agents."
>
> 🎯 **Junior must know:** the key metrics to watch. · **Middle adds:** traces/spans, OpenTelemetry, alerting.

## What to monitor `[OS]`
| Metric | Detail |
|---|---|
| Latency | TTFT, total time, TPS |
| Token usage | Input/output per user, per endpoint |
| Cost | $ per user, per feature, per day |
| Quality | Wrong answers, refusals, hallucinations |
| Tool call success rate | Per tool (agents) |
| Cache hit rate | KV, prompt, semantic |
| GPU utilization | Are expensive GPUs idle? |

Classic `[SDH]`: **p95/p99 latency**, throughput (RPS), model performance (precision/recall), **data and feature drift**, bias. Tools: Prometheus, Grafana, ELK, Evidently AI.

AI tools `[OS]`: **Langfuse, Helicone, Arize Phoenix, LangSmith, Weights & Biases** — log every LLM call with prompt, response, latency, cost, tool calls; drill into a single session.

> [!important] `[OS]` Unlike APM, AI requires logging **actual prompts and responses** (with privacy redaction) — the only way to debug a hallucination.

## Agent observability `[OS]`
One request → dozens of LLM + tool calls.
- **Span** = one step/operation.
- **Trace** = full run, made of spans; spans **nest** → tree.
Flight-booking trace: receive request → LLM decides to search → flight search tool → read results → LLM picks cheapest → booking tool → confirmation. Each span: input, output, time, tokens, error.
Standard: **OpenTelemetry**.

> [!note] `[OS]` Observability = **what** the agent did (raw data, comes first). Evaluation = **how good** it was (uses that data).

## Alerts example (support bot) `[OS]`
Daily cost > $200 · avg latency > 3 s · thumbs-up < 80% · faithfulness < 90% · escalation rate above threshold. On alert: investigate, fix, **re-run evals** before deploying fix.

## 🌐 Deeper Context `[WEB]`

**OpenTelemetry GenAI semantic conventions** — the emerging standard names for LLM telemetry:

| Attribute / metric | Meaning |
|---|---|
| `gen_ai.request.model` | Which model was called |
| `gen_ai.usage.input_tokens` / `gen_ai.usage.output_tokens` | Token counts per call → cost |
| `gen_ai.response.finish_reasons` | Why generation stopped (stop, length, tool call…) |
| `gen_ai.client.token.usage` (metric) | Token usage histogram |
| `gen_ai.client.operation.duration` (metric) | Call latency |
| Prompt/response content | **Opt-in** (privacy!) as structured message attributes/events |

```json
{
  "name": "chat claude-sonnet",
  "attributes": {
    "gen_ai.request.model": "claude-sonnet",
    "gen_ai.usage.input_tokens": 3120,
    "gen_ai.usage.output_tokens": 412,
    "gen_ai.response.finish_reasons": ["stop"]
  }
}
```
Core chat attributes are mature enough for dashboards; **agent / multi-agent conventions are still evolving**, and some libraries use older names (e.g. `gen_ai.usage.prompt_tokens`). Check the current spec.

**Sources:** [OpenTelemetry: GenAI observability](https://opentelemetry.io/blog/2026/genai-observability/) · [OpenObserve GenAI conventions guide](https://openobserve.ai/blog/opentelemetry-genai-semantic-conventions/) · [Traceloop / OpenLLMetry conventions](https://traceloop.com/docs/openllmetry/contributing/semantic-conventions)


> [!question] Recall
> 1. Seven AI metrics to monitor.
> 2. Span vs trace.
> 3. Why must AI observability log prompts?

Related: [[Evaluation - LLM and Agent]] · [[API Gateway and AI Gateway]] · [[Data Privacy and Compliance]]
