---
tags: [ai-system-design, inference-engineering, gpu]
aliases: [GPU Architecture, SM, Warp, Tensor Core, HBM, Shared Memory, CUDA Basics, Memory Hierarchy]
---

# GPU Architecture for Inference Engineers

> [!success] 🟢 Junior Explanation
> **In plain words:** A GPU is thousands of tiny workers grouped into teams (**SMs**). Teams run 32 threads in lock-step (**warps**). Data lives in layers of memory: big-and-slow (**HBM**) down to tiny-and-fast (**registers**). Special math units (**tensor cores**) multiply matrix tiles very fast. Fast LLM serving = keep tensor cores fed and **move data as little as possible**.
>
> **Analogy:** A factory: the warehouse (HBM) is huge but far; each work-station (SM) has a small shelf (shared memory) and a tool belt (registers). Walking to the warehouse is the slow part.
>
> **Say it in one sentence:** "Decode is bandwidth-bound on HBM, prefill is bound by tensor-core FLOPs, so I optimize data movement (fusion, tiling, KV layout) and keep SMs busy with batching."
>
> 🎯 **Junior must know:** HBM vs SRAM, GPUs love matrix math. · **Middle adds:** SM/warp/tensor-core model, memory hierarchy numbers, divergence, occupancy, spec comparison.

## 1. Execution model `[WEB]`
- **SM (streaming multiprocessor):** the basic compute unit. H100 SXM has **132 SMs** (full GH100 die: 144; SXM5 enables 132, PCIe 114).
- **Thread → warp → block → grid.** A **warp = 32 threads** scheduled together, executing in lock-step (**SIMT**); **thread blocks** cooperate through **shared memory** and sync.
- **Warp divergence:** threads in a warp taking different branches execute sequentially → slow.
- Hopper SM (H200 example): 128 FP32 cores, 4 tensor cores, 4 warp schedulers, **64K 32-bit registers** (256 KB), unified L1/shared memory.

## 2. Memory hierarchy `[WEB]` `[GEN]`
```
registers  (per thread, fastest, ~256 KB per SM)
   ↓
shared memory / L1  (per SM, programmer-managed scratchpad, ~hundreds of KB)  ~20 cycles
   ↓
L2 cache  (chip-wide, tens of MB: ~50 MB on H100/H200)                        ~200 cycles
   ↓
HBM  (off-chip global memory, 80–141 GB, ~3–5 TB/s)                           ~400 cycles
   ↓
NVLink / PCIe / network (other GPUs, host CPU)
```
Latencies are approximate and vary by chip `[WEB]` (sources disagree on per-SM shared-memory sizes across architectures — check the datasheet). Each tier is ~10× faster but much smaller → **tiling**: load a tile into shared memory once, reuse it many times (this is exactly what [[Flash Attention]] and fast GEMMs do).

## 3. Tensor cores
Specialized units doing **matrix multiply-accumulate on small tiles** (e.g. 16×16) in FP16/BF16/FP8/INT8 (FP4 on Blackwell). They deliver ~10×+ the FLOPs of regular CUDA cores — LLM matmuls must use them (right dtypes, aligned dimensions multiple of 8/16/64) `[WEB]` `[GEN]`.

## 4. Spec comparison (numbers matter in interviews)
| | A100 80GB | **H100 SXM** | H200 |
|---|---|---|---|
| Memory | 80 GB HBM2e | **80 GB HBM3** | 141 GB HBM3e |
| Bandwidth | ~2.0 TB/s | **3.35 TB/s** | 4.8 TB/s |
| BF16/FP16 dense | 312 TFLOPS | **989 TFLOPS** | 989 TFLOPS |
| FP8 dense | — | **1,979 TFLOPS** | 1,979 TFLOPS |
| NVLink | 600 GB/s | **900 GB/s** (bidirectional; 450/dir) | 900 GB/s |
| SMs | 108 | **132** | 132 |
| TDP | 400 W | **700 W** | 700 W |
H100/H200/A100 FP8/FP16 values: H100 `[WEB]` (note: the 1,979/3,958 TFLOPS "headline" numbers include **sparsity**; dense is half); A100 `[GEN]`. H200 = same compute as H100 with more/faster memory → **faster decode, bigger KV cache**.
**Ridge point (BF16 dense, H100):** 989e12 / 3.35e12 ≈ **295 FLOPs per byte** → below that, you're memory-bound → [[Roofline and Performance Modeling]].

## 5. What this means for LLM serving
| Fact | Consequence |
|---|---|
| Decode reads all weights every step | HBM bandwidth sets tokens/s per stream |
| Prefill is big matmuls | Tensor-core FLOPs set TTFT |
| Capacity 80 GB | Weights + KV cache + activations must fit → [[KV Cache]] |
| NVLink ≫ PCIe/network | Keep TP inside a node → [[Parallelism for Inference]] |
| Small decode kernels | Launch overhead matters → [[Kernels, Fusion and CUDA Graphs]] |
| H200 vs H100 | Same FLOPs, +43% memory, +43% bandwidth → ~better decode & concurrency |

## 6. Occupancy & utilization vocabulary
- **Occupancy:** active warps per SM ÷ max; more warps hide memory latency.
- **GPU "utilization" (nvidia-smi)** only says a kernel was running — **not** efficiency. Use **MFU** (FLOPs) and **MBU** (bandwidth) → [[Benchmarking and Profiling Methodology]].

> [!question] Recall
> 1. Define SM, warp, thread block, shared memory.
> 2. Why does tiling into shared memory speed up matmul/attention?
> 3. H100 ridge point — what does it imply about batch size for decode?
> 4. H200 vs H100: which workload benefits and why?

**Sources:** [GPU architecture primer (aman.ai)](https://aman.ai/primers/ai/gpu-architecture/) · [GPU architecture for the programmer (TU Berlin)](https://platform.commit.tu-berlin.de/en/book/sci-python/chapter/ch10/section/s01) · [Modular GPU architecture fundamentals](https://handbook.modular.com/kernel-optimization/gpu-architecture-fundamentals/) · [H100 specs](https://www.spheron.network/blog/nvidia-h100-specs/) · [H100 for LLM inference](https://www.morphllm.com/nvidia-h100) · [Glenn Klockwood H100 notes](https://glennklockwood.com/garden/processors/H100)

Related: [[AI Hardware - GPU TPU LPU]] · [[Flash Attention]] · [[LLM Math Cheat Sheet]]
