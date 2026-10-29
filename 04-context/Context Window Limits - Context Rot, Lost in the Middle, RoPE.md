---
tags: [ai-system-design, context]
aliases: [Context Rot, Lost in the Middle, RoPE Decay, Context Window Management]
---

# Context Window Limits — Context Rot, Lost in the Middle, RoPE

> [!success] 🟢 Junior Explanation
> **In plain words:** Models can accept huge prompts, but they get worse at using them as they grow, and they often miss facts in the middle.
>
> **Analogy:** Reading a 300-page memo: you remember the beginning and the end, the middle is a blur.
>
> **Why interviewers ask:** 'Just stuff everything into the 1M context' is a common wrong answer.
>
> **Say it in one sentence:** "Bigger context isn't free quality: send fewer, more relevant tokens and place key facts at the start or end."
>
> 🎯 **Junior must know:** lost in the middle and the 'send less' rule. · **Middle adds:** context rot evidence and RoPE positional decay.

## Limits are finite `[OS]`
GPT-5.5 up to 400k tokens; Claude Sonnet 4.6 / Opus 4.8 up to 1M. All finite. Production hits limits constantly: long chats, RAG retrieving too much, agent loops piling up tool results.

> [!important] Max context = what you're **allowed** to use, not what you **must** use `[OS]`.

## Three quality killers `[OS]`
1. **Context Rot** — as tokens grow, recall from anywhere in context drops. Long-context evals (Needle-in-a-Haystack, RULER, LongBench) show accuracy drops **well before** the advertised limit → effective context < advertised.
2. **Lost in the Middle** (Liu et al., 2023) — models attend most to **start and end**, least to middle → **U-shaped** accuracy curve. Silently breaks RAG that dumps 50 chunks. Fix: send less but better ([[Hybrid Search, HyDE, Reranking, ColBERT|reranker]], keep top few), put most relevant chunks at **start and end**.
3. **RoPE positional decay** — Rotary Position Embedding makes attention depend on **relative distance**; far-apart tokens' attention tends to decay. Softened in newer models, not eliminated.

> [!tip] Practical rule `[OS]`
> **Placement matters as much as content.** Important context goes at the top of the system prompt or right next to the question — never buried in the middle.

## 🌐 Deeper Context `[WEB]`

| Study | What they found | What to do |
|---|---|---|
| **Lost in the Middle** — Liu et al., *TACL* 2023 (arXiv 2307.03172). Tasks: multi-document QA and key-value retrieval | Accuracy is highest when the needed info is at the **start or end**, drops in the **middle** (U-shape); performance also falls as context grows — **even for long-context models** | Rerank, send fewer chunks, put the best ones first/last |
| **Context Rot** — Chroma technical report, July 2025, **18 models** incl. GPT-4.1, Claude 4, Gemini 2.5, Qwen3 | Models do **not** treat the 10,000th token as reliably as the 100th; performance becomes increasingly unreliable as input grows — even on **simple tasks** like copying a repeated-word sequence | Don't trust the advertised window; test at your real lengths |
| **Anthropic, "Effective context engineering"** (Sept 2025) | Describes an **"attention budget"** that every token spends | Treat tokens as a scarce resource → [[Context Engineering]] |

```
Accuracy
  high |█                         █
       | █                      █
       |   █                 █
  low  |      █  █  █  █  █
       +-------------------------------
        start      middle         end   (position of the key fact)
```

**Sources:** [Lost in the Middle (arXiv)](https://arxiv.org/abs/2307.03172v3) · [Hugging Face paper page](https://huggingface.co/papers/2307.03172) · [Chroma: Context Rot](https://research.trychroma.com/context-rot) · [Anthropic: Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)


> [!question] Recall
> 1. Explain the U-shaped curve and two mitigations.
> 2. Why is "we have 1M context, just stuff everything" a bad design answer?

Related: [[Context Engineering]] · [[Agent Memory]]
