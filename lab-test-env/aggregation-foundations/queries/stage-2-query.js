// filepath: queries/stage-2-query.js
// Stage 2: $group + $project — Aggregation & Reporting
// Goal: Generate a genre revenue report for 2024.
//
// Run this file in mongosh:  load("queries/stage-2-query.js")
// Check your work:           npm run check:stage-2

use("online_bookstore");

const matchStage = {
  $match: {
    date: { $gte: ISODate("2024-01-01"), $lt: ISODate("2025-01-01") }
  }
};

const unwindStage = {
  $unwind: "$books"
};

const groupStage = {
  $group: {
    // TODO: Group by genre and sum revenue.
    // After $unwind, each document has a single books object (not an array).
    // _id:          the field to group by — use "$books.genre"
    // totalRevenue: accumulate using $sum on "$books.price"
  }
};

const projectStage = {
  $project: {
    // TODO: Rename _id to genre and keep totalRevenue.
    // genre:        "$_id"
    // totalRevenue: 1
    // _id:          0   ← hides the original _id field
  }
};

const result = db.sales.aggregate([
  matchStage,
  unwindStage,
  groupStage,
  projectStage
]);

printjson(result.toArray());
