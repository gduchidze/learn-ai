<div align="center">

# 🧠 learn-ai

### The AI Engineer's field manual: from tokens to GPU kernels to production agents.

**200+ interlinked notes** covering AI system design, LLM internals, inference engineering and agent-assisted development.
Built for interviews and written for real systems.

![Notes](https://img.shields.io/badge/notes-200%2B-6E56CF?style=flat-square)
![Sections](https://img.shields.io/badge/sections-19-0EA5E9?style=flat-square)
![Case Studies](https://img.shields.io/badge/case_studies-14-F59E0B?style=flat-square)
![Obsidian](https://img.shields.io/badge/Obsidian-vault-7C3AED?style=flat-square&logo=obsidian&logoColor=white)

[**Start here →**](00-start-here/AI%20System%20Design%20-%20Home.md) · [Learning Path](00-start-here/Learning%20Path.md) · [Cheat Sheets](#-cheat-sheets) · [Case Studies](12-case-studies)

</div>

---

## ⚡ Why this exists

Most AI material stops at "call the API". Real AI engineering interviews and production systems go further and ask:

- Why is **decode memory-bound** and **prefill compute-bound**?
- How do you serve a **70B model on 4×A100**, and should that be TP=2 or TP=4?
- How do you design **RAG** that stays accurate at 10M documents?
- How do you make an **agent** reliable, observable and cheap?

This repo answers those questions in one connected graph. Every note links to its prerequisites and follow-ups, and most notes open with a 🟢 plain-language summary.

---

## 🗺️ The map

```mermaid
flowchart LR
    S[00 Start Here] --> J[01 Junior Track] --> F[02 Foundations]
    F --> ML0[03 ML From Scratch ⭐] --> R[04 RAG] --> C[05 Context] --> A[06 Agents]
    A --> P[07 Serving & Scaling] --> K[08 Caching & Routing] --> Q[09 Quality & Ops] --> X[10 Safety]
    X --> CS[12 Case Studies] --> I[13 Interview Prep]
    I -.go deeper.-> ML[16 ML Foundations] --> MO[17 Model Optimization] --> IE[18 Inference Engineering]
```

---

## 📚 Sections

Folders are numbered in reading order, from first steps to GPU internals.

| # | Section | What you'll master |
|---|---|---|
| | 🟢 **Beginner: start here** | |
| 00 | [**Start Here**](00-start-here) | Home, learning path, gap analysis, research library |
| 01 | [**Junior Track**](01-junior-track) | 10-day plan, the story of one request, 3 mock interviews |
| 02 | [**Foundations**](02-foundations) | Tokens, prefill vs decode, GPU/TPU/LPU, latency & cost metrics |
| 03 | [**ML From Scratch**](03-ml-from-scratch) ⭐ | 36 visual lessons: gradient descent → backprop → PyTorch → attention → **build & train your own GPT** |
| 04 | [**Retrieval & RAG**](04-retrieval-and-rag) | Chunking, embeddings, vector indexes, hybrid search, GraphRAG |
| 05 | [**Context**](05-context) | Context engineering, context rot, lost-in-the-middle |
| 06 | [**Agents**](06-agents) | Agent loop, tools, memory, MCP & A2A, multi-agent, computer use |
| | 🟡 **Production: ship it** | |
| 07 | [**Serving & Scaling**](07-serving-and-scaling) | AI gateways, LLM load balancing, rate limiting, streaming, autoscaling |
| 08 | [**Caching & Routing**](08-caching-and-routing) | KV, prompt and semantic caches, LLM routing |
| 09 | [**Quality & Ops**](09-quality-and-operations) | Evals, observability, deployment strategies, cost, multi-tenancy |
| 10 | [**Safety & Compliance**](10-safety-and-compliance) | Prompt injection, guardrails, red teaming, privacy |
| 11 | [**Multimodal & Voice**](11-multimodal-and-voice) | Voice agents, multimodal pipelines, on-device AI |
| | 🎯 **Interview & practice** | |
| 12 | [**Case Studies**](12-case-studies) | ChatGPT, Claude Code, Cursor, Perplexity, voice agents, fraud detection… |
| 13 | [**Interview Prep**](13-interview-prep) | 8-step framework, question bank, flashcards, key numbers |
| 14 | [**Agent-Assisted Engineering**](14-agent-assisted-engineering) | Working with coding agents: context, specs, verification, delegation |
| | 🔴 **Advanced: go deep** | |
| 15 | [**Classic ML Design**](15-classic-ml-system-design) | Feature stores, online vs offline, serving layers |
| 16 | [**ML Foundations**](16-ml-foundations) | Transformers, RoPE, scaling laws, ZeRO, SFT/RLHF/DPO, sampling |
| 17 | [**Model Optimization**](17-model-optimization) | FlashAttention, GQA, MoE, quantization, speculative decoding, LoRA |
| 18 | [**Inference Engineering**](18-inference-engineering) | Roofline, kernels & CUDA graphs, TP/PP/EP, FP8/FP4, $/M tokens |

---

## 🎯 Pick your path

| You are… | Go |
|---|---|
| 🌱 **New to AI systems** | 00 → 01 → 02 → **03 ML From Scratch** → 04 → 05 → 06 |
| 🏗️ **Backend engineer moving to AI** | 02 → 07 → 08 → 04 → 09 → 12 |
| 🤖 **Agent / GenAI engineer** | 04 → 05 → 06 → 10 → 09 → 14 |
| 🔥 **Inference / ML infra engineer** | 03 (module ⑦) → 16 → 17 → 18 → 13 drills |
| ⏱️ **Interview next week** | 13 Interview Prep → 12 Case Studies → Cheat Sheets |

---

## 🧾 Cheat sheets

- 📏 [Key Numbers Cheat Sheet](13-interview-prep/Key%20Numbers%20Cheat%20Sheet.md): latency, memory and cost numbers to memorize
- ⚖️ [Trade-offs Cheat Sheet](13-interview-prep/Trade-offs%20Cheat%20Sheet.md)
- 🧮 [LLM Math Cheat Sheet](16-ml-foundations/LLM%20Math%20Cheat%20Sheet.md): params, FLOPs, KV-cache size
- 🧩 [7 Infra Patterns for AI Engineers](13-interview-prep/7%20Infra%20Patterns%20for%20AI%20Engineers.md)
- 🗣️ [Interview Framework: 8 Steps](13-interview-prep/Interview%20Framework%20-%208%20Steps.md)
- 🃏 [Flashcards](13-interview-prep/Flashcards.md) · 📖 [Glossary](13-interview-prep/Glossary.md)

---

## 🛠️ How to read it

**Best:** open the repo as an [Obsidian](https://obsidian.md) vault. You get `[[wikilinks]]`, graph view, callouts and Mermaid diagrams out of the box.

```bash
git clone https://github.com/gduchidze/learn-ai.git
# Obsidian → "Open folder as vault" → select learn-ai
```

**Also fine:** read it on GitHub. Markdown, tables and Mermaid render natively. `[[wikilinks]]` show as plain text, so use the section folders above to navigate.

### Note conventions
- 🟢 **Junior Explanation**: plain-words summary at the top of each note
- 🌐 **Deeper Context**: verified numbers, paper origins, links
- Source tags: `[OS]` Outcome School · `[SDH]` System Design Handbook · `[JAM]` Jam with AI · `[WEB]` web research. See [Sources](00-start-here/Sources.md)

---

## 🤝 Contributing

Found a wrong number, a stale benchmark or a missing topic? PRs and issues are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for note style and conventions.

<div align="center">

⭐ **If this saved you an interview or an outage, star the repo.** ⭐

</div>
