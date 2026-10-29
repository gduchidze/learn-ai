---
tags: [ai-system-design, flashcards]
---

# Flashcards

> [!success] 🟢 Junior Explanation
> Review 15 cards a day. Say the answer out loud before revealing it.
#flashcards/ai-system-design

Format `question :: answer` (works with the Obsidian Spaced Repetition plugin).

## Foundations
AI System Design formula :: System Design + the new constraints of AI models (GPUs, tokens, streaming, non-determinism, cost per request)
TTFT :: Time from sending prompt to receiving first token; driven by prefill
TPOT :: Time per output token after the first; driven by decode (50 TPS = 20 ms TPOT)
Why output tokens cost ~4–5× input :: Output is generated sequentially (decode); input processed in parallel (prefill)
Prefill bottleneck :: Compute-bound (GPU ~90%+ busy)
Decode bottleneck :: Memory-bandwidth-bound (must read all weights + KV cache per token; ~20–40% util)
Chunked prefill purpose :: Split long prefill into chunks so other users' decode steps slip in; stops stutter, doesn't speed prefill
Prefill-decode disaggregation :: Separate GPU pools for prefill and decode; KV cache shipped over NVLink/InfiniBand/RDMA
Default inference engine :: vLLM (SGLang for prefix-heavy/RAG/structured; TensorRT-LLM NVIDIA-only; llama.cpp local)
Why LPUs are fast :: Weights in on-chip SRAM (~80 TB/s) vs GPU HBM (~3 TB/s); decode is memory-bound

## Scaling & serving
Tensor vs pipeline parallelism :: Tensor splits each layer's matrices across GPUs (talk inside every layer); pipeline puts different layers on different GPUs
Why warm pools :: Loading a large model takes 1–10 min, so cold starts can't absorb spikes
What to autoscale GPU nodes on :: GPU utilization, inference queue depth, latency percentiles (not CPU)
Why round-robin fails for LLMs :: Requests vary hugely in cost/duration; use least-outstanding-tokens
Prefix-aware routing :: Send requests sharing a long prefix to the same server so its KV cache is warm
Four LLM rate-limit dimensions :: TPM, RPM, concurrent requests, cost-based caps
Denial-of-wallet defense :: Token/cost-aware rate limiting and quotas
Circuit breaker states :: Closed (normal), Open (block, fallback), Half-open (test recovery)
SSE vs WebSocket :: SSE server→client over HTTP (chat); WebSocket two-way (cancel/mid-stream input)
Kafka vs SQS :: Kafka when many consumers read same stream; SQS/RabbitMQ when one worker per message

## Caching & routing
Four AI caches :: KV cache, prompt cache, semantic cache, embedding cache
Why cache K and V but not Q :: Q only needed for current token; past K,V needed every future step
KV cache per token (Llama-2-like) :: 2 × 32 layers × 32 heads × 128 dim × 2 bytes = 0.5 MB
PagedAttention :: Allocate KV cache in small fixed pages on demand with a page table instead of big upfront blocks
Prompt cache ordering rule :: Fixed content (system prompt, tools, docs) first; changing content (user msg) last
Semantic cache threshold :: ~0.85–0.95; too low returns wrong answers, too high gets no hits
Embedding cache key :: Text hash + embedding model name + version
Cascade routing :: Try cheapest model; escalate only if low confidence; cheapest on average
LLM routing vs MoE :: Routing picks one full LLM per query outside the model; MoE picks experts per token inside

## RAG
RAG = :: Retrieval + Augmented + Generation
RAG vs fine-tuning :: RAG adds knowledge; fine-tuning changes behavior
Share of RAG effort on parsing :: 60–80%
Default chunk size & overlap :: 500–800 tokens, 10–20% overlap
Contextual retrieval :: LLM prepends a note explaining where the chunk comes from before embedding/BM25
Hybrid search :: Vector + BM25, merged with Reciprocal Rank Fusion (rank-based)
HyDE :: Generate a fake answer and search with its embedding (answers look like answers)
Reranking funnel :: Retrieve top 50 cheaply → cross-encoder rerank → top 5
Bi-encoder vs cross-encoder :: Separate encodings (fast, shallow) vs question+chunk together (slow, accurate)
ColBERT :: One vector per token, MaxSim late interaction; accurate & fast but ~100× storage
Default vector index :: HNSW (fits in RAM, ≤ ~100M vectors); IVF+PQ memory-tight; DiskANN on SSD; ScaNN billions
GraphRAG strength :: Multi-hop and relationship questions; cost = expensive LLM extraction at indexing
Vectorless RAG :: LLM navigates a TOC tree of the document (tree search); explainable, handles negation/codes
Lost in the middle :: Models use start & end of context best; U-shaped accuracy curve

## Agents
AI Agent = :: LLM + Instructions + Tools + Memory + Loop
Who executes a tool call :: Our code (harness); the LLM only returns name + args
Most important tool-definition field :: Description (decides when the tool is used)
Five agent failure modes :: Infinite loops, wrong tool, hallucinated actions, context overflow, premature stopping
Loop engineering knobs :: Goal, step budget, tools, observation, memory, failure feedback
Memory layers :: Context window, short-term, long-term, external knowledge
Memory operations :: Write, Read, Update, Forget
What to store in long-term memory :: What will matter next week (stable facts, strong prefs, outcomes, decisions)
Plan-and-Execute vs ReAct :: Full plan upfront then execute vs decide one step at a time
Orchestration vs agent :: Developer controls flow vs LLM controls flow
Why SubAgents :: Fresh context, focus, reusability, parallel work
MCP :: Universal standard connecting AI apps to tools/data ("USB-C for AI"); client ↔ server
A2A :: Open standard for agent-to-agent communication across vendors; Agent Card + JSON-RPC over HTTP
Agent Skills progressive disclosure :: L1 name+description (~100 tokens), L2 SKILL.md on match, L3 extra files if needed

## Safety, quality, ops
Prompt injection root cause :: LLM reads instructions and data in the same stream
Indirect prompt injection :: Malicious instructions hidden in data the agent reads (web, email, PDF, tool output)
Code gate :: Hard rule enforced in code, e.g. refund > $50 denied regardless of model request
Dual LLM pattern :: Privileged model (tools, no untrusted text) + quarantined model (reads untrusted text, no tools)
PII redaction steps :: Detect (regex + NER) → replace with placeholders → restore if needed; also on output
BAA :: Business Associate Agreement — required to send PHI under HIPAA
Span vs trace :: Span = one step; trace = full run made of nested spans
Four LLM-judge biases :: Position, verbosity, style, self-preference
Most important agent metric :: Task Success Rate
Canary vs shadow :: Canary serves small % of real users; shadow runs on real traffic without affecting users
Training–serving skew fix :: Unified feature store

## Model optimization
Quantization 70B :: 140 GB @16-bit → 35 GB @4-bit (fits one A100)
Why quantization speeds decode :: Fewer bytes to stream from memory per token
Continuous batching :: Fill a finished request's slot immediately with a waiting request
Speculative decoding speedup :: 2–3×, exact quality via rejection sampling; best at low/medium batch
N-gram speculation best for :: Copy-heavy tasks (code editing, summarization, RAG)
Flash Attention trick :: Tiling in SRAM + online softmax; never write N×N matrix to HBM; 2–4× faster, exact
GQA :: Groups of heads share K and V → much smaller KV cache, near-MHA quality
MoE memory vs compute :: Memory for total params; compute for active params (Mixtral 47B / 13B)
LoRA :: Freeze base weights, train small adapters (<1% size), swap per task
Distillation vs quantization :: New smaller student model vs same model at lower precision
Test-time compute patterns :: Sequential, parallel (best-of/vote), hybrid

## Research-backed (web)
PagedAttention memory waste before vs after :: Existing systems wasted 60–80% of KV-cache memory; vLLM under 4%
vLLM paper throughput gain :: 2–4× vs FasterTransformer/Orca at same latency (bigger vs naive HF serving)
Orca contribution :: Iteration-level scheduling (continuous batching); 36.9× vs FasterTransformer on GPT-3 175B
Goodput :: Max request rate served while meeting latency SLOs per GPU (DistServe)
Single-stream decode ceiling :: Memory bandwidth ÷ model bytes; 70B FP16 on 3.35 TB/s ≈ 24 tokens/s
Anthropic prompt caching prices :: Cache read 0.1×, 5-min write 1.25×, 1-hour write 2× of base input price
When to skip RAG (Anthropic) :: Knowledge base under ~200k tokens → put it all in the prompt with caching
Contextual retrieval results :: −49% retrieval failures; −67% with reranking (5.7% → 1.9%)
RRF formula :: Sum over lists of 1/(k + rank), k = 60
Lost in the Middle venue & tasks :: TACL 2023; multi-document QA and key-value retrieval
Context Rot study :: Chroma, July 2025, 18 models degrade as input grows
Sub-agent summary size (Anthropic) :: Explore with tens of thousands of tokens, return ~1,000–2,000 tokens
Workflow vs agent (Anthropic) :: Workflow = predefined code paths; agent = LLM directs its own process and tools
Five workflow patterns :: Prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer
Orchestrator-workers vs parallelization :: Orchestrator decides subtasks from input; parallelization subtasks are predefined
CoALA memory types :: Working, episodic, semantic, procedural
MemGPT idea :: Context window as RAM, external storage as disk, LLM pages via function calls
MCP server primitives :: Tools, Resources, Prompts
MCP transports :: stdio (local) and Streamable HTTP (replaced HTTP+SSE in 2025-03-26 spec)
Agentic AI Foundation :: Linux Foundation, Dec 9 2025: MCP, goose, AGENTS.md
Lethal trifecta :: Private data + untrusted content + external communication
OWASP LLM01 / LLM06 / LLM10 :: Prompt injection / Excessive agency / Unbounded consumption
CaMeL :: Untrusted data can never change control flow; capability-tagged values + policy-checked tool calls
LLM-as-judge agreement :: GPT-4 >80% agreement with humans, about human–human level
Faithfulness metric :: Supported claims ÷ total claims in the answer
LoRA numbers :: ~10,000× fewer trainable params, ~3× less GPU memory, no inference latency
QLoRA :: NF4 + double quantization + paged optimizers; 65B on one 48 GB GPU
GQA uptraining cost :: ~5% of original pre-training compute
Mixtral 8x7B :: 46.7B total, 12.9B active per token, top-2 of 8 experts
Switch Transformer load balancing :: Auxiliary loss + expert capacity factor; overflow tokens dropped (<1%)
Speculative decoding paper :: Leviathan et al., ICML 2023: 2–3× on T5-XXL, identical outputs
OTel token attributes :: gen_ai.usage.input_tokens and gen_ai.usage.output_tokens

## ML foundations & LLM internals
Softmax+CE gradient wrt logits :: p − y (predicted probability minus one-hot target)
Perplexity :: exp(average cross-entropy in nats); random over 50k vocab ≈ 10.8 nats CE
Training FLOPs rule :: C ≈ 6ND (forward 2N + backward 4N per token)
Forward FLOPs per token :: ≈ 2N (ignores attention-score cost)
Chinchilla ratio :: ≈ 20 tokens per parameter; N = sqrt(C/120)
Why over-train small models :: Inference dominates lifetime cost; smaller N is cheaper to serve (Llama-3-8B ≈ 1,900 tokens/param)
Training bytes per parameter :: 16 (2 weights + 2 grads + 4 fp32 master + 4 m + 4 v)
ZeRO-1 / 2 / 3 per-GPU :: 4Ψ+12Ψ/N · 2Ψ+14Ψ/N · 16Ψ/N
Tensor parallel all-reduces :: ≈2 per layer (attention out-proj + MLP down-proj, row-parallel)
Pipeline bubble fraction :: (p−1)/(m+p−1)
AdamW LLM recipe :: β1=0.9, β2=0.95, weight decay 0.1, grad clip 1.0, warmup + cosine/WSD
bf16 vs fp16 :: bf16 has fp32's exponent range (no loss scaling), fewer mantissa bits
RMSNorm vs LayerNorm :: RMSNorm drops mean-centering and bias; cheaper
Pre-norm vs post-norm :: Pre-norm keeps clean residual path; stabler deep training
SwiGLU FFN :: down(silu(gate x) ⊙ up x); 3 matrices, hidden ≈ 8/3·d for equal params
Llama-3-8B parameter count :: Attention 41.9M + FFN 176.2M per layer ×32 + 1.05B embeddings (untied) ≈ 8.03B
KV bytes per token :: 2·L·h_kv·d_h·bytes (Llama-3-8B 128 KB; 70B 320 KB)
RoPE in one line :: Rotate Q/K dim-pairs by position-dependent angles so q·k depends only on relative distance
ALiBi in one line :: Add linear distance penalty −m|i−j| to attention logits
YaRN :: RoPE context extension needing ~10× fewer tokens, 2.5× fewer steps
Why models fail beyond trained context :: Unseen RoPE angles make attention scores out-of-distribution
BPE :: Merge most frequent adjacent pairs repeatedly until target vocab; byte-level BPE has no unknown tokens
Vocab size trade-off :: Bigger vocab shortens sequences but enlarges embedding/LM head
DPO loss :: −log σ(β[log π(yw)/πref(yw) − log π(yl)/πref(yl)])
Why DPO skips reward model :: Optimal policy gives r = β log(π/πref)+β log Z; Z cancels in Bradley–Terry
RLHF KL term purpose :: Prevents reward hacking / drift from reference model
Top-p sampling :: Keep smallest token set with cumulative probability ≥ p, renormalize, sample
Why T=0 outputs vary :: Float non-associativity and batch-dependent kernels flip near-ties
Speculative decode expected tokens :: (1−α^{k+1})/(1−α); speedup ≈ that ÷ (1+k·c)

## Inference engineering
H100 SXM key specs :: 80 GB HBM3, 3.35 TB/s, 989 TFLOPS BF16 dense, 1,979 FP8 dense, NVLink 900 GB/s bidirectional, 132 SMs
H100 ridge point (BF16 dense) :: ≈295 FLOP/byte (the ~591 figure uses sparse FLOPS)
Decode arithmetic intensity :: ≈2B/bytes-per-param ≈ B FLOP/byte for BF16
Single-stream decode ceiling :: bandwidth ÷ (params × bytes); 70B BF16 on H100 ≈ 24 tok/s
Why KV doesn't batch :: Each sequence reads its own KV; attention intensity stays ~O(1) regardless of batch
MBU vs MFU :: Bandwidth utilization (decode) vs FLOPs utilization (prefill/training)
Warp :: 32 threads executing in lock-step (SIMT) on an SM
Shared memory purpose :: Programmer-managed on-chip scratchpad for tiling/reuse
Fusion vs CUDA graphs :: Fusion cuts HBM round-trips; graphs cut CPU launch overhead
Flash-Decoding :: Split KV into chunks, parallel partial attention, merge with log-sum-exp (up to ~8× at long ctx)
vLLM CUDA graphs :: Captured per batch-size bucket at startup; replay matching graph
Prefix cache key :: hash(block tokens + parent block hash); full-block, same-position matches only
Preemption options :: Swap KV to CPU or drop and recompute later
Chunked prefill :: Prefill follows a per-step token budget so decodes keep streaming
TP all-reduce in decode :: Tiny messages → latency-bound; ~23% of decode at 8-way TP (NVIDIA)
Serve 70B on 4×A100-80GB :: TP=4 BF16 (35 GB/GPU) or FP8 with 2×TP=2; TP=2 BF16 leaves ~2 GB for KV
MoE touched experts :: E[1−(1−k/E)^B]; Mixtral B=8 → 7.2 of 8
EP communication :: All-to-all dispatch and combine per MoE layer
FP8 formats :: E4M3 max 448 (forward), E5M2 max 57,344 (gradients)
MXFP4 vs NVFP4 :: Block 32 + E8M0 scale vs block 16 + FP8 scale + FP32 tensor scale
Open vs closed loop benchmarking :: Closed loop hides queueing (coordination omission); use open-loop Poisson
Goodput :: Request rate meeting latency SLO per GPU
$/M tokens :: ($/GPU-hr) ÷ (tok/s × 3600) × 1e6; 3$/hr, 5k tok/s → $0.167 at 100% util
Little's law :: In-flight = arrival rate × time in system (sizes KV memory)
Prefill GPU need (70B) :: ≈3.5k tok/s/H100 BF16 at 50% MFU (≈7k FP8) — inputs can dominate fleet size
MLA result (DeepSeek-V2) :: −93.3% KV cache vs 67B, 5.76× max generation throughput
