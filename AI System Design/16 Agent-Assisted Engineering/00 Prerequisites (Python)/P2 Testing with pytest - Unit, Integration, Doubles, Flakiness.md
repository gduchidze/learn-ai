---
tags: [ai-system-design, agent-assisted-engineering, prerequisites, python, testing, pytest]
aliases: [pytest Mastery, Mocks vs Fakes, Flaky Tests Python, Python Testing]
level: L0
created: 2026-10-29
---

# P2 · Testing with pytest: Unit, Integration, Test Doubles, Flakiness

> [!success] 🟢 Junior Explanation
> **In plain words:** A test is a small program that proves another program does what you claim. **Unit tests** check one piece in isolation and run in milliseconds. **Integration tests** check that pieces work together with real I/O (a real HTTP server, a real database file). **Test doubles** stand in for things you don't want in the test. A **flaky test** passes or fails without the code changing, which means it's testing something you don't control.
>
> **Analogy:** Unit test = checking each brick. Integration test = checking the wall stands. A flaky test = an inspector who sometimes says yes depending on the weather.
>
> 🎯 **Fluent means:** you write both kinds without thinking, choose fake vs mock deliberately, and can turn any flaky test into a deterministic one.

Index: [[P0 Prerequisites Index (Python)]] · Prev: [[P1 Python in Depth - Errors, Concurrency, Packaging]] · Next: [[P3 Git from the CLI - Rebase, Bisect, Worktree, Staging]]

> [!tip] Why this is *the* skill for agent work
> Tests are how "done" becomes a check the agent can't fake (see [[04 Verification - Tests, Feedback Loops and Gates]]). If you can't tell a strong test from a hollow one, an agent will hand you hollow ones that pass.

---

## 1. pytest essentials

### 1.1 Plain asserts, rich failure messages

```python
# tests/unit/test_domain.py
from linkcheck.domain import extract_links


def test_extracts_markdown_and_bare_links():
    text = "See [docs](https://a.dev/docs) and https://b.dev."
    assert extract_links(text) == ["https://a.dev/docs", "https://b.dev"]
```

pytest rewrites `assert` to show both sides on failure. No `self.assertEqual` needed.

### 1.2 Parametrize: one test, many cases

```python
import pytest


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("", []),
        ("no links here", []),
        ("[x](https://a.dev)", ["https://a.dev"]),
        ("dup https://a.dev https://a.dev", ["https://a.dev"]),   # dedupe
        ("trailing https://a.dev).", ["https://a.dev"]),          # punctuation
    ],
    ids=["empty", "none", "md", "dedupe", "punct"],
)
def test_extract_links(text, expected):
    assert extract_links(text) == expected
```

### 1.3 Fixtures: setup with scope and teardown

```python
# tests/conftest.py
import pytest


@pytest.fixture
def docs_dir(tmp_path):                  # tmp_path: built-in, unique per test
    (tmp_path / "a.md").write_text("[ok](https://ok.dev)")
    (tmp_path / "b.md").write_text("[bad](https://bad.dev)")
    return tmp_path
```

| Built-in fixture | Use |
|---|---|
| `tmp_path` | Real temporary directory (`pathlib.Path`) |
| `monkeypatch` | Set env vars, attributes, `sys.path`, undone after the test |
| `capsys` / `caplog` | Capture stdout/stderr / log records |
| `request` | Introspect the requesting test (params, markers) |

Scopes: `function` (default), `class`, `module`, `session`. Teardown = code after `yield`.

### 1.4 Asserting errors

```python
from linkcheck.errors import ConfigError


def test_missing_config_is_a_config_error(tmp_path):
    with pytest.raises(ConfigError, match="no config file"):
        load_config(tmp_path / "nope.toml")
```

### 1.5 Commands you use daily

```bash
uv run pytest -q                    # quiet
uv run pytest -x --lf               # stop at first failure, rerun only last failures
uv run pytest -k "extract and not slow"
uv run pytest tests/unit/test_domain.py::test_extract_links -vv
uv run pytest --durations=10        # slowest 10 tests
uv run pytest --cov=linkcheck --cov-report=term-missing
uv run pytest -n auto               # parallel (pytest-xdist)
uv run pytest --pdb                 # drop into debugger on failure
```

pytest exit codes matter for scripts and CI: `0` all passed, `1` some failed, `2` interrupted, `3` internal error, `4` usage error, `5` **no tests collected** (a classic silent "success" if you only check for `1`).

---

## 2. Unit vs integration: where to draw the line

```
              slow, few, high confidence about wiring
                       ▲
                ┌──────┴──────┐
                │   E2E / CLI  │   run the installed `linkcheck` binary
                ├─────────────┤
                │ Integration  │   real local HTTP server, real files, real sqlite
                ├─────────────┤
                │    Unit      │   pure functions, fakes for I/O
                └─────────────┘
              fast, many, pinpoint failures
```

| | Unit | Integration |
|---|---|---|
| Touches | Pure logic; doubles for I/O | Real I/O (network on localhost, filesystem, DB) |
| Speed | ms | 10 ms – seconds |
| Fails because | Logic is wrong | Wiring, config, serialization, protocol assumptions are wrong |
| Example in `linkcheck` | `extract_links`, `build_report`, retry policy | `HttpxFetcher` against a real local server; CLI end-to-end on a temp dir |

### 2.1 A real integration test (no mocks)

Spin up a real HTTP server on a random port. This catches what doubles can't: redirects, HEAD handling, timeouts, headers.

```python
# tests/integration/conftest.py
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest


class _Handler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        routes = {"/ok": 200, "/missing": 404, "/moved": 301}
        code = routes.get(self.path, 404)
        self.send_response(code)
        if code == 301:
            self.send_header("Location", "/ok")
        self.end_headers()

    def log_message(self, *args):  # keep test output clean
        pass


@pytest.fixture(scope="session")
def server_url():
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), _Handler)   # port 0 = pick a free one
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{httpd.server_port}"
    httpd.shutdown()
    httpd.server_close()
```

```python
# tests/integration/test_http_fetcher.py
from linkcheck.adapters import check_all


async def test_real_http_statuses(server_url):
    results = await check_all([f"{server_url}/ok", f"{server_url}/missing", f"{server_url}/moved"])
    by_url = {r.url.rsplit("/", 1)[-1]: r for r in results}
    assert by_url["ok"].ok
    assert by_url["missing"].status == 404
    assert by_url["moved"].ok          # redirect followed to /ok
```

---

## 3. Test doubles: mocks vs fakes (and the rest)

### 3.1 The taxonomy (Meszaros)

| Double | What it is | Verifies |
|---|---|---|
| **Dummy** | Passed but never used | Nothing |
| **Stub** | Returns canned answers | Nothing (supports state checks) |
| **Spy** | Stub that records calls | You inspect calls afterwards |
| **Mock** | Pre-programmed with expectations | **Interactions**: "was called with X" |
| **Fake** | Working, simplified implementation (in-memory repo, fake clock) | **State/behavior**: outputs and resulting state |

### 3.2 Same test, two ways

The port (see [[P7 Design Basics in Python - Coupling, Interfaces, DI, Layers]]):

```python
# src/linkcheck/ports.py
from typing import Protocol


class Fetcher(Protocol):
    async def status(self, url: str) -> int: ...
```

**With a fake** (preferred for most logic):

```python
# tests/fakes.py
from linkcheck.errors import FetchError


class FakeFetcher:
    def __init__(self, statuses: dict[str, int]) -> None:
        self._statuses = statuses
        self.calls: list[str] = []

    async def status(self, url: str) -> int:
        self.calls.append(url)
        if url not in self._statuses:
            raise FetchError(url, reason="unreachable")
        return self._statuses[url]
```

```python
async def test_report_marks_broken_links():
    fetcher = FakeFetcher({"https://ok.dev": 200, "https://bad.dev": 404})
    report = await check_document("[a](https://ok.dev) [b](https://bad.dev)", fetcher)
    assert report.broken == ["https://bad.dev"]
```

**With a mock** (when the interaction *is* the behavior):

```python
from unittest.mock import AsyncMock

from linkcheck.ports import Fetcher


async def test_each_url_fetched_once_even_if_duplicated():
    fetcher = AsyncMock(spec=Fetcher)          # spec: typos in method names fail loudly
    fetcher.status.return_value = 200
    await check_document("https://a.dev https://a.dev", fetcher)
    fetcher.status.assert_awaited_once_with("https://a.dev")
```

### 3.3 When to use which

| Use a **fake** when | Use a **mock** when |
|---|---|
| You care about *results* and *state* | The call itself is the contract (send exactly one email, don't call the paid API twice) |
| The dependency has behavior (a repo that stores and returns) | The collaborator has no observable state to check |
| You'll reuse it across many tests | It's a one-off edge case (raise on 3rd call) |

> [!warning] Mock pathologies (watch for these in agent-written tests)
> - **Mocking the thing under test.** The test asserts the mock returned what the mock was told to return.
> - **No `spec`/`autospec`.** `mock.assert_called_once_wiht(...)` (typo) used to silently pass on old Pythons; misspelled methods still "work". Always `spec=` or `create_autospec`.
> - **Patching the wrong path.** `patch("httpx.AsyncClient")` doesn't affect a module that did `from httpx import AsyncClient`; patch *where it's looked up*: `patch("linkcheck.adapters.AsyncClient")`. Better: inject the dependency and avoid `patch` entirely.
> - **Asserting every internal call.** The test breaks on every refactor while catching no bugs. Over-specified.
> - **Mocks all the way down** with zero integration tests. Each unit "works"; the system doesn't.

---

## 4. Flaky tests and how to make them deterministic

### 4.1 Reproduce the flake first

```bash
# loop until it fails (stop on first failure)
for i in $(seq 1 200); do uv run pytest -q -p no:cacheprovider tests/unit/test_retry.py || break; done

# or with plugins
uv run pytest --count=200 -x tests/unit/test_retry.py   # pytest-repeat
uv run pytest                                           # with pytest-randomly installed: order shuffled, seed printed
uv run pytest --randomly-seed=12345                     # replay a failing order
uv run pytest -p no:randomly                            # turn shuffling off to compare
uv run pytest -n 8                                      # parallel exposes shared-state bugs
```

### 4.2 Causes → fixes

| Cause | Symptom | Deterministic fix |
|---|---|---|
| **Wall clock** | Fails at midnight, month end, DST, on slow CI | Inject a `Clock`; use a fake clock in tests (or `time-machine`/`freezegun`) |
| **Randomness** | Fails 1 in 50 | Inject `random.Random(seed)`; or property-test with Hypothesis (which shrinks and replays) |
| **Sleeps as sync** | `sleep(0.1)` "should be enough" | Wait on an **event/condition** with a generous timeout, never on time |
| **Order dependence** | Passes alone, fails in suite | Remove module-level mutable state; fixtures with proper teardown; run with `pytest-randomly` |
| **Real network** | Fails on CI or when site is down | Unit: fake. Integration: local server (§2.1) |
| **Concurrency** | Fails under `-n 8` | Unique `tmp_path`/ports per test; no shared files; locks around shared state |
| **Unordered collections** | `set`/dict order or `os.listdir` order | Sort before comparing; compare as `set` |
| **Leaky env** | Depends on dev's `$HOME`, locale, TZ | `monkeypatch.setenv`, `monkeypatch.delenv`; set `TZ=UTC` in CI |
| **Float equality** | `0.1 + 0.2 != 0.3` | `pytest.approx` |

### 4.3 Worked example: a time-dependent test

**Flaky:**

```python
class RetryPolicy:
    def __init__(self, cooldown_s: float = 1.0):
        self.cooldown_s = cooldown_s
        self._last_fail: float | None = None

    def record_failure(self):
        self._last_fail = time.monotonic()

    def can_retry(self) -> bool:
        return self._last_fail is None or time.monotonic() - self._last_fail >= self.cooldown_s


def test_can_retry_after_cooldown():
    p = RetryPolicy(cooldown_s=0.05)
    p.record_failure()
    time.sleep(0.05)          # on a loaded CI box this "usually" works
    assert p.can_retry()
```

**Deterministic** (inject the clock):

```python
from collections.abc import Callable


class RetryPolicy:
    def __init__(self, cooldown_s: float = 1.0, now: Callable[[], float] = time.monotonic):
        self.cooldown_s = cooldown_s
        self._now = now
        self._last_fail: float | None = None

    def record_failure(self) -> None:
        self._last_fail = self._now()

    def can_retry(self) -> bool:
        return self._last_fail is None or self._now() - self._last_fail >= self.cooldown_s


class FakeClock:
    def __init__(self, t: float = 0.0) -> None:
        self.t = t

    def __call__(self) -> float:
        return self.t

    def advance(self, dt: float) -> None:
        self.t += dt


def test_can_retry_after_cooldown():
    clock = FakeClock()
    p = RetryPolicy(cooldown_s=1.0, now=clock)
    p.record_failure()
    clock.advance(0.999)
    assert not p.can_retry()
    clock.advance(0.001)
    assert p.can_retry()      # boundary tested exactly, runs in microseconds
```

Notice the fix was a **design change** (dependency injection), not a test trick. Flaky tests are usually design feedback.

### 4.4 Property-based testing with Hypothesis

```python
from hypothesis import given, strategies as st


@given(st.lists(st.sampled_from(["https://a.dev", "https://b.dev", "x", " "]), max_size=50))
def test_extract_links_never_returns_duplicates(tokens):
    links = extract_links(" ".join(tokens))
    assert len(links) == len(set(links))
```

Hypothesis generates inputs, finds a failure, **shrinks** it to the minimal case, and stores it in `.hypothesis/` so it's replayed deterministically next run.

---

## 5. Test quality: is this test any good?

A test is good if it **fails when the behavior breaks** and **passes when it doesn't**. Checks:

1. **Break the code on purpose.** Flip `<` to `<=`, delete a line. Does a test fail? If not, the test is hollow. (Automated version: mutation testing with `mutmut`; covered in [[04 Verification - Tests, Feedback Loops and Gates]].)
2. **Coverage is a floor, not a goal.** 100% line coverage with no assertions is possible. Use `--cov-branch`.
3. **One reason to fail.** Name says the behavior: `test_redirect_to_404_is_reported_as_broken`.
4. **Arrange / Act / Assert** visible at a glance.
5. **No logic in tests** (loops, ifs) beyond parametrize.

---

## 6. Drills

| # | Drill | Exit check |
|---|---|---|
| D1 | Write `extract_links` test-first with the parametrize table in §1.2 | Red → green; ≥ 8 cases incl. punctuation, dedupe, code blocks |
| D2 | Write `FakeFetcher` and 3 tests for `check_document` | Tests run in < 50 ms total |
| D3 | Rewrite one of them with `AsyncMock(spec=...)`; then remove `spec` and misspell a method | Explain what `spec` protected you from |
| D4 | Integration test with the local server fixture (§2.1) | Passes with network disabled (Wi-Fi off) |
| D5 | Write the flaky `RetryPolicy` test, make it fail by looping under load (`stress` or `-n 8`), then fix with a fake clock | 1,000 runs, 0 failures |
| D6 | Add a module-level cache to `domain.py`, write two tests that pass alone and fail together; find it with `pytest-randomly` | Fix by removing global state |
| D7 | Mutation check by hand: introduce 5 bugs one at a time | Every bug is caught by ≥ 1 test; coverage ≥ 80% branch |

---

## 7. Self-check

1. Define stub, spy, mock, fake in one sentence each. Which would you use for a repository? For "send exactly one Slack message"?
2. Why is `patch("httpx.AsyncClient")` often the wrong target?
3. Name five root causes of flakiness and the deterministic fix for each.
4. What does pytest exit code `5` mean, and why should CI treat it as failure?
5. What does an integration test catch that a unit test with a fake can't?
6. How would you tell whether an agent weakened a test in a diff? *(Look for: removed asserts, loosened `match=`, broadened `pytest.raises(Exception)`, `@pytest.mark.skip`/`xfail`, changed expected values to match new output, mocks replacing real assertions.)*

---

## 8. Resources

- pytest docs: *How-to guides* (fixtures, parametrize, monkeypatch, tmp_path).
- Brian Okken, *Python Testing with pytest* (2nd ed.).
- Martin Fowler, *Mocks Aren't Stubs*; Gerard Meszaros, *xUnit Test Patterns*.
- Hypothesis docs (hypothesis.readthedocs.io): *Quickstart*, *What you can generate*.
- Google Testing Blog: *Flaky Tests at Google and How We Mitigate Them*; Harry Percival, *Architecture Patterns with Python* (fakes over mocks).

Next: [[P3 Git from the CLI - Rebase, Bisect, Worktree, Staging]]
