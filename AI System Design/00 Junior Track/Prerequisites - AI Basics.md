---
tags: [ai-system-design, junior, prerequisites]
aliases: [AI Basics for Juniors]
---

# Prerequisites — AI Basics (in plain words)

## Model
- A **model** is a big file of numbers ("weights") that learned patterns from data.
- **Picture**: a student who read the whole internet and now answers questions from memory.

## Training vs Inference
- **Training** = teaching the model (very expensive, done rarely).
- **Inference** = using the model to answer (happens on every user request).
- In AI system design interviews we mostly design for **inference** `[OS]`.

## LLM (Large Language Model)
- A model that reads text and **guesses the next word**, again and again, until the answer is done `[OS]`.
- "I love" → "teaching" → "AI" → … This is called **autoregressive** (it reads its own output).

## Token
- Models don't read letters or full words; they read **tokens** (pieces of words).
- Rule: **1 token ≈ 4 English characters** ≈ ¾ of a word `[OS]`.
- You **pay per token** — for the input you send and the output you get.

## Prompt and System Prompt
- **Prompt** = the text you send.
- **System prompt** = the hidden instructions at the top ("You are a support assistant. Be polite. Only use the context.").

## Context window
- The maximum amount of text (tokens) the model can read in one request — like the size of its desk.
- Bigger is not always better: models get worse at finding facts in very long text `[OS]` → [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]].

## Temperature (randomness)
- The model picks each next token by probability. Higher temperature = more random.
- **Consequence**: the same question can give different answers → you can't test AI like normal code; you need **evals** `[OS]`.

## Hallucination
- The model says something false **confidently**. Main fix in system design: give it real documents (RAG) and tell it to say "I don't know" `[OS]`.

## Embedding
- A list of numbers (e.g. 1,536 numbers) that represents the **meaning** of a text `[OS]`.
- Texts with similar meaning → similar numbers → "close together".
- **Picture**: every sentence gets GPS coordinates on a "meaning map". "Dog" lives near "puppy", far from "invoice".

## Similarity search / Vector database
- To find relevant text: turn the question into an embedding, then find the **nearest** stored embeddings.
- A **vector database** (Pinecone, Qdrant, pgvector) does this fast for millions of items `[OS]`.

## RAG (Retrieval Augmented Generation)
- "Open-book exam" for the model: **search your documents first, paste the best pieces into the prompt, then ask the model** `[OS]`.

## Fine-tuning
- Train the model a bit more on your own examples to change its **behavior** (style, format) `[OS]`.
- RAG = give knowledge. Fine-tuning = teach behavior.

## Agent
- An LLM in a **loop** that can use **tools** (search, calculator, APIs) until a goal is done `[OS]`.
- Chatbot talks. Agent **talks and acts**.

## Tool calling
- The model says "please call `get_weather(city='Paris')`". **Your code** runs it and gives the result back. The model never runs code itself `[OS]`.

## GPU memory (VRAM)
- The model's weights must fit in GPU memory. A 70-billion-parameter model in 16-bit ≈ **140 GB** — bigger than one 80 GB GPU `[OS]`.
- Quick math: **parameters × bytes per parameter**. 16-bit = 2 bytes, 8-bit = 1 byte, 4-bit = 0.5 bytes.

> [!question] Self-check
> 1. What is a token and why do we care? 2. Embedding in one sentence? 3. RAG vs fine-tuning? 4. Who actually runs a tool — the model or your code?

Next → [[The Story of One Request]]
