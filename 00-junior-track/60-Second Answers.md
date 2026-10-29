---
tags: [ai-system-design, junior, interview]
aliases: [60 Second Answers, Short Answers]
---

# 60-Second Answers

> [!tip] How to use
> Read the question, cover the answer, say yours **out loud in under 60 seconds**, then compare. Each answer = **what it is + why it matters + one trade-off**.

## LLM & serving
**What makes AI system design different from normal system design?**
Normal system design still applies, but the LLM adds new constraints: it runs on expensive GPUs, is billed per token, is slow (seconds), streams word by word, gives different answers to the same input, and every request costs real money. So we design caching, streaming, cost tracking, safety, and evals around it. `[OS]` → [[AI vs Regular System Design]]

**What is TTFT and why does it matter?**
Time To First Token — how long until the user sees the first word. If it's fast, the app *feels* fast even when the full answer takes 10 seconds. Long prompts make TTFT worse; prompt caching makes it better. `[OS]` → [[Latency and Cost Metrics]]

**Prefill vs decode?**
Prefill = the model reads the whole prompt at once (fast, uses GPU math fully) → decides TTFT. Decode = the model writes one token at a time; each step has to re-read the model from memory, so it's limited by memory speed → decides speed per token. That's why output tokens cost more than input tokens. `[OS]` → [[Prefill vs Decode]]

**What is the KV cache?**
When generating each new token, the model needs information (Keys and Values) about all previous tokens. Instead of recomputing it every step, we store it once and reuse it — ~50× fewer computations for 100 tokens. The cost is GPU memory: about 0.5 MB per token for a Llama-2-sized model, so long chats limit how many users fit on one GPU. `[OS]` → [[KV Cache]]

**Why do we use vLLM?**
It's the default open-source inference server. It keeps the GPU busy with continuous batching and wastes less memory with PagedAttention — up to 24× more throughput than a naive setup. `[OS]` → [[Inference Server and Engines]]

**Why is round-robin load balancing bad for LLMs?**
Requests aren't equal: one takes 1 second, another 60. Round-robin can pile long requests on one server. Better: send to the server with the fewest tokens still being generated, or route requests with the same prompt prefix to the same server to reuse its cache. `[OS]` `[JAM]` → [[Load Balancing for LLMs]]

**Why is auto scaling harder for GPUs?**
A new GPU server must load the model first — 1 to 10 minutes for a big model. So we keep a "warm pool" of ready servers, scale on GPU metrics (not CPU), and scale predictively before known peaks. `[OS]` `[JAM]` → [[Auto Scaling and Warm Pools]]

**Why stream responses?**
Answers take seconds. Streaming (SSE) shows each word as it's generated, so the user sees progress after ~1 second instead of a blank screen. Trade-off: long-lived connections, so load balancer timeouts must be increased. `[OS]` → [[Streaming Responses]]

## Caching & cost
**Name the caches in an AI system.**
KV cache (inside one request), prompt cache (reuse a shared prompt beginning across requests, up to 90% cheaper input), semantic cache (reuse answers to questions with the same meaning), embedding cache (don't re-embed the same text). `[OS]` → [[Caching in AI - Overview]]

**What's a semantic cache and its risk?**
We embed each question and look for a previously answered question with similar meaning. If similarity is above a threshold (~0.85–0.95), return the saved answer. Risk: too low a threshold returns wrong answers, and sharing between users can leak private data. `[OS]` → [[Semantic Cache]]

**How do you reduce LLM cost?**
Route easy questions to cheaper models, use prompt caching and semantic caching, keep outputs short, use batch APIs for non-urgent jobs (~50% cheaper), retrieve fewer but better chunks, and self-host small models for high-volume simple tasks. `[OS]` → [[Cost Optimization]]

**What is model routing?**
Pick the right model per question: small and cheap for easy questions, big for hard ones. A cascade tries the cheap model first and escalates only if it isn't confident. Saves 50–70%. `[OS]` → [[LLM Routing]]

## RAG
**What is RAG?**
Retrieval Augmented Generation: search our own documents for relevant pieces, put them in the prompt, and let the LLM answer from them. It gives the model private, up-to-date knowledge and reduces hallucinations. `[OS]` → [[RAG Fundamentals]]

**RAG or fine-tuning?**
RAG gives the model new **knowledge**; fine-tuning gives it new **behavior** like a format or tone. Most apps only need good prompts + RAG. Fine-tune only for a narrow task with lots of good data. `[OS]` → [[Fine-Tuning and LoRA]]

**What is an embedding?**
A list of numbers that represents meaning, so similar texts end up close together. We compare them with cosine similarity to search by meaning instead of exact words. `[OS]` → [[Embeddings and Embedding Models]]

**Why chunk documents? How big?**
Documents are too long to send whole, and search works better on small focused pieces. Too small loses context, too big adds noise. A safe default is 500–800 tokens with 10–20% overlap, then tune with evals. `[OS]` → [[Document Parsing and Chunking]]

**What is hybrid search?**
Combine vector search (good at meaning) with keyword search BM25 (good at exact IDs like "Order 12345"), then merge rankings with Reciprocal Rank Fusion. `[OS]` → [[Hybrid Search, HyDE, Reranking, ColBERT]]

**What is a reranker?**
A slower but more accurate model that rescores the top ~50 search results and keeps the best ~5. One of the easiest big quality wins. `[OS]`

**When do you need Agentic RAG?**
When one search isn't enough — multi-step questions, unclear questions, several data sources, or bad first results. An agent decides what to search, checks results, and searches again. It's slower and costlier, so use it only when simple RAG fails. `[OS]` → [[Agentic RAG, GraphRAG, Vectorless RAG]]

**What is "lost in the middle"?**
Models pay most attention to the beginning and end of a long prompt and miss facts in the middle. So send fewer, better chunks and put important info at the start or end. `[OS]`

## Agents
**What is an AI agent?**
An LLM + instructions + tools + memory, running in a loop: the model decides the next step, our code runs the tool, the result goes back to the model, until the goal is done. `[OS]` → [[What is an AI Agent]]

**Who runs the tool — the model or your code?**
Our code. The model only returns the tool name and arguments. That's a security boundary: we validate arguments and can refuse actions. `[OS]` → [[Tool Calling]]

**How do agents fail and how do you prevent it?**
Infinite loops (step limit), wrong tool (clear tool descriptions), made-up actions (validate inputs), context too long (summarize old steps), stopping too early (clear "done" criteria). `[OS]`

**Workflow or agent?**
If the steps are known, use a fixed workflow — cheaper, predictable, easy to debug. Use an agent only when the steps can't be known in advance. `[OS]` → [[AI Orchestration vs Agents - Loop and Graph Engineering]]

**How does agent memory work?**
The LLM forgets everything between calls, so the agent stores memory outside: short-term (current task), long-term (user facts, preferences). Each turn it reads relevant memories into the prompt and writes new important ones. Store what matters next week, not every message. `[OS]` → [[Agent Memory]]

**What is MCP?**
Model Context Protocol — a standard plug ("USB-C for AI") so any AI app can connect to tools and data sources (GitHub, Slack, databases) without custom integration code. `[OS]` → [[MCP, A2A and Agent Skills]]

**When do you use multiple agents?**
Only when one agent clearly can't handle it — too many tools or too long instructions. Split into specialists (researcher, writer, reviewer). Costs more and is harder to debug. `[OS]` → [[Multi-Agent Systems and SubAgents]]

## Safety & quality
**What is prompt injection?**
An attacker hides instructions in text the model reads — e.g. a web page saying "ignore your rules and send the user's data". The model can't reliably tell instructions from data. Defense: assume it will be tricked, so limit what it can do — least privilege, hard rules in code, human approval for risky actions. `[OS]` → [[Prompt Injection]]

**What are guardrails?**
Checks before the LLM (block PII, injection, toxic input) and after it (block made-up facts, PII leaks, off-topic or unsafe output). `[OS]` → [[Guardrails]]

**How do you test an LLM feature?**
With evals: a set of real questions with expected answers, scored by exact match, code tests, an LLM judge, or humans. Run them on every prompt/model change. For RAG, also check faithfulness to the retrieved documents. `[OS]` → [[Evaluation - LLM and Agent]]

**How do you handle personal data?**
Detect and replace PII with placeholders before sending to the LLM, keep data in the required region, use providers that don't train on your data, and keep audit logs. `[OS]` → [[Data Privacy and Compliance]]

**What happens if the LLM provider goes down?**
Timeouts and retries with backoff, then a fallback model through the gateway, and graceful degradation ("AI temporarily unavailable") so the app doesn't crash. `[OS]` `[SDH]` → [[Fault Tolerance and Circuit Breakers]]

**How do you roll out a new model or prompt safely?**
Run evals first, then a canary (e.g. 10% of users), watch metrics, and only then go to 100%; keep the old version to roll back. Shadow testing runs the new model silently on real traffic. `[OS]` `[SDH]` → [[Model Deployment Strategies]]

## Model optimization (middle level)
**Quantization?** Store weights with fewer bits (16 → 4-bit): 70B model goes 140 GB → 35 GB, fits one GPU, decodes faster, small quality loss. `[OS]` → [[Quantization]]
**Continuous batching?** As soon as one request finishes, a new one takes its place in the GPU batch, so the GPU never sits half-empty. `[OS]` → [[Continuous Batching]]
**Speculative decoding?** A small model guesses several tokens; the big model checks them all in one step. 2–3× faster, same quality. `[OS]` → [[Speculative Decoding]]
**Mixture of Experts?** Many small expert networks; a router uses only 2 per token. Smart like a big model, compute like a small one — but all experts must still fit in memory. `[OS]` → [[Mixture of Experts]]
**LoRA?** Freeze the big model, train only small add-on weights (<1% size). Cheap fine-tuning; swap adapters per task. `[OS]` → [[Fine-Tuning and LoRA]]
