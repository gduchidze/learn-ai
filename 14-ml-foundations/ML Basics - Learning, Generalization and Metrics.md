---
tags: [ai-system-design, ml-foundations]
aliases: [Bias Variance, Overfitting, Regularization, Precision Recall, Data Leakage, ML Basics]
---

# ML Basics — Learning, Generalization and Metrics

> [!success] 🟢 Junior Explanation
> **In plain words:** A model learns patterns from training data. The goal is to do well on **new** data, not to memorize. Overfitting = memorizing. Metrics tell you how good it is — but the right metric depends on the problem.
>
> **Analogy:** A student who memorizes last year's exam answers (overfit) vs one who understands the subject (generalizes).
>
> **Say it in one sentence:** "I split data into train/validation/test, watch the gap between train and validation error to detect overfitting, regularize if needed, and pick metrics that match the business cost of errors."
>
> 🎯 **Junior must know:** overfitting, train/val/test, precision vs recall. · **Middle adds:** bias–variance, leakage, calibration, PR-AUC for imbalance.

## 1. What learning means `[GEN]`
Given data $(x_i, y_i)$, find parameters $\theta$ minimizing a **loss** $L(\theta)$ on training data, hoping it also minimizes error on unseen data. Three data splits:
| Split | Use |
|---|---|
| **Train** | Fit parameters |
| **Validation** | Tune hyperparameters, early stopping, model choice |
| **Test** | Final, untouched estimate — look **once** |

## 2. Overfitting & underfitting
```
Error
 |  \                      validation error
 |   \__      ___________/   (rises when overfitting)
 |      \____/
 |       training error keeps falling
 +--------------------------------> model complexity / training time
   underfit      sweet spot     overfit
```
- **Underfit (high bias):** both train and val error high → model too simple / not trained enough.
- **Overfit (high variance):** train error low, val error high → memorizing noise.

## 3. Bias–variance
$$\mathbb{E}[\text{error}] = \text{bias}^2 + \text{variance} + \text{irreducible noise}$$
More complex model → lower bias, higher variance. Remedies: more data, regularization, simpler model, ensembling, early stopping.

## 4. Regularization toolbox
| Tool | Idea |
|---|---|
| **L2 / weight decay** | Penalize large weights; in LLMs applied as **decoupled** weight decay in AdamW (typical 0.1) `[WEB]` |
| **L1** | Pushes weights to exactly 0 (sparsity) |
| **Dropout** | Randomly zero activations in training (rare in LLM pretraining) |
| **Early stopping** | Stop when validation loss stops improving |
| **Data augmentation** | More varied training data |
| **More data** | Usually the best regularizer |

## 5. Data leakage — the silent killer
Information from outside the training window sneaks into features/labels → offline metrics look great, production fails.
Examples: random split on **time-series** data (future leaks into train), duplicates across train/test, a feature computed using the label, **fraud features using data that didn't exist at payment time** → [[Case - Real-Time Fraud Detection]] (point-in-time correctness). In LLMs: **benchmark contamination** (test questions in training data).

## 6. Classification metrics
Confusion matrix: TP, FP, FN, TN.
$$\text{precision}=\frac{TP}{TP+FP},\quad \text{recall}=\frac{TP}{TP+FN},\quad F_1=\frac{2PR}{P+R}$$
> [!example] Why accuracy lies
> Fraud rate 0.1%. A model that predicts "not fraud" always has **99.9% accuracy** and **0% recall**.

| Metric | Use when |
|---|---|
| Precision | False positives are costly (spam filter blocking real mail) |
| Recall | Misses are costly (cancer screening, fraud) |
| F1 | Need one number balancing both |
| ROC-AUC | Ranking quality; can look optimistic with heavy imbalance |
| **PR-AUC** | **Imbalanced** data — focuses on the positive class |
| Log loss / calibration | You need trustworthy probabilities (thresholds, costs) |

Threshold choice = business decision: move the threshold along the precision–recall curve.

## 7. Regression & ranking metrics `[GEN]`
MAE (robust), MSE/RMSE (punishes big errors), R². Ranking/recsys: NDCG, MAP, recall@k → [[Case - Recommendation Engine]].

## 8. LLM-specific
**Perplexity** = $\exp(\text{average cross-entropy in nats})$ — lower is better; benchmarks (MMLU, GSM8K, HumanEval) + human preference + LLM-as-judge → [[Evaluation - LLM and Agent]].

## 9. Classic vs deep learning — when what
| Data                         | Often best                                                              |
| ---------------------------- | ----------------------------------------------------------------------- |
| Tabular, small/medium        | Gradient-boosted trees (XGBoost/LightGBM) — strong, fast, interpretable |
| Images                       | CNNs / ViTs                                                             |
| Text, code, audio, sequences | Transformers                                                            |
| Retrieval/ranking at scale   | Two-tower + ranker                                                      |

> [!question] Recall
> 1. Train loss 0.1, val loss 0.9 — diagnosis and three fixes?
> 2. Why PR-AUC over ROC-AUC for 0.1% positives?
> 3. Give two ways leakage occurs in time-series.
> 4. What is perplexity?

Related: [[Training Fundamentals - Loss, Gradients, Optimizers]] · [[ML Foundations Roadmap]]
