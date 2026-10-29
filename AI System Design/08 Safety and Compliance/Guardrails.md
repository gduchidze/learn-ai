---
tags: [ai-system-design, safety]
aliases: [LLM Guardrails, Input Guardrails, Output Guardrails]
---

# Guardrails

> [!success] 🟢 Junior Explanation
> **In plain words:** Safety checks before the model (block bad input) and after it (block bad output).
>
> **Analogy:** Airport security before boarding and customs after landing.
>
> **Why interviewers ask:** Every production design needs them.
>
> **Say it in one sentence:** "Input guardrails block PII, injection and toxic content; output guardrails block hallucinations, leaks and unsafe answers."
>
> 🎯 **Junior must know:** input vs output checks. · **Middle adds:** what to do with bad output (block, retry, sanitize) and tools.

## Why `[OS]`
LLMs hallucinate, leak sensitive info from the prompt, generate harmful content, and get tricked by malicious prompts.
**LLM guardrails** = safety checks around an LLM controlling what goes in and what comes out — one fence in front, one behind.
```
User -> [Input Guardrail]  -> LLM -> [Output Guardrail] -> User
        PII, injection,           hallucination, PII leak,
        toxic content             off-topic, unsafe content
```

## Input guardrails `[OS]` `[SDH]`
Before the LLM: PII, toxic content, prompt injection attempts ("ignore all previous instructions…"). Bad → **block** before reaching the LLM. `[SDH]`: **input validation** blocks injection attacks by checking incoming data for malicious patterns.

## Output guardrails `[OS]`
After the LLM: hallucinated facts, toxic/unsafe content, off-topic answers, PII leakage. Bad → **block, retry with different prompt, or sanitize**.

Tools: **NeMo Guardrails** (NVIDIA), **Guardrails AI**, **Lakera Guard**, **OpenAI Moderation API**, Anthropic prompt-level safety features `[OS]`.
Deployed as a **separate service** in front of and behind the LLM; often as **AI Gateway policies** `[OS]`.

## Classic AI security `[SDH]`
Threats: **data poisoning, model inversion, prompt injection**. Mitigations: input validation, **differential privacy** in training (prevent leakage), **role-based access control** on APIs.
Trade-off: **Autonomy vs Control** — strict guardrails reduce capability but increase safety `[SDH]`.

## 🌐 Deeper Context `[WEB]`

| Finding | Why it matters |
|---|---|
| OWASP LLM Top 10 2025 gives a ready checklist: prompt injection, sensitive info disclosure, improper output handling, excessive agency, system prompt leakage, unbounded consumption… | Use it to structure the "safety" part of your answer → full list in [[Prompt Injection]] |
| **Improper Output Handling (LLM05)**: treat model output like untrusted user input before passing it to SQL, shells, browsers | Output guardrails aren't only about toxicity |
| Willison: a guardrail that blocks 95% of injection attempts is a **failing grade** for security | Guardrails reduce risk; **architecture** (least privilege, code gates, cutting the lethal trifecta) is the real defense |
| Anthropic's **parallelization (sectioning)** pattern: run a **separate guardrail model** on the input in parallel with the main model | Guardrails without adding serial latency |

**Sources:** [OWASP 2025 (Coralogix overview)](https://coralogix.com/ai-blog/owasp-top-10-for-llm-applications/) · [OWASP 2025 (HackerOne)](https://www.hackerone.com/blog/owasp-top-10-llms-2025-how-genai-risks-are-evolving) · [Lethal trifecta coverage](https://aiweekly.co/alerts/willison-names-lethal-trifecta-behind-ai-agent-data-leaks) · [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)


> [!question] Recall
> List 3 input and 4 output checks; 3 actions on bad output.

Related: [[Prompt Injection]] · [[AI Red Teaming and LLM Watermarking]] · [[API Gateway and AI Gateway]]
