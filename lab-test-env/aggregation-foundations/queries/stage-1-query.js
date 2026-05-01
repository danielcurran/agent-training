// filepath: queries/stage-1-query.js
// Stage 1: $match + $unwind Fundamentals
// Goal: Filter 2024 sales and deconstruct the books array.
//
// Run this file in mongosh:  load("queries/stage-1-query.js")
// Check your work:           npm run check:stage-1

use("online_bookstore");

const matchStage = {
  $match: {
    // TODO: Filter documents where date is between 2024-01-01 and 2024-12-31
    // Use $gte (>=) and $lt (<) comparison operators on the date field.
    // date: { ... }
  }
};

const unwindStage = {
  $unwind: "$books"
  // $unwind deconstructs the books array — one document is created per book.
  // A sale with 3 books becomes 3 output documents.
};

const result = db.sales.aggregate([
  matchStage,
  unwindStage
]);

printjson(result.toArray());
