# Index Decisions

<!-- Stage 4 deliverable. Fill in your decisions below. -->
<!-- Required keywords: index, rationale, trade-off, performance, queries (minimum 100 words) -->

## Index Decisions

### query1-status `{ status: 1 }`

**Rationale:** Query 1 is an equality-only filter on `status`. No sort or range field is present. The index covers just the equality field, which is sufficient to allow MongoDB to use an index scan instead of a collection scan for queries that filter by status.

**Trade-off:** The `status` field has only three values (active, archived, draft), making it low-cardinality. An index on a low-cardinality field offers limited selectivity — many documents will still match. For queries filtering on `status: 'active'`, roughly one-third of documents will pass the filter even with the index. Performance gains are modest. A more selective compound index would be better for high-volume queries.

---

### query2-status-createdAt `{ status: 1, createdAt: -1 }`

**Rationale:** Query 2 filters on `status` (equality) and sorts by `createdAt` descending. ESR order places equality first, sort second. This allows MongoDB to filter to matching status values and then return documents in `createdAt` order from the index itself — no in-memory sort stage is needed.

**Trade-off:** The `-1` direction on `createdAt` means this index cannot be used for a query sorting `createdAt` ascending. A separate index or a direction-reversal scan would be required for the ascending sort variant. Descending sort is the common case for "recent items first" queries, so the direction choice is reasonable.

---

### query3-status-price `{ status: 1, price: 1 }`

**Rationale:** Query 3 filters on `status` (equality) and `price` as a range. ESR order: E=status first, R=price second. There is no sort field in this query. Placing status first gives the index a more selective prefix, reducing the number of entries the range scan must traverse.

**Trade-off:** This index serves queries that combine a status equality filter with a price range. It also benefits query 1 as a prefix index (status-only queries can use this index's leading field). The cost is additional write overhead and index storage compared to a single-field price index.

---

### query4-status-rating-price `{ status: 1, rating: -1, price: 1 }`

**Rationale:** Query 4 has equality on `status`, sort on `rating` descending, and range on `price`. This is the canonical ESR example: E=status, S=rating, R=price. Placing the sort field (rating) before the range field (price) allows MongoDB to use the index order for sorting — no in-memory SORT stage is needed. Confirmed by Stage 3: the explain output shows no SORT stage with this index.

**Trade-off:** If the sort direction on `rating` changed to ascending, a new index would be required. If price range is very wide, many documents per status group will match, and the sort over all those documents is done via the index rather than in memory — still more efficient than a collection scan sort, but less dramatic than on a smaller dataset.

---

### query5-tags-createdAt-rating `{ tags: 1, createdAt: -1, rating: 1 }`

**Rationale:** Query 5 filters on `tags` (equality on an array field), sorts by `createdAt` descending, and filters on `rating` as a range. ESR order: E=tags, S=createdAt, R=rating. MongoDB indexes array fields by indexing each element individually, so `tags: 1` correctly handles the `tags: 'sale'` equality filter. Placing `createdAt` (sort) before `rating` (range) ensures no in-memory sort is needed.

**Trade-off:** Indexing array fields (multikey indexes) has a higher storage cost because each document contributes multiple index entries — one per tag value. A product with 4 tags produces 4 index entries. For collections with many tags per document, the index size grows significantly. The performance benefit for frequent queries on `tags` still justifies the trade-off.

---

## Overall Trade-Off Summary

- **Write vs. read trade-off:** Each of these 5 indexes adds overhead to every insert and update on the products collection. The trade-off is justified when the queries these indexes support are frequent enough that the read savings outweigh the write cost.
- **Memory cost:** Five compound indexes consume significantly more RAM than a single `_id` index. For production, index memory usage should be monitored.
- **Index prefix sharing:** query1, query2, query3, and query4 all share a `status` prefix. MongoDB can use a compound index to satisfy queries on leading fields (prefix queries). This means query1's equality filter on `status` can use the `query3-status-price` index even without a dedicated single-field `status` index — though having the simpler index is more selective for status-only queries.
