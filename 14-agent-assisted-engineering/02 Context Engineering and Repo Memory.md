---
tags: [ai-system-design, agent-assisted-engineering, context-engineering]
aliases: [Context Engineering, AGENTS.md, Repo Memory, Durable State, Init Scripts, Domain Language]
level: L2
---

# 02 · Context Engineering and Repo Memory

> [!success] 🟢 Junior Explanation
> **In plain words:** Chat history evaporates. The repo stays. Put the things the agent must know into small, versioned files: a short router (`AGENTS.md`), a glossary, decision records, a state file, and an init script. Keep them **short and checkable**, because long docs get skimmed.
>
> **Analogy:** Don't hand a new hire a 40-page manual. Hand them a one-page map with links, a glossary, and today's ticket.
>
> 🎯 **L2 must know:** router vs manual, progressive disclosure, file-backed state, atomic writes. · **L3 adds:** schemas + migrations, init probes, glossary/ADR pruning, cross-tool distribution.

Prev: [[01 Foundations - How Agents Actually Work]] · Next: [[03 Specification, Framing and Planning]]

---

## 1. The memory hierarchy

```
                   volatile ◄─────────────────────────────────► durable
 ┌────────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐
 │ Turn       │  │ Session      │  │ Task          │  │ Project               │
 │ (prompt)   │  │ (chat, gets  │  │ agent_state,  │  │ AGENTS.md, glossary,  │
 │            │  │  compacted)  │  │ scope, handoff│  │ ADRs, tests, types    │
 └────────────┘  └──────────────┘  └───────────────┘  └──────────────────────┘
   seconds          hours             days               months–years
```

**Durability test:** *Would this be useful three months from now in a CI rerun?* Yes → repo. No → chat or telemetry.

| Belongs in repo | Doesn't |
|---|---|
| Active task id, touched files, assumptions, blockers, next action | Raw transcripts, token-level reasoning |
| Decisions and why (ADRs) | "User seemed frustrated" |
| Domain terms (glossary) | Generic programming explanations |
| How to verify (commands) | Vendor-specific model IDs |

---

## 2. AGENTS.md is a router, not a manual 🔵

`AGENTS.md` is an open convention (agents.md) read by Codex, Cursor, Copilot, Gemini CLI, OpenCode, and others. Claude Code reads `CLAUDE.md`, so symlink one to the other. It is loaded **every session**, so every line costs attention forever.

### ❌ Bad (the encyclopedia)
```markdown
# Project Guidelines
Welcome! This project is a modern web application built with love...
## Code Style
- Follow the Google Python Style Guide.
- Write clean, maintainable code. Be careful with edge cases.
- Always test thoroughly.
... (2,800 more lines: history, every incident ever, style essays) ...
## Commands
(buried at line 2,700)
```
Problems: commands buried, rules nobody can check ("be careful"), rules that contradict each other, written for humans.

### ✅ Good (the map, < 60 lines)
```markdown
# AGENTS.md — router. Read fully at session start.

## Verify (run before claiming done)
- `make check`   # ruff + mypy --strict + pytest -q (≈70s)
- `make test-fast FILE=<path>`  # related tests only

## Start every session
1. Run `python scripts/init_agent.py` — stop if it exits non-zero.
2. Read `.agent/state.json` (where you are) and `.agent/feature_list.json` (what's next).
3. Work on exactly ONE feature: the `active` one.

## Hard rules (enforced by hooks/CI — violations block)
1. Never edit `migrations/**`, `scripts/release.sh`, `.github/**`.
2. Never weaken, skip, or delete an existing test to make it pass.
3. New dependency → stop and ask.
4. Unsure about product behavior → write the question to state.blockers, don't guess.
5. Done = acceptance command exited 0 in a captured feedback record.

## Where to look (load only when relevant)
- Domain terms: `docs/GLOSSARY.md`        - Decisions: `docs/adr/` (accepted only)
- Architecture & boundaries: `docs/architecture.md`
- Testing conventions: `docs/testing.md`  - Review standards: `docs/CODING_STANDARDS.md`
```

### Rules that make it work

| Rule | Why |
|---|---|
| **Commands first, style last** | The verification path is the most-used fact |
| **Every rule is enforceable or deleted** | "Be careful" changes nothing; a hook does |
| **Number the priorities** | Conflicting flat rules push agents into guessy behavior |
| **Pointers, not prose** | Reachability test: any doc ≤ 2 hops from the router |
| **Broken pointer = startup failure** | A stale link is worse than a missing rule |
| **Nested files for monorepos** | `AGENTS.md` in subdirs; the nearest file extends the root (tool-specific merge rules, so check yours) |
| **One source, many tools** | `ln -s AGENTS.md CLAUDE.md` (and Copilot/Cursor equivalents) |

> [!tip] Lint your router (exercise: build it)
> `lint_agents_md.py`: fail if > 80 lines, if any path it mentions doesn't exist, or if it contains banned aspirational phrases (`be careful`, `thoroughly`, `clean code`, `best practices`).

```python
#!/usr/bin/env python3
"""Fail CI if AGENTS.md is long, vague, or points at missing files."""
import re, sys
from pathlib import Path

MAX_LINES = 80
VAGUE = re.compile(r"\b(be careful|thoroughly|clean code|best practices|as needed)\b", re.I)
PATH_REF = re.compile(r"`([\w./-]+\.(?:md|py|json|ts|sh|ya?ml))`")

def main(path: str = "AGENTS.md") -> int:
    text = Path(path).read_text(encoding="utf-8")
    errors = []
    if (n := text.count("\n") + 1) > MAX_LINES:
        errors.append(f"{path}: {n} lines > {MAX_LINES}; move depth into docs/")
    for i, line in enumerate(text.splitlines(), 1):
        if m := VAGUE.search(line):
            errors.append(f"{path}:{i}: unenforceable phrase '{m.group(0)}'")
        for ref in PATH_REF.findall(line):
            if not Path(ref).exists():
                errors.append(f"{path}:{i}: points to missing file '{ref}'")
    print("\n".join(errors) or "AGENTS.md OK")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
```

---

## 3. Progressive disclosure: three tiers

| Tier | File | Read when | Budget |
|---|---|---|---|
| Router | `AGENTS.md` | Every session | < 60–80 lines |
| Rules | `docs/agent-rules.md` | Every session, start | 1 screen per category |
| Topic docs | `docs/<topic>.md` | Only when the task touches that topic | As deep as needed |
| Skills | `.claude/skills/<name>/SKILL.md` | Harness loads metadata; body on demand | Small frontmatter, deep body |

🔵 **Skills** (Anthropic's Agent Skills format, now adopted by multiple harnesses): a folder with `SKILL.md` (name + description frontmatter) and optional scripts. Only the description sits in context until the skill is triggered. Use them for **repeatable procedures** (release checklist, migration recipe, review rubric), not for facts.

---

## 4. Domain language: the cheapest quality lever 🟢

From Evans' *Domain-Driven Design*: one vocabulary shared by people, docs, and code. Agents start cold and guess at jargon, so they benefit even more than new hires do.

```markdown
## Enrollment
A learner's right to access one cohort. Created on payment, revoked on refund.
Not: "subscription" (recurring billing), "registration" (account creation).
Code: `Enrollment`, `enrollments` table, `EnrollmentService`.
Example: Giorgi's enrollment in the Nov 2026 cohort.
```

**Pruning:** delete terms no longer in code (`rg -w Term`), merge synonyms and ban one, rewrite definitions that describe implementation, and delete generic programming terms (the model already knows them).

**Generate it with grilling:** run a relentless interview skill (e.g., `/grill-with-docs` from `mattpocock/skills`) on a planned change. It challenges terms, then writes glossary entries and ADRs as it goes.

---

## 5. ADRs: stop agents from re-litigating decisions 🟢

Nygard format (2011): **Title · Status · Context · Decision · Consequences.**

```markdown
# ADR 0007: Postgres advisory locks for job claiming
Status: Accepted (2026-09-14)
Context: Two workers occasionally claimed the same job. Redis is not in our stack;
         adding it means a new on-call surface.
Decision: Claim jobs with `pg_try_advisory_xact_lock(job_id)` inside the claim txn.
Consequences: + no new infra; + locks auto-release on txn end.
              − ties us to Postgres; − lock ids share a global 64-bit space (namespace by table).
Alternatives rejected: Redis/Redlock (new infra), SKIP LOCKED queue table (fine, revisit at >1k jobs/s).
```

Write an ADR when a decision is **hard to reverse**, **surprised someone**, or **the agent keeps suggesting the alternative.** Never delete ADRs. Mark them superseded and link forward. The agent's index should point only at accepted ones.

---

## 6. File-backed state: the system of record 🔵

### 6.1 Minimal three-file workbench
```
AGENTS.md                 # router
.agent/state.json         # where you are (read at start, write at end of every turn)
.agent/feature_list.json  # what's left (queue) — one `in_progress` max
```

### 6.2 Schema-first state
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "agent_state",
  "type": "object",
  "required": ["schema_version", "active_task", "touched_files", "assumptions", "blockers", "next_action", "updated_at"],
  "additionalProperties": false,
  "properties": {
    "schema_version": {"const": 2},
    "active_task": {"type": ["string", "null"], "pattern": "^T-\\d{3,}$"},
    "touched_files": {"type": "array", "items": {"type": "string"}},
    "assumptions": {"type": "array", "items": {"type": "string"}},
    "blockers": {"type": "array", "items": {"type": "string"}},
    "next_action": {"type": "string", "minLength": 5},
    "last_known_good_commit": {"type": "string", "pattern": "^[0-9a-f]{7,40}$"},
    "updated_at": {"type": "string", "format": "date-time"}
  }
}
```

### 6.3 Atomic writes (non-negotiable)
A half-written state file is worse than no file. Write to a temp file, fsync, then rename.

```python
import json, os, tempfile
from pathlib import Path

def atomic_write_json(path: Path, data: dict) -> None:
    """Write JSON so readers see either the old file or the new file — never half."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, sort_keys=True)   # sorted keys = clean diffs
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)          # atomic on POSIX and Windows (same filesystem)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise
```

### 6.4 State manager: refuse bad writes
```python
from dataclasses import dataclass
from datetime import datetime, timezone

SCHEMA_VERSION = 2
REQUIRED = {"schema_version", "active_task", "touched_files", "assumptions",
            "blockers", "next_action", "updated_at"}

class StateError(Exception): ...

@dataclass(frozen=True)
class StateManager:
    path: Path

    def load(self) -> dict:
        data = json.loads(self.path.read_text(encoding="utf-8"))
        if data.get("schema_version") != SCHEMA_VERSION:
            raise StateError(f"state v{data.get('schema_version')} != v{SCHEMA_VERSION}; "
                             "run tools/migrate_state.py")
        self._validate(data)
        return data

    def commit(self, current: dict, **changes) -> dict:
        new = {**current, **changes,                     # new object, never mutate
               "updated_at": datetime.now(timezone.utc).isoformat()}
        self._validate(new)                               # refuse before touching disk
        atomic_write_json(self.path, new)
        return new

    @staticmethod
    def _validate(d: dict) -> None:
        if missing := REQUIRED - d.keys():
            raise StateError(f"missing keys: {sorted(missing)}")
        if extra := d.keys() - REQUIRED - {"last_known_good_commit"}:
            raise StateError(f"unknown keys: {sorted(extra)}")
        for k in ("touched_files", "assumptions", "blockers"):
            if not isinstance(d[k], list):
                raise StateError(f"{k} must be a list")
        if len(d["next_action"].strip()) < 5:
            raise StateError("next_action must be a concrete step")
```
(In production use `jsonschema` against the schema in §6.2. The hand-rolled check shows the idea.)

### 6.5 Production patterns
| Pattern | Why |
|---|---|
| `schema_version` + migration script, refuse unknown versions | No silent drift |
| Big artifacts as separate files; store only the path in state | Small, fast checkpoints |
| Append-only `state.events.jsonl` + periodic snapshot | Replay decisions (event sourcing) |
| Idempotency keys for non-idempotent tools (`pending_calls.jsonl`) | A crash mid-call won't double-send email/DB inserts |

---

## 7. Init scripts: pay the setup tax once 🔵

Every cold session wastes tokens rediscovering the Python version, the test command, missing env vars, stale state. One deterministic script probes it all, writes `init_report.json`, and **fails loudly**.

```python
#!/usr/bin/env python3
"""init_agent.py — deterministic probes. No network, no LLM, < 3s total."""
import importlib.util, json, os, shutil, subprocess, sys, time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED_PY = (3, 11)
REQUIRED_MODULES = ["pytest", "ruff"]
REQUIRED_ENV = ["DATABASE_URL"]
STATE = ROOT / ".agent/state.json"
STATE_MAX_AGE_H = 24
MAX_DRIFT_FILES = 50

def probe_python():
    ok = sys.version_info[:2] >= REQUIRED_PY
    return ("python", ok, f"{sys.version.split()[0]} (need >= {'.'.join(map(str, REQUIRED_PY))})")

def probe_modules():
    missing = [m for m in REQUIRED_MODULES if importlib.util.find_spec(m) is None]
    return ("modules", not missing, f"missing: {missing}" if missing else "all present")

def probe_env():
    missing = [v for v in REQUIRED_ENV if not os.environ.get(v)]
    return ("env", not missing, f"missing: {missing}" if missing else "all set")

def probe_check_cmd():
    ok = shutil.which("make") is not None and (ROOT / "Makefile").exists()
    return ("check_cmd", ok, "make check resolvable" if ok else "no Makefile/make")

def probe_state_fresh():
    if not STATE.exists():
        return ("state", True, "no state yet (fresh task)")
    age_h = (time.time() - STATE.stat().st_mtime) / 3600
    return ("state", age_h <= STATE_MAX_AGE_H, f"age {age_h:.1f}h (max {STATE_MAX_AGE_H}h)")

def probe_drift():
    if not STATE.exists():
        return ("drift", True, "no baseline")
    lkg = json.loads(STATE.read_text()).get("last_known_good_commit")
    if not lkg:
        return ("drift", True, "no last_known_good_commit")
    out = subprocess.run(["git", "diff", "--name-only", lkg, "HEAD"],
                         capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        return ("drift", False, f"git diff failed: {out.stderr.strip()}")
    n = len([l for l in out.stdout.splitlines() if l])
    return ("drift", n <= MAX_DRIFT_FILES, f"{n} files changed since {lkg[:8]}")

def main() -> int:
    probes = [probe_python, probe_modules, probe_env, probe_check_cmd, probe_state_fresh, probe_drift]
    results = []
    for p in probes:
        t0 = time.perf_counter()
        name, ok, detail = p()
        results.append({"name": name, "ok": ok, "detail": detail,
                        "ms": round((time.perf_counter() - t0) * 1000)})
    report = {"at": datetime.now(timezone.utc).isoformat(), "probes": results,
              "healthy": all(r["ok"] for r in results)}
    (ROOT / ".agent").mkdir(exist_ok=True)
    (ROOT / ".agent/init_report.json").write_text(json.dumps(report, indent=2) + "\n")
    for r in results:
        print(f"{'✓' if r['ok'] else '✗'} {r['name']:<10} {r['detail']}  ({r['ms']}ms)")
    if not report["healthy"]:
        print("INIT FAILED — fix the ✗ items or ask a human. Do not start work.", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

Wire it to the harness's session start (e.g., a Claude Code `SessionStart` hook), to CI as a setup job, or as the first line of `AGENTS.md`.

---

## 8. Giving the agent eyes: information access 🔵

Missing data is one of the most common causes of bad fixes. Give **read-only** access to:

- Dev server logs teed to a file (`npm run dev 2>&1 | tee .agent/dev.log`)
- A seeded local DB / fixtures
- Library docs on demand (Context7-style doc MCPs, or vendored docs) → prevents **F5 hallucinated APIs**
- The error tracker or metrics through a read-only MCP
- A browser (Playwright / browser MCP) for UI work

Rule: **read-only by default; write access is an approval boundary.**

---

## 9. Exercises (Project P2: Agent-ready repo)

1. Rewrite your practice repo's instructions as a router under 60 lines. Add `lint_agents_md.py` to CI.
2. Run a grilling session on an upcoming feature → 5–10 glossary terms + 1 ADR.
3. Create `.agent/state.json` with a schema and `StateManager`. Kill the process mid-write (e.g., `kill -9` in a loop) and prove the file is never corrupt.
4. Write `init_agent.py` with ≥ 5 probes. Time each probe. Any probe over 3s is a smell; cache it or move it.
5. Symlink `CLAUDE.md → AGENTS.md`. Confirm both of the tools you use load it.
6. **Measure:** rerun the P1 task with the new repo setup. How many fewer "where is X?" turns?

## 10. Mastery check

- [ ] My router is < 60 lines, commands first, every rule enforceable, linted in CI.
- [ ] A new session reaches its first meaningful edit in < 2 minutes without asking me anything.
- [ ] State survives crashes (atomic) and refuses invalid writes (schema).
- [ ] Init fails loudly with one place to look.

> [!quote] Takeaway
> Chat is volatile; the repo is the system of record. Give the agent a map, not an encyclopedia.
