# Index Decisions

## Overview

This document records the rationale behind each index designed during the ESR Indexing Strategy lab.

## Index Decisions

### query1-status `{ status: 1 }`

**Rationale:** Query 1 filters only by `status` with an exact equality match. A single-field index on `status` is sufficient to support this query. No sort or range field is needed.

**Trade-offs:** This index has low selectivity since there are only three distinct status values (active, archived, draft). For very large collections this may still require scanning many documents. A more selective equality field would give better performance.

### query2-category-createdAt `{ category: 1, createdAt: -1 }`

**Rationale:** Query 2 has an equality filter on `category` and sorts by `createdAt` descending. Following ESR, `category` (Equality) comes first, then `createdAt` (Sort). This allows MongoDB to use the index for both filtering and sorting without an in-memory sort stage.

**Trade-offs:** The index includes `createdAt` in descending order (`-1`). If the same query were run with `createdAt` ascending, a separate index would be needed or MongoDB would re-sort in memory.

### query3-status-price `{ status: 1, price: 1 }`

**Rationale:** Query 3 filters on `price` as a range. The index prefixes with `status` for selectivity across multiple queries, then `price` as the range field. This design supports queries that combine a status equality filter with a price range.

**Trade-offs:** Query 3 as written does not include a `status` filter, so `status` acts as a supporting prefix field. For query 3 alone, `{ price: 1 }` would be simpler. The multi-query rationale for including `status` is not made explicit in the lab instructions, which made this index the most confusing to design. A trade-off is that the index size is larger than needed for query 3 in isolation.

### query4-status-rating-price `{ status: 1, rating: -1, price: 1 }`

**Rationale:** Query 4 has an equality filter on `status`, sorts by `rating` descending, and has a range filter on `price`. Applying ESR: `status` (Equality) → `rating` (Sort) → `price` (Range). This field order allows MongoDB to use the index for filtering, sorting, and range scanning without an in-memory SORT stage.

**Trade-offs:** If the sort direction on `rating` were reversed to ascending, a new index would be required. The performance improvement from eliminating the SORT stage is the main benefit here.

### query5-tags-createdAt-rating `{ tags: 1, createdAt: -1, rating: 1 }`

**Rationale:** Query 5 has an equality filter on `tags` (array field) and sorts by `createdAt` descending. Applying ESR: `tags` (Equality) → `createdAt` (Sort). The `rating` field was added based on the expected index name hint; the rationale is likely to support queries that also filter or project on `rating`.

**Trade-offs:** Adding `rating` increases the index size without directly serving query 5's filter or sort. The lab does not explain the rationale for this addition, which is a gap in the instructional design. A learner applying ESR strictly would produce `{ tags: 1, createdAt: -1 }` and fail the check.

## General Trade-offs

- **Index count vs. query coverage:** Each new index speeds up reads but slows writes and consumes storage. Designing one index per query (as in this lab) is pedagogically clear but not always production-appropriate.
- **ESR vs. multi-query optimization:** Some indexes here appear designed to serve multiple queries (e.g., the `status` prefix in query3). The lab does not explain this concept, leaving the learner to reverse-engineer it from index names.
- **Performance measurement:** On a 10,000-document dataset on a modern machine, all queries run in single-digit milliseconds. Timing-based comparisons are unreliable at this scale. The SORT stage elimination in the explain output is the more reliable signal.
