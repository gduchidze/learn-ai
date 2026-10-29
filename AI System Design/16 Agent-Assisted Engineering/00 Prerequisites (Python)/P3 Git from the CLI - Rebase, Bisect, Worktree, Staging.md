---
tags: [ai-system-design, agent-assisted-engineering, prerequisites, git]
aliases: [Git CLI Mastery, git bisect, git worktree, git rebase, Interactive Staging]
level: L0
created: 2026-10-29
---

# P3 · Git from the CLI: Branch, Rebase, Bisect, Worktree, Interactive Staging

> [!success] 🟢 Junior Explanation
> **In plain words:** Git is a database of snapshots (commits) linked by parent pointers. A **branch** is just a movable name pointing at one commit. **Rebase** replays your commits on top of a different base. **Bisect** binary-searches history for the commit that broke something. **Worktree** gives you a second (third, fourth…) checked-out folder of the same repo. **Interactive staging** lets you commit *part* of a file.
>
> **Analogy:** Commits are photos in an album, each saying "I came after that one." Branches are sticky notes on photos. Rebase = reprinting your photos so they follow a newer one. Bisect = "the cake was fine in photo 10 and burnt in photo 50; check 30."
>
> 🎯 **Fluent means:** all of the above from the CLI, calmly, including conflicts, and you can undo any mistake with the reflog.

Index: [[P0 Prerequisites Index (Python)]] · Prev: [[P2 Testing with pytest - Unit, Integration, Doubles, Flakiness]] · Next: [[P4 Shell Fluency for Python Engineers]]

> [!tip] Why this matters for agent work
> Worktrees are how you run parallel agents without them stepping on each other ([[06 Delegation, Parallelism and Handoff]]). Small, well-split commits are how you review agent output. Bisect is how you find which agent change broke `main`. Reflog is how you recover when an agent runs `git reset --hard`.

---

## 1. The model in one picture

```
            HEAD ──► main
                      │
   A ◄── B ◄── C ◄── D            ← commits point to parents
               ▲
               └── E ◄── F  ◄── feat/retry      ← branch = pointer
```

| Object | Is |
|---|---|
| Commit | Snapshot of the tree + metadata + parent(s). Immutable, named by hash |
| Branch | Mutable pointer to a commit (`.git/refs/heads/...`) |
| `HEAD` | What you have checked out (usually points to a branch) |
| Index (staging area) | The *next* commit being assembled |
| Remote-tracking branch | Your last-known copy of a remote branch (`origin/main`) |

Everything below is moving pointers and creating new commits. **Nothing committed is ever really lost for ~90 days** (reflog), so you can be brave.

---

## 2. Daily branch workflow

```bash
git switch -c feat/retry origin/main     # new branch from up-to-date main
# ... work ...
git status -sb                           # short status + branch tracking info
git diff                                 # unstaged changes
git diff --staged                        # what will be committed
git add -p                               # stage hunk by hunk (see §5)
git commit -m "feat: add retry policy with injectable clock"
git fetch origin
git rebase origin/main                   # replay my commits on latest main
git push -u origin feat/retry            # first push; sets upstream
git push --force-with-lease              # after rewriting history; refuses if remote moved
```

Never `git push --force` on a shared branch. `--force-with-lease` refuses if someone else pushed since your last fetch.

Useful log views:

```bash
git log --oneline --graph --decorate --all -20
git log -p -- src/linkcheck/adapters.py           # history of one file with diffs
git log -S "Semaphore" --oneline                  # commits that added/removed a string ("pickaxe")
git log origin/main..HEAD --oneline               # what my branch adds
git blame -w -C -L 40,60 src/linkcheck/adapters.py   # ignore whitespace, follow moved code
```

---

## 3. Rebase

### 3.1 Merge vs rebase

| | `git merge origin/main` | `git rebase origin/main` |
|---|---|---|
| History | Keeps branch shape, adds a merge commit | Linear; your commits get **new hashes** |
| Conflicts | Resolve once | Resolve per replayed commit |
| Safe on shared branches | Yes | Only if nobody else built on your commits |
| Use for | Integrating finished branches into main (team policy) | Keeping your feature branch current; cleaning up before review |

### 3.2 Conflicts calmly

```bash
git rebase origin/main
# CONFLICT (content): Merge conflict in src/linkcheck/adapters.py
git status                         # shows which files conflict and where you are
# edit files; remove <<<<<<< ======= >>>>>>> markers
uv run pytest -q                   # verify before continuing
git add src/linkcheck/adapters.py
git rebase --continue              # next commit
# panic button:
git rebase --abort                 # back to exactly where you started
```

Turn on `git config --global rerere.enabled true` so git remembers how you resolved a conflict and reapplies it next time. Use `git config --global merge.conflictstyle zdiff3` to see the common ancestor inside conflict markers.

### 3.3 Clean up before review: fixup + autosquash

```bash
git commit -m "feat: add retry policy"
git commit -m "test: cover retry boundary"
# reviewer finds a bug in the first commit:
git add -p
git commit --fixup=HEAD~1           # creates "fixup! feat: add retry policy"
git rebase -i --autosquash origin/main   # fixup is auto-placed and squashed
```

In the `rebase -i` todo list: `pick`, `reword`, `edit`, `squash`, `fixup`, `drop`, and you can reorder lines. Set `git config --global rebase.autoSquash true` to make `--autosquash` the default.

### 3.4 `--onto`: transplant a branch

You branched `feat/b` off `feat/a`, but `feat/a` got squash-merged. Move only `feat/b`'s own commits onto `main`:

```bash
git rebase --onto origin/main feat/a feat/b
#                 new base     old base  branch to move
```

---

## 4. Bisect: find the breaking commit

Binary search over history. 1,000 commits → ~10 steps.

### 4.1 Manual

```bash
git bisect start
git bisect bad                      # current commit is broken
git bisect good v0.1.0              # this tag was fine
# git checks out a midpoint; test it, then:
git bisect good    # or: git bisect bad   or: git bisect skip (can't build)
# ...repeat until git prints "<hash> is the first bad commit"
git bisect reset                    # return to where you started
```

### 4.2 Automated with pytest (the fluent way)

`git bisect run <cmd>` uses the exit code: `0` = good, `1–124, 126, 127` = bad, `125` = skip.

**Key trick:** the regression test usually doesn't exist in old commits. Keep it **outside** the repo (or untracked) so every checkout runs the same test.

```bash
# 1. write the repro test outside the working tree
cat > /tmp/test_regression.py <<'EOF'
from linkcheck.domain import extract_links

def test_trailing_paren_is_stripped():
    assert extract_links("(see https://a.dev)") == ["https://a.dev"]
EOF

# 2. a wrapper that SKIPS commits that can't even install
cat > /tmp/bisect.sh <<'EOF'
#!/usr/bin/env bash
uv sync --quiet || exit 125
uv run pytest -q -p no:cacheprovider /tmp/test_regression.py
EOF
chmod +x /tmp/bisect.sh

# 3. run it
git bisect start HEAD v0.1.0
git bisect run /tmp/bisect.sh
git bisect log > /tmp/bisect.log     # evidence for the bug report
git bisect reset
```

Bisect only works well if **every commit builds and tests pass**. That's the real reason for small, green commits, and why "WIP" commits from agents should be squashed before merge.

---

## 5. Interactive staging: commit exactly what you mean

An agent (or you) changed three things in one file. Make three commits.

```bash
git add -p src/linkcheck/adapters.py
```

| Key | Does |
|---|---|
| `y` / `n` | stage / skip this hunk |
| `s` | split hunk into smaller hunks |
| `e` | edit the hunk by hand (stage only some lines) |
| `q` | quit |
| `?` | help |

Siblings with the same interface:

```bash
git restore -p file.py         # discard selected hunks from working tree
git restore --staged -p file.py   # unstage selected hunks
git stash push -p              # stash only some hunks
git commit -v                  # show the staged diff in the commit editor (review before you commit)
```

Review discipline: **`git diff --staged` before every commit.** It's the cheapest code review there is.

---

## 6. Worktrees: several checkouts, one repo

```bash
git worktree add ../linkcheck-retry -b feat/retry origin/main
git worktree add ../linkcheck-json  -b feat/json-output origin/main
git worktree list
# each worktree has its own working files and index, sharing one .git object store
cd ../linkcheck-retry && uv sync && uv run pytest -q   # each needs its own .venv
git worktree remove ../linkcheck-retry                 # after merge
git worktree prune                                     # clean up stale entries
```

Rules:

- A branch can be checked out in **only one** worktree at a time.
- Untracked files (`.venv/`, `.env`, build outputs) are **per worktree**. Script the setup (`uv sync`, copy `.env.example`).
- Ports, databases, temp dirs: make them per-worktree too, or two parallel test runs collide.

This is the physical basis of parallel agents in Module 06: one agent, one worktree, one branch, disjoint paths.

---

## 7. Undo anything: the reflog

```bash
git reflog                          # every position HEAD has been in, newest first
# a1b2c3d HEAD@{0}: reset: moving to HEAD~3     ← oops
# 9f8e7d6 HEAD@{1}: commit: feat: add retry policy
git branch rescue HEAD@{1}          # put a name on the lost commit
# or
git reset --hard HEAD@{1}           # move back (⚠ discards uncommitted work)
```

| Situation | Fix |
|---|---|
| Committed to `main` instead of a branch | `git branch feat/x && git reset --hard origin/main` (commit lives on in `feat/x`) |
| Bad last commit message | `git commit --amend` (before pushing) |
| Undo a pushed commit on a shared branch | `git revert <hash>` (new commit; history intact) |
| Rebase went wrong | `git reflog` → `git reset --hard HEAD@{n}` from before the rebase, or `ORIG_HEAD` |
| Deleted a branch | `git reflog` → `git branch name <hash>` |

> [!warning] Truly destructive
> `git reset --hard`, `git checkout -- .`, `git restore .`, and `git clean -fdx` destroy **uncommitted** changes, which the reflog can't recover. Commit or `git stash` first. Configure your agent harness to block these commands without confirmation ([[04 Verification - Tests, Feedback Loops and Gates]]).

---

## 8. Drills

| # | Drill | Exit check |
|---|---|---|
| D1 | Build `linkcheck` in ≥ 15 small commits, each green (`uv run pytest` passes) | `git log --oneline` reads like a changelog |
| D2 | Plant a bug in commit ~8 (e.g. strip trailing `)` stops working). Find it with `git bisect run` and an out-of-tree test | `bisect.log` saved; first-bad commit identified in ≤ 5 steps |
| D3 | Make 3 unrelated edits in one file, commit them as 3 commits with `add -p` (use `s` and `e` at least once) | Each commit's diff shows one concern |
| D4 | Create a branch with 4 commits incl. 2 typo fixes; clean it to 2 commits with `--fixup` + `--autosquash` | History tidy, tests green at every commit |
| D5 | Two worktrees, two features in parallel, both rebased on `main`, one conflicting | Conflict resolved with `rerere` enabled; second resolution is automatic |
| D6 | `git reset --hard HEAD~3`, then recover | Commits restored from reflog |
| D7 | Do D-`--onto` scenario (§3.4) | Only `feat/b`'s commits land on `main` |

---

## 9. Self-check

1. What *is* a branch, physically?
2. Why does rebasing change commit hashes, and why is that a problem on shared branches?
3. `--force` vs `--force-with-lease`?
4. Your regression test file doesn't exist in old commits. How do you bisect?
5. What exit code tells `git bisect run` to skip a commit, and when would you use it?
6. Two agents in two worktrees both run `uv run pytest` with an integration test on port 8000. What breaks and how do you fix it?
7. Which git commands lose work the reflog can't save?

---

## 10. Resources

- *Pro Git* (git-scm.com/book), chapters 2, 3, 7 (Rewriting History, Debugging with Git, Advanced Merging).
- `git help bisect`, `git help worktree`, `git help rebase` (the man pages are good).
- Julia Evans, *How Git Works* zine and blog posts on git internals.
- *Oh Shit, Git!?!* (ohshitgit.com) for undo recipes.

Next: [[P4 Shell Fluency for Python Engineers]]
