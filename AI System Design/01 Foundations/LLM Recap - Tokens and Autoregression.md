---
tags: [ai-system-design, foundations, llm]
aliases: [LLM Recap, Tokens, Autoregressive Generation]
---

# LLM Recap — Tokens and Autoregression

> [!success] 🟢 Junior Explanation
> **In plain words:** An LLM guesses the next small piece of text (a token), adds it, and guesses again until the answer is finished. You pay for every token in and out.
>
> **Analogy:** Your phone keyboard's next-word suggestion, but enormous and repeated hundreds of times.
>
> **Why interviewers ask:** Cost, latency, streaming and the KV cache all come from this token-by-token process.
>
> **Say it in one sentence:** "An LLM generates text one token at a time, each new token based on all previous ones, and we are billed per token."
>
> 🎯 **Junior must know:** token ≈ 4 characters, autoregressive generation, temperature makes answers vary. · **Middle adds:** BPE tokenization and how attention (Q, K, V) chooses which earlier tokens matter.

## What an LLM is `[OS]`
**LLM (Large Language Model)** takes text and **predicts the next token**, again and again, until the full response is generated.

## Tokens `[OS]`
- Text is first broken into **tokens** (chocolate-bar analogy: bar = sentence, each piece = token).
- Most modern LLMs use **BPE (Byte Pair Encoding)**.
- Rule of thumb: **1 token ≈ 4 characters of English**.
- "AI", "Hello" → 1 token; "Bangalore" → 2; "ChatGPT" → 2–3 depending on tokenizer.

## Autoregressive generation `[OS]`
The model feeds its own output back as new input.
```
"I love"            -> predicts "teaching"
"I love teaching"   -> predicts "AI"
"I love teaching AI"-> ... until model decides to stop
```

## Sampling → non-determinism `[OS]`
At each step the model assigns a **probability to every possible token**; one is picked. **Temperature**, **Top-k**, **Top-p** control the pick. This is why the same prompt can produce different outputs — one of the biggest reasons AISD differs from regular SD.

## Inside: the Transformer `[OS]`
A stack of **attention** + **feed-forward** layers. Key idea → [[Attention]]: each token becomes **Query (Q), Key (K), Value (V)** and uses them to decide which previous tokens matter most.

## How we consume LLMs `[OS]`
API (OpenAI, Anthropic, Google): send prompt → streamed response, one token at a time. Or self-host on an [[Inference Server and Engines|inference server]].

> [!question] Recall
> 1. What is autoregressive generation? Walk through "I love".
> 2. ~How many tokens is a 4,000-character English text?
> 3. Which knobs control token selection, and what's the system-design consequence?

Related: [[Attention]] · [[Prefill vs Decode]] · [[KV Cache]]

➡️ **Go deeper:** [[Tokenization and Embeddings Internals]] · [[Decoding and Sampling]]
