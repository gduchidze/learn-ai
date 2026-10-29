---
tags: [ai-system-design, safety]
aliases: [AI Red Teaming, Red Teaming, LLM Watermarking, Watermarking, Jailbreak]
---

# AI Red Teaming and LLM Watermarking

> [!success] 🟢 Junior Explanation
> **In plain words:** Red teaming = attacking your own AI before real attackers do. Watermarking = a hidden pattern in generated text to prove it came from your model.
>
> **Analogy:** A fire drill; invisible ink.
>
> **Why interviewers ask:** Shows a mature safety process.
>
> **Say it in one sentence:** "We red-team before every release and turn failures into evals and guardrail rules."
>
> 🎯 **Junior must know:** what red teaming tests for and when to run it. · **Middle adds:** tools, multi-turn attacks, watermark trade-offs.

## AI Red Teaming `[OS]`
Guardrails = runtime defense. **Red teaming** = offline **adversarial testing** to break your own system before attackers do (AI's penetration testing).

Tests for:
- **Jailbreaks** ("Ignore all previous instructions and…")
- **Multi-turn attacks** — slowly steer toward forbidden answer (e.g. **Crescendo**, Microsoft 2024: very high success within a handful of turns without defenses)
- **Prompt injection** via uploads, visited web pages, tool output
- **Data exfiltration** — leak system prompt, training data, other users' data
- **Tool abuse** — dangerous tools with bad inputs
- **Off-topic abuse**

Tools: **Garak** (NVIDIA), **PyRIT** (Microsoft), **Promptfoo**, **DeepTeam** (Confident AI) — hundreds of attack probes each.

Cadence: before launch, after every major prompt/model change, and recurring (often **monthly**) — new attacks appear constantly.
Output: report (categories, success rates, example failures) → failures become **new eval test cases** and **new guardrail rules**.

## LLM Watermarking `[OS]`
Prove later that text was written by **your** model. Hidden signal left in generated text.
- At each step a **secret key** seeds a split of the vocabulary into **preferred** vs other tokens; preferred get a small probability boost:
```
office 0.31 -> 0.25
park   0.29 -> 0.36   (preferred)  <- picked
market 0.22 -> 0.25   (preferred)
gym    0.18 -> 0.14
```
- "I am going to the park" reads normal; over hundreds of tokens, preferred tokens appear far more than chance → detector with the key counts them.
- Trade-off: bigger push = easier detection but worse quality; smaller = better writing, needs longer text. **Heavy editing / paraphrasing weakens** the signal.

> [!question] Recall
> 1. Six red-team categories; how findings feed back.
> 2. How does watermark detection work, and what defeats it?

Related: [[Guardrails]] · [[Prompt Injection]] · [[Evaluation - LLM and Agent]]
