---
tags: [ai-system-design, serving]
aliases: [Message Queues, Async Jobs, Job Queue, Kafka vs SQS]
---

# Async Processing and Message Queues

> [!success] 🟢 Junior Explanation
> **In plain words:** For long jobs, don't make the user wait. Give them a job ID, put the work in a queue, let background workers do it.
>
> **Analogy:** A dry cleaner gives you a ticket; you come back later to pick up your clothes.
>
> **Why interviewers ask:** Classic trap: calling the LLM 50,000 times in a synchronous loop.
>
> **Say it in one sentence:** "Long AI tasks go into a queue processed by a worker pool; the client gets a job_id and polls or receives a webhook."
>
> 🎯 **Junior must know:** the job_id flow and why queues absorb spikes and allow retries. · **Middle adds:** Kafka vs SQS choice and batch APIs for non-urgent work.

## When streaming isn't enough `[OS]`
Too long to stream: 100-page report, transcribing a 2-hour video, 10-minute agent run → **async processing**.

```
1. Client -> Backend -> enqueue -> Queue;  Backend returns {job_id, "processing"}
2. Queue -> Worker -> run task -> save result to DB
3. Client polls job_id (or receives webhook) -> result
```

## Why queues in AI `[OS]` `[JAM]`
Decoupling, reliability, retries — same as regular systems, but **messages are heavier** (long prompts, documents, audio) and **workers slower** (LLM calls, transcription) `[OS]`.
`[JAM]`: queues **absorb traffic spikes** without overloading inference servers and give **natural retry semantics** when a model call fails.

### Common uses `[OS]`
- **Document indexing**: PDF upload → queue → chunk → embed → vector DB (minutes).
- **Long agent runs**.
- **Bulk inference**: 10,000 reviews to summarize → many parallel workers.

> [!example] Interview signal `[JAM]`
> *"Process 50,000 documents through your summarization pipeline."* A synchronous loop hitting the LLM 50,000 times = interview over. Answer: **queue-backed worker pool**.

## Choosing a queue `[OS]`
| Tool | Shines when |
|---|---|
| **Kafka** | Many independent consumers read the **same stream** (indexing worker + analytics worker both read every upload) |
| **SQS / RabbitMQ** | Each message processed by **exactly one** worker (classic job queue) |
| Redis Streams | Lightweight option |
Pick by **consumption pattern**, not by "it's AI" `[OS]`.

Batch APIs (OpenAI/Anthropic) for non-urgent jobs are ~**50% cheaper** → [[Cost Optimization]].

> [!question] Recall
> 1. Describe the job_id async flow.
> 2. Kafka vs SQS for a doc pipeline feeding both indexing and analytics?

Related: [[Embeddings Pipeline]] · [[Streaming Responses]] · [[7 Infra Patterns for AI Engineers]]
