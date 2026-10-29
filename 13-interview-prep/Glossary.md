---
tags: [ai-system-design, glossary]
aliases: [AI System Design Glossary]
---

# Glossary `[OS]` (+ `[SDH]`, `[JAM]`)

> [!success] 🟢 Junior Explanation
> Forgot a word? Find it here, then click the link for the note with the 🟢 simple explanation at the top.

| Term | Definition | Note |
|---|---|---|
| A2A | Open standard for one agent to talk to another across teams/vendors | [[MCP, A2A and Agent Skills]] |
| Agent Skill | Folder of instructions/scripts an agent loads only when needed | [[MCP, A2A and Agent Skills]] |
| Agentic RAG | AI agent drives the retrieval process | [[Agentic RAG, GraphRAG, Vectorless RAG]] |
| AI Agent | LLM + Instructions + Tools + Memory + Loop | [[What is an AI Agent]] |
| AI Agent Loop | Think → act → observe cycle repeated until done | [[Agent Loop]] |
| AI Agent Memory | System letting a stateless LLM act like it remembers | [[Agent Memory]] |
| AI Agent Observability | Recording everything an agent does, step by step | [[Observability]] |
| AI Gateway | Reverse proxy specialized for LLM traffic | [[API Gateway and AI Gateway]] |
| AI Orchestration | Coordinating LLMs, tools, data, agents in a developer-defined flow | [[AI Orchestration vs Agents - Loop and Graph Engineering]] |
| AI SubAgent | Smaller specialized agent under a main agent | [[Multi-Agent Systems and SubAgents]] |
| AI TRiSM `[SDH]` | Trust, Risk, and Security Management | [[Data Privacy and Compliance]] |
| ANN Search | Approximate nearest neighbor without comparing all vectors | [[Vector Databases and Indexes]] |
| API Gateway `[JAM]` | Single entry: auth, routing, rate limiting, protocol translation | [[API Gateway and AI Gateway]] |
| Chunk | Small piece cut from a bigger document | [[Document Parsing and Chunking]] |
| Circuit breaker `[JAM]` | Trips open on failures to stop cascades | [[Fault Tolerance and Circuit Breakers]] |
| ColBERT | One vector per token; late-interaction matching | [[Hybrid Search, HyDE, Reranking, ColBERT]] |
| Context Compaction | Shrinking old conversation into a summary | [[Context Engineering]] |
| Context Engineering | Managing everything in the context window | [[Context Engineering]] |
| Continuous Batching | Replace finished requests in a batch immediately | [[Continuous Batching]] |
| Decode | Generating output tokens one at a time | [[Prefill vs Decode]] |
| Embedding | Numbers capturing meaning; similar things close | [[Embeddings and Embedding Models]] |
| Embedding Cache | Stores embeddings keyed by text + model + version | [[Embedding Cache]] |
| Feature store `[SDH]` | Consistent features for training and serving | [[Feature Store and Offline vs Online]] |
| Flash Attention | Same attention, tiled in SRAM, no full matrix in HBM | [[Flash Attention]] |
| Function Calling | LLM requests external functions; = tool calling | [[Tool Calling]] |
| Graph Engineering | System designed as nodes, edges, shared state | [[AI Orchestration vs Agents - Loop and Graph Engineering]] |
| GraphRAG | RAG over a knowledge graph | [[Agentic RAG, GraphRAG, Vectorless RAG]] |
| Grouped Query Attention | Head groups share K/V → small KV cache | [[Grouped Query Attention]] |
| Harness | Code around the LLM running the loop, tools, context | [[Agent Loop]] |
| Hybrid Search | Keyword + semantic, merged ranking | [[Hybrid Search, HyDE, Reranking, ColBERT]] |
| HyDE | Search with embedding of a fake answer | [[Hybrid Search, HyDE, Reranking, ColBERT]] |
| Inference | Using a trained model to produce output | [[Inference Server and Engines]] |
| Inference Server | Loads LLM into GPU memory, serves requests | [[Inference Server and Engines]] |
| Knowledge Distillation | Small student imitates big teacher | [[Model Distillation]] |
| KV Cache | Stored Keys/Values of previous tokens | [[KV Cache]] |
| KV Cache Compression | Techniques to shrink KV cache | [[KV Cache]] |
| LLM as a Judge | LLM evaluates another LLM's output | [[Evaluation - LLM and Agent]] |
| LLM Evaluation | Measuring LLM performance on expected tasks | [[Evaluation - LLM and Agent]] |
| LLM Guardrails | Safety checks around LLM input and output | [[Guardrails]] |
| LLM Routing | Picking the right LLM per query | [[LLM Routing]] |
| LLM Watermarking | Hidden detectable signal in generated text | [[AI Red Teaming and LLM Watermarking]] |
| LoRA | Frozen base + small trained adapters | [[Fine-Tuning and LoRA]] |
| Loop Engineering | Designing the agent's repeating cycle | [[Agent Loop]] |
| Lost in the Middle | Middle of long context gets ignored | [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]] |
| LPU | Chip built only to run trained LMs fast | [[AI Hardware - GPU TPU LPU]] |
| MCP | Open standard connecting AI apps to tools/data | [[MCP, A2A and Agent Skills]] |
| Mixture of Experts | Expert networks + per-token router | [[Mixture of Experts]] |
| Model Quantization | Lower-precision weights/compute | [[Quantization]] |
| Multi-Agent System | Role-specialized agents on a shared task | [[Multi-Agent Systems and SubAgents]] |
| Paged Attention | KV cache in small fixed-size pages | [[KV Cache]] |
| Prefill | Processing whole prompt in one pass → first token | [[Prefill vs Decode]] |
| Prefill-Decode Disaggregation | Prefill and decode on separate GPUs | [[Prefill vs Decode]] |
| Prompt Caching | Reusing saved work for a repeated prompt prefix | [[Prompt Cache]] |
| Prompt Injection | Attacker instructions slipped into model input | [[Prompt Injection]] |
| RAG | Answer using your documents via retrieval | [[RAG Fundamentals]] |
| Reranker | Reorders retrieved docs by relevance | [[Hybrid Search, HyDE, Reranking, ColBERT]] |
| Semantic Caching | Cache matched by meaning | [[Semantic Cache]] |
| SGLang | Fast engine; prefix KV reuse | [[Inference Server and Engines]] |
| Speculative Decoding | Draft guesses, big model verifies in one pass | [[Speculative Decoding]] |
| Tensor Parallelism | Weight matrices split across GPUs | [[Scaling LLMs - Vertical Horizontal Tensor Pipeline]] |
| TensorRT-LLM | NVIDIA's max-speed engine | [[Inference Server and Engines]] |
| Token | Small piece of text (~4 chars) | [[LLM Recap - Tokens and Autoregression]] |
| Token Streaming | Send tokens as generated | [[Streaming Responses]] |
| TPOT | Time per output token after the first | [[Latency and Cost Metrics]] |
| Training–serving skew `[SDH]` | Train and serve code differ → quality loss | [[ML System Architecture - Data Model Serving Layers]] |
| TTFT | Time to first token | [[Latency and Cost Metrics]] |
| Vector Database | Stores and searches embeddings | [[Vector Databases and Indexes]] |
| Vectorless RAG | LLM navigates document structure, no embeddings | [[Agentic RAG, GraphRAG, Vectorless RAG]] |
| vLLM | High-throughput engine (PagedAttention, continuous batching) | [[Inference Server and Engines]] |
| Voice AI Agent | Talk and listen like a phone call with a human | [[Voice AI Agents]] |
