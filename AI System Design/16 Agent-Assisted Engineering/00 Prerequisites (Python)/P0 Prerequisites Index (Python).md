---
tags: [ai-system-design, agent-assisted-engineering, prerequisites, python]
aliases: [L0 Prerequisites Python, Prereq Self-Check Python, Python Engineer Foundations]
level: L0
created: 2026-10-29
---

# P0 · Prerequisites in Python: Index and Study Plan

> [!success] 🟢 Junior Explanation
> **In plain words:** Before you hand work to an agent, you need to be able to *judge* that work. These eight skills are the judging toolkit. Each note below takes one row of the L0 self-check, explains what "fluent" means **in Python**, and gives you drills with a pass/fail exit check.
>
> **Analogy:** You can't be a good editor of a language you can't write. Agents write fast; you edit. These notes make you a good editor.
>
> 🎯 **Target:** ≥ 12/16 on the self-check before [[02 Context Engineering and Repo Memory]].

Back: [[00 Agent-Assisted Engineering Roadmap#4. Prerequisites (L0 self-check)]] · Next: [[01 Foundations - How Agents Actually Work]]

---

## 1. The eight skills (Python edition)

| # | Skill | Note | "2 = fluent" in Python means |
|---|---|---|---|
| 1 | One language in depth | [[P1 Python in Depth - Errors, Concurrency, Packaging]] | You can explain exceptions and chaining, the GIL vs threads vs processes vs `asyncio`, and how `pyproject.toml` → wheel → `import` works |
| 2 | Testing | [[P2 Testing with pytest - Unit, Integration, Doubles, Flakiness]] | pytest fixtures and parametrize, fakes vs mocks, integration tests against real I/O, and you can make a flaky test deterministic |
| 3 | Git | [[P3 Git from the CLI - Rebase, Bisect, Worktree, Staging]] | `rebase` (incl. `--onto`, `--autosquash`), `bisect run pytest`, `worktree`, `add -p`, reflog recovery |
| 4 | Shell | [[P4 Shell Fluency for Python Engineers]] | Pipes, `rg`, `jq`, exit codes and `set -euo pipefail`, env vars, background jobs and `trap` |
| 5 | Reading code | [[P5 Reading Unfamiliar Python Code]] | You can trace an HTTP request through a FastAPI/Flask repo you've never seen, in < 30 min, and write the map |
| 6 | Debugging | [[P6 Debugging Method in Python]] | Reproduce → minimize → hypothesize → instrument → fix, with `pdb`, `pytest --pdb`, `faulthandler`, `py-spy`, `git bisect` |
| 7 | Design basics | [[P7 Design Basics in Python - Coupling, Interfaces, DI, Layers]] | `Protocol`s as interfaces, constructor injection, functional core / imperative shell, layers enforced by `import-linter` |
| 8 | CI | [[P8 CI Pipelines for Python]] | You've written a GitHub Actions pipeline with `uv`, ruff, mypy, pytest, and you can name and fix what makes it slow |

---

## 2. Score yourself honestly (0 / 1 / 2)

Score **what you can do without looking it up**, not what you've read about.

| # | 0 = gap | 1 = working | 2 = fluent |
|---|---|---|---|
| 1 | You catch `Exception` everywhere; "async is faster" | You use custom exceptions and `asyncio.gather` | You can explain `raise ... from`, `ExceptionGroup`/`except*`, why threads help I/O but not CPU, src layout, wheels vs sdists |
| 2 | Tests are `print` statements | You write pytest unit tests with fixtures | You pick fake vs mock on purpose, write a real integration test, and can de-flake a timing/ordering test |
| 3 | You use the IDE git panel only | branch, commit, merge, push from CLI | You bisect with `git bisect run`, rebase with conflicts calmly, use worktrees, stage hunks with `add -p`, recover via reflog |
| 4 | You copy commands without reading them | Pipes and `grep` work for you | You write a script that fails loudly, filters JSON with `jq`, runs a server in the background and cleans it up |
| 5 | You read files top to bottom | You find things with search | You find the entry point, trace the hot path, confirm with a runtime stack trace, and write a 1-page map |
| 6 | Change things until it works | You use `print` and a debugger | You always repro first, shrink the input, state a falsifiable hypothesis, and leave a regression test plus a new check |
| 7 | One 600-line `main.py` | Functions and classes, some separation | Ports/adapters with `Protocol`, DI without a framework, pure domain core, import rules enforced in CI |
| 8 | "CI is the DevOps team's thing" | You've edited a workflow | You've written one from scratch, cache deps, parallelize, and can read a slow run and say why it's slow |

**Total ≥ 12 →** go to [[01 Foundations - How Agents Actually Work]] (you can start Module 01 in parallel with closing gaps; Module 02 needs ≥ 12).
**Total < 12 →** follow the plan in §4. Don't skip it: agents amplify judgment, including bad judgment.

---

## 3. One practice project ties all eight together

Every drill in P1–P8 builds the same small project, so skills compound instead of staying isolated.

> [!example] `linkcheck`: an async link checker CLI
> `linkcheck docs/` reads Markdown files, extracts URLs, checks them concurrently, prints a report, writes JSON with `--json`, and exits non-zero if any link is broken.
>
> It's small (≈ 400 lines when done) but touches everything: async I/O and error groups (P1), fakes and a real local HTTP server in tests (P2), a bisectable history (P3), shell piping and exit codes (P4), a dependency you'll read the source of (`httpx`, P5), a planted bug (P6), ports and adapters (P7), and a CI pipeline (P8).

```
linkcheck/
├── pyproject.toml          # P1 packaging, P8 tool config
├── uv.lock
├── src/linkcheck/
│   ├── __init__.py
│   ├── __main__.py         # python -m linkcheck
│   ├── cli.py              # composition root (P7)
│   ├── domain.py           # pure: extract links, build report (P7)
│   ├── ports.py            # Fetcher / Clock protocols (P7)
│   ├── adapters.py         # httpx fetcher (P1 async, P7)
│   └── errors.py           # exception hierarchy (P1)
├── tests/
│   ├── unit/               # fakes, parametrize, hypothesis (P2)
│   └── integration/        # real local HTTP server (P2)
├── scripts/check.sh        # the one "check" command (P4, P8)
└── .github/workflows/ci.yml  # P8
```

You'll reuse this repo as your **practice repo** in Week 0 of the main roadmap if you don't have a better real one.

---

## 4. Gap-closing plan (4 weeks, ~6 h/week)

Order matters: each week unlocks the next.

| Week | Notes | Exit artifact (commit it) |
|---|---|---|
| 1 | P1 Python in depth + P4 Shell | `linkcheck` skeleton installs with `uv sync`, runs as `uv run linkcheck`, exits 0/1 correctly; async checker with bounded concurrency |
| 2 | P2 Testing + P7 Design | Ports/adapters split; unit tests with fakes; one integration test against a real local server; one de-flaked test; coverage ≥ 80% |
| 3 | P3 Git + P6 Debugging | Planted-bug hunt solved with `git bisect run`; regression test + new lint rule; one worktree-based parallel change |
| 4 | P5 Reading code + P8 CI | Written trace map of a request through FastAPI or `httpx`; CI pipeline green in < 3 min with cache and parallel jobs |

Re-score at the end. If any row is still 0, repeat that note's drills before moving on.

---

## 5. Why each skill matters once agents are involved

| Skill | What the agent does without you having it |
|---|---|
| Python depth | Writes `except Exception: pass`, blocks the event loop with `time.sleep`, and you don't notice |
| Testing | Quietly weakens assertions or mocks the thing under test; tests go green, bug ships |
| Git | Leaves a 40-file commit you can't split, review, or bisect |
| Shell | Claims "tests pass" when the command never ran (exit code ignored, pipe swallowed failure) |
| Reading code | You can't check whether its change belongs where it put it |
| Debugging | It "fixes" symptoms by trial and error; the root cause stays |
| Design | It adds the 4th copy of the same helper and couples everything to `httpx` |
| CI | Nothing deterministic stands between "looks done" and `main` |

Next: start with [[P1 Python in Depth - Errors, Concurrency, Packaging]].
