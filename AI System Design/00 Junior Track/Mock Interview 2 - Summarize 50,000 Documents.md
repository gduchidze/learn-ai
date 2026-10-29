---
tags: [ai-system-design, junior, mock-interview]
aliases: [Mock Interview Batch Summarization]
---

# Mock Interview 2 — Summarize 50,000 Documents

> [!info] Built on the `[JAM]` queue pattern + `[OS]` async processing, batch APIs, embeddings pipeline. Theme: **async/batch AI work**, not chat.

---

**Interviewer:** Users upload contracts (PDFs). We need a summary of each. Today there are 50,000 documents, and ~1,000 new uploads per day.

**Candidate:** Questions first:
1. Does the user need the summary **immediately**, or is minutes/hours fine?
2. How long is a typical document? Any scans (images)?
3. What should a summary contain — free text or fixed fields?
4. Budget? Privacy rules for contracts?

**Interviewer:** New uploads: within a few minutes is fine. The 50,000 backlog: within a few days. ~5,000 tokens per document on average, some scanned. Summary + fixed fields (parties, dates, amount). Contracts are confidential.

---

**Candidate (the wrong way, said on purpose):** The naive way is a loop calling the LLM 50,000 times synchronously. That breaks: requests time out, one failure stops everything, and we'd hit the provider's rate limits. So I'll make it **asynchronous with a queue**. `[JAM]`

**Candidate (estimate):**
- Backlog input: 50,000 × 5,000 = **250M input tokens**; output ~300 tokens each = **15M output tokens**.
- At $3 / $15 per million: 250 × $3 + 15 × $15 = $750 + $225 ≈ **$975**.
- It's not urgent, so I'll use the provider's **batch API**, which is ~**50% cheaper** → ~**$490**. `[OS]`

---

**Candidate (design):**
```
Upload -> Backend: save PDF to S3, create job row {job_id, status: queued}
       -> return job_id to user immediately
Queue (SQS) -> Worker pool:
    1. Parse PDF (OCR if scanned, keep tables)
    2. Redact sensitive data if required
    3. Call LLM with structured output schema
    4. Validate JSON; save summary + fields to DB; status=done
User polls job_id or receives a webhook
```
- **Why a queue**: absorbs spikes (someone uploads 10,000 files at once), workers pull at their own pace, and failed jobs get retried. `[JAM]` `[OS]`
- **SQS vs Kafka**: each document needs exactly one worker → classic job queue like SQS/RabbitMQ. If later analytics also needs every upload event, Kafka fits better because multiple consumers read the same stream. `[OS]`
- **Structured output**: I pass a JSON schema (parties, dates, amount, summary) so the model returns valid JSON instead of free text I'd have to parse. `[OS]`

**Interviewer:** Why is parsing a separate step?

**Candidate:** Real PDFs are messy: two columns, tables, scans. If the text is garbage, the summary is garbage. Scans need OCR; tables need special extraction. In RAG projects this step is often 60–80% of the effort. `[OS]`

**Interviewer:** What if a contract is longer than the context window?

**Candidate:** Split it into chunks, summarize each chunk, then summarize the chunk summaries.

> [!note] Beyond the sources
> This "summarize chunks, then summarize summaries" (map-reduce) pattern isn't described in the sources, but it follows from chunking `[OS]` and context-window limits `[OS]`.

---

**Interviewer:** What can go wrong?

**Candidate:**
- **Provider rate limits** → workers throttle; retries with exponential backoff. `[OS]`
- **Broken JSON** → validate; retry with a stricter prompt. `[OS]`
- **A document keeps failing** → after N retries, mark it `failed` and move it aside for a human to check, so it doesn't block the queue.
- **Provider outage** → circuit breaker pauses calls; jobs stay in the queue and resume later — no data lost. `[JAM]`

**Interviewer:** Confidential contracts?

**Candidate:** Use a provider with a **no-train** clause and the right data region; encrypt files at rest; redact PII if not needed for the summary; never log raw contract text. `[OS]`

**Interviewer:** How do you check summary quality?

**Candidate:** Sample ~100 documents with human-written summaries as an eval set; an LLM judge scores accuracy and completeness with a rubric; exact-match checks on fields like dates and amounts; humans spot-check weekly. `[OS]`

**Candidate (summary):** Async upload → queue → worker pool → parse → LLM with structured output → validate → store; batch API for the backlog to halve cost; retries, failed-job handling, breaker for outages; privacy controls; evals on a sample.

> [!check] Scorecard
> - [ ] Rejected the synchronous loop and explained why
> - [ ] Did the token + cost math
> - [ ] Used batch API for non-urgent work
> - [ ] job_id + polling/webhook flow
> - [ ] Parsing/OCR as its own step
> - [ ] Structured output + validation
> - [ ] Retries, failed jobs, outage handling
> - [ ] Privacy + evals
