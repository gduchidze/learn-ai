---
tags: [ai-system-design, serving]
aliases: [Least Outstanding Tokens, Prefix-Aware Routing, Sticky Sessions]
---

# Load Balancing for LLMs

> [!success] 🟢 Junior Explanation
> **In plain words:** Spread requests across GPU servers, but smartly — some requests take 1 second, others 60.
>
> **Analogy:** At the supermarket you pick the line with the fewest items in carts, not just 'the next line in order'.
>
> **Why interviewers ask:** Round-robin is the classic answer and it's wrong for LLMs — interviewers check you know why.
>
> **Say it in one sentence:** "Because LLM requests vary hugely in cost, I balance by outstanding tokens and route shared prefixes to the same server to reuse cache."
>
> 🎯 **Junior must know:** why round-robin fails. · **Middle adds:** least outstanding tokens, prefix-aware routing, sticky sessions, health checks.

## Why round-robin fails `[OS]` `[JAM]`
LLM requests are **not equal**: one takes 1 s, another 60 s. Round-robin can leave one server stuck on long requests while another idles. `[JAM]`: *"A 50-token completion is not the same load as a 4,000-token generation."* Prefer **weighted** or **least-connections** — and in AI, smarter still:

## Strategies `[OS]`
### Least Outstanding Tokens
LB tracks how many tokens each server is currently generating; next request → server with fewest. Much more accurate than counting connections.

### Prefix-Aware Routing
Requests sharing a long common prefix (e.g. 5,000-token system prompt of a coding assistant) → **same server**, whose KV cache for that prefix is already warm. Otherwise every server recomputes the prefix. Pairs with [[Prompt Cache]].

### Sticky Sessions
Send all requests of one long conversation to the same server so its history stays warm in cache.

## Health checks `[JAM]`
Use **inference-aware health checks** to route around degraded nodes.

> [!example] Interview signal `[JAM]`
> *"How would you handle 10,000 concurrent requests to your LLM API?"* → load balancing **+** [[Rate Limiting]] **+** [[Auto Scaling and Warm Pools|auto scaling]]; explain why round-robin is insufficient for variable-cost inference.

> [!question] Recall
> 1. Why is "least connections" still imperfect for LLMs? What's better?
> 2. When does prefix-aware routing pay off?

Related: [[KV Cache]] · [[Prompt Cache]] · [[Scaling LLMs - Vertical Horizontal Tensor Pipeline]]
