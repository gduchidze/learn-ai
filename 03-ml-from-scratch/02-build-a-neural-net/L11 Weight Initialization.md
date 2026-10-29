---
tags: [ml-from-scratch, neural-net]
difficulty: medium
---

# L11 · Weight Initialization

> [!success] 🟢 In one sentence
> **The starting values of the weights decide whether signals survive a deep network. Too small and they fade to 0, too big and they explode. Good init keeps them at a steady size.**

> [!example] 🧠 Analogy: a game of telephone through 50 people
> If everyone whispers a little quieter, the message fades to silence (**vanishing**).
> If everyone shouts a little louder, it becomes a deafening roar (**exploding**).
> Good init means everyone speaks at **the same volume they heard**.

## 👀 Picture it: activation size per layer (50 layers deep)

```
 std of activations
  ∞  ┤                                    ●  W ~ N(0, 1)       💥 explodes
     │                          ●
     │                ●
  1  ┤●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  He init            ✅ stable
     │  ●
  0  ┤     ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  W ~ N(0, 0.01)    🫥 vanishes
     └──────────────────────────────────── layer
     1                                  50
```

## 🧮 Why √(2/fan_in)?

One output of a layer is the sum of `fan_in` products: $y = \sum_{i=1}^{n} w_i x_i$.
If the w and x are independent with mean 0:
$$
\text{Var}(y) = n \cdot \text{Var}(w)\cdot\text{Var}(x)
$$
To keep $\text{Var}(y) = \text{Var}(x)$ we need $\text{Var}(w) = 1/n$.
ReLU zeroes out half the values, which halves the variance, so we double it:

| Init | Var(w) | Use with |
|---|---|---|
| **Xavier / Glorot** | $1/n_{in}$ (or $2/(n_{in}+n_{out})$) | tanh, sigmoid |
| **He / Kaiming** | $2/n_{in}$ | **ReLU** ✅ |
| Too small `0.01` | $10^{-4}$ | ❌ vanishes |
| `N(0,1)` | $1$ | ❌ explodes when n is large |

> [!warning] Never init all weights to zero
> Every neuron in a layer then computes the same thing and gets the same gradient, so they stay identical forever (a **symmetry** problem). Randomness breaks the tie. Biases *can* start at zero.

## 🔢 By hand
fan_in = 512, ReLU → std = √(2/512) = √0.0039 ≈ **0.0625**
fan_in = 4096 → std ≈ **0.022**. Bigger layers need smaller weights.

## 💻 Code: watch the signal survive (or die)

```python
import numpy as np
rng = np.random.default_rng(0)

def run(init_std_fn, layers=50, width=512):
    x = rng.normal(size=(256, width))
    stds = []
    for _ in range(layers):
        W = rng.normal(0, init_std_fn(width), (width, width))
        x = np.maximum(0, x @ W)          # Linear + ReLU
        stds.append(x.std())
    return stds

for name, fn in [("tiny 0.01 ", lambda n: 0.01),
                 ("N(0,1)    ", lambda n: 1.0),
                 ("Xavier    ", lambda n: np.sqrt(1 / n)),
                 ("He        ", lambda n: np.sqrt(2 / n))]:
    s = run(fn)
    print(f"{name} layer1={s[0]:.3g}  layer10={s[9]:.3g}  layer50={s[-1]:.3g}")
```

Expected pattern: tiny → 0, N(0,1) → huge (or inf), Xavier slowly fading with ReLU, **He stays around 1** ✅.

### In PyTorch
```python
import torch.nn as nn
layer = nn.Linear(512, 512)
nn.init.kaiming_normal_(layer.weight, nonlinearity="relu")   # He
nn.init.zeros_(layer.bias)
print(round(layer.weight.std().item(), 4), "≈", round((2/512) ** 0.5, 4))
```

> [!info] Good news
> PyTorch's `nn.Linear` already uses a sensible default init, and **normalization layers** ([[L13 Layer Normalization]]) plus **residual connections** ([[L26 Transformer Block]]) make deep nets much less sensitive to init. It's still a common culprit when a big model's loss is NaN at step 0.

## ⚠️ Common mistakes
- Zero init for weights (the symmetry problem).
- Xavier with ReLU in very deep nets (the signal slowly fades).
- Copy-pasting `* 0.01` from old tutorials.

## 🏋️ Try it
1. Plot `stds` for all four inits on one chart.
2. Repeat with tanh instead of ReLU. Which init wins now?
3. Track gradient norms per layer during backward too, not just activations.

---
**Prev ←** [[L10 MLP from Scratch]] · **Next →** [[L12 PyTorch Basics]] (module ③)
