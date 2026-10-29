"""mini_gpt.py: a complete, tiny GPT you can read in one sitting.

Lessons L27–L36 explain every piece:
  BPETokenizer      → L27 Tokenizer, L28 Vocabulary, L29 Edge Cases
  GPTDataset        → L30 Data Loader, L31 Dataset
  GPT               → L32 Code GPT (+ GQA from L36)
  train()           → L33 Train Your GPT
  GPT.generate()    → L34 Make GPT Talk Back (+ KV-cache from L35)

Run:  python mini_gpt.py                     (built-in corpus, ~1 min on CPU)
      python mini_gpt.py --text input.txt --steps 3000   (your own text)

Note: the built-in corpus is tiny, so the model MEMORIZES it (train loss → 0,
val loss stays high). That is expected; see L17. Use a bigger text for real generalization,
e.g. Tiny Shakespeare (~1 MB).
"""
from __future__ import annotations

import math
import time
from dataclasses import dataclass

import torch
import torch.nn as nn
import torch.nn.functional as F

# --------------------------------------------------------------------------
# 0. A small built-in corpus (works offline). Swap in any .txt you like.
# --------------------------------------------------------------------------
CORPUS = """
The little robot woke up in the workshop. It looked at the window and saw the morning light.
The robot asked the old engineer, what should I learn today? The engineer smiled and said,
today you will learn to read. Reading is how a machine learns about the world.
The robot read a book about the sea. The sea was wide and blue, and the waves were loud.
The robot read a book about the stars. The stars were far away, but their light was bright.
The robot read a book about people. People laugh, people help, and people make mistakes.
Every evening the robot told the engineer what it had read. The engineer listened and nodded.
One day the robot asked, why do you teach me? The engineer said, because learning is a gift,
and a gift is better when it is shared. The robot thought about this for a long time.
The next morning the robot woke up early. It opened the window and looked at the light.
Then it found a small machine in the corner of the workshop, and it began to teach it to read.
""".strip()


# --------------------------------------------------------------------------
# 1. Byte-level BPE tokenizer  (L27, L28, L29)
# --------------------------------------------------------------------------
class BPETokenizer:
    """Starts from the 256 raw bytes, then repeatedly merges the most frequent pair."""

    EOT = "<|endoftext|>"

    def __init__(self) -> None:
        self.merges: dict[tuple[int, int], int] = {}
        self.vocab: dict[int, bytes] = {i: bytes([i]) for i in range(256)}
        self.special: dict[str, int] = {}

    @staticmethod
    def _pair_counts(ids: list[int]) -> dict[tuple[int, int], int]:
        counts: dict[tuple[int, int], int] = {}
        for pair in zip(ids, ids[1:]):
            counts[pair] = counts.get(pair, 0) + 1
        return counts

    @staticmethod
    def _merge(ids: list[int], pair: tuple[int, int], new_id: int) -> list[int]:
        out, i = [], 0
        while i < len(ids):
            if i < len(ids) - 1 and (ids[i], ids[i + 1]) == pair:
                out.append(new_id)
                i += 2
            else:
                out.append(ids[i])
                i += 1
        return out

    def train(self, text: str, vocab_size: int, verbose: bool = False) -> "BPETokenizer":
        if vocab_size < 256:
            raise ValueError("vocab_size must be >= 256 (the byte alphabet)")
        ids = list(text.encode("utf-8"))
        for new_id in range(256, vocab_size):
            counts = self._pair_counts(ids)
            if not counts:
                break
            pair = max(counts, key=counts.get)
            ids = self._merge(ids, pair, new_id)
            self.merges[pair] = new_id
            self.vocab[new_id] = self.vocab[pair[0]] + self.vocab[pair[1]]
            if verbose and new_id < 266:
                print(f"merge {new_id}: {self.vocab[pair[0]]!r} + {self.vocab[pair[1]]!r} → {self.vocab[new_id]!r}")
        self.special = {self.EOT: len(self.vocab)}
        return self

    @property
    def vocab_size(self) -> int:
        return len(self.vocab) + len(self.special)

    def encode(self, text: str) -> list[int]:
        ids = list(text.encode("utf-8"))
        while len(ids) >= 2:
            counts = self._pair_counts(ids)
            # apply the EARLIEST learned merge first, same order as training
            pair = min(counts, key=lambda p: self.merges.get(p, math.inf))
            if pair not in self.merges:
                break
            ids = self._merge(ids, pair, self.merges[pair])
        return ids

    def decode(self, ids: list[int]) -> str:
        inv_special = {v: k for k, v in self.special.items()}
        chunks = [inv_special[i].encode() if i in inv_special else self.vocab[i] for i in ids]
        return b"".join(chunks).decode("utf-8", errors="replace")   # L29: partial UTF-8 → �


# --------------------------------------------------------------------------
# 2. Dataset: (x, y) windows shifted by one token  (L30, L31)
# --------------------------------------------------------------------------
class GPTDataset(torch.utils.data.Dataset):
    def __init__(self, ids: list[int] | torch.Tensor, block_size: int) -> None:
        self.ids = torch.as_tensor(ids, dtype=torch.long)
        self.block_size = block_size
        if len(self.ids) <= block_size:
            raise ValueError("text is shorter than block_size")

    def __len__(self) -> int:
        return len(self.ids) - self.block_size

    def __getitem__(self, i: int) -> tuple[torch.Tensor, torch.Tensor]:
        chunk = self.ids[i : i + self.block_size + 1]
        return chunk[:-1], chunk[1:]          # x = tokens, y = the NEXT tokens


# --------------------------------------------------------------------------
# 3. The model  (L32, + KV-cache L35, + GQA L36)
# --------------------------------------------------------------------------
@dataclass
class GPTConfig:
    vocab_size: int
    block_size: int = 64
    n_layer: int = 4
    n_head: int = 4
    n_kv_head: int = 4        # = n_head → classic MHA; smaller → GQA (L36); 1 → MQA
    d_model: int = 128
    dropout: float = 0.1


class CausalSelfAttention(nn.Module):
    def __init__(self, cfg: GPTConfig) -> None:
        super().__init__()
        assert cfg.d_model % cfg.n_head == 0 and cfg.n_head % cfg.n_kv_head == 0
        self.h, self.kvh = cfg.n_head, cfg.n_kv_head
        self.dh = cfg.d_model // cfg.n_head
        self.q = nn.Linear(cfg.d_model, self.h * self.dh)
        self.kv = nn.Linear(cfg.d_model, 2 * self.kvh * self.dh)   # fewer K/V heads with GQA
        self.proj = nn.Linear(cfg.d_model, cfg.d_model)
        self.drop = cfg.dropout

    def forward(self, x: torch.Tensor, cache: dict | None = None) -> torch.Tensor:
        B, T, C = x.shape
        q = self.q(x).view(B, T, self.h, self.dh).transpose(1, 2)              # (B, h, T, dh)
        k, v = self.kv(x).split(self.kvh * self.dh, dim=-1)
        k = k.view(B, T, self.kvh, self.dh).transpose(1, 2)                    # (B, kvh, T, dh)
        v = v.view(B, T, self.kvh, self.dh).transpose(1, 2)

        if cache is not None:                                                  # L35: KV-cache
            if "k" in cache:
                k = torch.cat([cache["k"], k], dim=2)
                v = torch.cat([cache["v"], v], dim=2)
            cache["k"], cache["v"] = k, v          # stores the SMALL kv heads → GQA saves memory

        if self.kvh != self.h:                                                 # L36: share K/V
            rep = self.h // self.kvh
            k, v = k.repeat_interleave(rep, dim=1), v.repeat_interleave(rep, dim=1)

        # Causal mask needed only when several new queries exist. With a cache and T == 1,
        # the single new token may see everything before it.
        y = F.scaled_dot_product_attention(
            q, k, v, is_causal=(T > 1), dropout_p=self.drop if self.training else 0.0
        )
        return self.proj(y.transpose(1, 2).contiguous().view(B, T, C))


class Block(nn.Module):
    def __init__(self, cfg: GPTConfig) -> None:
        super().__init__()
        self.ln1, self.attn = nn.LayerNorm(cfg.d_model), CausalSelfAttention(cfg)
        self.ln2 = nn.LayerNorm(cfg.d_model)
        self.mlp = nn.Sequential(
            nn.Linear(cfg.d_model, 4 * cfg.d_model), nn.GELU(),
            nn.Linear(4 * cfg.d_model, cfg.d_model), nn.Dropout(cfg.dropout),
        )

    def forward(self, x: torch.Tensor, cache: dict | None = None) -> torch.Tensor:
        x = x + self.attn(self.ln1(x), cache)
        return x + self.mlp(self.ln2(x))


class GPT(nn.Module):
    def __init__(self, cfg: GPTConfig) -> None:
        super().__init__()
        self.cfg = cfg
        self.tok_emb = nn.Embedding(cfg.vocab_size, cfg.d_model)
        self.pos_emb = nn.Embedding(cfg.block_size, cfg.d_model)
        self.drop = nn.Dropout(cfg.dropout)
        self.blocks = nn.ModuleList(Block(cfg) for _ in range(cfg.n_layer))
        self.ln_f = nn.LayerNorm(cfg.d_model)
        self.head = nn.Linear(cfg.d_model, cfg.vocab_size, bias=False)
        self.head.weight = self.tok_emb.weight          # weight tying (GPT-2 trick)
        self.apply(self._init)

    @staticmethod
    def _init(m: nn.Module) -> None:
        if isinstance(m, (nn.Linear, nn.Embedding)):
            nn.init.normal_(m.weight, std=0.02)
        if isinstance(m, nn.Linear) and m.bias is not None:
            nn.init.zeros_(m.bias)

    def forward(self, idx, targets=None, caches=None, pos_offset: int = 0):
        B, T = idx.shape
        if pos_offset + T > self.cfg.block_size:
            raise ValueError(f"sequence length {pos_offset + T} > block_size {self.cfg.block_size}")
        pos = torch.arange(pos_offset, pos_offset + T, device=idx.device)
        x = self.drop(self.tok_emb(idx) + self.pos_emb(pos))
        for i, block in enumerate(self.blocks):
            x = block(x, None if caches is None else caches[i])
        logits = self.head(self.ln_f(x))                                       # (B, T, vocab)
        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))
        return logits, loss

    @torch.no_grad()
    def generate(self, idx, max_new_tokens: int, temperature: float = 1.0,
                 top_k: int | None = None, use_cache: bool = True):
        """L34 sampling loop. With use_cache=True only the NEW token is fed each step (L35)."""
        self.eval()
        caches, pos = None, 0
        for _ in range(max_new_tokens):
            if not use_cache:
                ctx = idx[:, -self.cfg.block_size:]
                logits, _ = self(ctx)
            else:
                if caches is None or pos >= self.cfg.block_size:   # (re)fill: prefill phase
                    ctx = idx[:, -(self.cfg.block_size - 1):]
                    caches = [{} for _ in self.blocks]
                    logits, _ = self(ctx, caches=caches)
                    pos = ctx.shape[1]
                else:                                              # decode phase: 1 token
                    logits, _ = self(idx[:, -1:], caches=caches, pos_offset=pos)
                    pos += 1
            logits = logits[:, -1, :] / max(temperature, 1e-6)
            if top_k is not None:
                kth = torch.topk(logits, min(top_k, logits.size(-1))).values[:, [-1]]
                logits = logits.masked_fill(logits < kth, float("-inf"))
            next_id = torch.multinomial(logits.softmax(-1), num_samples=1)
            idx = torch.cat([idx, next_id], dim=1)
        return idx


# --------------------------------------------------------------------------
# 4. Training  (L33)
# --------------------------------------------------------------------------
def train(text: str = CORPUS, vocab_size: int = 320, steps: int = 600, batch_size: int = 32,
          lr: float = 3e-3, seed: int = 0, cfg_overrides: dict | None = None, log_every: int = 100):
    torch.manual_seed(seed)
    tok = BPETokenizer().train(text, vocab_size)
    ids = tok.encode(text)
    split = int(0.9 * len(ids))
    cfg = GPTConfig(vocab_size=tok.vocab_size, **(cfg_overrides or {}))
    train_ds = GPTDataset(ids[:split], cfg.block_size)
    val_ds = GPTDataset(ids[split - cfg.block_size:], cfg.block_size)
    train_dl = torch.utils.data.DataLoader(train_ds, batch_size=batch_size, shuffle=True, drop_last=True)

    model = GPT(cfg)
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.1)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=lr, total_steps=steps, pct_start=0.1)
    n_params = sum(p.numel() for p in model.parameters())
    print(f"tokens: {len(ids)} | vocab: {tok.vocab_size} | params: {n_params/1e6:.2f}M")
    print(f"initial loss should be ≈ ln(vocab) = {math.log(tok.vocab_size):.2f}")

    @torch.no_grad()
    def val_loss() -> float:
        model.eval()
        xs, ys = zip(*[val_ds[i] for i in range(0, len(val_ds), 4)])
        _, loss = model(torch.stack(xs), torch.stack(ys))
        model.train()
        return loss.item()

    step, t0 = 0, time.time()
    while step < steps:
        for x, y in train_dl:
            _, loss = model(x, y)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step(); sched.step()
            if step % log_every == 0 or step == steps - 1:
                print(f"step {step:4d} | train {loss.item():.3f} | val {val_loss():.3f} | {time.time()-t0:.0f}s")
            step += 1
            if step >= steps:
                break
    return model, tok


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Train a tiny GPT")
    ap.add_argument("--text", help="path to a UTF-8 .txt file (default: built-in corpus)")
    ap.add_argument("--steps", type=int, default=600)
    ap.add_argument("--vocab", type=int, default=320)
    args = ap.parse_args()
    text = open(args.text, encoding="utf-8").read() if args.text else CORPUS
    model, tok = train(text, vocab_size=args.vocab, steps=args.steps)
    prompt = torch.tensor([tok.encode("The robot")])
    for temp in (0.5, 1.0):
        out = model.generate(prompt, max_new_tokens=60, temperature=temp, top_k=20)
        print(f"\n--- temperature {temp} ---\n{tok.decode(out[0].tolist())}")
