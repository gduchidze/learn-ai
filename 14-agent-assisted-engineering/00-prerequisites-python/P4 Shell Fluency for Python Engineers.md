---
tags: [ai-system-design, agent-assisted-engineering, prerequisites, shell, bash, python]
aliases: [Shell Fluency, Bash for Python Devs, Exit Codes, jq, ripgrep]
level: L0
created: 2026-10-29
---

# P4 · Shell Fluency for Python Engineers

> [!success] 🟢 Junior Explanation
> **In plain words:** The shell starts programs and wires them together. Every program has three streams (**stdin**, **stdout**, **stderr**), an **exit code** (0 = success, anything else = failure), and an **environment** (key=value variables inherited from its parent). Pipes connect one program's stdout to the next one's stdin. That's nearly all of it.
>
> **Analogy:** Programs are kitchen appliances. Pipes are conveyor belts between them. Exit codes are the green/red light on each appliance. If you ignore the lights, you serve burnt food and call it done.
>
> 🎯 **Fluent means:** you compose `rg | jq | sort | uniq -c` without thinking, write scripts that **fail loudly**, and write Python CLIs that behave like good Unix citizens.

Index: [[P0 Prerequisites Index (Python)]] · Prev: [[P3 Git from the CLI - Rebase, Bisect, Worktree, Staging]] · Next: [[P5 Reading Unfamiliar Python Code]]

> [!tip] Why this matters for agent work
> Coding agents act almost entirely through the shell. The most common "fake done" is a pipeline that swallowed a failure: `pytest | tee log.txt` exits 0 even when tests fail. If you can read exit codes and pipelines, you can catch it. If you can't, you'll believe it.

---

## 1. Streams, redirection, pipes

```bash
cmd > out.txt          # stdout to file (overwrite)
cmd >> out.txt         # append
cmd 2> err.txt         # stderr to file
cmd > all.txt 2>&1     # both to one file (order matters: redirect stdout first)
cmd &> all.txt         # bash shorthand for the same
cmd 2>/dev/null        # discard errors
cmd < input.txt        # file as stdin
cmd1 | cmd2            # stdout of cmd1 → stdin of cmd2 (stderr NOT piped)
cmd1 |& cmd2           # bash: pipe stderr too
cmd | tee log.txt      # see it AND save it
diff <(cmd1) <(cmd2)   # process substitution: compare two outputs
```

**Unix citizen rule:** **data → stdout, diagnostics → stderr.** Then `linkcheck --json docs/ | jq ...` works even while it logs progress.

---

## 2. Search: `rg` (ripgrep)

`rg` respects `.gitignore`, is fast, and is what most agent harnesses use under the hood.

```bash
rg "def check_"                         # recursive search
rg -n -t py "TODO|FIXME"                # line numbers, Python files only
rg -w "Fetcher"                         # whole word
rg -l "import httpx"                    # files only
rg -c "assert" tests/                   # count per file
rg -C 3 "TaskGroup"                     # 3 lines of context
rg -F "a.b(c)"                          # literal string, no regex
rg -g '!tests/**' "print\("             # glob exclude
rg --files | rg "conftest"              # find files by name
rg "except Exception:\s*$" -A1 -t py    # find catch-alls and the next line
```

Classic `grep` equivalents: `grep -rn`, `grep -l`, `grep -v` (invert), `grep -E` (extended regex). Know them; servers won't always have `rg`.

---

## 3. JSON: `jq`

```bash
echo '{"a": 1, "b": [1,2,3]}' | jq '.b | length'          # 3
jq '.'           file.json      # pretty print
jq -r '.name'    file.json      # raw string (no quotes), good for shell vars
jq '.[] | select(.status >= 400) | .url'           results.json
jq 'map({url, status}) | sort_by(.status)'         results.json
jq 'group_by(.status) | map({status: .[0].status, n: length})' results.json
jq -c '.[]'      results.json   # one compact JSON object per line (for piping/xargs)
jq -e '.ok' file.json           # -e: exit 1 if result is false/null (use in scripts!)
```

Real Python-tool examples:

```bash
# top ruff violations by rule
uv run ruff check --output-format json \
  | jq -r 'group_by(.code) | map("\(length)\t\(.[0].code)") | .[]' | sort -rn | head

# broken links only
uv run linkcheck --json docs/ | jq -r '.[] | select(.ok | not) | "\(.status // "ERR")\t\(.url)"'

# failing GitHub Actions jobs on the last run
gh run view --json jobs | jq -r '.jobs[] | select(.conclusion=="failure") | .name'
```

---

## 4. Exit codes: the green/red light

```bash
uv run pytest -q; echo "exit=$?"     # $? = exit code of the LAST command
```

| Code | Convention |
|---|---|
| `0` | Success |
| `1` | General failure |
| `2` | Usage error (bad flags) in many tools, incl. argparse |
| `126` / `127` | Not executable / command not found |
| `128+N` | Killed by signal N (`130` = Ctrl-C/SIGINT, `137` = SIGKILL, often OOM) |

Combinators:

```bash
uv sync && uv run pytest          # run tests only if sync succeeded
uv run ruff check || echo "lint failed" >&2
if ! uv run pytest -q; then echo "tests failed" >&2; exit 1; fi
```

### 4.1 Strict mode: make scripts fail loudly

```bash
#!/usr/bin/env bash
set -euo pipefail
# -e          exit on any failing command
# -u          error on undefined variables (typo'd $VAR is not "")
# -o pipefail a pipeline fails if ANY stage fails, not just the last
```

Why `pipefail` matters:

```bash
uv run pytest | tee test.log      # without pipefail: exit code = tee's = 0. Tests "passed".
set -o pipefail
uv run pytest | tee test.log      # now exit code = pytest's
```

Gotchas with `-e`: it doesn't trigger inside `if`, `&&`/`||` chains, or for commands whose failure you intentionally test. Use `cmd || true` when failure is acceptable, and say why in a comment.

---

## 5. Environment variables

```bash
export LINKCHECK_TIMEOUT=5        # visible to child processes
LINKCHECK_TIMEOUT=1 uv run linkcheck docs/    # only for this one command
env | sort | rg -i python         # inspect
unset LINKCHECK_TIMEOUT
echo "${LINKCHECK_TIMEOUT:-10}"   # default if unset
: "${API_TOKEN:?API_TOKEN must be set}"   # fail fast if missing
```

Children inherit the environment; **children can never change the parent's**. That's why `cd` and `export` inside a script don't affect your terminal (use `source script.sh` if you need that).

Python-relevant variables: `PATH`, `VIRTUAL_ENV`, `PYTHONPATH` (avoid in projects; it hides packaging bugs), `PYTHONUNBUFFERED=1` (see output immediately in CI/containers), `PYTHONDONTWRITEBYTECODE=1`, `PYTHONDEVMODE=1` / `python -X dev` (extra runtime checks), `UV_*` settings.

In Python, read config at the boundary and validate it:

```python
import os

def timeout_from_env() -> float:
    raw = os.environ.get("LINKCHECK_TIMEOUT", "10")
    try:
        value = float(raw)
    except ValueError as e:
        raise SystemExit(f"LINKCHECK_TIMEOUT must be a number, got {raw!r}") from e
    if value <= 0:
        raise SystemExit("LINKCHECK_TIMEOUT must be > 0")
    return value
```

Secrets: never `echo` them, never commit `.env`; keep a `.env.example`. Be aware that env vars are visible to every child process, including an agent's tools.

---

## 6. Background jobs and process control

```bash
long_command &          # run in background; shell prints [job] PID
echo $!                 # PID of the last background job
jobs                    # list jobs in this shell
fg %1                   # bring job 1 to foreground
# Ctrl-Z               # suspend the foreground job
bg %1                   # resume it in background
wait                    # wait for all background jobs
wait $PID               # wait for one; returns its exit code
kill $PID               # SIGTERM (polite); kill -9 = SIGKILL (last resort)
nohup cmd > out.log 2>&1 &    # survive terminal closing
```

The canonical "start a server, test against it, always clean up" script:

```bash
#!/usr/bin/env bash
set -euo pipefail

uv run python -m http.server 8765 --directory site > /tmp/site.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT     # runs on success, failure, Ctrl-C

# wait until ready instead of sleeping a guessed amount
for _ in $(seq 1 50); do
  curl -sf http://127.0.0.1:8765/ > /dev/null && break
  sleep 0.1
done

uv run linkcheck tests/fixtures/local-links.md   # a Markdown file whose links point at 127.0.0.1:8765
```

Parallelism from the shell:

```bash
# run lint, types, tests in parallel; fail if any failed
uv run ruff check & p1=$!
uv run mypy src  & p2=$!
uv run pytest -q & p3=$!
fail=0
for p in $p1 $p2 $p3; do wait "$p" || fail=1; done
exit $fail

# fan out over files
rg --files -g '*.md' docs | xargs -P 8 -n 20 uv run linkcheck
```

---

## 7. Writing Python CLIs that behave

```python
# src/linkcheck/cli.py
import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path

from linkcheck.adapters import check_all
from linkcheck.domain import extract_links
from linkcheck.errors import LinkcheckError

log = logging.getLogger("linkcheck")

EXIT_OK, EXIT_BROKEN, EXIT_USAGE = 0, 1, 2


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="linkcheck")
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--json", action="store_true", help="machine-readable output on stdout")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)                     # bad flags → exit 2 automatically

    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.WARNING,
                        stream=sys.stderr)              # logs never pollute stdout

    try:
        urls = sorted({u for p in args.paths for u in extract_links(p.read_text("utf-8"))})
        results = asyncio.run(check_all(urls))
    except (OSError, LinkcheckError) as e:              # expected failures → clean message
        print(f"linkcheck: {e}", file=sys.stderr)
        return EXIT_USAGE

    if args.json:
        json.dump([{"url": r.url, "status": r.status, "ok": r.ok, "error": r.error}
                   for r in results], sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        for r in results:
            if not r.ok:
                print(f"{r.status or 'ERR'}\t{r.url}\t{r.error or ''}")
    return EXIT_OK if all(r.ok for r in results) else EXIT_BROKEN
```

Checklist: data on stdout, logs on stderr, documented exit codes, `--json` for machines, `main(argv)` testable without a subprocess, no traceback for expected user errors.

Calling the shell *from* Python:

```python
import subprocess

result = subprocess.run(
    ["git", "rev-parse", "HEAD"],          # list form: no shell, no injection
    capture_output=True, text=True, check=True, timeout=10,
)
sha = result.stdout.strip()
```

Avoid `shell=True` with any interpolated input (injection). `check=True` turns a non-zero exit into `CalledProcessError`; without it, failures are silent.

---

## 8. Drills

| # | Drill | Exit check |
|---|---|---|
| D1 | One-liner: the 10 most-changed Python files in a repo | `git log --format= --name-only -- '*.py' \| sort \| uniq -c \| sort -rn \| head` and you can explain each stage |
| D2 | Show that `pytest \| tee` hides failure; fix with `pipefail` | Two runs, two different `$?` |
| D3 | `scripts/check.sh` in strict mode: format check, lint, types, tests | Introduce a lint error → script exits non-zero and stops |
| D4 | Background-server script from §6 | Ctrl-C mid-run leaves no orphan server (`lsof -i :8765` empty) |
| D5 | Implement `cli.main` from §7; test it in pytest with `capsys` and asserted return codes | Tests for exit 0, 1, 2 |
| D6 | jq: from `linkcheck --json`, count broken links per domain | Output like `3  example.com` |
| D7 | Explain `$?` = `137` and `130` | Without looking it up |

---

## 9. Self-check

1. Why does `cmd > f 2>&1` differ from `cmd 2>&1 > f`?
2. What are the three flags in `set -euo pipefail` and what failure does each prevent?
3. A script runs `cd build` and then `rm -rf *`. What happens if `build` doesn't exist and there's no `set -e`? *(It deletes the current directory's contents.)*
4. How do you make a script clean up a background process no matter how it exits?
5. Why should a CLI write logs to stderr?
6. Why is `subprocess.run(f"git log {user_input}", shell=True)` dangerous?

---

## 10. Resources

- *The Linux Command Line* (William Shotts), free online.
- MIT *The Missing Semester of Your CS Education*: shell, scripting, data wrangling lectures.
- `man bash` (sections on Pipelines, Redirection, `set`), ShellCheck (shellcheck.net) to lint scripts.
- `jq` manual (jqlang.org), ripgrep user guide (`rg --help` is excellent).
- Python docs: `argparse` tutorial, `subprocess` (security considerations section).

Next: [[P5 Reading Unfamiliar Python Code]]
