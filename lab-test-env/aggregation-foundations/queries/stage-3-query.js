// filepath: queries/stage-3-query.js
// Stage 3: $sort + $limit — Ranking & Pagination
// Goal: Find the top 10 highest-rated books based on reviews posted after 2017.
//
// Run this file in mongosh:  load("queries/stage-3-query.js")
// Check your work:           npm run check:stage-3

use("online_bookstore");

const matchStage = {
  $match: {
    // Filter reviews posted after 2017-12-31 (i.e., from 2018 onwards)
    timestamp: { $gte: ISODate("2018-01-01") }
  }
};

const groupStage = {
  $group: {
    // TODO: Group by book_id and calculate average rating.
    // _id:           the field to group by — use "$book_id"
    // averageRating: accumulate using $avg on "$rating"
  }
};

const sortStage = {
  $sort: {
    // TODO: Sort by averageRating in descending order (highest first).
    // Use -1 for descending.
  }
};

const limitStage = {
  $limit: 10
};

const result = db.reviews.aggregate([
  matchStage,
  groupStage,
  sortStage,
  limitStage
]);

printjson(result.toArray());
