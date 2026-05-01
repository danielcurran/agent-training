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
    _id: "$books.genre",
    totalRevenue: { $sum: "$books.price" }
  }
};

const projectStage = {
  $project: {
    genre: "$_id",
    totalRevenue: 1,
    _id: 0
  }
};

const result = db.sales.aggregate([
  matchStage,
  unwindStage,
  groupStage,
  projectStage
]);

printjson(result.toArray());
