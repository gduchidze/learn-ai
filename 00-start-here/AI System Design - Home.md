---
tags: [ai-system-design, moc]
aliases: [AISD Home, AI System Design MOC]
---

# AI System Design — Home

> [!success] 🟢 Junior Explanation
> New to this? Start with [[Junior Start Here]] — it explains everything in simple words and gives you a 10-day plan, mock interviews and a workbook.

> [!abstract] What this wiki is
> Full study wiki for the **AI System Design interview** (AI Engineer, GenAI/LLM Engineer, Agent Engineer, MLOps/LLMOps, Applied AI).
> Every note is grounded in three sources — see [[Sources]]. Tags inside notes: `[OS]` Outcome School guide, `[SDH]` System Design Handbook guide, `[JAM]` Jam with AI "7 patterns".

**Core formula** `[OS]`: *AI System Design = System Design + the new constraints of AI models* (GPUs, tokens, long streamed responses, non-deterministic output, real cost per request).

Start with → [[Learning Path]] · then → [[Interview Framework - 8 Steps]]

> [!tip] 🧠 Targeting AI Engineer / Inference Engineer at big tech?
> Read [[Gap Analysis - What Was Missing]] first. New folders: **15 ML Foundations** (LLM internals + ML/DL intuition) and **17 Inference Engineering** (GPU, roofline, parallelism, kernels, engine internals, benchmarking, capacity).

> [!info] 🌐 Web-enhanced
> 35+ notes now end with a **🌐 Deeper Context** section (verified numbers, paper origins, mermaid diagrams, links). Reading list → [[Research Library]]. New pattern guide → [[Agentic Workflow Patterns]].

---

## 🟢 Junior / Middle Track (start here if you're new)
| Step | Note |
|---|---|
| 0. Orientation | [[Junior Start Here]] · [[Junior vs Middle - What Interviewers Expect]] |
| 1. Basics | [[Prerequisites - System Design Basics]] · [[Prerequisites - AI Basics]] |
| 2. Big picture | [[The Story of One Request]] |
| 3. Concepts fast | [[60-Second Answers]] (+ the 🟢 box at the top of every note) |
| 4. Speak like an engineer | [[How to Talk in the Interview]] · [[Common Junior Mistakes]] |
| 5. Mock interviews | [[Mock Interview 1 - Support Chatbot]] · [[Mock Interview 2 - Summarize 50,000 Documents]] · [[Mock Interview 3 - Simple AI Agent]] |
| 6. Practice | [[Practice Workbook]] · [[Flashcards]] |

---

## Core Track (your numbered topics)

### Large Language Models
| # | Topic | Note |
|---|---|---|
| 01 | Attention | [[Attention]] |
| 02 | KV Cache | [[KV Cache]] |
| 03 | Speculative Decoding | [[Speculative Decoding]] |
| 04 | Quantization | [[Quantization]] |
| 05 | Fine Tuning | [[Fine-Tuning and LoRA]] |
| 06 | Mixture of Experts | [[Mixture of Experts]] |
| 07 | Agent Loop | [[Agent Loop]] |

### Agents
| # | Topic | Note |
|---|---|---|
| 07 | Agent Loop | [[Agent Loop]] |
| 08 | Tool Calling | [[Tool Calling]] |
| 09 | Context Engineering | [[Context Engineering]] |
| 10 | Agent Memory | [[Agent Memory]] |
| 11 | Planning and Task Decomposition | [[Planning and Task Decomposition]] |

---

## Full Map

### 00 Start Here
- [[Sources]] · [[Learning Path]] · [[Research Library]] · [[Gap Analysis - What Was Missing]]

### 02 Foundations
- [[AI vs Regular System Design]]
- [[LLM Recap - Tokens and Autoregression]]
- [[Inference Server and Engines]]
- [[AI Hardware - GPU TPU LPU]]
- [[Latency and Cost Metrics]]
- [[Prefill vs Decode]]

### 06 Serving and Scaling
- [[Scaling LLMs - Vertical Horizontal Tensor Pipeline]]
- [[Auto Scaling and Warm Pools]]
- [[Load Balancing for LLMs]]
- [[Back-of-the-Envelope Estimation]]
- [[Streaming Responses]]
- [[Async Processing and Message Queues]]
- [[Rate Limiting]]
- [[API Gateway and AI Gateway]]
- [[Fault Tolerance and Circuit Breakers]]

### 07 Caching and Routing
- [[Caching in AI - Overview]]
- [[KV Cache]] · [[Prompt Cache]] · [[Semantic Cache]] · [[Embedding Cache]]
- [[LLM Routing]]

### 03 Retrieval and RAG
- [[Embeddings and Embedding Models]]
- [[Vector Databases and Indexes]]
- [[RAG Fundamentals]]
- [[Document Parsing and Chunking]]
- [[Hybrid Search, HyDE, Reranking, ColBERT]]
- [[Agentic RAG, GraphRAG, Vectorless RAG]]
- [[Embeddings Pipeline]]

### 04 Context
- [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]]
- [[Context Engineering]]

### 05 Agents
- [[What is an AI Agent]]
- [[Agentic Workflow Patterns]]
- [[Agent Loop]]
- [[Tool Calling]]
- [[Structured Output]]
- [[MCP, A2A and Agent Skills]]
- [[Agent Memory]]
- [[Planning and Task Decomposition]]
- [[AI Orchestration vs Agents - Loop and Graph Engineering]]
- [[Multi-Agent Systems and SubAgents]]
- [[Computer Use and Browser Agents]]

### 10 Multimodal and Voice
- [[Multimodal Systems]]
- [[Voice AI Agents]]
- [[Edge AI and On-Device Inference]]

### 09 Safety and Compliance
- [[Guardrails]]
- [[Prompt Injection]]
- [[AI Red Teaming and LLM Watermarking]]
- [[Data Privacy and Compliance]]

### 08 Quality and Operations
- [[Observability]]
- [[Evaluation - LLM and Agent]]
- [[Prompt Management and DSPy]]
- [[Cost Optimization]]
- [[Multi-Tenancy]]
- [[Model Deployment Strategies]]

### 16 Model Optimization
- [[Inference Optimization - Overview]]
- [[Attention]] · [[Flash Attention]] · [[Grouped Query Attention]]
- [[Quantization]] · [[Continuous Batching]] · [[Speculative Decoding]]
- [[Test-Time Compute]] · [[Mixture of Experts]] · [[Model Distillation]]
- [[Fine-Tuning and LoRA]]

### 14 Classic ML System Design
- [[ML System Architecture - Data Model Serving Layers]]
- [[Feature Store and Offline vs Online]]
- [[Classic ML Components]]

### 11 Case Studies
- **[[Case Studies Index]]** (study order + building-block matrix)
- [[Case - Customer Support Chatbot]]
- [[Case - Claude Code]]
- [[Case - Cursor]]
- [[Case - Real-Time Voice AI Agent]]
- [[Case - Recommendation Engine]]
- [[Case - ChatGPT-Scale Chat Assistant]]
- [[Case - Perplexity-Style AI Search Engine]]
- [[Case - Multi-Agent Research Assistant]]
- [[Case - LLM Inference Platform for Many Teams]]
- [[Case - Enterprise AI Gateway]]
- [[Case - Legal Contract Q&A]]
- [[Case - Real-Time Fraud Detection]]
- [[Case - On-Device AI Assistant]]
- [[Case - LLM Evaluation and Monitoring Pipeline]]

### 15 ML Foundations (LLM Internals + ML/DL Intuition)
- [[ML Foundations Roadmap]]
- [[ML Basics - Learning, Generalization and Metrics]] · [[Training Fundamentals - Loss, Gradients, Optimizers]] · [[Neural Network Building Blocks]]
- [[Tokenization and Embeddings Internals]] · [[Transformer Architecture Deep Dive]] · [[Positional Encodings - RoPE, ALiBi and Long Context]]
- [[Pretraining - Scaling Laws and Compute Math]] · [[Distributed Training - Memory, ZeRO and Parallelism]]
- [[Post-Training - SFT, RLHF and DPO]] · [[Decoding and Sampling]]
- [[LLM Math Cheat Sheet]] · [[LLM Internals and ML Foundations Q&A]]

### 17 Inference Engineering
- [[GPU Architecture for Inference Engineers]] · [[Roofline and Performance Modeling]]
- [[Parallelism for Inference]] · [[Kernels, Fusion and CUDA Graphs]] · [[Inference Engine Internals]]
- [[Low-Precision Inference]] · [[Long Context and KV Cache Engineering]] · [[MoE Serving and Expert Parallelism]]
- [[Benchmarking and Profiling Methodology]] · [[Capacity Planning and Cost per Million Tokens]]
- [[Inference Whiteboard Drills]] · [[Inference Engineer Interview Q&A]]

### 13 Agent-Assisted Engineering (Zero → Hero)
- [[00 Agent-Assisted Engineering Roadmap]]
- [[02 Foundations - How Agents Actually Work]] · [[02 Context Engineering and Repo Memory]]
- [[03 Specification, Framing and Planning]] · [[04 Verification - Tests, Feedback Loops and Gates]]
- [[05 Debugging, Code Review and Codebase Design]] · [[06 Delegation, Parallelism and Handoff]]
- [[07 Software Factories and Automation]] · [[08 Projects, Capstone and Mastery]]

### 12 Interview Prep
- [[Interview Framework - 8 Steps]]
- [[7 Infra Patterns for AI Engineers]]
- [[Trade-offs Cheat Sheet]]
- [[Key Numbers Cheat Sheet]]
- [[Interview Question Bank]]
- [[Flashcards]]
- [[Glossary]]
