---
tags: [ai-system-design, rag, agents]
aliases: [Agentic RAG, GraphRAG, Vectorless RAG, Self-RAG, Corrective RAG, CRAG]
---

# Agentic RAG, GraphRAG, Vectorless RAG

> [!success] 🟢 Junior Explanation
> **In plain words:** Advanced RAG types for questions where one simple search isn't enough.
>
> **Analogy:** Standard RAG = librarian fetching one book; Agentic RAG = researcher who searches again and again; GraphRAG = detective with a board of connections; Vectorless RAG = reader using the table of contents.
>
> **Why interviewers ask:** Shows you know when simple RAG fails and what to do.
>
> **Say it in one sentence:** "For multi-hop or messy questions I use agentic RAG; for relationship questions GraphRAG; for long structured documents vectorless tree search — only when standard RAG isn't enough."
>
> 🎯 **Junior must know:** the failure cases of standard RAG. · **Middle adds:** trade-off tables for each variant.

## Agentic RAG `[OS]`
### When standard RAG fails
- **Multi-hop**: "Q4 revenue of the company that acquired Acme in 2023?"
- **Ambiguous**: "What about the new policy?"
- **Multiple sources**: SQL vs vector store vs live web
- **Bad retrieval**: irrelevant chunks passed silently to the LLM

**Agentic RAG = RAG + an AI Agent controlling retrieval steps.** Replace librarian with **researcher**. Agent decides: need retrieval? which tool/source? what query? chunks good enough? retrieve again? combine sources? when to stop?
```
Question -> Agent (think) -> Retrieval tool (vector/SQL/web/graph) -> chunks
         -> Agent evaluates "good enough?" -- No -> new query, retrieve again
                                            -- Yes -> final answer
```
Patterns: **ReAct-style RAG** (think-act-observe), **Self-RAG** (grades own retrievals), **Corrective RAG / CRAG** (fallback source when main retrieval is bad).

| | Standard RAG | Agentic RAG |
|---|---|---|
| Flow | Fixed pipeline | Dynamic loop |
| Retrievals | One | Many |
| Tools | One (vector) | Many |
| Query rewriting | No | Yes |
| Chunk quality check | No | Yes |
| Multi-hop | No | Yes |
| Latency / cost | Low | Higher |
| Build complexity | Simple | Complex |
Use **only when standard RAG can't do the job** `[OS]`.

## GraphRAG `[OS]`
Vector RAG struggles when the answer needs **connecting facts across chunks**.
**GraphRAG = Knowledge Graph + RAG** — retrieve **relationships**, not just chunks.
- **Indexing**: LLM extracts **entities** + **relationships** from every doc → graph DB (Neo4j, Memgraph) + text chunks; optionally **communities + community summaries**.
- **Query**: extract entities from question → traverse graph (entities, paths, summaries) → pass to LLM with chunks.
```
Jane Doe -is_CEO_of-> Globex -acquires(2023)-> Acme
                      Globex -has_report-> Q4 2023 revenue
Answer path: Acme <-acquires- Globex -has_report-> Q4 2023 revenue
```
Better at: multi-hop, holistic summaries ("main themes?"), entity-centric queries.
Trade-off: **expensive indexing** (LLM extraction per doc), hard incremental updates → use when relationships matter and data is fairly stable.
Tools: Microsoft GraphRAG, LlamaIndex KG Index, Neo4j LLM Graph Builder.
Vector RAG = "find chunk about X"; GraphRAG = "how are X, Y, Z connected". Often used together.

## Vectorless RAG `[OS]`
Vector RAG problems: chunking breaks meaning (coverage in one chunk, waiting-period exclusion in another); similar ≠ correct ("does **not** cover" barely moves vectors); exact codes (Clause 14.2.b vs 14.3.b) look alike; can't explain picks.
**Vectorless RAG**: no embeddings/vector DB. LLM navigates **document structure** like a human using a table of contents.
1. **Prepare**: build a tree (TOC) — each node: title, 1–2 line summary, location of real text. No cutting.
2. **Answer**: show top level → LLM picks chapters → open → repeat (**tree search**) → send full sections to LLM → answer **with section number**.

| Vector RAG | Vectorless RAG |
|---|---|
| Embedding model + vector DB | Neither |
| Fixed-size chunks | Whole docs, section by section |
| Distance between numbers | LLM reads titles/summaries |
| No reasoning in search | Reasoning each step |
| Very fast, cheap | Slower, costlier (several LLM calls) |
| Hard to explain | Explainable |
| Scales to millions of docs | Best on long, well-structured docs |
| Weak on codes/numbers/negation | Strong on them |

Vector → huge numbers of short docs (help center w/ 1M articles). Vectorless → long structured docs where wrong answers are expensive (insurance, legal, annual reports, manuals). **Combine**: cheap search narrows millions → 20, tree search finds exact section.

> [!question] Recall
> 1. Four failure cases of standard RAG.
> 2. When GraphRAG over vector RAG? Its main cost?
> 3. Design retrieval for 300-page insurance policies with negation-heavy clauses.

Related: [[RAG Fundamentals]] · [[Agent Loop]] · [[Hybrid Search, HyDE, Reranking, ColBERT]]
