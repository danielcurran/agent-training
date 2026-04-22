'use strict';

/**
 * Stage 1: ESR Identification
 *
 * For each query below, identify which fields serve as:
 *   E = Equality  (field used in exact match: field === value)
 *   S = Sort      (field used in .sort())
 *   R = Range     (field used in range/inequality: $gt, $gte, $lt, $lte, $in, etc.)
 *
 * Use 'none' if a role has no corresponding field.
 *
 * Example:
 *   Query: db.products.find({ category: 'Books', price: { $gte: 10 } }).sort({ createdAt: -1 })
 *   Answer: { E: 'category', S: 'createdAt', R: 'price' }
 */

// Query 1: db.products.find({ status: 'active' })
const query1 = {
  E: 'status',
  S: 'none',
  R: 'none'
};

// Query 2: db.products.find({ category: 'Electronics' }).sort({ createdAt: -1 })
const query2 = {
  E: 'category',
  S: 'createdAt',
  R: 'none'
};

// Query 3: db.products.find({ price: { $gte: 100, $lte: 500 } })
const query3 = {
  E: 'none',
  S: 'none',
  R: 'price'
};

// Query 4: db.products.find({ status: 'active', price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 })
const query4 = {
  E: 'status',
  S: 'rating',
  R: 'price'
};

// Query 5: db.products.find({ tags: 'sale' }).sort({ createdAt: -1 })
const query5 = {
  E: 'tags',
  S: 'createdAt',
  R: 'none'
};

module.exports = { query1, query2, query3, query4, query5 };
