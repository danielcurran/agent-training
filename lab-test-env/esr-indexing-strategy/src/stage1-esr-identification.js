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
  E: '',
  S: '',
  R: ''
};

// Query 2: db.products.find({ status: 'active' }).sort({ createdAt: -1 })
const query2 = {
  E: '',
  S: '',
  R: ''
};

// Query 3: db.products.find({ status: 'active', price: { $gte: 50, $lte: 500 } })
const query3 = {
  E: '',
  S: '',
  R: ''
};

// Query 4: db.products.find({ status: 'active', price: { $gte: 50 } }).sort({ rating: -1 })
const query4 = {
  E: '',
  S: '',
  R: ''
};

// Query 5: db.products.find({ tags: 'sale', rating: { $gte: 4 } }).sort({ createdAt: -1 })
const query5 = {
  E: '',
  S: '',
  R: ''
};

module.exports = { query1, query2, query3, query4, query5 };
