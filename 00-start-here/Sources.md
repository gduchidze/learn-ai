---
tags: [ai-system-design, meta]
---

# Sources

> [!success] 🟢 Junior Explanation
> You don't need to read the sources. Just know: `[OS]`, `[SDH]`, `[JAM]` tags show where each fact comes from.

All notes in this wiki are grounded in these three texts. Inline tag = where a claim comes from.

| Tag | Source | Strength |
|---|---|---|
| `[OS]` | **Outcome School — "AI System Design" guide** (Amit Shekhar, 2026, Apache-2.0) | Most complete. LLM inference, caching, RAG, agents, MCP, voice, safety, eval, optimization, 8-step framework, case studies. |
| `[SDH]` | **System Design Handbook — "AI System Design: A Complete Guide (2026)"** (Fahim Ul Haq) | Classic ML-system view: data/model/serving layers, feature store, offline vs online, deployment strategies, recommendation engine, interview structure. |
| `[JAM]` | **Jam with AI — "System Design for AI Engineers: 7 patterns"** (Shirin Khosravi Jam, Apr 2026) | Infra patterns interviewers probe: API gateway, rate limiting, caching, queues, circuit breakers, load balancing, auto scaling. |
| `[GEN]` | **General/textbook knowledge** — standard derivations and widely known facts (e.g. tensor shapes, bias–variance, tiling intuition, A100 specs, worked arithmetic). **Not verified against a source in this session**; spot-check against papers/datasheets before quoting exact figures. | Used mainly in folders 14 and 15. |
| `[WEB]` | **Web research (Oct 2026)** — original papers (vLLM, Orca, DistServe, LoRA, QLoRA, GQA, Switch, Lost in the Middle…), official docs (MCP, TGI, OpenTelemetry, OWASP) and engineering posts (Anthropic agents & context engineering) | Adds verified numbers, origins and diagrams. Every `## 🌐 Deeper Context` section lists its links. Full list → [[Research Library]]. |

> [!warning] Grounding rule
> Where a topic in the core track (e.g. self vs cross attention, PTQ vs QAT) is **not** in these sources, the note marks it with a `> [!note] Beyond the sources` callout so you know what is source-grounded and what is supplementary.

> [!info] Numbers
> Prices, model names, and benchmarks are quoted as the sources state them (2026). Treat them as interview-scale examples — the **method** matters more than the exact figure `[OS]`.

Back to [[AI System Design - Home]]
