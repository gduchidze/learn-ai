---
tags: [ai-system-design, agents]
aliases: [JSON Mode, Constrained Decoding, Guided Decoding]
---

# Structured Output

> [!success] 🟢 Junior Explanation
> **In plain words:** Force the model to return valid JSON that matches your schema.
>
> **Analogy:** Filling in a form with fixed boxes instead of writing a free letter.
>
> **Why interviewers ask:** When AI output feeds other code, broken formats break pipelines.
>
> **Say it in one sentence:** "Constrained decoding makes the model output schema-valid JSON so the next step can trust it."
>
> 🎯 **Junior must know:** why 'please answer in JSON' isn't enough. · **Middle adds:** provider/engine options and still validating output.

## Problem `[OS]`
Resume parser wants:
```json
{ "name": "Amit Shekhar", "email": "amit@example.com", "skills": ["Python","Go","Kotlin"], "experience_years": 10 }
```
"Give me JSON" → sometimes valid, sometimes "Sure, here is the JSON:", sometimes broken.

## Solution `[OS]`
**Structured output** (JSON mode / **constrained decoding**): send the schema → inference server **forces** valid JSON matching it → guaranteed parseable.
Examples: OpenAI `response_format` with JSON Schema, Anthropic tool-use mode, vLLM guided decoding, Outlines library.

Critical when LLM output feeds the **next pipeline step** — no fragile parsers. Still **validate output** as fault tolerance (retry with stricter prompt on mismatch) → [[Fault Tolerance and Circuit Breakers]].

SGLang is especially good at structured output workloads → [[Inference Server and Engines]].

> [!question] Recall
> Why prefer constrained decoding over "please reply in JSON"?

Related: [[Tool Calling]]
