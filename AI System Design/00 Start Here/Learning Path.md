---
tags: [ai-system-design, meta]
---

# Learning Path

> [!success] 🟢 Junior Explanation
> Juniors: first do the [[Junior Start Here]] 10-day plan, then come back here for the full path.

> [!tip] How to use `[OS]`
> - New to the topic → read top to bottom; each block builds on the previous.
> - Interview soon → read [[Interview Framework - 8 Steps]] first, then the building blocks.
> - After every note: explain it out loud as if to a friend. If you can explain it, you learned it. Then do the **Recall** questions at the bottom of each note.

## Phase 1 — How an LLM actually runs (Day 1–2)
1. [[AI vs Regular System Design]]
2. [[LLM Recap - Tokens and Autoregression]] → [[Attention]]
3. [[Inference Server and Engines]] → [[AI Hardware - GPU TPU LPU]]
4. [[Latency and Cost Metrics]] → [[Prefill vs Decode]]
5. [[KV Cache]]

## Phase 2 — Serving at scale (Day 3–4)
6. [[Scaling LLMs - Vertical Horizontal Tensor Pipeline]] → [[Auto Scaling and Warm Pools]]
7. [[Load Balancing for LLMs]] → [[Back-of-the-Envelope Estimation]]
8. [[Caching in AI - Overview]] → [[Prompt Cache]] → [[Semantic Cache]] → [[Embedding Cache]]
9. [[LLM Routing]]
10. [[Streaming Responses]] → [[Async Processing and Message Queues]] → [[Rate Limiting]] → [[API Gateway and AI Gateway]] → [[Fault Tolerance and Circuit Breakers]]
11. [[7 Infra Patterns for AI Engineers]] (quick JAM recap)

## Phase 3 — Retrieval (Day 5–6)
12. [[Embeddings and Embedding Models]] → [[Vector Databases and Indexes]]
13. [[RAG Fundamentals]] → [[Document Parsing and Chunking]] → [[Hybrid Search, HyDE, Reranking, ColBERT]]
14. [[Agentic RAG, GraphRAG, Vectorless RAG]] → [[Embeddings Pipeline]]
15. [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]] → [[Context Engineering]]

## Phase 4 — Agents (Day 7–8)
16. [[What is an AI Agent]] → [[Agentic Workflow Patterns]] → [[Agent Loop]] → [[Tool Calling]] → [[Structured Output]]
17. [[MCP, A2A and Agent Skills]] → [[Agent Memory]] → [[Planning and Task Decomposition]]
18. [[AI Orchestration vs Agents - Loop and Graph Engineering]] → [[Multi-Agent Systems and SubAgents]] → [[Computer Use and Browser Agents]]

## Phase 5 — Modalities, Safety, Quality (Day 9–10)
19. [[Multimodal Systems]] → [[Voice AI Agents]] → [[Edge AI and On-Device Inference]]
20. [[Guardrails]] → [[Prompt Injection]] → [[AI Red Teaming and LLM Watermarking]] → [[Data Privacy and Compliance]]
21. [[Observability]] → [[Evaluation - LLM and Agent]] → [[Prompt Management and DSPy]]
22. [[Cost Optimization]] → [[Multi-Tenancy]] → [[Model Deployment Strategies]]

## Phase 6 — Model-level optimization (Day 11)
23. [[Inference Optimization - Overview]] → [[Quantization]] → [[Continuous Batching]] → [[Speculative Decoding]]
24. [[Flash Attention]] → [[Grouped Query Attention]] → [[Mixture of Experts]] → [[Model Distillation]] → [[Test-Time Compute]]
25. [[Fine-Tuning and LoRA]]

## Phase 7 — Classic ML + Practice (Day 12–14)
26. [[ML System Architecture - Data Model Serving Layers]] → [[Feature Store and Offline vs Online]] → [[Classic ML Components]]
27. Case studies: start at [[Case Studies Index]] (14 cases, ordered 🟢→🔴, with a building-block matrix)
28. Drill: [[Interview Question Bank]], [[Flashcards]], [[Trade-offs Cheat Sheet]], [[Key Numbers Cheat Sheet]]
29. Name-drop the origins: skim the ⭐ items in [[Research Library]]

## Phase 8 — ML Foundation round (Day 15–17)
30. [[ML Basics - Learning, Generalization and Metrics]] → [[Training Fundamentals - Loss, Gradients, Optimizers]] → [[Neural Network Building Blocks]]
31. [[Tokenization and Embeddings Internals]] → [[Transformer Architecture Deep Dive]] → [[Positional Encodings - RoPE, ALiBi and Long Context]]
32. [[Pretraining - Scaling Laws and Compute Math]] → [[Distributed Training - Memory, ZeRO and Parallelism]] → [[Post-Training - SFT, RLHF and DPO]] → [[Decoding and Sampling]]
33. Drill: [[LLM Math Cheat Sheet]] → [[LLM Internals and ML Foundations Q&A]]

## Phase 9 — Inference Engineer track (Day 18–21)
34. [[GPU Architecture for Inference Engineers]] → [[Roofline and Performance Modeling]]
35. [[Parallelism for Inference]] → [[MoE Serving and Expert Parallelism]] → [[Long Context and KV Cache Engineering]]
36. [[Kernels, Fusion and CUDA Graphs]] → [[Inference Engine Internals]] → [[Low-Precision Inference]]
37. [[Benchmarking and Profiling Methodology]] → [[Capacity Planning and Cost per Million Tokens]]
38. Drill: [[Inference Whiteboard Drills]] → [[Inference Engineer Interview Q&A]]
(See [[Gap Analysis - What Was Missing]] for what's still on you: real CUDA/Triton coding practice.)

> [!warning] Biggest interview mistake `[OS]`
> Over-engineering. Start with the simplest design that works (a single LLM call) and add vector DB / agents / multi-agent **only when requirements demand it**.
