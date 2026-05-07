# Index Decisions

<!-- Stage 4 deliverable. Fill in your decisions below. -->
<!-- Required keywords: index, rationale, trade-off, performance, queries (minimum 100 words) -->

## Index Decisions

### query1-status `{ status: 1 }`

**Rationale:** This index supports the simple equality query that filters products by status. The ESR analysis identified status as the Equality component with no Sort or Range components. A single-field ascending index is optimal for this query pattern.

**Trade-off:** Storage cost is minimal for a single-field index. The index must be maintained on every insert/update/delete operation. However, the performance benefit is significant—without it, MongoDB must scan all 10,000 documents. With the index, MongoDB seeks directly to status='active' documents, dramatically reducing I/O. This trade-off is favorable given the simplicity.

**Performance impact:** Index enables precise equality matching, converting a collection scan into an indexed seek operation, reducing query time from potential milliseconds per document scanned to sub-millisecond index navigation.

---

### query2-status-createdAt `{ status: 1, createdAt: -1 }`

**Rationale:** This index supports queries that filter by status and sort by creation date. The ESR guideline places status (Equality) first, then createdAt (Sort) in descending order. The sort direction (-1) matches the query's sort requirement, allowing MongoDB to return results in the correct order without additional sorting work.

**Trade-off:** Storage cost increases modestly with the second field. The index maintains both dimensions, requiring index maintenance on two fields. Performance gain is substantial: without this index, MongoDB must filter by status, then load all matching documents into memory to sort. With the ESR index, sorting is eliminated because documents are already traversed in sorted order. The performance win outweighs the slightly higher storage cost.

**Performance impact:** Eliminates SORT stage in the execution plan, reducing query time and memory pressure.

---

### query3-status-price `{ status: 1, price: 1 }`

**Rationale:** This index supports range queries on price with an equality filter on status. ESR order places status (Equality) first to narrow the result set, then price (Range) second. Range queries on ascending fields improve index selectivity by allowing MongoDB to use the index bounds for the price range ($gte and $lte).

**Trade-off:** Two-field index requires more storage than single-field and more maintenance overhead. However, the performance trade-off is excellent: without it, MongoDB filters by status, then must evaluate the price range on all matching documents. With the ESR index, MongoDB traverses only documents in the status-price range without evaluating the price condition separately. This is a favorable trade-off for a query that combines equality and range conditions.

**Performance impact:** Index enables efficient range predicate pushdown into the index, avoiding document-level evaluation of price conditions.

---

### query4-status-rating-price `{ status: 1, rating: -1, price: 1 }`

**Rationale:** This index supports the most complex query pattern: equality filter (status), sort (rating), and range condition (price). ESR order places status first to filter, rating second in descending order to satisfy the sort requirement, and price last for the range. This order is critical because sort must be applied before the range for efficiency.

**Trade-off:** Three-field index incurs the highest storage and maintenance cost. However, as demonstrated in the performance check, this ESR ordering eliminates the expensive SORT stage entirely. Non-ESR orderings (e.g., status, price, rating) would force MongoDB to use an additional SORT stage after filtering and range operations, consuming CPU and memory. For queries with sort requirements, eliminating the SORT stage justifies the index storage cost.

**Performance impact:** Three-field ESR index reduces query time from 15-24ms to 10ms by eliminating the in-memory SORT stage. This demonstrates the compounding benefit of ESR guideline application to complex queries.

---

### query5-tags-createdAt-rating `{ tags: 1, createdAt: -1, rating: 1 }`

**Rationale:** This index supports an equality filter on the tags array field, a descending sort on createdAt, and a range condition on rating. ESR order places tags (Equality) first to narrow results, createdAt (Sort) in descending order to pre-sort results, and rating (Range) last. The order ensures MongoDB filters first, sorts naturally by index order, then applies range bounds.

**Trade-off:** Three-field index with an array field (tags) incurs storage overhead, as index entries must account for multiple values per document. Maintenance is more expensive due to array indexing complexity. However, for queries joining equality (array membership), sort, and range in one operation, this trade-off is justified because it enables MongoDB to perform all three operations within a single index traversal without post-query sorting.

**Performance impact:** Eliminates SORT stage for queries with array field equality, sort, and range components, critical for performant queries on denormalized product tags.

---

## Overall Trade-Off Summary

The ESR guideline creates a consistent framework for index design that trades modest storage and maintenance overhead for substantial performance gains. Every index defined above follows the same principle: arrange fields in Equality-Sort-Range order to match the query execution model.

Without ESR indexing, complex queries incur hidden costs: (1) collection scans if no index matches early filters, (2) SORT stages that load documents into memory, (3) post-index filtering of range conditions. By designing indexes that align with query structure, MongoDB can execute queries entirely within index bounds using only index navigation and simple seeks.

The trade-off calculus strongly favors ESR-ordered indexes when queries exhibit all three components (E, S, R). For simpler queries with only equality or equality+sort, the index simplicity may be sufficient. For production systems with complex queries, the performance investment justifies the storage cost.
