---
tags: [ai-system-design, foundations, metrics]
aliases: [TTFT, TPOT, TPS, Throughput, Cost per Token]
---

# Latency and Cost Metrics

> [!success] 🟢 Junior Explanation
> **In plain words:** AI speed has new measures: TTFT (time until the first word), TPOT (time per next word), throughput (total words per second for everyone), and cost per token.
>
> **Analogy:** Pizza delivery: TTFT is when the doorbell rings, TPOT is how fast slices are handed over, throughput is pizzas per hour for the whole city.
>
> **Why interviewers ask:** You must speak in these terms when you set latency targets and estimate cost.
>
> **Say it in one sentence:** "Users feel TTFT most, TPOT decides how fast the rest appears, and output tokens cost about 4–5× more than input tokens."
>
> 🎯 **Junior must know:** define TTFT, TPOT, throughput; compute the cost of one request. · **Middle adds:** why batching raises throughput but hurts TTFT, and hidden reasoning-token costs.

Regular SD: latency in ms, throughput in req/s. AI adds token-level metrics because output is generated token-by-token `[OS]`.

## The four metrics `[OS]`
| Metric | Definition | Example |
|---|---|---|
| **TTFT** (Time to First Token) | Prompt sent → first token received | "Tell me a story" → "Once" after 800 ms → TTFT = 800 ms |
| **TPS** (Tokens per Second) / **TPOT** (Time Per Output Token) | Generation speed after first token | 50 TPS ⇔ TPOT 20 ms; 500-token reply ≈ 10 s |
| **Throughput** | Total tokens/s server produces across all users | 100 users × 20 TPS = 2,000 tokens/s |
| **Cost per token** | $ per request based on tokens | see below |

- TTFT dominates *perceived* responsiveness — fast first token feels responsive even if full answer takes 10 s.
- TPS depends on model size + GPU. Smaller = faster; bigger = slower but more accurate.

> [!warning] Tension `[OS]`
> Low TTFT, high TPS, high throughput **fight each other**. Batching more requests raises throughput but also TTFT. See [[Continuous Batching]].

## Three token categories billed `[OS]`
1. **Input tokens** — cheapest (processed in parallel).
2. **Output tokens** — **~4–5× more expensive** (sequential).
3. **Reasoning tokens** — hidden "thinking" tokens (o1/o3 family). Billed but invisible; can be **10×+** visible output on hard prompts.

### Worked example `[OS]`
$3 / 1M input, $15 / 1M output; 1,000 in + 500 out:
```
(1000/1e6)*3 + (500/1e6)*15 = 0.003 + 0.0075 = $0.0105  (~1 cent)
```

> [!tip] Practice `[OS]`
> Watch **cost like latency**. Every dashboard, alert, and postmortem includes the dollar number.

## Classic percentiles `[SDH]`
Track **p95 / p99** latency, requests per second, model performance (precision/recall), and data drift. See [[Observability]].

## 🌐 Deeper Context `[WEB]`

| Concept | Plain explanation | Why it matters |
|---|---|---|
| **Goodput** | The maximum request rate a system can serve **while still meeting its latency targets (SLOs)** per GPU — from the DistServe paper | Raw throughput can look great while users get slow answers. Goodput counts only "good" requests. Strong word to use in interviews. |
| **Single-user speed ceiling** | Decode speed ≤ memory bandwidth ÷ model size. A 70B FP16 model (~140 GB) on ~3.35 TB/s HBM tops out around **~24 tokens/s** for one request | Quick sanity check for any TPOT target you are given |
| **Token counts in telemetry** | OpenTelemetry's GenAI conventions record `gen_ai.usage.input_tokens` and `gen_ai.usage.output_tokens` on every LLM span | Standard way to track cost per request → [[Observability]] |

> [!example] Quick math you can do on the whiteboard
> 70B params × 2 bytes = 140 GB. 3,350 GB/s ÷ 140 GB ≈ 24 reads/s ⇒ ≈ 24 tokens/s max for a single stream. Quantize to 4-bit (35 GB) ⇒ ceiling ≈ 96 tokens/s.

**Sources:** [DistServe (arXiv 2401.09670)](https://arxiv.org/pdf/2401.09670) · [Bytes-per-token explainer](https://www.zartis.com/you-dont-have-a-compute-problem-you-have-a-bytes-per-token-problem/) · [OpenTelemetry GenAI blog](https://opentelemetry.io/blog/2026/genai-observability/)


> [!question] Recall
> 1. Define TTFT, TPOT, throughput. Which phase drives each? (→ [[Prefill vs Decode]])
> 2. Why are output tokens pricier than input tokens?
> 3. Compute cost: 2,000 in / 800 out at $3/$15 per M.

Related: [[Prefill vs Decode]] · [[Back-of-the-Envelope Estimation]] · [[Cost Optimization]]
