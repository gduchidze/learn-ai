---
tags: [ai-system-design, serving]
aliases: [Token Streaming, SSE, Server-Sent Events, WebSockets]
---

# Streaming Responses

> [!success] 🟢 Junior Explanation
> **In plain words:** Send each word to the user as soon as it's generated instead of waiting for the full answer.
>
> **Analogy:** YouTube starts playing while the video is still downloading.
>
> **Why interviewers ask:** Without streaming, users stare at a blank screen for 10+ seconds.
>
> **Say it in one sentence:** "We stream tokens over SSE so the user sees the first word in under a second, and configure long timeouts for the open connection."
>
> 🎯 **Junior must know:** SSE and why streaming matters. · **Middle adds:** WebSockets vs SSE, load-balancer timeouts, disconnect handling, gateway must not buffer.

A long answer can take 30 s; users can't stare at a blank screen. **Token streaming** sends each token as soon as it's generated `[OS]`.

```
Regular HTTP: request ......... ~10 s ......... full 500 tokens
Streaming:    request -> "Once" (~800 ms TTFT) -> " upon" -> ... -> [DONE] (~10 s)
```
Streaming is what makes a slow LLM **feel fast** `[OS]`.

## Two ways `[OS]`
| | SSE (Server-Sent Events) | WebSockets |
|---|---|---|
| Direction | Server → client | Two-way |
| Mechanism | HTTP connection kept open; chunks prefixed `data:`; ends with `[DONE]` | Long-lived bidirectional connection |
| Use when | Typical chat (ChatGPT web uses it) | Need client messages mid-stream (cancel, add context) |

## Backend consequences `[OS]`
- Connections stay alive for **minutes**.
- Default LB timeouts (~30 s) break streams → configure **long timeouts** (case study used 5 min).
- Handle **disconnections** gracefully (user closes tab).
- An [[API Gateway and AI Gateway|AI Gateway]] must **pass-through stream without buffering**; log token counts from the final SSE event.

Voice uses **WebRTC / WebSocket / SIP** bidirectional streaming → [[Voice AI Agents]].

> [!question] Recall
> 1. SSE vs WebSocket — when each?
> 2. List 3 infra changes needed once you stream.

Related: [[Latency and Cost Metrics]] · [[Async Processing and Message Queues]]
