# Reflection

## What I Learned

The ESR guideline provides a clear ordering rule for building MongoDB indexes: equality fields come first, followed by sort fields, then range fields. I learned that this specific order matters because MongoDB can only eliminate an in-memory sort stage when the sort field appears in the index before any range condition. If a range field precedes the sort field, the database cannot guarantee the sort order from the index alone, so it must sort the documents after retrieving them — adding a SORT stage and extra CPU work. The performance check in Stage 3 showed this directly: before adding the ESR index, Query 4 required a SORT stage; after adding `{ status: 1, rating: -1, price: 1 }`, the SORT stage disappeared entirely and documents examined dropped dramatically.

## Decisions I Made

In Stage 2, the most interesting decision was for Query 4: `find({ status: 'active', price: { $gte: 50 } }).sort({ rating: -1 })`. The equality field is `status`, the sort field is `rating`, and the range field is `price`. I had to consciously put `rating` before `price` even though `price` appears in the query filter — because the ESR rule says the sort field (S) always precedes the range field (R) regardless of where they appear in the query syntax.

In Stage 4, with a maximum of 2 indexes, I chose to build indexes for Query X (50×/sec, ~500ms latency) and Query Y (10×/sec, ~120ms latency), and skip Query Z (2×/min, ~60ms). The time savings from the first two indexes are enormous; the savings from the third would be negligible.

## When I Got Stuck

Query 5 gave me a moment's pause: `find({ tags: 'sale', rating: { $gte: 4 } }).sort({ createdAt: -1 })`. I initially wasn't certain whether `tags` matched the ESR equality definition, since array fields can seem ambiguous. But re-reading the example in the README — "field used in exact match: field === value" — clarified that `tags: 'sale'` is an equality condition on the array field. Once I confirmed that, the ESR breakdown fell into place: E=tags, S=createdAt, R=rating.

## Transfer to Real Applications

Consider a ride-sharing app that queries trips by driver: `db.trips.find({ driverId: "d-42", startTime: { $gte: today } }).sort({ fare: -1 })`. Here, `driverId` is the equality field (E), `fare` is the sort field (S), and `startTime` is the range field (R). The ESR index would be `{ driverId: 1, fare: -1, startTime: 1 }`. Without ESR ordering — for example, `{ driverId: 1, startTime: 1, fare: -1 }` — MongoDB would encounter the range condition on `startTime` before `fare`, forcing an in-memory SORT stage on every query. With the ESR index, the sort is handled directly by the index traversal, eliminating the SORT stage and improving performance significantly at high query frequency.
