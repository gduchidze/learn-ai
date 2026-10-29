---
tags: [ai-system-design, agent-assisted-engineering, delegation, multi-agent, handoff]
aliases: [Agent Delegation, Parallel Agents, Git Worktrees, Merge Contract, Handoff Packet, Clean State, Ralph Loop]
level: L4
---

# 06 · Delegation, Parallelism and Handoff

> [!success] 🟢 Junior Explanation
> **In plain words:** Parallel agents save wall time **only when the work is truly independent.** Otherwise one clear task turns into a coordination mess that fails faster. Give each worker exclusive file ownership, its own worktree, and a proof to return. An integrator merges in dependency order and runs the full gate. When any session ends, a generated **handoff packet** plus a **clean working tree** let the next session start productively in the first minute.
>
> 🎯 **L4 must know:** parallelism test, work-unit contract, 3 layers of isolation, integrator duties, handoff's 7 fields, clean-state check. · **L5 adds:** fan-out research swarms, Ralph-style loops, cross-agent handoffs.

Prev: [[05 Debugging, Code Review and Codebase Design]] · Next: [[07 Software Factories and Automation]] · See also: [[Multi-Agent Systems and SubAgents]]

---

## 1. Amdahl's law for agents 🟢

```
 total time = serial part (framing + integration + review) + parallel part / N agents

 If framing+integration+review = 40% of the work:
   N=1 → 100%   N=2 → 70%   N=4 → 55%   N=∞ → 40%     ← YOU are the serial part
```
**Implication:** before adding agents, shrink the serial part. Better frames (Module 03), deterministic gates (04), and calibrated reviewers (05) are what make parallelism pay off.

---

## 2. The parallelism test

Delegate in parallel when **at least one** is true:
- Two investigations answer **different unknowns** independently.
- Two implementations own **disjoint files and contracts**.
- A reviewer inspects a **completed** artifact without changing it.
- A slow external check runs while local work continues.

Stay **serial** when agents need the same files, the same unresolved decision, or the same mutable environment (one dev DB, one port).

| Pattern | Parallel-safe? | Why |
|---|---|---|
| Research 3 libraries, return a fact table each | ✅ | Read-only, independent |
| API impl + docs after the contract is fixed | ✅ | Disjoint paths, shared contract frozen first |
| "Backend agent" + "frontend agent" before the API shape is decided | ❌ | Shared unresolved decision → two invented contracts |
| Two agents fixing different tests in the same module | ❌ | Same files |
| Builder + reviewer on the finished diff | ✅ | Reviewer is read-only |

---

## 3. Subagents: context firewalls 🔵

Main use: **keep noise out of the main context.** An exploration subagent may read 40 files and return 20 lines.

| Role | Access | Returns | Model tier |
|---|---|---|---|
| Explorer / researcher | Read-only | Fact table with receipts (`path:line`) | Fast/cheap |
| Implementer | Write to owned paths only | Diff + proof + handoff | Strong |
| Reviewer | Read-only | Review report | Strong |
| Verifier | Run commands, no edits | Verification report | Cheap (deterministic work) |

Claude Code subagent definition (`.claude/agents/explorer.md`):
```markdown
---
name: explorer
description: Read-only codebase investigator. Use to locate code, trace call paths, and gather facts before planning. Returns a fact table, never edits.
tools: Read, Grep, Glob
model: haiku
---
You investigate and report. You never edit files.
Return at most 25 lines:
| Claim | Receipt (path:line or command) | Confidence |
End with "Unknowns:" — questions the repo could not answer.
```

---

## 4. Work units, isolation, and merge contracts 🔵

### 4.1 A work unit is a contract
| Field | Example |
|---|---|
| Goal | "Duplicate check in `AccountService.create`, case-insensitive" |
| Owner | `worker-api` |
| Paths (exclusive write) | `app/accounts.py`, `tests/test_accounts.py` |
| Dependencies | `contract` unit merged |
| Proof | `pytest tests/test_accounts.py -k duplicate -q` |
| Handoff | Changed files, decisions made, remaining risk |

❌ "Handle the backend." ✅ "Implement X in Y and prove it with Z."

### 4.2 Three layers of isolation
| Layer | Mechanism | Prevents | Does NOT prevent |
|---|---|---|---|
| Filesystem | `git worktree`, container, sandbox | Accidental shared edits | Conflicting designs |
| Ownership | Exclusive path globs in the delegation plan | Intentional overlapping edits | Shared-contract drift |
| State | Separate logs, outputs, ports, DB schemas | Overwritten evidence, env collisions | — |

```bash
# One worktree per unit, branched from the integration base
git worktree add ../repo-T142-api  -b agent/T-142-api  integ/T-142
git worktree add ../repo-T142-docs -b agent/T-142-docs integ/T-142
# Run one agent per worktree (separate terminal / tmux pane), each with its own scope contract
git worktree list
# After integration:
git worktree remove ../repo-T142-api && git branch -d agent/T-142-api
```
Give each worktree its own **port** and **DB name** (e.g., `PORT=$((3000 + N))`, `DATABASE_URL=.../app_T142_api`).

### 4.3 Ownership overlap check (conservative)
```python
from itertools import combinations

def static_prefix(glob: str) -> str:
    return glob.split("*", 1)[0]

def overlaps(a: str, b: str) -> bool:
    pa, pb = static_prefix(a), static_prefix(b)
    return pa.startswith(pb) or pb.startswith(pa)     # conservative: may over-flag, never under-flag

def ownership_conflicts(units: list[dict]) -> list[tuple[str, str, str, str]]:
    return [(u["id"], v["id"], a, b)
            for u, v in combinations(units, 2)
            for a in u["paths"] for b in v["paths"] if overlaps(a, b)]

units = [{"id": "api", "paths": ["app/accounts.py", "tests/test_accounts.py"]},
         {"id": "docs", "paths": ["docs/api/**"]}]
assert ownership_conflicts(units) == []
units_bad = units + [{"id": "refactor", "paths": ["app/**"]}]
assert ownership_conflicts(units_bad)          # api vs refactor → BLOCK, redesign the split
```

### 4.4 The integrator (human or agent) does NOT rebuild the work
1. Confirm each handoff matches its assigned scope (`scope_check` per unit).
2. Read **proof output**, not the worker's summary.
3. Merge in dependency order (waves from Module 03).
4. Run the **full cross-unit gate**.
5. Reject hidden scope expansion.
6. Record conflicts as **new decisions** (ADR / grilling ticket), not silent edits.

> If integration means rewriting most of a worker's output, the decomposition was wrong. Retro the split, not the worker.

### 4.5 Cancellation rule
If a dependency's contract changes after a dependent started: **stop the dependent**, discard or rebase its work, and re-issue the unit against the new contract. Don't "patch it up" during integration.

---

## 5. Compaction vs handoff

| | Compaction | Handoff |
|---|---|---|
| What | Summarize old turns to extend a session | Close a session cleanly; start fresh |
| Loss | Uncontrolled (the harness decides) | Controlled (you decide what persists) |
| When | Harness default near the window limit | **Proactively at ~50–75% context**, or at task boundaries |

🔵 Practice: when quality starts to slip (repeated questions, forgotten decisions, contradictions), **write a handoff, end the session, resume fresh.** Don't keep compacting until it collapses.

---

## 6. The handoff packet: generated, not written 🔵

| Field | Question |
|---|---|
| `summary` | What was done (one paragraph) |
| `changed_files` | Diff at a glance |
| `commands_run` | What actually executed (last K + every non-zero exit) |
| `failed_attempts` | What was tried and why it didn't work |
| `open_risks` | What could bite, with severity |
| **`next_action`** | **The first concrete step next session takes.** Without it, it's a status report |
| `verdict_pointer` | Paths to verification + review reports |
| (+) `branch`, `last_known_good_commit`, `status` | `active` / `superseded` / `archived`: one active per branch+topic |

```python
import json, subprocess
from pathlib import Path

def sh(*argv: str) -> str:
    return subprocess.run(argv, capture_output=True, text=True, check=True).stdout.strip()

def generate_handoff(state: dict, feedback: list[dict], verdict_path: str,
                     review_path: str | None, base: str = "main", k: int = 5) -> tuple[str, dict]:
    failures = [r for r in feedback if r["exit_code"] != 0]
    recent = feedback[-k:]
    trimmed = list({r["command_id"]: r for r in failures + recent}.values())   # dedupe, keep order
    payload = {
        "status": "active",
        "branch": sh("git", "rev-parse", "--abbrev-ref", "HEAD"),
        "head": sh("git", "rev-parse", "--short", "HEAD"),
        "last_known_good_commit": state.get("last_known_good_commit"),
        "summary": state.get("summary", ""),
        "changed_files": sh("git", "diff", "--name-only", f"{base}...HEAD").splitlines(),
        "commands_run": [{"cmd": " ".join(r["argv"]), "exit": r["exit_code"],
                          "note": r["agent_note"]} for r in trimmed],
        "failed_attempts": state.get("failed_attempts", []),
        "open_risks": state.get("blockers", []),
        "assumptions_to_validate": state.get("assumptions", []),
        "next_action": state["next_action"],                 # KeyError = refuse to hand off
        "verdict_pointer": {"verification": verdict_path, "review": review_path},
    }
    md = "\n".join([
        f"# Handoff — {payload['branch']} @ {payload['head']}",
        f"**Next action:** {payload['next_action']}", "",
        "## Summary", payload["summary"] or "_(none)_", "",
        "## Changed files", *[f"- `{f}`" for f in payload["changed_files"]], "",
        "## Commands (recent + failures)",
        *[f"- `{c['cmd']}` → {c['exit']} — {c['note']}" for c in payload["commands_run"]], "",
        "## Failed attempts", *([f"- {a}" for a in payload["failed_attempts"]] or ["- none"]), "",
        "## Open risks", *([f"- {r}" for r in payload["open_risks"]] or ["- none"]), "",
        f"Verification: `{verdict_path}` · Review: `{review_path}`",
    ])
    return md, payload            # JSON wins if the two ever disagree
```

---

## 7. Leave a clean state 🔵

A perfect handoff on a dirty tree is a **forwarded mess**. Cleanup is its own phase and a **check**, not a habit.

| Check | Clean means |
|---|---|
| Working tree | Everything committed, or stashed with a note |
| Temp artifacts | No `*.tmp`, scratch dirs, debug prints, commented-out blocks |
| Tests | Green, or red with the failure named in `open_risks` |
| Feature board | Statuses reflect reality; at most one `in_progress` |
| Branch | Expected branch, no detached HEAD, no orphan agent branches/worktrees |

```python
import re, subprocess

DEBUG = re.compile(r"^\+.*\b(console\.log|print\(|debugger;|breakpoint\(\)|pdb\.set_trace)", re.M)

def clean_state_issues(expected_branch: str, base: str = "main") -> list[str]:
    run = lambda *a: subprocess.run(a, capture_output=True, text=True).stdout
    issues = []
    if run("git", "status", "--porcelain").strip():
        issues.append("uncommitted changes")
    if (b := run("git", "rev-parse", "--abbrev-ref", "HEAD").strip()) != expected_branch:
        issues.append(f"on branch {b!r}, expected {expected_branch!r}")
    if DEBUG.search(run("git", "diff", f"{base}...HEAD")):
        issues.append("debug statements added in diff")
    stray = [l for l in run("git", "ls-files", "--others", "--exclude-standard").splitlines()
             if l.endswith((".tmp", ".orig", ".rej")) or l.startswith(("scratch/", "tmp/"))]
    if stray:
        issues.append(f"stray files: {stray}")
    return issues      # [] is the precondition for generate_handoff()
```

---

## 8. Long-running loops 🟠

**Ralph loop** (Geoffrey Huntley): run the agent in a loop. Each iteration gets a **fresh context**, the same prompt file, and reads state from disk (`feature_list.json`, progress notes, git log). It does one item, commits, exits. Then it restarts.

```bash
# Emerging pattern — only with strong gates, a sandbox, and a budget
for i in $(seq 1 20); do
  claude -p "$(cat PROMPT.md)" --max-turns 60 --output-format json > ".agent/runs/$i.json" || break
  python3 scripts/verify_gate.py || { echo "gate red at iteration $i"; break; }
  jq -e '.features | map(select(.status!="done")) | length == 0' .agent/feature_list.json && break
done
```
Why it works: fresh context avoids rot, and persistence carries the goal. Why it's risky: compounding errors when gates are weak, cost runaway. **Prereqs:** Modules 02–05 solid, sandbox (Module 07), iteration + cost cap, gate between iterations.

---

## 9. Exercises (P8, P9)

1. **P8:** decompose a real change into 2 independent units + 1 integrator. Run them in 2 worktrees. Log integration time as a % of total.
2. Find a parallel split that only *looks* independent. Name the shared decision.
3. Add a read-only research worker whose only output is a fact table with receipts.
4. **P9:** run a task across ≥ 3 sessions using only handoff packets and state. Time each resume to first meaningful edit (target < 2 min).
5. Make `generate_handoff` idempotent (same inputs → same packet). What must be stable?
6. Add `clean_state_issues()` as a precondition. Try to hand off from a dirty tree.

## 10. Mastery check

- [ ] I can explain why my last parallel split was safe (ownership, contract, state isolation).
- [ ] Integration is < 20% of total wall time, with no path conflicts.
- [ ] Sessions resume from the packet alone, in < 2 min.
- [ ] I end sessions proactively, before context rot, never at the wall.

> [!quote] Takeaway
> Parallelism multiplies whatever your framing and gates already are. Isolate, own, prove, integrate. Always leave the bench clean.
