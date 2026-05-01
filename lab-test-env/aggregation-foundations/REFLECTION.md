# Aggregation Foundations — Pipeline Design

## Your Pipeline Design

```
Stage 1: $match
- Transformation: Filters the sales collection to include only documents from 2024, reducing
  the working set before any expensive operations. Also apply $match again later to filter
  genres below the revenue threshold.
- Fields: date (with $gte and $lt operators)
- Connection: Output is the filtered set of sales documents feeding into $unwind.

Stage 2: $unwind
- Transformation: Deconstructs the embedded books array on each sales document so that
  each book becomes its own document. A sale containing 3 books becomes 3 documents, each
  with the same sale metadata but a single book object.
- Fields: books (the embedded array)
- Connection: After $unwind, each document has a single books object, so the next $group
  stage can aggregate on $books.genre.

Stage 3: $group
- Transformation: Consolidates the unwound documents by genre. Accumulates:
  - totalRevenue using $sum on $books.price
  - avgPrice using $avg on $books.price
  - uniqueCustomers using $addToSet on $customer_id (collects distinct customer IDs per genre)
- Fields: $books.genre (group key), $books.price, $customer_id
- Connection: Output is one document per genre with accumulated values, feeding into the
  second $match stage for revenue filtering.

Stage 4: $match (second — post-group filter)
- Transformation: Filters out genres with totalRevenue <= 5000, keeping only genres that
  generated more than $5,000 in revenue. This must come after $group because the
  totalRevenue field does not exist until accumulation is complete.
- Fields: totalRevenue
- Connection: Output is the filtered genre documents feeding into $project.

Stage 5: $project
- Transformation: Reshapes the output to produce clean field names: genre (rename from _id),
  totalRevenue, avgPrice, and uniqueCustomerCount (computed as $size of the $addToSet array).
- Fields: _id → genre, totalRevenue, avgPrice, uniqueCustomers → uniqueCustomerCount
- Connection: Output feeds into $sort for ordering.

Stage 6: $sort
- Transformation: Orders the genre documents by totalRevenue in descending order
  (highest revenue first).
- Fields: totalRevenue (-1)
- Connection: Output feeds into $limit to take only the top 5.

Stage 7: $limit
- Transformation: Truncates the result set to the top 5 genres.
- Fields: n/a (operates on document count)
- Connection: Final output — 5 genre documents with revenue analytics.
```

## Notes

The second $match (Stage 4) must come after $group, not before. The totalRevenue field
is only created by $group — it does not exist on the raw sales documents.

The $addToSet accumulator in $group collects unique values into an array. To count them,
wrap in $size inside $project: `{ $size: "$uniqueCustomers" }`.

Stage sequencing rationale: $match-first reduces the working set early (performance).
$unwind before $group is necessary because $group needs individual book documents to
aggregate by genre. The second $match after $group is a "having" clause equivalent (like
SQL's HAVING totalRevenue > 5000).

