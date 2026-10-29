---
tags: [ai-system-design, case-study, rag, routing]
aliases: [How Cursor Works]
---

# Case — How Cursor Works `[OS]`

> [!success] 🟢 Junior Explanation
> Idea in one line: **search your code by meaning (RAG) + use a different-sized model for each job** — tiny model for instant autocomplete, big model for thinking.

Code editor with an AI brain — **RAG + model routing** together.

## RAG over the codebase
Chunk code (e.g. **one function per chunk** — document-structure chunking) → embed → vector DB. "Where do we check the user's password?" → semantic search → matching code sent to LLM.

## Model routing by job
| Job | Model | Why |
|---|---|---|
| Tab autocomplete | Small, fast | Must appear **instantly** while typing |
| Chat & Agent | Big, smart | Hard thinking and code writing |
| Applying the change | Small, fast "Apply" model | Merging a described change is simple, quick |

Each model has one clear job → product both **smart and fast**.

Related: [[LLM Routing]] · [[Document Parsing and Chunking]] · [[Case - Claude Code]]
