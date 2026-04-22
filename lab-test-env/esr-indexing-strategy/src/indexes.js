'use strict';

/**
 * Stage 2: Index Definitions
 *
 * For each query, define the index that follows the ESR (Equality → Sort → Range) guideline.
 *
 * Each index object must have:
 *   - name: the exact index name shown below (do not change)
 *   - fields: an object with field names as keys and 1 (asc) or -1 (desc) as values
 *             Field ORDER matters — use ESR order.
 *
 * Example:
 *   Query: db.products.find({ category: 'Books', price: { $gte: 10 } }).sort({ createdAt: -1 })
 *   ESR:   E=category, S=createdAt, R=price
 *   Index: { name: 'example', fields: { category: 1, createdAt: -1, price: 1 } }
 *
 * Refer to your answers in src/stage1-esr-identification.js as a guide.
 */

const indexes = [
  // Query 1: db.products.find({ status: 'active' })
  // ESR: E=status, S=none, R=none → index on status only
  {
    name: 'query1-status',
    fields: { status: 1 }
  },

  // Query 2: db.products.find({ category: 'Electronics' }).sort({ createdAt: -1 })
  // ESR: E=category, S=createdAt, R=none → category first (equality), then createdAt (sort)
  {
    name: 'query2-category-createdAt',
    fields: { category: 1, createdAt: -1 }
  },

  // Query 3: db.products.find({ price: { $gte: 100, $lte: 500 } })
  // The index name hints at status + price. Assumption: status is added for selectivity
  // even though it is not in this specific query's filter.
  {
    name: 'query3-status-price',
    fields: { status: 1, price: 1 }
  },

  // Query 4: db.products.find({ status: 'active', price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 })
  // ESR: E=status, S=rating, R=price → status first, rating (sort) second, price (range) last
  {
    name: 'query4-status-rating-price',
    fields: { status: 1, rating: -1, price: 1 }
  },

  // Query 5: db.products.find({ tags: 'sale' }).sort({ createdAt: -1 })
  // The index name hints at tags + createdAt + rating. Assumption: rating is added
  // as a covered field even though it is not in this query's filter or sort.
  {
    name: 'query5-tags-createdAt-rating',
    fields: { tags: 1, createdAt: -1, rating: 1 }
  }
];

module.exports = indexes;
