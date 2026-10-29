---
tags: [ai-system-design, edge]
aliases: [Edge AI, On-Device Inference, SLM, Small Language Models, Hybrid AI]
---

# Edge AI and On-Device Inference

> [!success] 🟢 Junior Explanation
> **In plain words:** Run a small model directly on the phone or laptop.
>
> **Analogy:** A pocket calculator (on device) vs calling a math professor (cloud) for hard problems.
>
> **Why interviewers ask:** Privacy, offline use, and cost questions.
>
> **Say it in one sentence:** "Small quantized models handle easy, private requests on device and send hard ones to the cloud."
>
> 🎯 **Junior must know:** why on-device (privacy, latency, cost, offline) and its limits. · **Middle adds:** hybrid routing, quantization, distillation.

## What `[OS]`
Run small models directly on phone, laptop, watch, car. Examples: **Apple Intelligence** on-device foundation model, **Gemini Nano** on Pixel, **Llama 3.2 1B/3B** built for edge.

## Why / catch `[OS]`
| Why | Catch |
|---|---|
| **Privacy** — data never leaves device | Little memory/compute → **SLMs 1B–8B**, quantized to **4-bit or even 2-bit**, often **distilled** from bigger models |
| **Latency** — no round trip | **Battery** constraint |
| **Cost** — no GPU bill | Updates ship via **app updates**, not server rollouts |
| **Offline** | |

## Hybrid AI `[OS]`
```
Question -> small on-device model -> can I handle it?
            Yes -> answer on device      No -> send to big cloud model
```
"Set a timer for 10 min" never touches the internet; "write a poem about the monsoon" → cloud. Offline → device still handles simple things. Exactly how Apple Intelligence is designed.

> [!tip] Interview question to ask yourself `[OS]`
> Which parts of the workload can run on the device?

Engine: **llama.cpp / Ollama**, GGUF → [[Inference Server and Engines]]. Shrinking: [[Quantization]], [[Model Distillation]].

> [!question] Recall
> Design an on-device assistant: model size, quantization, routing rule, offline behavior.

Related: [[LLM Routing]] · [[Multimodal Systems]]
