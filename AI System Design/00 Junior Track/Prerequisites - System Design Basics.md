---
tags: [ai-system-design, junior, prerequisites]
aliases: [System Design Basics for Juniors]
---

# Prerequisites — System Design Basics (in plain words)

If these words are clear, the rest of the wiki is easy. Each one: **what it is → real-life picture → why AI cares**.

## Client and Server
- **What**: the *client* (browser, phone app) asks; the *server* answers.
- **Picture**: a customer (client) orders at a restaurant counter (server).
- **AI**: the server now also calls an LLM, which is slow — so the "order" can take seconds.

## API
- **What**: a fixed way to ask a server for something (e.g. `POST /chat` with JSON).
- **Picture**: the restaurant menu — you can only order what is on it.
- **AI**: OpenAI/Anthropic give you an API; you send a prompt, they return text.

## Latency vs Throughput
- **Latency** = how long **one** request takes. **Throughput** = how many requests (or tokens) per second the system handles **in total**.
- **Picture**: latency = how fast one car drives across the bridge; throughput = how many cars cross per hour.
- **AI**: we measure latency in a new way — time to the **first word** (TTFT) — see [[Latency and Cost Metrics]].

## Percentiles (p50, p95, p99)
- **What**: p99 = 99% of requests are faster than this number. p50 = the middle (median).
- **Why**: averages hide slow users. "p99 < 200 ms" means almost everybody is fast `[SDH]`.

## Database
- Stores data permanently (users, chats). Example: PostgreSQL.
- **AI**: we also need a **vector database** to search by *meaning* — see [[Prerequisites - AI Basics]].

## Cache
- **What**: a small, very fast memory that keeps answers you already computed (e.g. Redis).
- **Picture**: keeping your keys on the table instead of searching the whole house each time.
- **Hit** = found in cache (fast). **Miss** = not found (do the slow work, then save it).
- **AI**: a miss can cost **seconds and real money**, so caching is extra valuable `[OS]`.

## Queue (message queue)
- **What**: a waiting line for jobs. Producers put jobs in; workers take them out when ready (Kafka, SQS, RabbitMQ).
- **Picture**: tickets at a deli counter — customers take a number, cooks serve in order.
- **AI**: long jobs (summarize 50,000 docs) go into a queue instead of making the user wait `[JAM]`.

## Load Balancer
- **What**: spreads requests across many servers.
- **Picture**: a supermarket manager sending people to the shortest checkout line.
- **AI**: LLM requests are very different sizes, so "just take turns" (round-robin) is bad `[OS]` `[JAM]`.

## Horizontal vs Vertical scaling
- **Vertical** = buy a bigger machine. **Horizontal** = add more machines.
- **AI**: some models are so big they don't fit on **one** GPU — we must split the model itself `[OS]`.

## Auto scaling
- **What**: add machines automatically when busy, remove when quiet.
- **AI**: a GPU machine needs **minutes** to load the model, so we keep some ready ("warm") `[OS]`.

## Rate limiting
- **What**: "each user can make at most N requests per minute".
- **AI**: also limit **tokens** and **money** — one bad user can burn thousands of dollars `[JAM]`.

## API Gateway
- **What**: the front door of your backend — checks who you are, applies limits, routes you to the right service `[JAM]`.

## Circuit breaker
- **What**: if a service keeps failing, stop calling it for a while and return a backup answer.
- **Picture**: the electric fuse in your house that cuts power to stop a fire spreading `[JAM]`.

## Synchronous vs Asynchronous
- **Sync**: you wait for the answer (phone call). **Async**: you get a ticket and come back later (email/order tracking).

## Streaming
- **What**: send the answer piece by piece while it's being made, instead of all at the end.
- **Picture**: watching a YouTube video while it downloads vs waiting for the whole file.
- **AI**: ChatGPT shows words one by one — that's streaming (SSE) `[OS]`.

## CPU vs GPU
- **CPU** = a few very smart workers. **GPU** = thousands of simple workers doing math at the same time.
- **AI**: LLMs need GPUs. GPUs are **expensive** (~$2–4 per hour to rent an H100) `[OS]`.

> [!question] Self-check
> Explain to a friend: cache hit vs miss · latency vs throughput · why a queue helps · what a circuit breaker does.

Next → [[Prerequisites - AI Basics]]
