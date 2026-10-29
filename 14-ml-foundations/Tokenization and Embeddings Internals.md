---
tags: [ai-system-design, ml-foundations, tokenization]
aliases: [BPE, Byte Pair Encoding, Tokenizer, Vocabulary, Embedding Table]
---

# Tokenization and Embeddings Internals

> [!success] 🟢 Junior Explanation
> **In plain words:** A model can't read letters. A **tokenizer** chops text into pieces (tokens) from a fixed vocabulary and gives each an ID. The model looks up each ID in an **embedding table** to get a vector.
>
> **Analogy:** Lego bricks: common words are one big brick; rare words are built from several small bricks.
>
> **Say it in one sentence:** "BPE builds a vocabulary by repeatedly merging the most frequent adjacent pairs; each token ID indexes a learned embedding vector."
>
> 🎯 **Junior must know:** token ≈ 4 chars, vocab, embedding lookup. · **Middle adds:** run BPE by hand, vocab-size trade-offs, tokenizer pitfalls.

## 1. Pipeline
```
"unhappiness" -> tokenizer -> [un][happi][ness] -> IDs [412, 9087, 1203]
              -> embedding lookup (V × d table) -> vectors [d] each -> transformer
```
Tokens per word ≈ 1.3 for English; **1 token ≈ 4 characters** `[OS]` (language-dependent).

## 2. BPE by hand `[GEN]`
Corpus words (with counts): `low`×5, `lower`×2, `newest`×6, `widest`×3. Start from characters.
1. Count adjacent pairs; merge the most frequent, e.g. `e`+`s` → `es` (appears in newest, widest).
2. Repeat: `es`+`t` → `est`; then `l`+`o` → `lo`; `lo`+`w` → `low`…
3. Stop at target vocabulary size (e.g. 32k–128k+).
Inference: apply learned merges in order to new text.
- **Byte-level BPE:** start from the 256 bytes → **no unknown tokens**, handles any language/emoji (GPT-2 onward).
- Alternatives: WordPiece (BERT), **SentencePiece/Unigram** (probabilistic, language-agnostic, used by T5/Llama-1/2).

## 3. Vocabulary size trade-off
| Bigger vocab | Smaller vocab |
|---|---|
| ✅ Shorter sequences → less attention/KV cost, faster decode | ✅ Smaller embedding/output matrices |
| ❌ Larger embedding + LM-head ($V\times d$ each); rare tokens poorly trained | ❌ Longer sequences, more compute |
Example: Llama 3 8B vocab 128,256 × d 4096 = **525M params** per table (×2 if untied) — **13% of the model** is embeddings → [[Transformer Architecture Deep Dive]].
Output softmax costs $O(Vd)$ per token — nontrivial for small models.

## 4. Pitfalls interviewers like
| Pitfall | Why |
|---|---|
| **Numbers** tokenized inconsistently ("1234" → 12|34) | Hurts arithmetic; some tokenizers split digits individually |
| **Whitespace/casing** variants | " the" ≠ "the" ≠ "The" are different tokens |
| **Non-English costs more tokens** | Higher cost + less context for the same text |
| **Glitch tokens** (rare tokens seen ~never in training) | Undertrained embeddings → weird behavior |
| **Tokenizer/model mismatch** | Silent garbage; always version tokenizer with the model (like [[Embedding Cache]] keys) |
| **Prompt-boundary effects** | Tokenization of prefix+suffix ≠ tokenization of parts → matters for prefix caching & constrained decoding |

## 5. Embeddings
- **Input embedding:** row lookup $E[\text{id}]\in\mathbb{R}^d$ — learned during pretraining. No positional info yet → added via RoPE inside attention → [[Positional Encodings - RoPE, ALiBi and Long Context]].
- **Output (unembedding):** $\text{logits}=h\,W_{out}$, $W_{out}\in\mathbb{R}^{d\times V}$; may be **tied** to $E^\top$ (saves $Vd$ params).
- **Sentence embeddings** (for RAG) are a different model trained contrastively → [[Embeddings and Embedding Models]].
- Cosine similarity of normalized vectors = dot product.

> [!question] Recall
> 1. Run two BPE merges on "aaabdaaabac". (a+a → aa, then aa+b → aab…)
> 2. Why does a larger vocabulary shorten decode time but cost memory?
> 3. Why are non-English prompts more expensive?

Related: [[LLM Recap - Tokens and Autoregression]] · [[Transformer Architecture Deep Dive]]
