---
tags: [ai-system-design, agent-assisted-engineering, projects, capstone, mastery]
aliases: [Agent Engineering Projects, Workbench Pack, Capstone, Elite Operator Playbook, Agent Engineering Self-Check]
level: Hero
---

# 08 · Projects, Capstone and Mastery

> [!success] 🟢 How to use this note
> Ten projects of increasing difficulty, one capstone, a review rubric, the elite operator playbook, and self-check questions. **Every project ends with evidence a reviewer can reproduce.** If you can't prove it, you haven't done it.

Prev: [[07 Software Factories and Automation]] · Home: [[00 Agent-Assisted Engineering Roadmap]]

---

## 1. The project ladder

```
 difficulty
   ▲                                                          P10 Factory
   │                                                   P9 Multi-session
   │                                            P8 Parallel delegation
   │                                     P7 Legacy rescue
   │                              P6 Guardrails & hooks
   │                       P5 Calibrated reviewer
   │                P4 Repro-first bug hunt
   │         P3 Spec → plan → gate
   │  P2 Agent-ready repo
   │ P1 Instrumented baseline
   └──────────────────────────────────────────────────────────────────► level
     L1       L2                 L3                  L4           L5
```

| # | Project | Module | Deliverable | Pass criteria (reproducible) |
|---|---|---|---|---|
| **P1** | Instrumented baseline | 01 | `baseline-report.md` | Same task, prompt-only vs framed; logged time, turns, interventions (with reasons), out-of-scope files, whether tests actually ran; every problem tagged F1–F11 |
| **P2** | Agent-ready repo | 02 | Router, glossary, ≥ 1 ADR, state schema + manager, `init_agent.py`, `lint_agents_md.py` in CI | Router < 60 lines and lints clean; `kill -9` during state writes never corrupts the file; fresh session's first meaningful edit < 2 min |
| **P3** | Spec → plan → gate | 03, 04 | Task frame, plan JSON with waves, scope contract, feature shipped through `verify()` | Every fact has a receipt; `.agent/verification/T-xxx.json` → `passed: true`; `scope_check` clean; red test committed before implementation |
| **P4** | Repro-first bug hunt | 05A | Repro script, hypotheses log, fix, regression test | Repro fails ≥ 9/10 before the fix, passes 10/10 after; no catch-all `except`; a retro note on why no check caught it |
| **P5** | Calibrated reviewer | 05B | Reviewer prompt/skill, rubric schema, seeded-flaw branch, 10-item calibration set | Catches ≥ 4/5 seeded flaws; ≥ 80% agreement with known verdicts; runs in a separate context |
| **P6** | Guardrails & hooks | 04 | PreToolUse scope guard, PostToolUse format/lint, Stop gate, tamper detector, 1 custom lint rule, 1 ratchet | Demo video/log: guard blocks a forbidden edit; Stop hook forces continuation on red; Bash bypass caught by the CI gate; lint rule has failing + passing fixtures |
| **P7** | Legacy rescue | 05C | Characterization tests on a hot spot, deepened module, ADR, enforced boundary | Behavior unchanged (same tests green before/after); interface smaller; boundary violation fails CI; mutation score on the module recorded and improved |
| **P8** | Parallel delegation | 06 | Delegation plan (owners, paths, deps, proofs), 2+ worktree runs, integration log | Zero ownership conflicts; integrator read proof outputs; integration < 20% of wall time; full gate green |
| **P9** | Multi-session task | 06 | ≥ 3 sessions, handoff packets (md + json), clean-state checks | Each resume reaches its first meaningful edit in < 2 min from the packet alone; no handoff from a dirty tree |
| **P10** | Software factory | 07 | Implementer + reviewer workflows, threat model, ratchet, 1 scheduled job, metrics report, factory retro | ≥ 3 tickets end to end (stretch: ≥ 10 merged); can't push to main; four metrics vs baseline; ≥ 3 retro findings became checks |

### Project briefs (what makes each one hard)

**P1:** The hard part is honesty. Log *every* intervention, including "I re-explained the requirement." The surprise you find is the point.

**P3:** Write the acceptance command and the red test *before* the agent touches implementation. If you catch yourself writing acceptance afterwards, start over.

**P5:** A reviewer that flags everything is as useless as one that flags nothing. Track false positives too.

**P7:** Characterization tests sometimes pin bugs. Label those tests `# pins current (buggy?) behavior — see ADR-xxxx` instead of silently "fixing" behavior during a refactor.

**P8:** Choose a split where the shared contract is frozen first (wave 1), then implementations fan out (wave 2).

**P10:** Start with the lowest-blast-radius ticket class you have (test gaps, lint debt). Expand only on evidence.

---

## 2. Capstone: ship a reusable workbench pack + a case study

### 2.1 The pack
```
agent-workbench-pack/
├── VERSION                       # major: schema/script migrations · minor: additions · patch: docs
├── AGENTS.md                     # router template (< 60 lines)
├── docs/
│   ├── agent-rules.md            # 5 categories: startup, forbidden, done, uncertainty, approval
│   ├── handoff-protocol.md
│   ├── reviewer-rubric.md
│   └── CODING_STANDARDS.md       # judgment-only rules (mechanical ones live in checks)
├── schemas/
│   ├── agent_state.schema.json
│   ├── feature_list.schema.json
│   └── scope_contract.schema.json
├── scripts/
│   ├── init_agent.py  run_with_feedback.py  scope_check.py
│   ├── verify_gate.py  generate_handoff.py  clean_state.py  lint_agents_md.py
├── .claude/
│   ├── settings.json             # hooks: scope guard, format, stop gate
│   ├── hooks/  agents/ (explorer, reviewer)  skills/ (grill, retro)
├── ci/                           # workflow templates: verify, review, (opt) implement
└── bin/
    ├── install.sh                # idempotent; refuses to overwrite without --force; writes .workbench-version
    └── uninstall.sh              # never deletes user state (.agent/*), refuses on uncommitted state changes
```
**Stays out:** project-specific tasks, vendor SDK calls, onboarding prose. The pack is framework-agnostic.
**Cross-tool:** the installer symlinks `AGENTS.md` → `CLAUDE.md` (and other tools' instruction paths).

### 2.2 The case study (`learning-artifacts/career-agent-evidence.md`)
Pick one **real** task in a repo you're allowed to change. Record:

1. **Frame + autonomy:** starting revision, goal, non-goals, allowed paths, acceptance; chosen mode (guided / checkpointed / bounded autonomous) **with justification** (uncertainty × consequence × reversibility); time and cost budget; stop rule.
2. **Environment:** which sources went into context and why; which extensions (skill / MCP / hook) and with what permissions; one proposed addition you **rejected** and its cost; one stale instruction you retired (rerun the affected check).
3. **Baseline:** current behavior captured *before* edits (command, revision, output).
4. **Implementation:** intervention log with reasons.
5. **Challenge the evidence:** in a disposable copy, introduce one specific wrong behavior → the **same** acceptance check must fail for that reason (a syntax error doesn't count). Restore it, rerun green, keep both receipts.
6. **Operate + recover:** run the artifact locally/staging (label it); trigger one failure signal with a threshold and owner; rehearse rollback and verify the previous behavior returns.
7. **Improve + hand off:** compare with the baseline (honest: one task ≠ general speedup); promote one correction into a control; leave a clean state and a next action.

### 2.3 Capstone review rubric
Reviewer marks each row **demonstrated / needs revision / unverified**, with an evidence pointer.

| Dimension | Reviewer challenges |
|---|---|
| Task & autonomy | Starting behavior, bounded goal, justified permissions, budget, usable stop rule |
| Context & environment | Relevant sources, justified tool access, a rechecked retirement decision |
| Verification | Real before/after, plus a deliberate wrong result the same check rejects |
| Review & operation | Inspected diff, independent challenge, labeled runtime observation, rehearsed recovery |
| Iteration & handoff | One verified improvement, honest limits, clean final state, reproducible next action |

**Hero criterion:** a peer reproduces your weakest acceptance check from the case study **without asking you anything.**

---

## 3. Extreme engineering efficiency: the operator's toolkit

| Lever | Practice | Evidence |
|---|---|---|
| **Frame once, reuse** | Templates for frame, plan, scope contract, handoff | 🔵 |
| **Never idle-watch** | While agents run: design, review, read code, write ADRs | 🔵 |
| **Batch human decisions** | Collect human-unknowns; answer them in one sitting | 🔵 |
| **Review by merge-danger** | One-way doors first and deepest; two-way doors skimmed against evidence | 🟢 |
| **Fast checks** | Per-edit < 5s, related tests < 30s, full < 3 min | 🟢 |
| **Model routing** | Strong for framing/review, cheap for exploration/mechanics | 🔵 |
| **Stable prefixes** | Keep system prompt / router / tool list stable for prompt caching | 🔵 |
| **Skills for repeats** | Anything done 3× becomes a skill or script | 🔵 |
| **Terminal ergonomics** | tmux/panes per worktree, shell aliases for check/verify/handoff | 🟢 |
| **Small batches** | One feature per session, small PRs | 🟢 |
| **Delete instructions** | Every retro: delete ≥ 1 no-op line | 🔵 |

### Anti-patterns that cap you at L2
| Anti-pattern | Why it hurts | Replace with |
|---|---|---|
| "Vibe-accepting" diffs you didn't read | You own what ships | Review by merge-danger + gate |
| Retrying the same prompt with a reworded plea | Failures are missing surfaces | Ask "which surface?" |
| Giant instruction files | Context rot, contradictions | Router + progressive disclosure |
| Letting the agent fix tests to pass | Test tampering | Protected tests + tamper gate |
| Parallel agents on shared, undecided contracts | Conflicting designs | Freeze contract first (wave 1) |
| Measuring "% AI-written code" | Vanity | Rework rate, human minutes/PR, escaped defects |
| Building the factory first | Mass-produced defects | Brakes before accelerators |
| Running agents with secrets on untrusted input | Lethal trifecta | Break a leg of the trifecta per job |

---

## 4. The elite operator playbook

### Daily
```
06:00  Factory digest (auto): merged/blocked PRs, gate catch rate, morning-rebase results, monitors
09:00  Triage — which items need ME? (human unknowns, one-way doors, needs-human labels)
09:30  Deep work: grill + frame 1–3 high-leverage tasks; write specs & ADRs
11:00  Dispatch framed tasks (worktrees / factory labels); queue explorer subagents for open questions
11:15  Review PRs by merge-danger; read proofs, not summaries
14:00  Design/architecture time while agents run; answer batched human unknowns
16:30  Integrate parallel units; full gate
17:30  Retro the day: 1 correction → 1 control; delete 1 no-op instruction
17:45  Clean state + handoffs; queue overnight low-blast AFK jobs
```

### Weekly
- Reviewer calibration rerun (if prompts/standards changed)
- Architecture survey → pick one deepening
- Factory metrics vs baseline; retire stale controls
- Prune glossary/ADR index

### Decision rule: how much autonomy?
| Uncertainty ↓ / Consequence → | Low (reversible, local) | High (public contract, data, security, money) |
|---|---|---|
| **Low** (clear spec, strong tests) | Bounded autonomous / factory | Checkpointed: plan approval + human merge |
| **High** (fog, weak tests) | Guided: frame + prototype first | Human-led; agent for research and drafts only |

---

## 5. Self-check questions (answer from memory, then verify in the notes)

1. Name the three layers under every agent result. Which one do you control most?
2. Where in the agent loop does "done" get decided, and why is that dangerous?
3. What is context rot, and what are three tactics against it?
4. What makes `AGENTS.md` a router rather than a manual? Give two lint rules.
5. Why atomic writes for state? Write the four steps.
6. What are the six fields of a task frame? What's a receipt?
7. Classify unknowns into four kinds. When must the agent pause?
8. Why define the shared contract before parallel implementations?
9. Why is `forbidden_files` "half the contract"?
10. Why must the verification gate be deterministic? Where do LLM judges belong?
11. List four forms of test tampering and one defense for each.
12. Which hook events can block with exit code 2, and what does each block? Why aren't hooks enough on their own?
13. Coverage vs mutation score: what does each prove? Why not aim for 100% mutation score?
14. How does a ratchet let you adopt a strict rule on legacy code?
15. What is the repro gate in debugging, and which failure mode does it prevent?
16. Why can't the builder review itself? What makes the reviewer "separate"?
17. Name four LLM-judge biases and a mitigation for each.
18. Define deep module, seam, enabling point. Why is one adapter only a hypothetical seam?
19. State the parallelism test. Give one split that looks independent but isn't.
20. Name the three isolation layers and what each *doesn't* prevent.
21. What are the seven handoff fields? Which one is load-bearing?
22. Compaction vs handoff: when do you choose each?
23. Explain the lethal trifecta and how your factory breaks it.
24. Which four factory metrics would you show a skeptical VP? Why not "% AI-written code"?
25. What did METR's 2025 RCT find, and what does it imply for how you evaluate your own workflow?

---

## 6. Glossary

| Term | Meaning |
|---|---|
| Harness | Runtime around the model: loop, tools, permissions, compaction |
| Workbench | The seven engineered surfaces around the model |
| Router | Short root instruction file that points to deeper docs |
| Receipt | `path:line` or command output backing a claim |
| Scope contract | Per-task allowed/forbidden globs, acceptance, rollback, approvals |
| Feedback record | Structured capture of command, output tails, exit, duration |
| Verification gate | Deterministic pass/fail over artifacts |
| Test tampering | Weakening/skipping tests to go green |
| Two-axis review | Separate Standards and Spec reviews, never merged |
| Deep module | Big behavior behind a small interface |
| Seam / enabling point | Where behavior can vary / where the choice is made |
| Work unit | Delegated contract: goal, owner, exclusive paths, deps, proof, handoff |
| Integrator | Merges units in dependency order and runs the full gate |
| Handoff packet | Generated 7-field md+json for the next session |
| Ratchet | Metric that may only move one way |
| Retro | Turning a run's corrections into environment controls |
| Lethal trifecta | Private data + untrusted content + exfiltration path |
| Ralph loop | Re-run the agent in fresh contexts with state on disk |

---

## 7. Reading list (by priority)

**Read first**
- Anthropic: *Building Effective Agents* · *Effective Context Engineering for AI Agents* · *Effective Harnesses for Long-Running Agents*
- Claude Code docs: hooks, subagents, skills, headless/CI, GitHub Actions
- Böckeler / Fowler: *Harness engineering for coding agent users*
- Simon Willison: *The lethal trifecta for AI agents*
- METR (2025) productivity RCT · DORA *State of AI-assisted Software Development* (2025)

**Practice sources**
- `mattpocock/skills`: grill-with-docs, wayfinder, to-spec, to-tickets, implement, code-review, retro, improve-codebase-architecture, diagnosing-bugs, tdd
- agents.md spec · OpenAI *Harness engineering* / *Unrolling the Codex agent loop*
- SWE-agent paper (agent–computer interfaces matter)

**Classics that matter more now**
- Ousterhout, *A Philosophy of Software Design* · Feathers, *Working Effectively with Legacy Code* · Fowler, *Refactoring* (ch. 3) · Evans, *DDD* · Hunt & Thomas, *The Pragmatic Programmer* · Beck, *TDD by Example* · Nygard, ADRs · Zeller, *Why Programs Fail* (debugging)

> [!quote] Final takeaway
> Elite isn't "uses the most agents." Elite is: **every claim has a receipt, every correction becomes a control, and the human spends their time only where judgment is irreplaceable.**
