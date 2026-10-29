---
tags: [ai-system-design, agents, core-track]
aliases: ["08 Tool Calling", Function Calling, Tool Use]
---

# 08 · Tool Calling

> [!success] 🟢 Junior Explanation
> **In plain words:** The model writes 'please call this function with these arguments'. Your code checks it, runs it, and sends back the result.
>
> **Analogy:** A boss writes a request note; the assistant (your code) decides whether it's allowed and does it.
>
> **Why interviewers ask:** Foundation of all agents, and an important security boundary.
>
> **Say it in one sentence:** "With tool calling the model only proposes a function and arguments; our code validates and executes it."
>
> 🎯 **Junior must know:** the 3 fields of a tool definition and that the description matters most. · **Middle adds:** failure cases, parallel calls, validation, MCP standardization.

> Core track #08 — How a model requests a function and your application executes it, tool definitions, mapping names to functions, multiple tool calls, failure cases.

## What it is `[OS]`
How the LLM says "please call this function for me". Also called **function calling** — same thing. **Foundation of all agentic AI.**

## Tool definition `[OS]`
```json
{
  "name": "web_search",
  "description": "Search the web for pages matching the query. Use this tool when the user asks for current information, news, or anything not available in the model's training data.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "The search query to run." },
      "max_results": { "type": "integer", "description": "Maximum number of results to return. Default is 5." }
    },
    "required": ["query"]
  }
}
```
- `name` → identify tool · `description` → **when** to use (most important field; every word matters) · `input_schema` → what args, which format.
- Vague description → wrong tool. Precise → right tool.

## Flow `[OS]`
1. Tools listed in prompt.
2. LLM returns **structured output**: tool name + arguments.
3. **Our code** parses, maps name → function, runs it.
4. Result appended as next message → LLM continues. (Loop: [[Agent Loop]])

> [!important] Security boundary `[OS]`
> The LLM **never runs the tool**. It returns name + args. Our code can **validate every argument and refuse any action** before it happens. → [[Prompt Injection]]

## Mapping names to functions (pattern implied by `[OS]` loop)
```python
TOOLS = {"web_search": web_search, "calculator": calculator}
fn = TOOLS.get(tool_call.name)          # unknown name -> return error to model
result = fn(**validated(tool_call.arguments))
```

## Multiple tool calls `[OS]`
The loop iterates `for tool_call in response.tool_calls` — a turn can request several. Independent calls can run in **parallel** (single-agent parallelism is "parallel tool calls within one turn" `[OS]`).

## Failure cases to handle `[OS]`
| Failure | Handling |
|---|---|
| Wrong tool picked | Better descriptions; fewer overlapping tools |
| Hallucinated tool/args | Native tool-use support; **validate inputs** |
| Tool error | Return **actionable** feedback ("did you mean src/main.py") |
| Huge output | Trim / summarize observation |
| Infinite tool loop | Step budget |
| Dangerous action | Code gate, human approval (computer-use: "Pay $1000") |
| Malicious tool output | Treat as **untrusted text** (indirect prompt injection) |

> [!tip] `[OS]` In agentic systems **designing good tools matters more than model choice**. Bad tools (vague names, unclear params, noisy outputs) make even the smartest model behave badly.

Standardized tool access across systems → [[MCP, A2A and Agent Skills|MCP]]. Guaranteed-valid args → [[Structured Output]].

## 🌐 Deeper Context `[WEB]`

Anthropic calls tool design the **agent–computer interface (ACI)** and says to give it as much care as the main prompt:

| Advice | Example |
|---|---|
| **Put yourself in the model's shoes** — if usage isn't obvious to you from the description, it isn't to the model | Read your tool list as if you'd never seen the codebase |
| Write descriptions like a **docstring for a junior developer**: example usage, edge cases, input formats, and **boundaries between similar tools** | "Use `search_orders` for lists; use `get_order` when you already have an ID" |
| Prefer formats the model has seen in natural text; avoid overhead like **counting lines** or **escaping strings** | Return plain Markdown/JSON, not diff hunks with line numbers |
| **Poka-yoke** (mistake-proofing): change parameters so errors are hard to make | SWE-bench agent kept breaking relative paths → team **required absolute file paths** → errors stopped |
| Test many inputs and iterate; the team spent **more time optimizing tools than the overall prompt** | Tool evals are worth it |

Security link: OWASP's 2025 list includes **LLM06 Excessive Agency** — tools with more permission/autonomy than needed. Least privilege per tool → [[Prompt Injection]].

**Sources:** [Anthropic: Building effective agents (ACI appendix)](https://www.anthropic.com/engineering/building-effective-agents) · [OWASP Top 10 for LLM 2025 (summary table)](https://help.hcl-software.com/appscan/Enterprise/10.10.0/topics/r_owasp_top_10_for_llm.html)


> [!question] Recall
> 1. Three fields of a tool definition; which matters most?
> 2. Who executes the tool, and why is that a security boundary?
> 3. Seven tool-calling failure cases and fixes.

Related: [[Agent Loop]] · [[What is an AI Agent]]
