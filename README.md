<div align="center">

# 🧠 learn-ai

### The AI Engineer's field manual: from tokens to GPU kernels to production agents.

**160+ interlinked notes** covering AI system design, LLM internals, inference engineering and agent-assisted development.
Built for interviews and written for real systems.

![Notes](https://img.shields.io/badge/notes-160%2B-6E56CF?style=flat-square)
![Sections](https://img.shields.io/badge/sections-17-0EA5E9?style=flat-square)
![Case Studies](https://img.shields.io/badge/case_studies-14-F59E0B?style=flat-square)
![Obsidian](https://img.shields.io/badge/Obsidian-vault-7C3AED?style=flat-square&logo=obsidian&logoColor=white)

[**Start here →**](00-start-here/AI%20System%20Design%20-%20Home.md) · [Learning Path](00-start-here/Learning%20Path.md) · [Cheat Sheets](#-cheat-sheets) · [Case Studies](11-case-studies)

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
    F --> R[03 RAG] --> C[04 Context] --> A[05 Agents]
    A --> P[06 Serving & Scaling] --> K[07 Caching & Routing] --> Q[08 Quality & Ops] --> X[09 Safety]
    X --> CS[11 Case Studies] --> I[12 Interview Prep]
    I -.go deeper.-> ML[15 ML Foundations] --> MO[16 Model Optimization] --> IE[17 Inference Engineering]
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
| 03 | [**Retrieval & RAG**](03-retrieval-and-rag) | Chunking, embeddings, vector indexes, hybrid search, GraphRAG |
| 04 | [**Context**](04-context) | Context engineering, context rot, lost-in-the-middle |
| 05 | [**Agents**](05-agents) | Agent loop, tools, memory, MCP & A2A, multi-agent, computer use |
| | 🟡 **Production: ship it** | |
| 06 | [**Serving & Scaling**](06-serving-and-scaling) | AI gateways, LLM load balancing, rate limiting, streaming, autoscaling |
| 07 | [**Caching & Routing**](07-caching-and-routing) | KV, prompt and semantic caches, LLM routing |
| 08 | [**Quality & Ops**](08-quality-and-operations) | Evals, observability, deployment strategies, cost, multi-tenancy |
| 09 | [**Safety & Compliance**](09-safety-and-compliance) | Prompt injection, guardrails, red teaming, privacy |
| 10 | [**Multimodal & Voice**](10-multimodal-and-voice) | Voice agents, multimodal pipelines, on-device AI |
| | 🎯 **Interview & practice** | |
| 11 | [**Case Studies**](11-case-studies) | ChatGPT, Claude Code, Cursor, Perplexity, voice agents, fraud detection… |
| 12 | [**Interview Prep**](12-interview-prep) | 8-step framework, question bank, flashcards, key numbers |
| 13 | [**Agent-Assisted Engineering**](13-agent-assisted-engineering) | Working with coding agents: context, specs, verification, delegation |
| | 🔴 **Advanced: go deep** | |
| 14 | [**Classic ML Design**](14-classic-ml-system-design) | Feature stores, online vs offline, serving layers |
| 15 | [**ML Foundations**](15-ml-foundations) | Transformers, RoPE, scaling laws, ZeRO, SFT/RLHF/DPO, sampling |
| 16 | [**Model Optimization**](16-model-optimization) | FlashAttention, GQA, MoE, quantization, speculative decoding, LoRA |
| 17 | [**Inference Engineering**](17-inference-engineering) | Roofline, kernels & CUDA graphs, TP/PP/EP, FP8/FP4, $/M tokens |

---

## 🎯 Pick your path

| You are… | Go |
|---|---|
| 🌱 **New to AI systems** | 00 → 01 → 02 → 03 → 04 → 05, in order |
| 🏗️ **Backend engineer moving to AI** | 02 → 06 → 07 → 03 → 08 → 11 |
| 🤖 **Agent / GenAI engineer** | 03 → 04 → 05 → 09 → 08 → 13 |
| 🔥 **Inference / ML infra engineer** | 15 → 16 → 17 → 12 drills |
| ⏱️ **Interview next week** | 12 Interview Prep → 11 Case Studies → Cheat Sheets |

---

## 🧾 Cheat sheets

- 📏 [Key Numbers Cheat Sheet](12-interview-prep/Key%20Numbers%20Cheat%20Sheet.md): latency, memory and cost numbers to memorize
- ⚖️ [Trade-offs Cheat Sheet](12-interview-prep/Trade-offs%20Cheat%20Sheet.md)
- 🧮 [LLM Math Cheat Sheet](15-ml-foundations/LLM%20Math%20Cheat%20Sheet.md): params, FLOPs, KV-cache size
- 🧩 [7 Infra Patterns for AI Engineers](12-interview-prep/7%20Infra%20Patterns%20for%20AI%20Engineers.md)
- 🗣️ [Interview Framework: 8 Steps](12-interview-prep/Interview%20Framework%20-%208%20Steps.md)
- 🃏 [Flashcards](12-interview-prep/Flashcards.md) · 📖 [Glossary](12-interview-prep/Glossary.md)

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
