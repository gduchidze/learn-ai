---
tags: [ai-system-design, agents]
aliases: [AI Orchestration, Loop Engineering, Graph Engineering, Prompt Chaining, LangGraph]
---

# AI Orchestration vs Agents — Loop & Graph Engineering

> [!success] 🟢 Junior Explanation
> **In plain words:** Who decides the next step? In a workflow, you (the developer). In an agent, the model.
>
> **Analogy:** A train on fixed rails (workflow) vs a taxi driver choosing the route (agent).
>
> **Why interviewers ask:** Using an agent where a workflow is enough is a red flag.
>
> **Say it in one sentence:** "Use a fixed workflow when steps are known and an agent only for open-ended steps — often both together."
>
> 🎯 **Junior must know:** start with a workflow. · **Middle adds:** loop vs graph engineering and testing implications.

## Do you even need an agent? `[OS]`
**AI Orchestration** = coordinating multiple AI components (LLMs, tools, data, agents) to finish a complex task. Conductor-of-orchestra analogy.
**Key difference = who controls the flow.**

| | AI Orchestration | AI Agents |
|---|---|---|
| Flow controller | Developer | LLM |
| Flow type | Fixed upfront | Dynamic at runtime |
| Predictability | High | Low |
| Best for | Known workflows | Open-ended tasks |
| Cost control | Easier | Harder |
| Debugging | Easier | Harder |

Orchestration patterns: **Sequential, Parallel, Conditional, Loop** (repeat until check passes), **Orchestrator-Worker**. Simple chain = **Prompt Chaining**.
> Start with a fixed workflow; use an agent only when steps can't be known in advance. Hybrid common `[OS]`.

## Loop Engineering `[OS]`
Designing the agent's repeating cycle so it keeps making real progress and stops at the right moment. Knobs: goal, step budget, tools, observation, memory, failure feedback → details in [[Agent Loop]].

## Graph Engineering `[OS]`
Design the system as a **graph**: each step = **node**, transitions = **edges**; shared **state** travels through; **conditional edges** decide; **cycles** redo work when a check fails.

| | Loop Engineering | Graph Engineering |
|---|---|---|
| Next step decided by | Model | Our code (using model's output) |
| Structure | One think-act loop | Many nodes + edges |
| Path per run | Different every time | Same path for same situation |
| Testing | Hard | Easy, node by node |
| Best for | Open-ended, unknown | Known work with clear stages |

Frameworks: **LangGraph** (graph), **LangChain** (building blocks: prompts, chains, retrievers, parsers), **AutoGen** (multi-agent).

> [!quote] `[OS]` Prompt Engineering → what model hears · Context Engineering → what model knows · Loop Engineering → what model may do over time.

## Autonomy vs Control `[SDH]`
Agentic systems are powerful but harder to predict; strict guardrails reduce capability but increase safety. Microservice agent architectures are flexible but harder to debug than monoliths.

## 🌐 Deeper Context `[WEB]`

Anthropic's catalog maps directly onto "orchestration vs agents":

| Pattern | Who controls flow | Use when |
|---|---|---|
| Prompt chaining | Developer | Task splits into fixed steps; add programmatic **gates** between steps |
| Routing | Developer (classifier picks branch) | Distinct input categories |
| Parallelization (sectioning / voting) | Developer | Independent subtasks, or multiple opinions for confidence |
| Orchestrator-workers | **LLM** decides subtasks | Subtasks can't be predicted in advance |
| Evaluator-optimizer | Loop with LLM critic | Clear quality criteria, iteration helps |
| Autonomous agent | **LLM** | Open-ended, unpredictable number of steps, trusted/sandboxed environment |

Anthropic also warns against adopting **heavy agent frameworks before trying direct API calls and simple code** — frameworks add abstraction that hides prompts and makes debugging harder.

Diagrams for each → [[Agentic Workflow Patterns]].

**Sources:** [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) · [Workflow patterns summary](https://learn.traeai.com/t/ai-engineering/phases/14-agent-engineering/12-anthropic-workflow-patterns.html)


> [!question] Recall
> 1. Who controls flow in orchestration vs agent?
> 2. Loop vs Graph engineering: testing and determinism.
> 3. Design a refund workflow: which parts fixed, which agentic?

Related: [[Planning and Task Decomposition]] · [[Multi-Agent Systems and SubAgents]]
