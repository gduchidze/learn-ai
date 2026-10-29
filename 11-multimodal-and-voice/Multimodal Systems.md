---
tags: [ai-system-design, multimodal]
aliases: [Multimodal, Multimodal AI]
---

# Multimodal Systems

> [!success] 🟢 Junior Explanation
> **In plain words:** Systems that handle images, audio and video, not only text.
>
> **Analogy:** A friend who can read, look at photos, and listen.
>
> **Why interviewers ask:** Media changes storage, cost and latency design.
>
> **Say it in one sentence:** "Multimodal systems keep media in blob storage, preprocess it, track its high token cost, and use async for slow generation."
>
> 🎯 **Junior must know:** blob storage and token cost of images/audio. · **Middle adds:** preprocessing and output-modality handling.

## What `[OS]`
A **multimodal model** understands (and sometimes generates) more than one kind of data. Internally each modality → embeddings in a **shared space** (image of a cat ≈ word "cat").
Examples: ChatGPT describing images; **Whisper** transcription; **Veo/Sora** text→video; screenshot → code.

## Extra design concerns `[OS]`
| Concern | Design |
|---|---|
| **Storage** | Big blobs → **S3 / Cloudflare R2**; DB keeps only URL/ID |
| **Pre-processing** | Resize images; convert formats (mp3→wav, mp4→frames); compress to cut token cost (some image models charge per pixel) |
| **Token cost** | One hi-res image ≈ **1,500–3,000 tokens**; 1-min audio ≈ **1,000 tokens** — include in cost tracking |
| **Output modalities** | Some models accept images, output text only; others output image/audio/video — wire right I/O channels |
| **Latency** | Image/video generation is slow (minutes) → heavy use of [[Async Processing and Message Queues|async]] + [[Streaming Responses|streaming]] |

> [!question] Recall
> Name 5 extra concerns multimodal adds vs text-only.

Related: [[Voice AI Agents]] · [[Edge AI and On-Device Inference]] · [[Computer Use and Browser Agents]]
