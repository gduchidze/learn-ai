---
tags: [ai-system-design, research, meta]
aliases: [Papers, Further Reading, Reading List]
---

# Research Library `[WEB]`

> [!success] 🟢 Junior Explanation
> You **don't** need to read these papers. Learn the **one-line takeaway** and the **name** — saying *"PagedAttention, the vLLM paper"* or *"Lost in the Middle"* in an interview shows you know where ideas come from. Read the ⭐ items if you have time.

## LLM serving & inference
| Paper / article | Year | One-line takeaway | Note |
|---|---|---|---|
| ⭐ [Attention Is All You Need](https://arxiv.org/abs/1706.03762) | 2017 | Transformer + scaled dot-product attention | [[Attention]] |
| ⭐ [PagedAttention / vLLM](https://arxiv.org/abs/2309.06180) | 2023 | KV cache in pages: waste 60–80% → <4%; 2–4× throughput | [[KV Cache]] |
| [Orca](https://www.usenix.org/conference/osdi22/presentation/yu) | 2022 | Iteration-level scheduling = continuous batching | [[Continuous Batching]] |
| [DistServe](https://arxiv.org/pdf/2401.09670) | 2024 | Disaggregate prefill/decode; optimize **goodput** | [[Prefill vs Decode]] |
| [SGLang / RadixAttention](https://lmsys.org/blog/2024-01-17-sglang) | 2024 | Prefix tree KV reuse across requests | [[Prompt Cache]] |
| [FlashAttention-3](https://tridao.me/blog/2024/flash3/) | 2024 | 75–85% H100 utilization via asynchrony + FP8 | [[Flash Attention]] |
| ⭐ [Speculative Decoding](https://arxiv.org/abs/2211.17192) | 2022/23 | Draft + verify: 2–3×, identical outputs | [[Speculative Decoding]] |
| [GQA](https://arxiv.org/abs/2305.13245) | 2023 | Shared K/V heads; uptrain with ~5% compute | [[Grouped Query Attention]] |
| [Switch Transformers](https://arxiv.org/abs/2101.03961) | 2021 | MoE load-balancing loss, capacity factor | [[Mixture of Experts]] |
| [Mixtral of Experts](https://mistral.ai/news/mixtral-of-experts/) | 2023 | 46.7B total / 12.9B active, top-2 of 8 | [[Mixture of Experts]] |
| [DeepSeek-V3](https://github.com/deepseek-ai/deepseek-v3) | 2024 | 671B / 37B active, aux-loss-free balancing | [[Mixture of Experts]] |

## Training & compression
| Paper | Year | Takeaway | Note |
|---|---|---|---|
| ⭐ [LoRA](https://arxiv.org/abs/2106.09685) | 2021 | 10,000× fewer trainable params, 3× less memory | [[Fine-Tuning and LoRA]] |
| ⭐ [QLoRA](https://arxiv.org/abs/2305.14314) | 2023 | 65B fine-tune on one 48 GB GPU (NF4) | [[Quantization]] |
| GPTQ · AWQ · SmoothQuant ([overview](https://www.generalcompute.com/blog/quantization-for-inference-gptq-awq-smoothquant-fp8)) | 2022–23 | Weight-only 4-bit vs W8A8 outlier smoothing | [[Quantization]] |
| [RouteLLM](https://arxiv.org/abs/2406.18665) | 2024 | Learned routers: >2× cost cut in some cases | [[LLM Routing]] |

## Retrieval & context
| Paper / article | Year | Takeaway | Note |
|---|---|---|---|
| ⭐ [RAG (Lewis et al.)](https://arxiv.org/abs/2005.11401) | 2020 | Parametric + non-parametric memory | [[RAG Fundamentals]] |
| [HNSW](https://arxiv.org/abs/1603.09320) | 2016 | Layered graph ANN search | [[Vector Databases and Indexes]] |
| ⭐ [Contextual Retrieval (Anthropic)](https://www.anthropic.com/news/contextual-retrieval) | 2024 | −49% failures; −67% with reranking | [[Document Parsing and Chunking]] |
| [Reciprocal Rank Fusion](https://bigdataboutique.com/blog/reciprocal-rank-fusion-how-it-works-and-when-to-use-it) | 2009 | Σ 1/(60 + rank) | [[Hybrid Search, HyDE, Reranking, ColBERT]] |
| ⭐ [Lost in the Middle](https://arxiv.org/abs/2307.03172) | 2023 | U-shaped accuracy over position | [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]] |
| [Context Rot (Chroma)](https://research.trychroma.com/context-rot) | 2025 | 18 models degrade as input grows | [[Context Window Limits - Context Rot, Lost in the Middle, RoPE]] |
| ⭐ [Effective context engineering (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | 2025 | Attention budget, compaction, notes, sub-agents | [[Context Engineering]] |

## Agents
| Paper / article | Year | Takeaway | Note |
|---|---|---|---|
| ⭐ [Building effective agents (Anthropic)](https://www.anthropic.com/engineering/building-effective-agents) | 2024 | Workflows vs agents; 5 patterns | [[Agentic Workflow Patterns]] |
| [ReAct](https://openreview.net/pdf/d49877b783d60e3cf6fdb22185a1a37de0ced704.pdf) | 2023 | Reason + act loop | [[Agent Loop]] |
| [Reflexion](https://arxiv.org/abs/2303.11366) | 2023 | Verbal self-reflection as memory | [[Agent Memory]] |
| [CoALA](https://arxiv.org/abs/2309.02427) | 2023 | Working / episodic / semantic / procedural memory | [[Agent Memory]] |
| [MemGPT](https://arxiv.org/abs/2310.08560) | 2023 | Context window as RAM, storage as disk | [[Agent Memory]] |
| [MCP docs](https://modelcontextprotocol.io/docs/2025-11-25/learn/architecture) | 2024– | Tools / Resources / Prompts over JSON-RPC | [[MCP, A2A and Agent Skills]] |
| [Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) | 2025 | MCP + goose + AGENTS.md under Linux Foundation | [[MCP, A2A and Agent Skills]] |

## ML foundations & training
| Paper / article | Year | Takeaway | Note |
|---|---|---|---|
| ⭐ [Chinchilla notes](https://theorempath.com/papers/chinchilla) / [Reconciling Kaplan & Chinchilla](https://arxiv.org/pdf/2406.12907) | 2022/24 | ~20 tokens/param; 6ND | [[Pretraining - Scaling Laws and Compute Math]] |
| ⭐ [ZeRO](https://arxiv.org/pdf/1910.02054) | 2019 | 16 B/param; shard optimizer/grad/params | [[Distributed Training - Memory, ZeRO and Parallelism]] |
| [Megatron TP overview](https://www.zeroentropy.dev/concepts/tensor-parallelism/) | 2019 | Column then row parallel; all-reduce per block | [[Parallelism for Inference]] |
| [YaRN](https://arxiv.org/html/2309.00071v3) | 2023 | Extend RoPE context with 10× fewer tokens | [[Positional Encodings - RoPE, ALiBi and Long Context]] |
| [RoFormer / RoPE vs ALiBi](https://metricgate.com/blogs/rope-vs-alibi-positional-encoding/) | 2021 | Rotary vs linear bias | [[Positional Encodings - RoPE, ALiBi and Long Context]] |
| ⭐ [DPO explained](https://www.zeroentropy.dev/concepts/dpo/) | 2023 | Reward = β·log(π/π_ref); no RL loop | [[Post-Training - SFT, RLHF and DPO]] |
| [DeepSeek-V2 (MLA)](https://arxiv.org/pdf/2405.04434) | 2024 | −93.3% KV cache, 5.76× throughput vs 67B | [[Long Context and KV Cache Engineering]] |
| [LLaMA architecture primer](https://aman.ai/primers/ai/LLaMA/) | — | RMSNorm, SwiGLU, RoPE, GQA | [[Transformer Architecture Deep Dive]] |

## Inference engineering
| Paper / article | Year | Takeaway | Note |
|---|---|---|---|
| [GPU architecture primer](https://aman.ai/primers/ai/gpu-architecture/) | — | SM, warp, memory hierarchy | [[GPU Architecture for Inference Engineers]] |
| [Flash-Decoding](https://crfm.stanford.edu/2023/10/12/flashdecoding.html) | 2023 | Split-KV parallel decode attention | [[Kernels, Fusion and CUDA Graphs]] |
| [CUDA graphs in LLM inference](https://www.morphllm.com/cuda-graphs) / [vLLM torch.compile](https://vllm.ai/blog/2025-08-20-torch-compile) | 2025 | Fusion vs graphs | [[Kernels, Fusion and CUDA Graphs]] |
| [NVIDIA: low-latency all-reduce for inference](https://developer.nvidia.com/blog/optimizing-for-low-latency-communication-in-inference-workloads-with-jax-and-xla) | — | All-reduce ≈23% of decode at 8-way TP | [[Parallelism for Inference]] |
| [Transformer Engine FP8/FP4](https://docs.nvidia.com/deeplearning/transformer-engine/examples/fp8_primer.html) | — | E4M3/E5M2, NVFP4/MXFP4 | [[Low-Precision Inference]] |
| [AI inference interview prep 2026](https://www.techinterview.org/post/3233475331/ai-inference-infrastructure-interview-prep-2026-vllm-triton/) | 2026 | Typical question types | [[Inference Engineer Interview Q&A]] |

## Production case studies
| Article | Year | Takeaway | Note |
|---|---|---|---|
| ⭐ [Anthropic multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) | 2025 | Orchestrator + parallel sub-agents: +90.2% on internal eval, ~15× tokens | [[Case - Multi-Agent Research Assistant]] |
| [Vespa × Perplexity](https://vespa.ai/case-studies/perplexity/) | — | One engine for keyword + semantic search, filtering, ranking | [[Case - Perplexity-Style AI Search Engine]] |
| ⭐ [DoorDash support automation](https://careersatdoordash.com/?p=12568) | 2024 | RAG + online LLM guardrail + LLM judge | [[Case - Customer Support Chatbot]] |
| [LinkedIn GenAI lessons](https://thenewstack.io/5-lessons-from-linkedins-first-foray-into-genai-development/) | 2024 | 80% in 1 month, 95% took 4 more | [[Case - LLM Evaluation and Monitoring Pipeline]] |
| [Stripe Radar ML primer](https://stripe.com/au/blog/a-primer-on-machine-learning-for-fraud-detection) | — | Network-wide signals, bank-provided labels | [[Case - Real-Time Fraud Detection]] |
| [Apple Foundation Models 2025](https://machinelearning.apple.com/research/apple-foundation-models-tech-report-2025) | 2025 | ~3B on-device, 2-bit QAT, KV sharing −37.5% memory | [[Case - On-Device AI Assistant]] |

## Safety & evaluation
| Paper / article | Year | Takeaway | Note |
|---|---|---|---|
| ⭐ [OWASP Top 10 for LLM 2025](https://genai.owasp.org/2024/11/17/owasp-reveals-updated-2025-top-10-risks-for-llms-announces-new-llm-project-sponsorship-program-and-inaugural-sponsors/) | 2024 | Prompt injection #1; excessive agency; unbounded consumption | [[Prompt Injection]] |
| [Lethal trifecta](https://www.hiddenlayer.com/research/the-lethal-trifecta-and-how-to-defend-against-it) | 2025 | Private data + untrusted content + exfiltration | [[Prompt Injection]] |
| [CaMeL](https://simonwillison.net/2025/Apr/11/camel/) | 2025 | Untrusted data can't change control flow | [[Prompt Injection]] |
| ⭐ [LLM-as-a-Judge (MT-Bench)](https://arxiv.org/abs/2306.05685) | 2023 | GPT-4 judge >80% human agreement; biases | [[Evaluation - LLM and Agent]] |
| [Ragas metrics](https://docs.ragas.io/en/v0.1.21/concepts/metrics/) | — | Faithfulness, relevancy, context precision/recall | [[Evaluation - LLM and Agent]] |
| [OpenTelemetry GenAI](https://opentelemetry.io/blog/2026/genai-observability/) | 2026 | Standard `gen_ai.*` span attributes | [[Observability]] |
| [Turn-taking universals (Stivers et al.)](https://www.pnas.org/doi/10.1073/pnas.0903616106) | 2009 | Humans minimize gaps in every language | [[Voice AI Agents]] |
