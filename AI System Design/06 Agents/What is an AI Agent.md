---
tags: [ai-system-design, agents]
aliases: [AI Agent, Agentic AI, Five Core Parts]
---

# What is an AI Agent

> [!success] 🟢 Junior Explanation
> **In plain words:** An agent is an LLM that can use tools in a loop until a goal is done, instead of answering once.
>
> **Analogy:** A new intern: reads the task, uses tools, checks results, decides the next step, repeats until done.
>
> **Why interviewers ask:** Agents are a top 2026 interview topic.
>
> **Say it in one sentence:** "An AI agent is an LLM plus instructions, tools, memory, and a loop that runs until the goal is achieved."
>
> 🎯 **Junior must know:** the 5 parts and that your code (not the model) runs tools. · **Middle adds:** agent types and the 5 failure modes.

## Definition `[OS]`
A system that takes a goal, figures out steps, uses tools when needed, and keeps working until done. LLM is the **decision-maker**: picks next action/tool, reads the result the loop feeds back, plans next move.

> **AI Agent = LLM + Instructions + Tools + Memory + a Loop that runs until the goal is achieved.**

Intern analogy: reads task → thinks → uses a tool (open file, send message, run query) → checks result → decides next step → repeats.
Plain LLM = one answer. Chatbot = many answers. Agent = **talks and acts**, many times, until done.

`[SDH]`: agentic AI goes beyond single-pass prediction — actively **plans and executes** tasks with tools, using reasoning patterns like **ReAct (Reason-Act)**.

## Five core parts `[OS]`
| Part | Role | Intern analogy |
|---|---|---|
| **LLM** (brain) | Decides: pick a tool or return final answer. **Recommends** tools; does not call them. | Brain |
| **Instructions** (system prompt) | Job, tools, rules | Job description |
| **Tools** (hands) | Search, calc, files, APIs, email, code. Each: name, description, input schema | Laptop, email, systems |
| **Memory** | Short-term (current run) + long-term (across runs) | Notebook |
| **Loop** (runtime) | Send → read → run tool → feed back → repeat until done. **Where tool calls actually happen.** | The workday |
Remove any one → not an agent.

## Types `[OS]`
- **ReAct** — Thought → Action → Observation each step. Most common.
- **Plan-and-Execute** — full plan first, then steps. Long tasks. → [[Planning and Task Decomposition]]
- **Reflection** — draft → self-critique → revise. Quality > speed.
- **Agentic RAG** — decides when/how to retrieve. → [[Agentic RAG, GraphRAG, Vectorless RAG]]
- **Multi-Agent** — roles cooperate. → [[Multi-Agent Systems and SubAgents]]
- **Computer Use / Browser** — screenshots, clicks, typing. → [[Computer Use and Browser Agents]]
Patterns combine (ReAct + Agentic RAG + final Reflection).

Advanced reasoning `[SDH]`: **Tree-of-Thought / Graph-of-Thought** explore multiple reasoning paths, critique outputs, pick best.

## Common failure modes `[OS]`
| Failure | Fix |
|---|---|
| Infinite loops | Hard step limit |
| Wrong tool selection | Very clear tool descriptions |
| Hallucinated actions | Native tool-use support + validate inputs before running |
| Context overflow | Summarize older steps / drop stale observations |
| Premature stopping | Clear completion criteria in instructions |
Demo is easy; **stability across thousands of varied requests** is the hard part.

## 🌐 Deeper Context `[WEB]`

Anthropic's **"Building effective agents"** (Dec 19, 2024) gives the vocabulary most interviewers now use:

| Term | Meaning |
|---|---|
| **Agentic system** | Umbrella term for anything below |
| **Workflow** | LLMs and tools orchestrated through **predefined code paths** (you decide the steps) |
| **Agent** | The LLM **dynamically directs its own process and tool use** (the model decides the steps) |
| **Augmented LLM** | The building block: an LLM + **retrieval + tools + memory** |

Key guidance:
- Agentic systems **trade latency and cost for better task performance** — justify that trade.
- Often a **single well-optimized LLM call with retrieval and in-context examples is enough**.
- Three principles: **(1) keep it simple, (2) be transparent — show the agent's planning steps, (3) design the agent–computer interface (tools) carefully.**
- Agents get **"ground truth" from the environment** at each step (tool results, code execution), can pause for human checkpoints, and need stopping conditions such as **max iterations**.

Full pattern catalog with diagrams → [[Agentic Workflow Patterns]].

**Sources:** [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) · [Simon Willison's notes](https://simonwillison.net/2024/Dec/20/building-effective-agents)


> [!question] Recall
> 1. Five parts — and who actually executes a tool call?
> 2. Six agent types with one-line use cases.
> 3. Five failure modes and fixes.

Related: [[Agent Loop]] · [[Tool Calling]] · [[Agent Memory]] · [[AI Orchestration vs Agents - Loop and Graph Engineering]]
