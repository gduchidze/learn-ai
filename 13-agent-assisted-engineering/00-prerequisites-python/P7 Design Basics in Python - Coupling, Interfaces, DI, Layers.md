---
tags: [ai-system-design, agent-assisted-engineering, prerequisites, python, design, architecture]
aliases: [Coupling and Cohesion, Python Protocols, Dependency Injection Python, Layered Architecture, Ports and Adapters]
level: L0
created: 2026-10-29
---

# P7 · Design Basics in Python: Coupling, Cohesion, Interfaces, Dependency Injection, Layering

> [!success] 🟢 Junior Explanation
> **In plain words:** Design is deciding **what knows about what**. *Cohesion*: things that change together live together. *Coupling*: how much one part must know about another to work. An *interface* is a promise ("I can fetch a status for a URL") that hides *how*. *Dependency injection* means a function receives what it needs instead of building it itself. *Layering* means dependencies point one way: business rules never import the web framework or the database driver.
>
> **Analogy:** A wall socket is an interface. Your lamp doesn't care which power plant made the electricity (low coupling), and you can test the lamp with a battery (dependency injection + a fake).
>
> 🎯 **Fluent means:** you can take a tangled script, split it into a pure core plus adapters behind `Protocol`s, wire it in one place, and enforce the dependency direction in CI.

Index: [[P0 Prerequisites Index (Python)]] · Prev: [[P6 Debugging Method in Python]] · Next: [[P8 CI Pipelines for Python]]

> [!tip] Why this matters for agent work
> Agents see only their context window, so they copy rather than reuse, and they wire things together wherever it's convenient. A codebase with clear seams, small interfaces and enforced boundaries is one an agent can change safely: the boundary check fails before the coupling ships. This is the "deep modules + enforced boundary" work of [[05 Debugging, Code Review and Codebase Design]].

---

## 1. Coupling and cohesion

| | Low (good) | High (bad) |
|---|---|---|
| **Coupling** | Module A uses B through a small interface; B can change internals freely | A reaches into B's internals, globals, or concrete classes; changes ripple |
| **Cohesion** | A module has one reason to change | `utils.py` with date parsing, HTTP retries and CSV export |

Kinds of coupling, roughly worst to least bad:

| Kind | Python example |
|---|---|
| Content | `obj._private_cache.clear()` from another module |
| Global / common | Two modules reading and writing `config.SETTINGS["timeout"]` |
| Control | `process(data, mode="fast_but_skip_validation")` flag arguments |
| Stamp | Passing a whole `Request` object when the function needs `user_id` |
| Data | Passing exactly the values needed: `price(qty: int, unit: Decimal)` ✓ |

Smells to notice: a change needs edits in 6 files ("shotgun surgery"); you can't test a function without the network; imports form a cycle; a class's methods use disjoint sets of attributes (two classes in one).

---

## 2. Interfaces in Python: `Protocol` vs `ABC`

Python has two ways to state "anything that can do X."

```python
# src/linkcheck/ports.py
from typing import Protocol


class Fetcher(Protocol):
    """Anything that can return the HTTP status of a URL."""
    async def status(self, url: str) -> int: ...


class Clock(Protocol):
    def __call__(self) -> float: ...
```

| | `typing.Protocol` (structural) | `abc.ABC` (nominal) |
|---|---|---|
| Implementer must inherit | No: anything with matching methods fits | Yes: `class X(Base)` |
| Checked | Statically (mypy/pyright) | At instantiation (missing abstract method → `TypeError`) |
| Good for | Ports owned by the consumer; fakes in tests; third-party classes you can't modify | Frameworks/plugins where you want a runtime guarantee and shared base behavior |
| Runtime `isinstance` | Only with `@runtime_checkable` (checks names, not signatures) | Yes |

Rule of thumb: **the consumer owns the interface.** `service.py` defines (or imports from `ports.py`) the `Fetcher` it needs; `adapters.py` implements it. The interface is shaped by what the core needs, not by what `httpx` offers. Keep it **small**: one or two methods.

---

## 3. Dependency injection without a framework

DI just means: **pass dependencies in** instead of creating them inside.

```python
# ❌ hidden dependency: untestable without network, can't swap, can't configure
async def check_document(text: str) -> Report:
    async with httpx.AsyncClient() as client:
        ...

# ✅ injected: caller decides; tests pass a fake
async def check_document(text: str, fetcher: Fetcher, limit: int = 20) -> Report:
    ...
```

Forms, in order of preference:

| Form | Use |
|---|---|
| **Function parameter** | Pure-ish functions; the default choice |
| **Constructor parameter** (`__init__`) | Objects with several methods sharing the dependency |
| Default parameter (`now: Clock = time.monotonic`) | Convenient for rarely-swapped deps like clocks; keep defaults *immutable* |
| Framework DI (`FastAPI Depends`, `dependency-injector`) | When the framework already owns the lifecycle (per-request DB sessions) |
| ❌ Service locator / global registry | Hides dependencies again; avoid |
| ❌ `mock.patch` everywhere in tests | A smell that DI is missing |

All the wiring happens in one place, the **composition root**: usually `cli.main()` or the app factory `create_app()`. It's the only place that knows concrete classes.

---

## 4. Layering: dependencies point inward

```
┌──────────────────────────────────────────────┐
│  cli.py  (composition root, I/O, argparse)   │  knows everything, does little
├──────────────────────────────────────────────┤
│  adapters.py  (httpx, filesystem, sqlite)    │  implements ports
├──────────────────────────────────────────────┤
│  service.py  (use cases: orchestrate)        │  depends on ports + domain
├──────────────────────────────────────────────┤
│  ports.py    (Protocols)                     │
│  domain.py   (pure rules: no I/O, no async)  │  depends on nothing
└──────────────────────────────────────────────┘
        imports allowed only downward ↓
```

Also called *ports and adapters* / *hexagonal* / *clean architecture*; same idea. A useful slogan: **functional core, imperative shell**: decisions in pure functions, side effects at the edges.

---

## 5. Worked refactor: from script to layers

### 5.1 Before: one function does everything

```python
# linkcheck_v0.py
import re, sys, requests, sqlite3, time

def run(path):
    text = open(path).read()
    links = list(dict.fromkeys(re.findall(r"https?://[^\s)]+", text)))
    bad = []
    for u in links:
        try:
            r = requests.head(u, timeout=10, allow_redirects=True)
            if r.status_code >= 400:
                bad.append((u, r.status_code))
        except Exception as e:
            bad.append((u, str(e)))
    db = sqlite3.connect("history.db")
    db.execute("insert into runs values (?, ?)", (time.time(), len(bad)))
    db.commit()
    for u, why in bad:
        print(u, why)
    sys.exit(1 if bad else 0)
```

Problems: can't test parsing without a file, can't test reporting without the network, sequential HTTP, `except Exception`, DB and printing and exit code all tangled. Every change touches this one function.

### 5.2 After

```python
# src/linkcheck/domain.py: pure, synchronous, no I/O, trivially testable
import re
from dataclasses import dataclass

LINK_RE = re.compile(r"https?://[^\s)\]>\"']+")


def extract_links(text: str) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for url in LINK_RE.findall(text):
        url = url.rstrip(".,;:!?")
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


@dataclass(frozen=True)
class LinkResult:
    url: str
    status: int | None
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None and self.status is not None and self.status < 400


@dataclass(frozen=True)
class Report:
    results: tuple[LinkResult, ...]

    @property
    def broken(self) -> list[str]:
        return [r.url for r in self.results if not r.ok]
```

```python
# src/linkcheck/service.py: orchestration; knows ports, not httpx
import asyncio

from linkcheck.domain import LinkResult, Report, extract_links
from linkcheck.errors import FetchError
from linkcheck.ports import Fetcher


async def _check(fetcher: Fetcher, sem: asyncio.Semaphore, url: str) -> LinkResult:
    async with sem:
        try:
            return LinkResult(url, await fetcher.status(url))
        except FetchError as e:
            return LinkResult(url, e.status, str(e))


async def check_document(text: str, fetcher: Fetcher, limit: int = 20) -> Report:
    sem = asyncio.Semaphore(limit)
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(_check(fetcher, sem, u)) for u in extract_links(text)]
    return Report(tuple(t.result() for t in tasks))
```

```python
# src/linkcheck/adapters.py: the only module that imports httpx
import httpx

from linkcheck.errors import FetchError


class HttpxFetcher:                       # satisfies ports.Fetcher structurally
    def __init__(self, client: httpx.AsyncClient) -> None:
        self._client = client

    async def status(self, url: str) -> int:
        try:
            resp = await self._client.head(url, follow_redirects=True)
        except httpx.HTTPError as e:      # translate infra errors into domain errors
            raise FetchError(url, reason=type(e).__name__) from e
        return resp.status_code
```

```python
# src/linkcheck/cli.py: composition root (only place with concrete wiring)
async def _run(paths: list[Path], limit: int) -> Report:
    text = "\n".join(p.read_text("utf-8") for p in paths)
    async with httpx.AsyncClient(timeout=10) as client:
        return await check_document(text, HttpxFetcher(client), limit=limit)
```

Now:

| Test | Needs |
|---|---|
| `extract_links`, `Report.broken` | Nothing: pure functions, microseconds |
| `check_document` | `FakeFetcher` from [[P2 Testing with pytest - Unit, Integration, Doubles, Flakiness]] |
| `HttpxFetcher` | Integration test against a local HTTP server |
| `cli.main` | A temp dir + `capsys`; or one end-to-end test |

Swapping `httpx` for `aiohttp`, adding a cache, or adding the sqlite history later means **adding an adapter**, not editing the core.

---

## 6. Enforce the boundaries (so agents can't quietly break them)

A boundary that only lives in a diagram will be crossed within a week. Make it a check. `import-linter` reads contracts from `pyproject.toml`:

```toml
[tool.importlinter]
root_package = "linkcheck"
include_external_packages = true

[[tool.importlinter.contracts]]
name = "Layers point inward"
type = "layers"
layers = [
    "linkcheck.cli",
    "linkcheck.adapters",
    "linkcheck.service",
    "linkcheck.domain",
]

[[tool.importlinter.contracts]]
name = "Core has no I/O dependencies"
type = "forbidden"
source_modules = ["linkcheck.domain", "linkcheck.service", "linkcheck.ports"]
forbidden_modules = ["httpx", "requests", "sqlite3", "linkcheck.adapters", "linkcheck.cli"]
```

```bash
uv add --dev import-linter
uv run lint-imports        # exit non-zero on violation → add to scripts/check.sh and CI
```

Other cheap enforcement: `mypy --strict` on `domain.py` (types are interfaces too), ruff `TID251` (banned imports), and a test that imports `linkcheck.domain` and asserts `"httpx" not in sys.modules` (crude but works).

---

## 7. Deep modules and other principles worth knowing

- **Deep modules** (Ousterhout): a small interface hiding a lot of functionality is good (`HttpxFetcher.status` hides redirects, timeouts, error translation). Many shallow pass-through classes are bad.
- **Information hiding** (Parnas): hide the decisions most likely to change (which HTTP library, which DB).
- **Make illegal states unrepresentable**: frozen dataclasses, `Enum`s, `Literal` types instead of strings and flags.
- **Composition over inheritance**: inject collaborators; inherit only for genuine "is-a" with shared behavior.
- **YAGNI**: don't introduce a `Protocol` with one implementation *unless* it's an I/O boundary you need to fake or you're actually expecting a second implementation. Abstraction has a cost.
- **Rule of three** for DRY: duplicate once, extract on the third copy, when you can see what really varies.

---

## 8. Drills

| # | Drill | Exit check |
|---|---|---|
| D1 | Write `linkcheck_v0.py` (§5.1) as-is, then refactor it into the layers of §5.2 in small green commits | Behavior unchanged (same output on a sample dir); each commit passes tests |
| D2 | Add `import-linter` contracts; then deliberately `import httpx` in `domain.py` | `lint-imports` fails and names the violation |
| D3 | Add a `Clock` port and a run-history feature (sqlite adapter) without editing `domain.py` | `git diff --stat` shows no change to `domain.py` |
| D4 | Replace `HttpxFetcher` with an `aiohttp` adapter behind the same port | Only `adapters.py` and `cli.py` change; all unit tests untouched |
| D5 | Find 3 coupling smells in a real repo you use (yours or open source) and name their kind from §1 | Short note with file:line and proposed fix |
| D6 | Write the design rules as 5 lines you'd put in `AGENTS.md` for this repo | Each line is checkable, ideally by a tool |

---

## 9. Self-check

1. Define coupling and cohesion with one example each from your own code.
2. `Protocol` vs `ABC`: when would you pick each?
3. What's a composition root, and why should there be only one?
4. Why does "needs `mock.patch` to test" suggest missing DI?
5. Which direction do imports go in a layered app, and how do you enforce it automatically?
6. When is adding an interface over-engineering?

---

## 10. Resources

- John Ousterhout, *A Philosophy of Software Design* (2nd ed.): deep modules, information hiding.
- Harry Percival & Bob Gregory, *Architecture Patterns with Python* (free at cosmicpython.com): repository, service layer, unit of work, DI, all in Python.
- Gary Bernhardt, *Boundaries* talk (functional core, imperative shell).
- Hynek Schlawack's blog: *Subclassing in Python Redux*; on DI and testing.
- import-linter docs (import-linter.readthedocs.io); PEP 544 (Protocols).

Next: [[P8 CI Pipelines for Python]]
