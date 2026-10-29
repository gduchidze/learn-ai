---
tags: [ai-system-design, agent-assisted-engineering, prerequisites, python, ci, github-actions]
aliases: [Python CI, GitHub Actions Python, uv CI, Slow CI]
level: L0
created: 2026-10-29
---

# P8 · CI Pipelines for Python: Write One, Then Make It Fast

> [!success] 🟢 Junior Explanation
> **In plain words:** Continuous Integration (CI) runs your checks (format, lint, types, tests) on a clean machine for every push and pull request. It answers one question: **"Does this change work somewhere other than my laptop?"** A good pipeline is *the same command you run locally*, run in a clean place, fast enough that people don't route around it.
>
> **Analogy:** CI is the airport security scanner. Everyone goes through it, it's the same scanner for everyone, and if it takes 2 hours people start looking for side doors.
>
> 🎯 **Fluent means:** you've written a pipeline from scratch, it's green in a few minutes, and when it's slow you can read the timings and say exactly why.

Index: [[P0 Prerequisites Index (Python)]] · Prev: [[P7 Design Basics in Python - Coupling, Interfaces, DI, Layers]] · Next: [[01 Foundations - How Agents Actually Work]]

> [!tip] Why this matters for agent work
> CI is the deterministic gate between "the agent says it's done" and `main`. Everything in [[04 Verification - Tests, Feedback Loops and Gates]] and [[07 Software Factories and Automation]] builds on a pipeline you trust. If it's slow, agents (and humans) wait; if it's flaky, everyone learns to ignore red.

---

## 1. One `check` command, used everywhere

The single most important CI design decision: **CI runs the same command developers and agents run locally.** No logic that only exists in YAML.

```bash
#!/usr/bin/env bash
# scripts/check.sh: the definition of "done" for this repo
set -euo pipefail

echo "== format";  uv run ruff format --check
echo "== lint";    uv run ruff check
echo "== types";   uv run mypy src
echo "== imports"; uv run lint-imports
echo "== tests";   uv run pytest -q --cov=linkcheck --cov-branch --cov-fail-under=80
```

`chmod +x scripts/check.sh`. Locally: `./scripts/check.sh`. In CI: same. In your agent's instructions: "Done means `./scripts/check.sh` exits 0." (Some teams use a `Makefile`, `justfile`, `nox`, or `tox` instead; the principle is identical.)

Add fast local feedback with pre-commit hooks (ruff format + ruff check on staged files) so CI rarely fails on trivia.

---

## 2. A complete GitHub Actions workflow

```yaml
# .github/workflows/ci.yml
name: ci

on:
  pull_request:
  push:
    branches: [main]

concurrency:                       # a new push cancels the old run on the same branch
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read                   # least privilege for the token

env:
  PYTHONUNBUFFERED: "1"
  TZ: UTC

jobs:
  static:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5
      - uses: astral-sh/setup-uv@v6       # check for the current major versions
        with:
          enable-cache: true
      - run: uv sync --locked          # fail if uv.lock is out of date with pyproject.toml
      - run: uv run ruff format --check
      - run: uv run ruff check --output-format=github   # inline annotations on the PR
      - run: uv run mypy src
      - run: uv run lint-imports

  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        python-version: ["3.12", "3.13", "3.14"]
    steps:
      - uses: actions/checkout@v5
      - uses: astral-sh/setup-uv@v6
        with:
          enable-cache: true
          python-version: ${{ matrix.python-version }}
      - run: uv sync --locked
      - run: uv run pytest -n auto --durations=15 --cov=linkcheck --cov-branch --cov-report=xml --cov-fail-under=80
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-artifacts-${{ matrix.python-version }}
          path: |
            .pytest_cache/
            coverage.xml
```

What each piece buys you:

| Piece | Why |
|---|---|
| `on: pull_request` + `push: main` | Gate PRs; verify `main` after merge |
| `concurrency` + `cancel-in-progress` | Don't waste runners on superseded pushes |
| `permissions: contents: read` | A compromised step can't push code or edit releases |
| `uv sync --locked` | CI fails if someone added a dep without updating the lockfile |
| `setup-uv` with cache | Dependency install drops from minutes to seconds |
| Separate `static` and `test` jobs | They run **in parallel**; lint failures show in ~30 s |
| Matrix | Catches version-specific behavior; `fail-fast: false` shows *all* failing versions |
| `timeout-minutes` | A hung test fails in 15 min, not the 6-hour default |
| `--durations=15` | Every run tells you the slowest tests |
| `upload-artifact` on failure | Evidence to debug without rerunning |

Then in GitHub settings: **branch protection / ruleset** on `main` requiring `static` and `test` to pass. Without that, CI is advice, not a gate.

> [!warning] Security basics for CI
> Pin third-party actions to a version (or a full commit SHA for high-security repos). Don't use `pull_request_target` with a checkout of PR code (it runs untrusted code with secrets). Keep secrets out of logs and out of PR workflows from forks. These matter more once agents open PRs automatically ([[07 Software Factories and Automation]]).

---

## 3. What makes CI slow (and the fix)

Measure first: the Actions UI shows per-step times; `gh run view <id> --log` gives raw logs; `pytest --durations` names slow tests.

| Cause | Symptom | Fix |
|---|---|---|
| **Cold dependency install** | `pip install` step takes 2–5 min every run | `uv` + `enable-cache`; commit `uv.lock`; prefer wheels |
| **Everything serial** | One long job: lint → types → tests | Split into parallel jobs; run tests with `pytest -n auto` (xdist) |
| **A few slow tests dominate** | `--durations` shows 3 tests = 70% of time | Make them unit tests with fakes; mark true slow ones `@pytest.mark.slow` and run them nightly or only on `main` |
| **Real network / sleeps in tests** | Tests wait on timeouts; flaky too | Fakes, local servers, fake clocks ([[P2 Testing with pytest - Unit, Integration, Doubles, Flakiness]]) |
| **Session setup repeated** | Each test creates DB/server | `scope="session"` fixtures with proper isolation (transactions, unique tmp dirs) |
| **Matrix explosion** | 3 Pythons × 3 OSes × 2 DBs = 18 jobs per push | Full matrix on `main`/nightly; PRs run the newest + oldest supported Python only |
| **Docker image built from scratch** | 8 min "build" step | Layer caching (`docker/build-push-action` with `cache-from: type=gha`), slimmer base, deps layer before code layer |
| **Rerunning everything on doc changes** | 10-min CI for a README typo | `paths-ignore: ['**.md', 'docs/**']` (careful with required checks; use a no-op job or path filters per job) |
| **Retries masking flakiness** | `pytest-rerunfailures` everywhere, still slow and still flaky | Quarantine the flaky test with an owner and a ticket; fix the root cause |
| **Queue time** | Jobs wait for runners | Fewer, fatter jobs; cancel superseded runs; larger runners for the test job |
| **Coverage on every matrix leg** | Coverage overhead × N | Collect coverage on one Python version only |

Targets worth aiming for: **static checks < 1 min, PR pipeline < 5 min, first failure visible < 2 min.** Slow CI changes behavior: people batch changes (bigger diffs, harder review) or merge without waiting.

---

## 4. Order checks by cost (fail fast)

```
format (s) → lint (s) → types (10s) → import contracts (s) → unit tests (≤1 min) → integration (min) → e2e/slow (nightly)
```

Cheap, high-signal checks first so a typo fails in seconds. Locally, `scripts/check.sh` already does this; in CI, parallel jobs give the same effect.

---

## 5. Reproduce CI locally

When CI fails and local passes, the difference is the environment. Close the gap:

```bash
git status --short --ignored            # untracked/ignored files you have that CI doesn't
rm -rf .venv && uv sync --locked         # clean env like CI
TZ=UTC LANG=C.UTF-8 ./scripts/check.sh   # same env vars as CI
uv run --python 3.12 pytest -q           # the oldest version in the matrix
gh run view --log-failed                 # just the failing step's log
gh run rerun --failed                    # rerun only failed jobs (not a fix for flakiness!)
```

`act` (github.com/nektos/act) runs workflows locally in Docker; handy for YAML iteration, not a perfect replica.

---

## 6. Drills

| # | Drill | Exit check |
|---|---|---|
| D1 | Write `scripts/check.sh` (§1) for `linkcheck` | Runs green locally; a planted lint error fails it with a non-zero exit |
| D2 | Write `.github/workflows/ci.yml` from scratch (type it, don't paste) | Green on a PR; branch protection requires it |
| D3 | Remove caching and parallelism; record total time. Add them back one at a time | Table: baseline vs `uv` cache vs parallel jobs vs `-n auto` |
| D4 | Add a test with `time.sleep(5)`; find it from CI output alone via `--durations` | Named in the log; replaced with a fake clock |
| D5 | Add a dependency to `pyproject.toml` without re-locking; push | CI fails on the lockfile check, with a clear message |
| D6 | Break something only on Python 3.12 (e.g. use a 3.13+ API) | Matrix shows exactly which leg fails |
| D7 | Write a 5-line "CI runbook" in the repo: how to run checks locally, how to rerun, who owns flaky tests | Committed under `docs/` |

---

## 7. Self-check

1. Why should CI call `scripts/check.sh` instead of having its own steps with different flags?
2. Name six things that make CI slow and the fix for each.
3. What does `concurrency.cancel-in-progress` do, and when would you *not* want it (hint: deploy jobs)?
4. Why does a lockfile check belong in CI?
5. What makes a CI check a *gate* rather than *advice*?
6. Why is "add retries" not a fix for a flaky test?
7. What's dangerous about `pull_request_target`?

---

## 8. Resources

- GitHub Actions docs: *Building and testing Python*, *Workflow syntax*, *Security hardening for GitHub Actions*.
- `uv` docs: *Using uv in GitHub Actions* (setup-uv, caching, `--locked`).
- Jez Humble & David Farley, *Continuous Delivery*; Nicole Forsgren et al., *Accelerate* (why fast feedback matters).
- pytest-xdist docs; pre-commit (pre-commit.com); ruff's pre-commit hook.

---

## 9. Done with the prerequisites?

Re-score yourself in §2 of [[P0 Prerequisites Index (Python)]]. At ≥ 12/16, your `linkcheck` repo (layered, tested, bisectable, with a one-command check and a green CI) is your practice repo for the main track.

Next: [[01 Foundations - How Agents Actually Work]]
