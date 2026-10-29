---
tags: [ai-system-design, agents]
aliases: [Computer Use Agent, Browser Agent, RPA replacement]
---

# Computer Use and Browser Agents

> [!success] 🟢 Junior Explanation
> **In plain words:** Agents that look at the screen (screenshots) and click and type like a human, for apps with no API.
>
> **Analogy:** Remote-controlling someone's computer for them.
>
> **Why interviewers ask:** New agent class with special safety needs.
>
> **Say it in one sentence:** "Computer-use agents loop screenshot → decide → click; they're slow and need sandboxing and human approval for risky actions."
>
> 🎯 **Junior must know:** how they work, why slow, sandbox. · **Middle adds:** DOM/accessibility tree, human-in-the-loop, failure recovery.

## What `[OS]`
Regular agents call APIs. **Computer-use agents** have no API — they **see the screen** (screenshot), decide a UI action (click at coordinates, type, scroll), runtime executes, next screenshot returns. Loop until done. Can drive any web/desktop app, even legacy systems with no API.
```
Goal -> LLM (vision + reasoning) <-screenshot- Browser/Desktop/OS
                                  -click,type->
     -> Final answer
```
**Browser agents**: same idea in a browser; controller like **Playwright**; besides screenshots can read **DOM / accessibility tree** and act on numbered elements instead of raw coordinates.

## Design implications `[OS]`
- **Vision-capable model** required → image-token cost every step.
- **Slow** — screenshot + decision + action per step; tasks take minutes.
- **Sandboxing critical** — full keyboard/mouse; run in VM / browser sandbox.
- **Human-in-the-loop** for risky actions ("Pay $1000", "Delete all").
- **Failure recovery** — UI changes break it → retries, saved screenshots, fallback paths.

Use cases: forms, scraping apps without APIs, legacy enterprise UIs, back-office workflows — replaces traditional **RPA** with something far more flexible.

> [!question] Recall
> List 5 design implications and the safety controls you'd add.

Related: [[What is an AI Agent]] · [[Prompt Injection]] · [[Multimodal Systems]]
