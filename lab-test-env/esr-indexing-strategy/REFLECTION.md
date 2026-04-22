# Reflection: ESR Indexing Strategy Lab

## What I Learned

The ESR guideline (Equality, Sort, Range) is a rule for ordering fields in a compound MongoDB index. The order matters because MongoDB traverses an index from left to right. When Equality fields come first, MongoDB can immediately narrow to matching documents. When the Sort field comes second, MongoDB can use the index order for sorting, eliminating an in-memory SORT stage. When Range fields come last, the index can still be used for scanning a bounded portion of the data.

Before this lab I had no understanding of why field order in an index mattered. I now understand that `{ status: 1, rating: -1, price: 1 }` is fundamentally different from `{ status: 1, price: 1, rating: -1 }` even though both indexes contain the same fields. The first eliminates a SORT stage for a query that sorts by rating; the second does not. This is a non-obvious concept that the explain output made concrete.

## Decisions I Made

**Query 3 index:** I initially designed `{ price: 1 }` because query 3 only filters on price (a range). The check failed because the expected answer was `{ status: 1, price: 1 }`. The only way I discovered this was by reading the index name `query3-status-price` as a hint. I do not understand the full rationale for including `status` — the lab does not explain it.

**Query 5 index:** Similarly, I designed `{ tags: 1, createdAt: -1 }` from the ESR rule, then found from the index name that `rating` should be added as a third field. Again, no explanation was given for why rating belongs here.

**Sorting direction:** For query 4, I used `rating: -1` because the query sorts by `rating: -1`. I learned that sort direction in the index must match the query's sort direction for the index to eliminate the SORT stage.

## When I Got Stuck

**Stage 2, attempt 1:** Applied ESR directly and got the correct answers for query1, query2, and query4, but got wrong answers for query3 and query5. The check output told me what was expected but not why. I was stuck because the expected answers contradicted what the ESR rule I had just learned would produce.

**Stage 3:** The performance check failed every attempt. The ESR index did correctly eliminate the SORT stage (which I understand is the key proof of correct ESR application), but the check required a 50× speedup. On a 10,000-document dataset running on a fast local machine, all queries ran in under 25ms, making a 50× speedup mathematically impossible. I was stuck because I had no way to satisfy this check without modifying the check script itself — which a learner should not need to do.

## Transfer to Real Applications

The ESR rule generalises to any compound index design decision: always ask which fields serve as equality filters, which field determines sort order, and which fields serve as range filters. Put them in that order. The payoff is avoiding in-memory SORT stages, which become expensive at scale.

I would apply this in practice by looking at the explain output's `queryPlanner.winningPlan` and checking for a SORT stage. If one exists on a frequently run query, I would check whether the index includes the sort field and whether it appears before any range fields.

The less obvious lesson is that indexes can be designed to serve multiple queries — a `status` prefix field may benefit several queries even if a specific query doesn't filter on `status`. This is a concept the lab introduced implicitly through the expected answers but never explained. I would want to learn more about multi-query index design before applying it confidently.
