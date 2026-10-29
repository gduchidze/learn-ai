---
tags: [ml-from-scratch, training, debugging]
difficulty: medium
---

# L18 · Dead ReLU Detector

> [!success] 🟢 In one sentence
> **A "dead" ReLU neuron outputs 0 for every input, so its gradient is always 0 and it can never recover. We can detect these with forward hooks and fix them.**

> [!example] 🧠 Analogy: a light switch glued off
> ReLU passes the signal only when the input is > 0. If a big update pushes the neuron's bias very negative, the input is **always** < 0. The switch is stuck off, no current flows (gradient = 0), and nothing can ever flip it back.

## 👀 Picture it

```
 alive neuron                     dead neuron
 input z across the batch:        input z across the batch:
  −2  0.5  3  −1  1.2              −9  −7  −12  −8  −10
 relu: 0  0.5  3  0  1.2           relu: 0   0   0   0   0
 grad:  0   1  1  0   1            grad: 0   0   0   0   0   ← stuck forever 💀
```

```mermaid
flowchart LR
    A["big lr step"] --> B["bias pushed very negative"] --> C["z < 0 for ALL inputs"] --> D["output 0, grad 0"] --> E["no update ever again 💀"]
    E --> D
```

## 🧮 Why it can't recover
ReLU's gradient is $\mathbb{1}[z>0]$. If $z \le 0$ for every training example, then $\partial L/\partial w = 0$ for all of that neuron's incoming weights. The weights freeze.

**Dead fraction** for a layer = the share of neurons whose output is 0 for **every** example in a big batch.

| Dead fraction | Verdict |
|---|---|
| < 10% | normal |
| 10–40% | wasting capacity: check lr and init |
| > 50% | 🚨 the network is crippled |

## 💻 Code: detect dead neurons with forward hooks

```python
import torch, torch.nn as nn
torch.manual_seed(0)

def build():
    return nn.Sequential(nn.Linear(20, 128), nn.ReLU(),
                         nn.Linear(128, 128), nn.ReLU(),
                         nn.Linear(128, 2))

def dead_report(model, X):
    acts = {}
    hooks = [m.register_forward_hook(lambda m, i, o, n=n: acts.__setitem__(n, o.detach()))
             for n, m in model.named_modules() if isinstance(m, nn.ReLU)]
    with torch.no_grad(): model(X)
    for h in hooks: h.remove()
    return {n: (a <= 0).all(dim=0).float().mean().item() for n, a in acts.items()}

X = torch.randn(1024, 20); y = (X[:, 0] > 0).long()

for lr in [1e-3, 3.0]:                   # sane lr vs absurd lr
    torch.manual_seed(0)
    model = build()
    opt = torch.optim.SGD(model.parameters(), lr=lr)
    for _ in range(100):
        loss = nn.functional.cross_entropy(model(X), y)
        opt.zero_grad(); loss.backward(); opt.step()
    rep = dead_report(model, X)
    print(f"lr={lr:<5} dead fraction per ReLU layer:",
          {k: f"{v:.0%}" for k, v in rep.items()})
```

## 🛠️ Fixes

| Fix | How |
|---|---|
| Lower the learning rate | the most common real cause |
| He init + bias 0 (or a small +0.01) | [[L11 Weight Initialization]] |
| **Leaky ReLU** | `nn.LeakyReLU(0.01)`: the negative side keeps a small slope, so the gradient never hits exactly 0 |
| **GELU / SiLU** | smooth and never fully flat (used in GPT and LLaMA) |
| Normalization before the activation | keeps z centered around 0 |

```
 Leaky ReLU:   ╱       slope 1 for z>0
             ╱
   ‾‾‾‾‾‾‾‾╱           slope 0.01 for z<0 → still a little gradient ✅
```

## ⚠️ Common mistakes
- Measuring dead neurons on a **single example**. That's normal sparsity. Use a large batch.
- Checking only at the end. Monitor during training to see *when* neurons die (usually after a spike).

## 🏋️ Try it
1. Replace `nn.ReLU` with `nn.LeakyReLU(0.01)` and rerun with lr=3.0. The dead fraction should drop to 0%.
2. Log the dead fraction every 10 steps and plot it.
3. Add a backward hook that reports layers whose grad norm is exactly 0.

---
**Prev ←** [[L17 Training Diagnostics]] · **Next →** [[L19 Digit Classifier]]
