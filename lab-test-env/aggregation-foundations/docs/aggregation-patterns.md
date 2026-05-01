# Aggregation Patterns Reference

This document summarises the aggregation operators used in this lab.

## Pipeline Stages

### $match
Filters documents. Works like a `WHERE` clause.
```javascript
{ $match: { field: { $gte: value } } }
```

### $unwind
Deconstructs an array field — one output document per array element.
```javascript
{ $unwind: "$fieldName" }
```

### $group
Groups documents by `_id` and accumulates values.
```javascript
{ $group: { _id: "$field", total: { $sum: "$price" } } }
```

**Accumulators:** `$sum`, `$avg`, `$min`, `$max`, `$count`, `$addToSet`, `$push`

### $project
Reshapes output — include, exclude, rename, or compute fields.
```javascript
{ $project: { newName: "$oldName", hidden: 0, _id: 0 } }
```

### $sort
Orders documents. `1` = ascending, `-1` = descending.
```javascript
{ $sort: { field: -1 } }
```

### $limit
Truncates result set to N documents.
```javascript
{ $limit: 10 }
```

### $set
Adds or overwrites fields. Equivalent to `$addFields`.
```javascript
{ $set: { newField: expression } }
```

### $lookup
Joins documents from another collection.
```javascript
{
  $lookup: {
    from: "otherCollection",
    localField: "myField",
    foreignField: "theirField",
    as: "outputArray"
  }
}
```

## Operators

### $filter (expression)
Filters an array based on a condition. Used inside `$set` or `$project`.
```javascript
{
  $filter: {
    input: "$arrayField",
    as: "item",
    cond: { $eq: ["$$item.status", "active"] }
  }
}
```
**Note:** `$$item` (double-dollar) references the current element defined by `as`.

### $eq, $gt, $gte, $lt, $lte
Comparison operators. In MQL expressions (inside `$filter`, `$cond`, etc.):
```javascript
{ $eq: ["$$book.genre", "Fantasy"] }   // expression form
{ $gte: value }                        // query form (inside $match)
```

### $concat
Concatenates strings.
```javascript
{ $concat: ["$first", " ", "$last"] }
```
