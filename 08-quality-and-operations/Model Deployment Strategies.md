---
tags: [ai-system-design, deployment, mlops]
aliases: [Canary Deployment, Shadow Deployment, A/B Testing, Rollout]
---

# Model Deployment Strategies

> [!success] 🟢 Junior Explanation
> **In plain words:** Release new models or prompts slowly and safely.
>
> **Analogy:** Letting a few customers taste a new dish before adding it to the menu.
>
> **Why interviewers ask:** Shows production thinking.
>
> **Say it in one sentence:** "I ship with a canary (e.g. 10%), compare via shadow or A/B tests, and keep the old version to roll back."
>
> 🎯 **Junior must know:** canary rollout. · **Middle adds:** shadow vs A/B and model registry rollback.

Introduce models gradually while managing cost, risk, performance `[SDH]`.

| Strategy | How | Use |
|---|---|---|
| **Canary** | Roll to a small subset of users first | Test stability `[SDH]`; e.g. **10% canary**, watch metrics, go 100% only if quality holds `[OS]` |
| **Shadow** | New model runs alongside old on real traffic, **not user-facing** | Safe comparison `[SDH]` |
| **A/B testing** | Compare models via user feedback / business metrics | Pick best version `[SDH]` |

After deploy monitor latency, throughput, error rates `[SDH]`. Keep a **model registry** for rollback (MLflow, SageMaker Model Registry) `[SDH]`. Prompts follow the same gradual-rollout/rollback discipline `[OS]` → [[Prompt Management and DSPy]].

> [!question] Recall
> Canary vs shadow vs A/B — which never affects users?

Related: [[Classic ML Components]] · [[Observability]] · [[Fault Tolerance and Circuit Breakers]]
