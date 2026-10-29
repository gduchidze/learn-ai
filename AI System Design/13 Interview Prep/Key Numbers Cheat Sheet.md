---
tags: [ai-system-design, interview, cheatsheet]
aliases: [Key Numbers, Numbers to Know]
---

# Key Numbers Cheat Sheet

> [!success] 🟢 Junior Explanation
> Don't memorize everything. Juniors: know **1 token ≈ 4 chars, output ≈ 4–5× input price, 70B model = 140 GB at 16-bit, voice < 800 ms, chunk 500–800 tokens, rerank 50 → 5.**

All figures as stated in the sources (2026); use as interview-scale anchors.

## Tokens & cost `[OS]`
| Item | Number |
|---|---|
| 1 token | ≈ 4 English chars |
| Output vs input price | ~4–5× |
| Reasoning tokens | can be 10×+ visible output |
| Example pricing | $3 / M input, $15 / M output |
| 1k in + 500 out at that pricing | ≈ $0.0105 |
| Prompt caching savings | up to 90% of input cost |
| Batch API discount | ~50% |
| LLM routing savings | 50–70% |
| text-embedding-3-small | $0.02 / M tokens |
| Hi-res image | 1,500–3,000 tokens |
| 1 min audio | ~1,000 tokens |

## Hardware `[OS]`
| Item | Number |
|---|---|
| H100 buy / rent | $25k–40k / ~$2–4 per hr |
| A100 / H100 / H200 memory | 80 / 80 / 141 GB |
| GPU HBM bandwidth | ~3 TB/s |
| LPU SRAM bandwidth / size | ~80 TB/s / ~230 MB per chip |
| SRAM vs HBM speed | ~10–20× faster |
| Llama 70B weights FP16 / 4-bit | 140 GB / 35 GB |
| Large-model cold start | 1–10 min |
| vLLM vs naive | up to 24× throughput |
| H100 on 70B-class (example) | ~5,000 tokens/s |

## Inference `[OS]`
| Item | Number |
|---|---|
| Prefill GPU util | ~90%+ |
| Decode GPU util (single req) | ~20–40% |
| KV cache (Llama-2-like) | 0.5 MB/token → 2 GB @4k, 50 GB @100k |
| KV cache savings (100 tokens) | ~50× fewer computations |
| KV quantization | 2–4× |
| GQA/MQA | 4–8× |
| MLA | 10×+ |
| Speculative decoding | 2–3× faster |
| Flash Attention | 2–4× faster; 64M vs 17M entries moved @4k |
| Mixtral 8x7B | 47B total, ~13B active |
| Reasoning models | 10–100× more tokens/query |

## Latency targets
| Item | Number |
|---|---|
| Ranking p99 `[SDH]` | < 200 ms |
| Rec engine `[SDH]` | < 200 ms |
| Chat TTFT (case) `[OS]` | < 1 s |
| Voice V2V `[OS]` | < 800 ms good; > 1.5 s broken; p95 < 1.2 s |
| Router overhead `[OS]` | < 10% of LLM latency |
| AI gateway overhead `[OS]` | < 10 ms |
| Default LB timeout vs streaming `[OS]` | 30 s → set ~5 min |

## RAG `[OS]`
| Item | Number |
|---|---|
| Default chunk | 500–800 tokens (500 in case) |
| FAQ / long-doc chunk | 200–300 / 1000–1500 |
| Overlap | 10–20% |
| Retrieve → rerank | top 50 → top 5 |
| Semantic cache threshold | 0.85–0.95 |
| HNSW comfort zone | ≤ ~100M vectors in RAM |
| Embedding dims | 768 / 1024 / 1536 / 3072 |
| Parsing share of RAG effort | 60–80% |

## Agents / skills `[OS]`
Skill L1 ≈ 100 tokens; L2 < ~5k tokens; A2A 50+ companies.

Related: [[Back-of-the-Envelope Estimation]] · [[Trade-offs Cheat Sheet]]

## Research-backed numbers `[WEB]`
| Item | Number | Source |
|---|---|---|
| KV memory waste before / after PagedAttention | 60–80% → < 4% | vLLM blog |
| vLLM vs strong baselines | 2–4× throughput | PagedAttention paper |
| Orca continuous batching | 36.9× vs FasterTransformer | OSDI '22 |
| DistServe disaggregation | up to 7.4× more requests / 12.6× tighter SLO | OSDI '24 |
| Single-stream ceiling, 70B FP16 on H100 | ≈ 24 tokens/s | bandwidth ÷ bytes |
| Prompt cache (Anthropic) | read 0.1× · write 1.25× (5 min) · 2× (1 h) | Claude docs |
| Skip RAG threshold | KB < ~200k tokens | Anthropic |
| Contextual retrieval | −49% failures, −67% with rerank | Anthropic |
| RRF constant | k = 60 | Cormack et al. 2009 |
| Sub-agent return size | ~1,000–2,000 tokens | Anthropic |
| LLM-judge vs human agreement | > 80% (≈ human–human) | MT-Bench paper |
| LoRA | ~10,000× fewer params, ~3× less memory | Hu et al. |
| QLoRA | 65B on one 48 GB GPU (vs > 780 GB) | Dettmers et al. |
| GQA uptraining | ~5% of pre-training compute | Ainslie et al. |
| Mixtral 8x7B | 46.7B total / 12.9B active | Mistral |
| DeepSeek-V3 | 671B total / 37B active | DeepSeek |
| FlashAttention-3 | 75–85% H100 utilization | Dao et al. |
| Speculative decoding | 2–3× (T5-XXL) | Leviathan et al. |
| Medusa | 2.2× / 2.3–3.6× | Medusa paper |
Links for all → [[Research Library]].

## Foundations & inference-engineering numbers `[WEB]` `[GEN]`
| Item | Number |
|---|---|
| Training memory | 16 B/param (+ activations) |
| Training FLOPs | 6ND; forward 2N/token |
| Chinchilla | ≈20 tokens/param; 70B on 1.4T beat Gopher-280B |
| H100 ridge point (BF16 dense) | ≈295 FLOP/B |
| Llama-3-8B | 8.03B params; KV 128 KB/token |
| Llama-3-70B | 70.55B params; KV 320 KB/token |
| 8B decode weight-read time on H100 | ≈4.8 ms/step |
| 8B prefill 2k tokens | ≈33 ms ideal, ≈65 ms at 50% MFU |
| AdamW recipe | β=(0.9,0.95), wd 0.1, clip 1.0 |
| All-reduce share of decode (8-way TP) | ≈23% (NVIDIA) |
Details → [[LLM Math Cheat Sheet]] · [[Inference Whiteboard Drills]].
