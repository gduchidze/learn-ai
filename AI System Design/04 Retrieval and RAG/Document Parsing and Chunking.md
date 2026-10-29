---
tags: [ai-system-design, rag]
aliases: [Chunking, Chunking Strategies, Document Parsing, Contextual Retrieval, OCR]
---

# Document Parsing and Chunking

> [!success] 🟢 Junior Explanation
> **In plain words:** Turn messy PDFs, scans and tables into clean text, then cut it into pieces (chunks) that can be searched.
>
> **Analogy:** Cutting a textbook into index cards — if the pages were torn or scrambled, the cards are useless.
>
> **Why interviewers ask:** Bad text in = bad answers out; this is 60–80% of real RAG work.
>
> **Say it in one sentence:** "Clean, layout-aware parsing plus well-sized overlapping chunks is the foundation of good retrieval."
>
> 🎯 **Junior must know:** default chunk size (500–800 tokens) and 10–20% overlap. · **Middle adds:** OCR, table extraction, metadata, chunking strategies, contextual retrieval.

## Document parsing — the skipped part `[OS]`
Real data = PDFs, scanned images, slides, web pages, spreadsheets, DOCX, emails. Messy text in → no retrieval trick can save you.

> [!important] **60–80% of engineering effort** in real RAG projects goes into this step `[OS]`.

Pipeline `[OS]`:
1. **Format detection** (PDF, image, HTML, DOCX, audio…)
2. **Layout-aware parsing** — headings, lists, columns, reading order (naively flattened 2-column PDF = nonsense)
3. **OCR** for scans — preprocessing (deskew, denoise) matters as much as the engine
4. **Table extraction** — hardest part; keep cells/headers (emit HTML or row/column model). Tables often hold the most valuable data.
5. **Images/figures** — caption, vision-model describe charts, store in blob storage, link from chunk
6. **Metadata enrichment** — title, author, date, URL, page, section → later **retrieval filters**

**Confidence-based routing**: high → straight through; medium → spot check; low → manual review.
Tools: Unstructured, LlamaParse, Mistral OCR, Nemotron Doc Pipeline, AWS Textract, Azure Document Intelligence.

Data cleaning also: drop deprecated docs, strip HTML/ads/nav, normalize headings, remove PII ([[Case - Customer Support Chatbot]]) `[OS]`. Text tokenization is essential for text data `[SDH]`.

## Chunking `[OS]`
Too big → noise for LLM. Too small → lost context, chunks meaningless alone.

| Strategy | Notes |
|---|---|
| Fixed-size (e.g. 500 tokens) | Simple; breaks sentences |
| Sentence-based | Natural boundaries |
| Recursive | Paragraph → sentence → word |
| Semantic | Embeddings detect topic shifts; best quality, slowest |
| Document-structure | Code → function boundaries; Markdown → headings |

**Overlap**: repeat last lines of one chunk at start of next; **10–20%** of chunk size (500 → 50–100 tokens).

### Sizing by answer type `[OS]`
| Content | Size |
|---|---|
| Short factual (FAQ, catalog) | 200–300 tokens |
| Explanations/procedures (policies, docs) — **safe default** | 500–800 |
| Long reasoning (papers, contracts, transcripts) | 1000–1500 |
Start with default; **tune with evals** on your data.

## Contextual Retrieval `[OS]`
Chunk "Revenue grew by 3% over the previous quarter" — which company? which quarter? Fix: before storing, an LLM writes a short note on where the chunk comes from; prepend it **before computing embedding and BM25 index**.

## 🌐 Deeper Context `[WEB]`

**Contextual Retrieval in numbers (Anthropic, Sept 2024):**

| Setup | Top-20 retrieval failure rate | Change |
|---|---|---|
| Standard embeddings + BM25 baseline | 5.7% | — |
| **Contextual embeddings + contextual BM25** | 2.9% | **−49%** |
| + **reranking** | 1.9% | **−67%** |

- How: an LLM writes a short context (typically ~50–100 tokens) for each chunk ("This chunk is from ACME's Q2 2023 10-K; previous quarter revenue was…"), which is **prepended before embedding and before building the BM25 index**.
- Cost: with prompt caching (the whole document is the cached prefix), the one-time cost was estimated at about **$1.02 per million document tokens**.
- Read the numbers correctly: −67% is a **relative** drop in failures, not "+67% accuracy".

> [!tip] Interview line
> "I'd prepend an LLM-generated context sentence to each chunk before embedding and BM25 indexing — Anthropic measured a 49% drop in retrieval failures, 67% with a reranker."

**Sources:** [Contextual Retrieval coverage](https://getcoai.com/news/anthropic-introduces-contextual-retrieval-to-boost-accuracy-of-rag-systems) · [DataCamp walkthrough](https://www.datacamp.com/ko/tutorial/contextual-retrieval-anthropic) · [A critical take](https://medium.com/almond-ai/responding-to-anthropics-contextual-retrieval-for-rag-apps-why-context-is-not-all-you-need-af503985aa55)


> [!question] Recall
> 1. List 6 parsing pipeline stages. Which is hardest?
> 2. Chunk size + strategy for: legal contracts; FAQ; Python codebase.
> 3. What problem does contextual retrieval fix?

Related: [[RAG Fundamentals]] · [[Embeddings Pipeline]] · [[Agentic RAG, GraphRAG, Vectorless RAG]]
