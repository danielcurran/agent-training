# Index Decisions

I was given three queries with a constraint of maximum 2 indexes. Here is how I decided which queries to prioritize.

## Index 1: Query X (Critical)
- Fields: { user_id: 1, updated: -1, created: 1 }
- Rationale: This query runs 50 times per second. Without an index it takes ~500ms, which adds up to roughly 25 seconds of query time per minute. Applying the ESR rule, user_id is the equality field (E), updated is the sort field (S), and created is the range field (R), giving index { user_id: 1, updated: -1, created: 1 }. With this index, performance drops to ~5ms — a 100× improvement. The impact on overall system performance is enormous, making this index non-negotiable.
- Trade-off: Every index adds write overhead (~2% per index for insert/update operations). For queries this critical, that cost is far outweighed by the read improvement.

## Index 2: Query Y (Frequent)
- Fields: { status: 1, updated: -1 }
- Rationale: This query runs 10 times per second. Without an index it takes ~120ms; with an ESR index it takes ~10ms. That saves 110ms per 10 seconds, which is significant for a frequently-called query. The ESR breakdown is: status is equality (E), updated is the sort field (S), no range — so the index is { status: 1, updated: -1 }.
- Trade-off: Adds ~1.5% write cost. Acceptable given the query frequency and performance gain.

## Query Z (Skipped)
- Rationale: Query Z runs only 2 times per minute. Without an index it takes ~60ms; with an index ~8ms. That is roughly 100ms of savings per hour — negligible. Adding a third index for this query would use memory and add write cost without meaningful performance benefit.
- Trade-off: Query Z will continue to run at ~60ms. Given its low frequency, this is an acceptable cost. If the query frequency increases significantly in the future, revisiting this decision would be appropriate.

## Overall Decision
By prioritizing the two indexes that serve the highest-frequency and most performance-sensitive queries, I maximize performance gains while staying within the 2-index constraint. This approach reflects the core trade-off in index design: indexes improve read performance but cost write throughput and memory. The goal is to apply indexes where they have the greatest impact on the most critical queries.

