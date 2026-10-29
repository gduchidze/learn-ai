---
tags: [ai-system-design, agents, patterns]
aliases: [Workflow Patterns, Anthropic Agent Patterns, Building Effective Agents]
---

# Agentic Workflow Patterns

> [!success] 🟢 Junior Explanation
> **In plain words:** There are a handful of standard ways to wire LLM calls together. Most "AI agents" in real products are one of these simple patterns, not a fully autonomous robot.
>
> **Analogy:** LEGO pieces. Chain them, branch them, run them side by side, add a boss, add a reviewer — or let the model build freely (agent).
>
> **Why interviewers ask:** They want to see you pick the **simplest pattern that works** instead of jumping to multi-agent chaos.
>
> **Say it in one sentence:** "I start with a single augmented LLM call, move to a workflow like chaining or routing if needed, and only use an autonomous agent when the steps can't be predicted."
>
> 🎯 **Junior must know:** chaining, routing, and when an agent is overkill. · **Middle adds:** orchestrator-workers vs parallelization, evaluator-optimizer, risks of autonomy.

Source: Anthropic, **"Building effective agents"** (Dec 19, 2024) `[WEB]` — with links to `[OS]` concepts.

## 0. The building block — Augmented LLM
An LLM enhanced with **retrieval, tools, and memory**. Everything below is built from it.
```mermaid
flowchart LR
    In[Input] --> L[LLM]
    L <--> R[(Retrieval)]
    L <--> T[Tools]
    L <--> M[(Memory)]
    L --> Out[Output]
```
Often **one well-optimized augmented call is enough** (good prompt + retrieval + examples).

## 1. Prompt chaining
Split a task into **fixed sequential steps**; optional programmatic **gate** checks between steps.
```mermaid
flowchart LR
    In --> C1[LLM 1: outline] --> G{Gate: outline OK?}
    G -- yes --> C2[LLM 2: draft] --> C3[LLM 3: translate] --> Out
    G -- no --> Stop[Exit / fix]
```
- **Use when:** the task cleanly splits into known subtasks; trades latency for accuracy.
- **Examples:** write marketing copy → translate it; outline → check outline → write document.

## 2. Routing
**Classify** the input, send it to a **specialized** handler.
```mermaid
flowchart LR
    In --> R{Router LLM or classifier}
    R -- refund --> A[Refund flow]
    R -- technical --> B[Tech support flow]
    R -- easy --> S[Small cheap model]
    R -- hard --> Big[Large model]
```
- **Use when:** distinct categories handled better separately; classification is accurate.
- **Examples:** support tickets by type; easy → small model, hard → large model → [[LLM Routing]].

## 3. Parallelization
Run LLM calls **at the same time**, combine in code. Two flavors:
- **Sectioning** — different independent subtasks (e.g. one model answers while a **separate guardrail model** screens the input; parallel evals each checking one aspect).
- **Voting** — same task N times for confidence (e.g. several prompts review code for vulnerabilities; majority decides).
```mermaid
flowchart LR
    In --> A[LLM: answer]
    In --> B[LLM: guardrail check]
    In --> C[LLM: aspect check]
    A & B & C --> Agg[Aggregate in code] --> Out
```

## 4. Orchestrator-workers
A central LLM **decides the subtasks at runtime** from the input, delegates them, then synthesizes.
```mermaid
flowchart TD
    In --> O[Orchestrator LLM]
    O --> W1[Worker: file A]
    O --> W2[Worker: file B]
    O --> W3[Worker: file C]
    W1 & W2 & W3 --> S[Synthesizer] --> Out
```
- **Difference from parallelization:** subtasks are **not predefined** — the orchestrator chooses them.
- **Examples:** coding tools changing many files; research across many sources → [[Multi-Agent Systems and SubAgents]].

## 5. Evaluator-optimizer
One LLM generates, another **critiques**, loop until good enough.
```mermaid
flowchart LR
    In --> Gen[Generator LLM] --> Ev{Evaluator LLM: meets criteria?}
    Ev -- no, feedback --> Gen
    Ev -- yes --> Out
```
- **Use when:** clear evaluation criteria exist and iteration measurably helps (like a writer revising a draft).
- **Examples:** literary translation; multi-round search where the evaluator decides if more searching is needed.

## 6. Autonomous agent
The LLM plans and acts in a loop, checking **ground truth from the environment** (tool results) each step; may pause for human checkpoints; stops at completion or **max iterations** → [[Agent Loop]].
- **Use when:** open-ended problems; number of steps can't be predicted; environment is trusted/sandboxed.
- **Risks:** higher cost, **compounding errors** → sandbox + guardrails.
- **Examples:** coding agent solving SWE-bench issues; computer-use agents → [[Computer Use and Browser Agents]].

## Choosing — decision ladder
```mermaid
flowchart TD
    S[Start] --> A{Single augmented call good enough?}
    A -- yes --> Done1[Ship it]
    A -- no --> B{Steps known in advance?}
    B -- yes --> C{Shape?}
    C -- sequence --> PC[Prompt chaining]
    C -- categories --> RT[Routing]
    C -- independent parts --> PL[Parallelization]
    C -- needs quality loop --> EO[Evaluator-optimizer]
    B -- no --> D{Subtasks decided per input?}
    D -- yes, bounded --> OW[Orchestrator-workers]
    D -- open-ended --> AG[Autonomous agent + sandbox + max steps]
```

## Three principles (Anthropic)
1. **Simplicity** — smallest design that works.
2. **Transparency** — show the agent's planning steps.
3. **Agent–computer interface** — document and test tools as carefully as prompts → [[Tool Calling]].

> [!warning] Frameworks
> Anthropic advises trying **direct API calls and simple code** before heavy agent frameworks — abstractions can hide prompts and make debugging harder.

> [!question] Recall
> 1. Name the 5 workflow patterns + autonomous agent, one example each.
> 2. Orchestrator-workers vs parallelization — the exact difference?
> 3. Sectioning vs voting?
> 4. Walk the decision ladder for: a support-ticket bot; a "fix this GitHub issue" agent.

**Sources:** [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) · [Simon Willison's notes](https://simonwillison.net/2024/Dec/20/building-effective-agents) · [Workflow patterns summary](https://learn.traeai.com/t/ai-engineering/phases/14-agent-engineering/12-anthropic-workflow-patterns.html)

Related: [[What is an AI Agent]] · [[AI Orchestration vs Agents - Loop and Graph Engineering]] · [[Planning and Task Decomposition]]
