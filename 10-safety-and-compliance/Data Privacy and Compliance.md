---
tags: [ai-system-design, privacy, compliance]
aliases: [PII Redaction, Data Residency, BAA, GDPR, HIPAA, AI TRiSM, Audit Logs]
---

# Data Privacy and Compliance

> [!success] 🟢 Junior Explanation
> **In plain words:** Protect personal data: hide it before the model sees it, keep it in the right country, and keep proper logs.
>
> **Analogy:** Using a black marker on a document before sharing it.
>
> **Why interviewers ask:** Fines and lost trust are real risks.
>
> **Say it in one sentence:** "I redact PII before and after the LLM, keep data in-region, use no-train contracts, and keep redacted audit logs."
>
> 🎯 **Junior must know:** PII redaction flow. · **Middle adds:** data residency, BAA/no-train, audit retention, voice privacy.

## Why `[OS]` `[SDH]`
AI handles names, emails, medical records, finances, internal docs. Risks `[OS]`:
- **Regulatory fines** — GDPR billions of euros cumulative since 2018 (GDPR Enforcement Tracker); HIPAA millions per incident; **EU AI Act** adds a layer for high-risk systems.
- **Reputation** — one PII leak ends trust overnight.
`[SDH]` umbrella: **AI TRiSM** (Trust, Risk, Security Management). History: early models memorized and reproduced PII; today strict data governance + **differential privacy**.

## PII redaction `[OS]`
First line: never let sensitive data reach the LLM.
1. **Detect** PII — regex + small **NER** model (names, locations).
2. **Redact / tokenize** — `john@example.com` → `<EMAIL_1>`; LLM still reasons with placeholder.
3. **Restore** real values in response if needed.
Same redaction on **output** (model may leak PII, even from training data).
Tools: Microsoft **Presidio**, Gravitee PII Filtering, Tonic.ai, Private AI.

## Data residency `[OS]`
GDPR, India's **DPDP** etc. require data to stay in-region:
- Providers with right region (OpenAI, Anthropic, AWS Bedrock, Azure offer EU/US).
- **Logs, vector DBs, blob storage, caches** all same region as the user.
- Clear data-flow diagram for every customer who asks.

## Contract checkboxes `[OS]`
- **No-train clause** — provider must not train on your prompts/responses (enterprise plans).
- **BAA** (Business Associate Agreement) — required for HIPAA; without it you **cannot legally send PHI**.

## Classic practices `[SDH]`
Anonymize/pseudonymize; **encrypt at rest and in transit**; GDPR/CCPA compliance incl. **right to be forgotten** (may require deleting user data from **training sets**).

## Voice & multimodal `[OS]`
One call leaves traces in transcripts, recordings, debug logs, traces, analytics, LLM context — a spoken card number can land in **nine systems**. Redact at **every** pipeline stage.

## Audit logs `[OS]`
Log every LLM request: user, **redacted** prompt, **redacted** response, policy decisions. Evidence for "show me what happened on date X for user Y". Retention per regulation (often **6 months – 7 years**).

> [!important] `[OS]` Privacy is a **layer**, not a checklist — touches gateway, guardrails, observability, storage; design it in from day one.

> [!question] Recall
> 1. 3-step PII redaction flow.
> 2. What must be co-located for data residency?
> 3. No-train vs BAA.
> 4. How does "right to be forgotten" affect ML training?

Related: [[Guardrails]] · [[Observability]] · [[Multi-Tenancy]]
