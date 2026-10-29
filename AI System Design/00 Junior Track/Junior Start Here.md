---
tags: [ai-system-design, junior]
aliases: [Junior Track, Beginner Start]
---

# 🟢 Junior Start Here

> [!abstract] Who this is for
> You are a **junior or middle developer**. Maybe you have called the OpenAI API once. Maybe you never designed a big system. That is fine.
> This track explains **everything in simple words**, then sends you to the deeper notes when you are ready.

## The one idea to remember
An AI product is **a normal web system + one special box in the middle: the LLM**.
The LLM box is **slow, expensive, a bit random, and talks one word at a time**.
Almost every AI system design question is just: *"How do you build the rest of the system around this strange box?"* `[OS]`

```
Normal system:   User -> Server -> Database
AI system:       User -> Server -> [ LLM box on an expensive GPU ] (+ database, cache, search...)
```

## How to study (4 levels)
| Level | Goal | Notes |
|---|---|---|
| **L0 — Basics** | Understand the words people use | [[Prerequisites - System Design Basics]], [[Prerequisites - AI Basics]] |
| **L1 — Big picture** | See how one request flows end to end | [[The Story of One Request]] |
| **L2 — Concepts** | Explain each building block in 60 seconds | [[60-Second Answers]], then each note's 🟢 box |
| **L3 — Interview** | Speak like an engineer under time pressure | [[How to Talk in the Interview]], [[Mock Interview 1 - Support Chatbot]], [[Mock Interview 2 - Summarize 50,000 Documents]], [[Mock Interview 3 - Simple AI Agent]] |
| **Practice** | Check yourself | [[Practice Workbook]], [[Common Junior Mistakes]], [[Flashcards]] |
| **Going deeper (Middle → Senior)** | ML foundations & GPU/inference internals | [[Gap Analysis - What Was Missing]] → [[ML Foundations Roadmap]], [[Roofline and Performance Modeling]] |
| **Case studies** | See full designs, easiest first | [[Case Studies Index]] (start with the 🟢 cases) |

Know what level you are aiming for → [[Junior vs Middle - What Interviewers Expect]].

## How every note in this wiki works
Every note now starts with a green box:
> [!success] 🟢 Junior Explanation
> **In plain words** — the idea with no jargon.
> **Analogy** — a real-life picture.
> **Why interviewers ask** — what they want to see.
> **Say it in one sentence** — what you answer out loud.
> **Junior must know / Middle adds** — how deep to go.

Read the green box first. Read the rest of the note only when the box makes sense.
Many notes also end with a **🌐 Deeper Context** section: real numbers from research papers, diagrams, and links. Read those last — they make your answers sound grounded ("the vLLM paper showed…").

## A 10-day plan for juniors
| Day | Read |
|---|---|
| 1 | Prerequisites (both) + [[The Story of One Request]] |
| 2 | [[AI vs Regular System Design]], [[LLM Recap - Tokens and Autoregression]], [[Latency and Cost Metrics]] |
| 3 | [[Prefill vs Decode]], [[KV Cache]], [[Inference Server and Engines]] |
| 4 | [[Caching in AI - Overview]], [[Prompt Cache]], [[Semantic Cache]], [[LLM Routing]] |
| 5 | [[7 Infra Patterns for AI Engineers]] (gateway, rate limit, cache, queue, breaker, LB, autoscale) |
| 6 | [[RAG Fundamentals]], [[Embeddings and Embedding Models]], [[Vector Databases and Indexes]], [[Document Parsing and Chunking]] |
| 7 | [[What is an AI Agent]], [[Agentic Workflow Patterns]], [[Agent Loop]], [[Tool Calling]], [[Agent Memory]] |
| 8 | [[Guardrails]], [[Prompt Injection]], [[Evaluation - LLM and Agent]], [[Observability]], [[Cost Optimization]] |
| 9 | [[Interview Framework - 8 Steps]] + Mock Interview 1 (read, then say it out loud) |
| 10 | Mock Interviews 2 & 3 + [[Practice Workbook]] |
Middle developers: add the [[Learning Path]] phases 6–7 (model optimization, classic ML).

> [!tip] The golden rule
> Interviewers do **not** expect you to know everything. They expect you to: **ask good questions, start simple, explain trade-offs, and think about what breaks.** `[OS]` `[SDH]` `[JAM]`
