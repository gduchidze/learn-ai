---
tags: [ai-system-design, scaling]
aliases: [Auto Scaling, Warm Pool, Cold Start]
---

# Auto Scaling and Warm Pools

> [!success] 🟢 Junior Explanation
> **In plain words:** Add GPU servers when busy, remove them when quiet. But a new GPU server needs minutes to load the model, so we keep some ready ('warm').
>
> **Analogy:** A restaurant keeps extra cooks already in the kitchen before lunch rush instead of calling them from home when the line is out the door.
>
> **Why interviewers ask:** GPUs are expensive; idle ones waste money, missing ones make users wait.
>
> **Say it in one sentence:** "We autoscale on GPU metrics, keep a warm pool because model loading takes minutes, and scale ahead of known peaks."
>
> 🎯 **Junior must know:** cold start problem and warm pools. · **Middle adds:** scale on GPU utilization / queue depth / latency, plus predictive scaling.

## The difference from regular auto scaling `[OS]`
- Regular: add EC2 when CPU > threshold → **30 s – 2 min**.
- AI: new inference server must **load the model into GPU memory first**. A 70B model takes **1–10 minutes** depending on whether weights are on local SSD, network storage, or remote object storage.
→ Cannot just spin up GPUs on a sudden spike.

## Warm pools `[OS]`
Keep some inference servers **always warm** (running, model loaded). On spike: route to warm pool first, spin more in background. AI auto scaling is **slower and more careful**; always keep extra capacity because cold starts are expensive.

## What to scale on `[JAM]`
> [!important] CPU utilization is misleading for GPU nodes
> A GPU node can be at **10% CPU and 95% GPU**. Scale on **GPU utilization, inference queue depth, or custom latency percentiles**.

- Scale up when request latency crosses a threshold; scale down when utilization drops.
- Cost motivation: running four A100s 24/7 when traffic justifies them 6 h/day burns budget.
- **Interview signal** `[JAM]`: *"Your LLM API gets 10× traffic at 9am and almost nothing at 3am. How do you manage cost?"* → auto scaling with GPU-aware metrics **+ predictive scaling** (because cold-start model loading is slow) in addition to reactive scaling.

> [!question] Recall
> 1. Why can't AI auto scaling react like EC2 auto scaling?
> 2. Which 3 metrics should trigger GPU scaling? Why not CPU?
> 3. What is predictive scaling and why do LLM fleets need it?

Related: [[Scaling LLMs - Vertical Horizontal Tensor Pipeline]] · [[7 Infra Patterns for AI Engineers]]
