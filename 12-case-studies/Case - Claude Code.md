---
tags: [ai-system-design, case-study, agents]
aliases: [How Claude Code Works]
---

# Case — How Claude Code Works `[OS]`

> [!success] 🟢 Junior Explanation
> Idea in one line: **a coding agent loops 'read code → change code → run tests' until the tests pass.** Tests are its proof of 'done'. Practice with [[Mock Interview 3 - Simple AI Agent]].

Coding agent in the terminal: task in plain English → reads code, edits files, runs commands, **checks its own work**.

## The agent loop
```
Your request -> Gather context -> Take action -> Verify results --not done--> (repeat)
                                                               --done------> Task complete
```

## Building blocks mapped
| Block | In Claude Code |
|---|---|
| [[Agent Loop]] & harness | Gather → act → verify → repeat |
| [[Tool Calling]] | Search files, read, edit, run commands ("eyes and hands") |
| Verification | Runs tests/program — a passing test = **machine-checkable done** |
| [[Agent Memory]] | `CLAUDE.md` project memory loaded every session |
| [[Guardrails]] / permissions | Which actions need user approval |
| [[Multi-Agent Systems and SubAgents\|SubAgents]] | Big searches in own context → main context stays clean |
| [[Context Engineering\|Compaction]] | Long sessions summarized → works for hours |
| [[MCP, A2A and Agent Skills\|Skills + MCP]] | Skills = your way of working; MCP = outside tools |

> [!question] Interview drill
> "Design an AI coding agent." Hit: loop, tools, codebase RAG ([[Case - Cursor]]), **sandboxing**, permissions, SubAgents, compaction, verification with tests.

Related: [[Computer Use and Browser Agents]] · [[Prompt Injection]]
