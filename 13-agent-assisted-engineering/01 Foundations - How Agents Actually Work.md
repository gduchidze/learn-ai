---
tags: [ai-system-design, agent-assisted-engineering, foundations]
aliases: [Agent Foundations, Model Harness Environment, Why Capable Models Fail]
level: L1
---

# 01 · Foundations: How Coding Agents Actually Work

> [!success] 🟢 Junior Explanation
> **In plain words:** A coding agent is a `while` loop. Ask the model what to do → run the tool it picked → feed the result back → repeat until it stops. The model is smart but forgetful and has no idea what "done" means in *your* repo. Everything around the loop decides whether the output can ship.
>
> **Analogy:** A brilliant contractor on day one: skilled, but no site plan, no building code, no inspector. Hand them the plan and the inspector and they're reliable.
>
> 🎯 **L1 must know:** the loop, the context window, model vs harness vs environment. · **L2 adds:** context rot, tool design, cost/latency math, failure taxonomy.

Prereqs: [[00 Agent-Assisted Engineering Roadmap#4. Prerequisites (L0 self-check)]] · Next: [[02 Context Engineering and Repo Memory]]

---

## 1. The three layers (the iceberg)

```
        ┌──────────────────────┐
        │   What you see:      │   "It wrote the feature!"
        │   chat + diff        │
~~~~~~~~┴──────────────────────┴~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        │ MODEL       next-token predictor, finite window, no memory     │  you rent it
        │ HARNESS     loop, tools, permissions, compaction, subagents    │  you configure it
        │ ENVIRONMENT repo, docs, tests, checks, state files, CI, data   │  you OWN it  ← most leverage
        └────────────────────────────────────────────────────────────────┘
```

| Layer | What it is | Examples | Your control |
|---|---|---|---|
| Model | Weights that predict tokens | Claude, GPT, Gemini families | Choose and route |
| Harness | The runtime around the model | Claude Code, Codex CLI, Cursor agent, OpenCode, Agents SDK | Settings, tools, hooks, permissions |
| Environment | Everything the agent reads, runs, or is checked by | `AGENTS.md`, tests, linters, types, scripts, state files, CI | **Total** |

🔵 **Established:** the same model scores very differently on benchmarks such as SWE-bench and Terminal-Bench depending on the harness. Models absorb harness tricks over time, but **today** most of the work that makes agents reliable happens *around* the model.

---

## 2. The agent loop: demystified

Illustrative pseudocode. Every harness is a version of this:

```python
def agent_loop(task: str, model, tools: dict, max_turns: int = 40) -> str:
    messages = [system_prompt(), {"role": "user", "content": task}]
    for _ in range(max_turns):
        reply = model.generate(messages, tools=tool_schemas(tools))
        messages.append(reply.as_message())

        if not reply.tool_calls:          # model decided it's done
            return reply.text             # ← "done" is just the model's opinion!

        for call in reply.tool_calls:
            if not permitted(call):       # harness: permissions / hooks
                result = "DENIED: " + reason(call)
            else:
                result = tools[call.name](**call.args)   # read, edit, bash, grep...
            messages.append(tool_result(call.id, truncate(result)))

        if token_count(messages) > COMPACT_AT:
            messages = compact(messages)  # harness: summarize old turns (lossy!)
    raise TurnBudgetExceeded
```

Three things to notice. Most of this course comes from them:

1. **`return reply.text` is where "done" happens, and it's the model's opinion.** → You need verification gates ([[04 Verification - Tests, Feedback Loops and Gates]]).
2. **`truncate(result)` and `compact(messages)` lose information.** → Durable state lives in files, not chat ([[02 Context Engineering and Repo Memory]]).
3. **`permitted(call)` is the only hard boundary.** → Scope and safety must be enforced here (hooks, permissions, sandboxes), not requested in prose.

---

## 3. The context window: your scarcest resource

### 3.1 Budget math (typical frontier agent session)

| Item | Tokens (rough) |
|---|---|
| Harness system prompt + tool schemas | 10–25k |
| `AGENTS.md` / `CLAUDE.md` + rules loaded at start | 1–5k (good) / 20k+ (bad) |
| Each file read | 2–15k |
| Each test run output (untruncated) | 1–50k |
| Each grep with broad pattern | 1–20k |
| Your messages + agent reasoning | grows every turn |

A 200k window fills **fast**. Once it compacts, details are gone.

### 3.2 Context rot 🔵

Quality drops **before** you hit the limit. Long-context studies (e.g., Chroma's *Context Rot*, 2025) show retrieval and reasoning get worse as input length grows, especially with distractors. Practical consequences:

- **More context ≠ better.** Irrelevant files actively hurt.
- **Front-load the task, the constraints, and the definition of done.**
- **Wrap up or hand off at ~50–75% of the window**, not at the wall ([[06 Delegation, Parallelism and Handoff#5. Compaction vs handoff]]).
- **Use subagents for exploration** so the search noise stays out of the main context.

```
quality
  ▲ ████████████▇▇▇▆▆▅▅▄▄▃▃▂▂▁        ← degrades gradually, not at the cliff
  │
  └──────────────────────────────────► tokens in context
     clean start      50–75%       limit (compaction)
```

### 3.3 The context engineering principle

> **Give the agent the *smallest* set of high-signal tokens that makes the desired outcome *likely*.** (paraphrasing Anthropic, *Effective Context Engineering*)

That means: router files over manuals, retrieve on demand (just-in-time), tool outputs truncated deterministically, and memory in files.

---

## 4. Why capable models still fail: a failure taxonomy

| # | Failure | Symptom | Root cause (missing surface) | Fix module |
|---|---|---|---|---|
| F1 | **Wrong problem** | Clean code, solves an adjacent task | No task frame or acceptance | 03 |
| F2 | **Scope creep** | Diff touches 9 files for a 2-file fix | No scope contract or enforcement | 03, 04 |
| F3 | **Phantom verification** | "All tests pass" with no test run | No feedback capture, no gate | 04 |
| F4 | **Test tampering** | Agent weakens/skips the test to go green | Tests not protected; gate doesn't check test diffs | 04 |
| F5 | **Hallucinated API** | Calls a function or package that doesn't exist | No type check / no docs retrieval | 02, 04 |
| F6 | **Silent fallback** | `except Exception: return default` hides failures | No standards / review | 05 |
| F7 | **Amnesia** | Session 2 redoes session 1's work | No state or handoff | 02, 06 |
| F8 | **Goal loss / loops** | Retries the same fix 6 times | No repro loop, no turn budget, no stop rule | 05 |
| F9 | **Duplication entropy** | New helper copies an existing one | No navigation, no codebase map | 02, 05 |
| F10 | **Unsafe action** | `rm -rf`, force-push, prod write, secret leak | No permission policy or sandbox | 07 |
| F11 | **Prompt injection** | Follows instructions hidden in an issue or webpage | Untrusted input + tools + exfiltration path | 07 |

> [!important] Diagnostic habit
> When an agent fails, ask **"which surface was missing?"** before you ask "which model is better?" or "how do I reword the prompt?"

---

## 5. Model selection & routing: economics, not loyalty

| Work type | Model tier | Why |
|---|---|---|
| Framing, grilling, architecture, planning, final review | **Strongest** | Mistakes here multiply downstream |
| Implementing a well-specified ticket | Strong / mid | The spec and gates carry the quality |
| Exploration, search, summarizing logs | Fast / cheap (subagent) | High volume, low stakes |
| Triage labels, formatting, commit messages | Cheapest | Mechanical |

**Cost rule:** `cost of a wrong answer × probability` should drive the tier choice, not token price alone. A cheap model that triggers a 30-minute human review costs more than an expensive one that doesn't.

**Efficiency levers** 🔵: prompt caching (keep stable prefixes stable: system prompt, `AGENTS.md`, tool list), smaller tool sets (fewer and sharper tools improve selection), and output truncation.

---

## 6. Strip the vocabulary down to primitives

New harness buzzwords show up every month. Translate them back to what they actually are:

| Primitive | What it is | Agent-world name |
|---|---|---|
| **Function** | Typed handler | Tool call, rule check, verification step |
| **Worker** | Long-lived process with a role | Builder, reviewer, MCP server, subagent |
| **Trigger** | Event that invokes a function | Hook, cron, label added, PR opened, loop tick |
| **Runtime** | What runs where, with limits | Claude Code process, sandbox, container |
| **RPC** | Wire between caller and worker | Tool protocol, MCP, model API |
| **Queue** | Durable buffer, retry, back-pressure | Task board, issue tracker, review inbox |
| **Persistence** | State that survives crashes | `agent_state.json`, checkpoints, the repo |
| **Authorization policy** | Who can do what | Permissions, allow/deny lists, scope globs, approval gates |

| Buzzword | Is actually |
|---|---|
| Ralph Loop | Trigger that re-enqueues the task with a fresh context; persistence carries the goal |
| Hooks / middleware | Triggers + functions on the invocation path |
| Skills | Function registry, with metadata loaded just-in-time |
| Subagents | Workers with isolated context |
| Guardrails | Authorization policy + verification functions |
| Memory | Session persistence |
| Harness-compute separation | Control plane / data plane |

---

## 7. Bad vs good: the same request

**❌ Prompt-only**
```
Add input validation to the signup endpoint and tests.
```
Likely result: edits 4 files, invents an error format, writes a test that passes trivially, says "done."

**✅ Framed** (you'll learn to produce this in Module 03)
```
Goal: POST /signup rejects passwords < 8 chars with 422 and the existing
      ErrorEnvelope shape (see app/errors.py:12, tests/test_errors.py:30).
Allowed: app/routes/signup.py, tests/test_signup.py
Forbidden: app/errors.py, migrations/**, scripts/**
Done when: `pytest tests/test_signup.py -q` exits 0 AND a new test
           asserts 422 + envelope for a 7-char password AND
           `git diff --name-only main` ⊆ allowed.
Unknown (ask me): should whitespace-only passwords count toward length?
Report: paste the final pytest output; do not summarize it.
```

---

## 8. Hands-on setup (do it now)

```bash
# 1) Pick ONE harness and learn it deeply (Claude Code shown)
claude --version
# 2) Practice repo: small, real, slightly messy, yours. Issues enabled.
# 3) One command that proves health — make it exist even if weak:
#    package.json: "check": "tsc --noEmit && eslint . && vitest run"
#    or Makefile:  check: ; ruff check . && mypy . && pytest -q
make check   # must run in < 2 min, or Module 04 will fix that
```

Learn your harness's: **permission modes**, **project settings file** (`.claude/settings.json`, committed) vs **local overrides** (`settings.local.json`, git-ignored), **slash commands / skills**, **subagents**, **hooks**, and **headless mode** (`claude -p`).

---

## 9. Exercises

1. **Instrumented baseline (Project P1).** Pick a 1–2 hour task. Run it **prompt-only** and log: wall time, turns, tokens/cost if shown, every human intervention (and why), out-of-scope files, whether tests actually ran. Then `git stash` it, write a framed version (§7), rerun, and log the same fields. Write `baseline-report.md`.
2. **Failure tagging.** For your prompt-only run, tag each problem with F1–F11. Which surface would have prevented it?
3. **Context audit.** Run `/context` (or your harness's equivalent) at the end of a session. What % went to tool output? To files that turned out irrelevant?
4. **Translate.** Take one harness blog post and rewrite its key ideas using only the 8 primitives.

## 10. Mastery check

- [ ] I can sketch the agent loop and point to where "done," information loss, and enforcement happen.
- [ ] I can explain context rot and three tactics against it.
- [ ] I can map any agent failure to a missing surface.
- [ ] My P1 report has real numbers, including at least one surprise.

> [!quote] Takeaway
> The model is constant; the surfaces are what changed. Stop asking "which model?" first. Ask "which surface is missing?"
