---
tags: [ai-system-design, agent-assisted-engineering, prerequisites, python, code-reading]
aliases: [Reading Code, Code Archaeology, Trace a Request, Unfamiliar Codebase]
level: L0
created: 2026-10-29
---

# P5 · Reading Unfamiliar Python Code: Trace a Request in < 30 Minutes

> [!success] 🟢 Junior Explanation
> **In plain words:** You don't read a codebase like a book. You read it like a map: find where you are (the **entry point**), pick one road (one request, one command), follow it to its destination, and ignore everything else. Then you **confirm** your map by running the code and watching the real path (a stack trace).
>
> **Analogy:** Learning a new city by walking one route from the station to your hotel, not by memorizing the whole street index.
>
> 🎯 **Fluent means:** given a Python web repo you've never seen, in under 30 minutes you can say which functions an HTTP request passes through, where the data comes from, and where you'd change behavior X, and you can prove it with a captured stack.

Index: [[P0 Prerequisites Index (Python)]] · Prev: [[P4 Shell Fluency for Python Engineers]] · Next: [[P6 Debugging Method in Python]]

> [!tip] Why this matters for agent work
> You will read far more code than you write: every agent diff, every module the agent touched, every library it called. If you can't quickly confirm "this change sits in the right layer and the call path is what it claims," review becomes rubber-stamping. Reading speed is review speed.

---

## 1. The 30-minute protocol

| Min | Step | Output |
|---|---|---|
| 0–5 | **Orient**: README, `pyproject.toml`, top-level tree, test layout | One-line purpose; stack (framework, DB, queue); how to run it |
| 5–10 | **Find the entry point** for *your* question | File + function where execution starts |
| 10–20 | **Trace statically**: follow calls with go-to-definition, note each hop | Draft call chain (≤ 15 hops) |
| 20–25 | **Confirm dynamically**: run it, capture a stack trace at the destination | Real call chain; correct your draft |
| 25–30 | **Write the map**: chain, data shapes, where to change X, surprises | 1-page note committed to the repo or your notes |

Rule: **pick a question first.** "How does the app work?" has no end. "What happens when `POST /orders` is called with an invalid coupon?" ends in 30 minutes.

---

## 2. Orient (0–5 min)

```bash
cat README.md | head -80
cat pyproject.toml                       # deps tell you the architecture
git ls-files | rg '\.py$' | wc -l        # size
git ls-files | rg '\.py$' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -20   # where code lives
ls tests/ && rg -l "def test_" tests | head
git log --oneline -15                    # what's active
git log --format= --name-only | sort | uniq -c | sort -rn | head -15   # hotspots: most-changed files
```

What `pyproject.toml` dependencies reveal:

| You see | Means |
|---|---|
| `fastapi`, `uvicorn` | ASGI app; look for `app = FastAPI()` and `APIRouter`s |
| `flask`, `gunicorn` | WSGI app; look for `Flask(__name__)`, blueprints, `create_app()` |
| `django` | `manage.py`, `settings.py`, `urls.py` → `views.py` |
| `sqlalchemy`, `alembic` | ORM models + migrations folder |
| `celery`, `rq`, `dramatiq` | Background workers: second entry point |
| `click`, `typer` | CLI entry points |
| `pydantic` | Data shapes are in model classes: read them early |

---

## 3. Find the entry point (5–10 min)

Python programs start in a handful of places:

```bash
rg -n '^\[project.scripts\]' -A 10 pyproject.toml     # console scripts → module:function
rg -n 'if __name__ == .__main__.' -t py               # scripts
rg --files | rg '__main__\.py$'                       # python -m package
rg -n 'FastAPI\(|Flask\(|APIRouter\(|Blueprint\(' -t py
rg -n '@(app|router|bp)\.(get|post|put|delete|patch|route)\(' -t py   # route table
rg -n 'uvicorn|gunicorn|CMD|ENTRYPOINT' Dockerfile* Procfile* Makefile* 2>/dev/null
```

For a specific route, search the **path string**, because that's what you know:

```bash
rg -n '"/orders' -t py
```

---

## 4. Trace statically (10–20 min)

Tools, in order of usefulness:

1. **Go-to-definition / find-references** (Pyright/Pylance LSP in your editor). Works across your code *and* installed libraries in `.venv`.
2. `rg -n "def name\b|class Name\b"` when the LSP can't resolve (dynamic dispatch, decorators, DI containers).
3. Read the **tests** for the function: they show intended inputs and outputs.
4. Library source is just files: `uv run python -c "import fastapi, inspect; print(inspect.getsourcefile(fastapi.routing))"`, then open it.

Keep a running chain as you go:

```
POST /orders
 → app/api/orders.py:create_order()            # route handler, pydantic OrderIn
   → Depends(get_db) app/deps.py:get_db        # session per request
   → app/services/orders.py:OrderService.place()
     → app/domain/pricing.py:apply_coupon()    # raises InvalidCoupon
     → app/repo/orders.py:OrderRepo.add()      # SQLAlchemy
 ← exception_handlers: InvalidCoupon → 422     # app/main.py
```

Python-specific traps when reading:

| Trap | What to do |
|---|---|
| **Decorators** change what a function is (`@app.post`, `@retry`, `@cache`) | Read the decorator; it may wrap, register, or replace |
| **Dependency injection** (`Depends`, DI containers) | Find the provider function; calls aren't visible at the call site |
| **Dynamic dispatch** (`getattr`, plugin registries, entry points, signals) | `rg` for the registration key; confirm dynamically |
| **Metaclasses / ORM magic** (`Model.objects`, `relationship()`) | Treat as I/O boundaries; don't trace into the ORM unless needed |
| **Monkey patching / import side effects** | `rg "import .*  # noqa: F401"`; check `__init__.py` files |
| **Middleware** wraps every request | List it early (`app.add_middleware`, `MIDDLEWARE = [...]`) |

---

## 5. Confirm dynamically (20–25 min): let Python draw the map

Static reading misses decorators, middleware, and DI. The **stack** at the destination is ground truth.

### 5.1 Stack dump at the destination

```python
# temporarily, inside the handler or the deepest function you care about
import traceback; traceback.print_stack()
```

Or stop there and look around:

```python
breakpoint()     # pdb: `w` (where) prints the stack, `u`/`d` move frames, `p var`, `ll` source, `c` continue
```

Then trigger it: `curl -X POST localhost:8000/orders -d '{...}' -H 'content-type: application/json'`, or better, run the existing test for that route with `uv run pytest -k create_order -s`.

### 5.2 Worked example: what a FastAPI request really passes through

A minimal app:

```python
# app.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/ping")
async def ping():
    import traceback; traceback.print_stack()
    return {"ok": True}
```

```bash
uv run uvicorn app:app &   # then:
curl -s localhost:8000/ping
```

Trimmed stack you'll see (exact names shift between versions; read *your* output):

```
uvicorn/protocols/http/httptools_impl.py   run_asgi                 ← server calls the ASGI app
uvicorn/middleware/proxy_headers.py         __call__
fastapi/applications.py                     FastAPI.__call__
starlette/applications.py                   Starlette.__call__       ← builds middleware stack
starlette/middleware/errors.py              ServerErrorMiddleware    ← turns crashes into 500
starlette/middleware/exceptions.py          ExceptionMiddleware      ← your exception_handlers
starlette/routing.py                        Router.__call__ / app    ← matches path → route
starlette/routing.py                        Route.handle
starlette/routing.py                        request_response.<locals>.app
fastapi/routing.py                          get_request_handler.<locals>.app
fastapi/dependencies/utils.py               solve_dependencies       ← Depends(...) resolved here
fastapi/routing.py                          run_endpoint_function
app.py                                      ping                     ← your code
```

Now you know, with evidence: where errors become 500s, where your custom exception handlers run, where `Depends` happens, and where validation of the request body occurs (in `get_request_handler` before your function is called).

### 5.3 Other runtime map-makers

| Tool | Shows |
|---|---|
| `python -X importtime -c "import app" 2> imports.log` | Import graph and slow imports |
| `python -m cProfile -o out.prof script.py` + `snakeviz out.prof` | Call graph weighted by time |
| `py-spy dump --pid PID` / `py-spy top --pid PID` | Live stacks of a running process, no code changes |
| `logging` at DEBUG for the framework (`sqlalchemy.engine`, `httpx`) | Every SQL query / HTTP call |
| `sys.setprofile` / `python -m trace --trace` | Every call (very noisy; last resort) |

---

## 6. Write the map (25–30 min)

Template (save it in the repo as `docs/maps/<flow>.md` or in your notes):

```markdown
# Flow: POST /orders (invalid coupon)

Question: what happens, and where would I change the error message?

Call chain (confirmed by stack, commit abc123):
1. starlette ExceptionMiddleware (handlers registered in app/main.py:41)
2. app/api/orders.py:create_order  — validates OrderIn (pydantic)
3. app/services/orders.py:OrderService.place
4. app/domain/pricing.py:apply_coupon  — raises InvalidCoupon(code)
5. app/main.py:handle_invalid_coupon → 422 {"detail": ...}   ← CHANGE MESSAGE HERE

Data shapes: OrderIn(app/schemas.py:12) → Order(domain) → OrderRow(ORM)
I/O boundaries: DB session (app/deps.py:get_db), payment client (app/adapters/stripe.py)
Surprises: coupon codes are uppercased in middleware (app/middleware.py:30), not in domain
Open questions: why does OrderRepo.add commit itself instead of the service?
```

This is also exactly the artifact you hand to an agent as context ([[02 Context Engineering and Repo Memory]]): small, precise, evidence-backed.

---

## 7. Git as a reading tool

```bash
git log --follow -p -- app/domain/pricing.py | less    # how did this file evolve
git log -S "InvalidCoupon" --oneline                   # when was this concept introduced
git blame -w -C app/domain/pricing.py                  # who/why for each line (then `git show <sha>`)
git log --grep "coupon" --oneline                      # commit messages mentioning it
gh pr list --search "coupon" --state merged            # PR discussions often explain intent
```

The commit or PR that introduced a weird line usually explains *why*. Read it before "fixing" the weirdness (Chesterton's fence).

---

## 8. Drills

| # | Drill | Exit check |
|---|---|---|
| D1 | Read `httpx`'s source in your `.venv`: trace `client.head(url)` down to the transport | Chain of ≤ 12 hops ending in `httpcore`; confirmed with `breakpoint()` + `w` |
| D2 | Run the FastAPI example from §5.2; produce your own stack and annotate each hop | Each hop has a one-line "what it does" |
| D3 | Pick an open-source FastAPI or Flask app you've never seen (e.g. the official full-stack FastAPI template, or a Flask tutorial app). Set a 30-min timer. Trace "create item" | Map from §6 done before the timer ends |
| D4 | Same repo: answer "where would I add rate limiting?" and "where is the DB session committed?" | Both answers cite file:line and runtime evidence |
| D5 | Hotspot analysis: top 10 most-changed files, cross-checked with file size | Name the riskiest file and why |
| D6 | Read one agent-generated diff in your `linkcheck` repo and trace each changed function's callers with find-references | You can say what else could break |

---

## 9. Self-check

1. Where can a Python program's execution start? Name five places.
2. Why is a captured stack trace better evidence than reading the code?
3. Which Python features make static tracing unreliable?
4. How do you open the source of an installed library?
5. You have 30 minutes and an unfamiliar Django repo. What are your first three commands?
6. What goes into a good code map, and why keep it short?

---

## 10. Resources

- Dave Thomas & Andy Hunt, *The Pragmatic Programmer*: "Tracer Bullets", "Software Archaeology".
- Michael Feathers, *Working Effectively with Legacy Code*: characterization tests, seams.
- Adam Tornhill, *Your Code as a Crime Scene*: hotspot analysis from git history.
- Python docs: `pdb`, `traceback`, `inspect`, `cProfile`.
- Starlette and FastAPI source on GitHub: both are small and readable. Reading them once pays off forever.

Next: [[P6 Debugging Method in Python]]
