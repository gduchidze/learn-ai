---
tags: [ai-system-design, prompts]
aliases: [Prompt Management, DSPy, Chain-of-Thought, Tree of Thoughts, Prompt Versioning]
---

# Prompt Management and DSPy

> [!success] 🟢 Junior Explanation
> **In plain words:** Treat prompts like code: version them, test them, roll out slowly, roll back.
>
> **Analogy:** Recipe versions in a restaurant — you test a new recipe before putting it on the menu.
>
> **Why interviewers ask:** Small prompt changes can break quality.
>
> **Say it in one sentence:** "Prompts are versioned, eval-tested, rolled out gradually, and loaded from a prompt store, not hardcoded."
>
> 🎯 **Junior must know:** versioning and testing prompts. · **Middle adds:** CoT, Tree of Thoughts, prompt chaining, DSPy.

## Treat prompts like code `[OS]`
A single word change shifts behavior →
- **Version** in git · **test** with evals · **roll out gradually** · **roll back** if quality drops.
Prompt management system stores: template, version, evals passing on that version, compatible models.
Tools: PromptLayer, Humanloop, LangSmith Prompts, Latitude.
> Never hardcode prompts in prod app code; pull them like config `[OS]`.

## Common prompt techniques `[OS]`
- **Chain-of-Thought (CoT)** — write reasoning steps before final answer → better multi-step accuracy, more output tokens.
- **Tree of Thoughts** — explore many paths, judge steps, backtrack → good for search-like problems, many more calls.
- **Prompt Chaining** — split big task; output of one prompt → input of next; small, testable, reliable.

## DSPy `[OS]`
Stanford framework for **programming** LMs instead of prompting. Describe a typed **signature** (inputs/outputs); DSPy compiles a prompt; **optimizer** tries variants on your eval set and keeps the best — "compile prompts like code".
```python
import dspy

class AnswerQuestion(dspy.Signature):
    """Answer the user's question based on the context."""
    context: str = dspy.InputField()
    question: str = dspy.InputField()
    answer: str = dspy.OutputField()

qa = dspy.ChainOfThought(AnswerQuestion)
result = qa(context="...", question="What is the refund policy?")
print(result.answer)
```
Not a replacement for prompt management — an alternative way to **write** the prompt. Most useful in complex pipelines (multi-step RAG, agents).

## Example system prompt (support bot) `[OS]`
```
You are a customer support assistant for [Company].
Use only the context below to answer the user's question.
If the context does not have the answer, reply with
"I do not know" and suggest the user contact human support.
Do not make up facts.

Context:
{chunks}

Question:
{user_question}
```
"Use only the context" → grounding; "I do not know" → fewer hallucinations + escalation trigger; constant prefix → [[Prompt Cache]].

> [!question] Recall
> 1. Four practices of prompt management.
> 2. What does a DSPy optimizer do?

Related: [[Evaluation - LLM and Agent]] · [[Context Engineering]]
