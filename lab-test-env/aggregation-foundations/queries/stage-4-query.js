// filepath: queries/stage-4-query.js
// Stage 4: $lookup + $set + $filter — Joins & Conditional Logic
// Goal: Generate a marketing list of customers who bought children's books in 2024.
//
// New syntax: $$variable (double-dollar) is used inside $filter to reference
// each element of the input array. Example: $$book.genre accesses the genre
// field on the current element named "book".
//
// Run this file in mongosh:  load("queries/stage-4-query.js")
// Check your work:           npm run check:stage-4

use("online_bookstore");

const matchStage = {
  $match: {
    // Pre-filter: only 2024 sales
    date: { $gte: ISODate("2024-01-01"), $lt: ISODate("2025-01-01") }
  }
};

const lookupStage = {
  $lookup: {
    from: "customers",
    localField: "customer_id",
    foreignField: "_id",
    as: "customer_details"
  }
};

const unwindStage = {
  $unwind: "$customer_details"
  // After $lookup, customer_details is an array. $unwind makes it a single object.
};

// MID-STAGE CHECKPOINT:
// Before completing the stages below, run a partial pipeline to verify $lookup works:
//   db.sales.aggregate([ matchStage, lookupStage, unwindStage ])
// Each document should have a customer_details object with first_name, last_name, email.
// Confirm this before continuing.

const setStage = {
  $set: {
    childrensBooks: {
      $filter: {
        input: "$books",
        as: "book",
        cond: { $eq: ["$$book.genre", "Children's literature"] }
      }
    }
  }
};

const matchChildrensStage = {
  $match: {
    // Keep only customers who bought at least one children's book
    "childrensBooks.0": { $exists: true }
  }
};

const projectStage = {
  $project: {
    customerName: { $concat: ["$customer_details.first_name", " ", "$customer_details.last_name"] },
    email: "$customer_details.email",
    childrensBooks: 1,
    _id: 0
  }
};

const result = db.sales.aggregate([
  matchStage,
  lookupStage,
  unwindStage,
  setStage,
  matchChildrensStage,
  projectStage
]);

printjson(result.toArray());
